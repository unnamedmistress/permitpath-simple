import { z } from 'zod';
import OpenAI from 'openai';

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

const ChatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1).max(5000)
  })).min(1).max(20),
  jobContext: z.object({
    jobType: z.string().optional(),
    jurisdiction: z.string().optional(),
    address: z.string().optional()
  }).optional()
});

function setCorsHeaders(res: any, origin?: string) {
  const allowedOrigins = [
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
    'http://localhost:3000',
    'http://localhost:5173',
  ].filter(Boolean);

  const requestOrigin = origin || '*';
  if (allowedOrigins.includes(requestOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function checkRateLimit(userId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitStore.get(userId);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_REQUESTS - 1 };
  }

  if (record.count >= RATE_LIMIT_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_REQUESTS - record.count };
}

export default async function handler(req: any, res: any) {
  const origin = req.headers?.origin;
  setCorsHeaders(res, origin);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const userId = req.headers?.['x-user-id'] || req.socket?.remoteAddress || 'anonymous';
  const rateLimit = checkRateLimit(userId);

  if (!rateLimit.allowed) {
    return res.status(429).json({ error: 'Rate limit exceeded', retryAfter: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000) });
  }

  const validation = ChatRequestSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Invalid request', details: validation.error.errors });
  }

  const { messages, jobContext } = validation.data;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({
      message: { role: 'assistant', content: 'I am currently unavailable. Please try again later or call the Pinellas County permitting office at (727) 464-3888 for assistance.' },
      fallback: true,
      rateLimit
    });
  }

  try {
    const openai = new OpenAI({ apiKey });

    const systemMessage = {
      role: 'system' as const,
      content: `You are PermitPath AI, a helpful assistant for contractors in Pinellas County, Florida. You help with permit questions, building codes, and the permitting process.

Guidelines:
- Use plain language, grade 4-6 reading level
- Be specific to Pinellas County, Florida regulations
- Always clarify you are not providing legal advice
- Keep answers concise but helpful
- If you do not know something, direct to the county office: (727) 464-3888
${jobContext?.jobType ? `Current job type: ${jobContext.jobType}` : ''}
${jobContext?.jurisdiction ? `Jurisdiction: ${jobContext.jurisdiction}` : ''}`
    };

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 1000
    });

    const content = response.choices[0]?.message?.content || 'I apologize, I could not generate a response. Please try again.';

    return res.status(200).json({
      message: { role: 'assistant', content },
      fallback: false,
      rateLimit
    });
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({
      error: 'Chat failed',
      message: { role: 'assistant', content: 'I am having trouble responding right now. Please try again or call (727) 464-3888 for help.' },
      fallback: true
    });
  }
}
