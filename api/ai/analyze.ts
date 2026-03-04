import { z } from 'zod';
import OpenAI from 'openai';

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

const AnalyzeRequestSchema = z.object({
  jobType: z.string().min(1).max(100),
  jurisdiction: z.string().min(1).max(100),
  address: z.string().min(1).max(500),
  description: z.string().min(1).max(2000),
  squareFootage: z.number().positive().optional(),
  yearBuilt: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
});

function setCorsHeaders(res: any, origin?: string) {
  // Allow all origins in local development and production for offline mode
  const requestOrigin = origin || '*';
  res.setHeader('Access-Control-Allow-Origin', requestOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-Id');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
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

function enrichRequirement(req: any, index: number) {
  return {
    id: req.id || `req-${Date.now()}-${index}`,
    jobId: req.jobId || '',
    category: req.category || 'document',
    title: req.title || 'Required Document',
    description: req.description || 'A required document for your permit',
    isRequired: req.isRequired ?? true,
    confidence: req.confidence || 0.8,
    status: 'pending',
    actionType: req.actionType || 'Fill out and upload',
    sourceUrl: req.sourceUrl || 'https://pinellas.gov/topic/building-development/permits/',
    minimumCriteria: req.minimumCriteria || 'Clear address, names, and signatures',
    whoCanHelp: req.whoCanHelp || 'County permit desk',
    plainLanguageWhy: req.plainLanguageWhy || 'The county needs this to review your job.',
    acceptedFormats: req.acceptedFormats || ['PDF', 'JPG', 'PNG'],
    allowsMultipleUploads: req.allowsMultipleUploads ?? false,
    goodUploadExample: req.goodUploadExample || 'Clear full-page image or PDF'
  };
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

  const validation = AnalyzeRequestSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Invalid request', details: validation.error.errors });
  }

  const { jobType, jurisdiction, address, description, squareFootage, yearBuilt } = validation.data;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({
      requirements: [
        { id: `req-${Date.now()}-1`, jobId: '', category: 'document', title: 'Permit Application', description: 'Completed permit application form', isRequired: true, confidence: 1, status: 'pending', actionType: 'Fill out and upload', sourceUrl: 'https://pinellas.gov/topic/building-development/permits/', minimumCriteria: 'Signed form with full property address', whoCanHelp: 'County permit desk', plainLanguageWhy: 'This starts your permit review.', acceptedFormats: ['PDF'], allowsMultipleUploads: false, goodUploadExample: 'Signed permit form PDF' },
        { id: `req-${Date.now()}-2`, jobId: '', category: 'license', title: 'Contractor License', description: 'Valid Florida contractor license', isRequired: true, confidence: 1, status: 'pending', actionType: 'Upload proof', sourceUrl: 'https://www.myfloridalicense.com/', minimumCriteria: 'Active license with matching business name', whoCanHelp: 'Florida DBPR support', plainLanguageWhy: 'County checks licensed workers for permit jobs.', acceptedFormats: ['PDF', 'JPG', 'PNG'], allowsMultipleUploads: false, goodUploadExample: 'License image showing expiration date' },
        { id: `req-${Date.now()}-3`, jobId: '', category: 'insurance', title: 'Insurance Certificate', description: 'General liability insurance certificate', isRequired: true, confidence: 1, status: 'pending', actionType: 'Request from insurer and upload', minimumCriteria: 'Coverage dates include permit period', whoCanHelp: 'Insurance agent', plainLanguageWhy: 'County wants active coverage during work.', acceptedFormats: ['PDF'], allowsMultipleUploads: true, goodUploadExample: 'Certificate with policy dates and limits' }
      ],
      estimatedTimeline: '5-10 business days',
      estimatedCost: '$150-500',
      confidenceScore: 0.6,
      fallback: true,
      rateLimit
    });
  }

  try {
    const openai = new OpenAI({ apiKey });
    const userPrompt = `Job Type: ${jobType}\nJurisdiction: ${jurisdiction}\nAddress: ${address}\nDescription: ${description}${squareFootage ? `\nSquare Footage: ${squareFootage}` : ''}${yearBuilt ? `\nYear Built: ${yearBuilt}` : ''}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: 'You are a permit requirements expert for Pinellas County, Florida. Respond with JSON: {requirements:[{category,title,description,isRequired,actionType,sourceUrl,minimumCriteria,whoCanHelp,plainLanguageWhy,acceptedFormats,allowsMultipleUploads,goodUploadExample}],estimatedTimeline,estimatedCost,confidenceScore}. Categories: document,drawing,inspection,fee,license,insurance.' }, { role: 'user', content: userPrompt }],
      response_format: { type: 'json_object' },
      temperature: 0.2
    });

    const content = response.choices[0]?.message?.content || '{}';
    const result = JSON.parse(content);

    const requirements = Array.isArray(result.requirements)
      ? result.requirements.map((r: any, i: number) => enrichRequirement(r, i))
      : [];

    return res.status(200).json({
      requirements,
      estimatedTimeline: result.estimatedTimeline || '5-10 business days',
      estimatedCost: result.estimatedCost || '$150-500',
      confidenceScore: result.confidenceScore || 0.8,
      fallback: false,
      rateLimit
    });
  } catch (error) {
    console.error('AI analysis error:', error);
    return res.status(500).json({
      error: 'AI analysis failed',
      requirements: [],
      estimatedTimeline: '5-10 business days',
      estimatedCost: '$150-500',
      confidenceScore: 0.5,
      fallback: true
    });
  }
}
