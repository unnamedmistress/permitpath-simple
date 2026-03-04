// OpenAI Server-Side Service
// This file is used ONLY in API routes to keep API keys secure

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY,
});

// Rate limiting storage (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(userId: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(userId);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

export async function analyzeJobWithAI(request: {
  jobType: string;
  jurisdiction: string;
  address: string;
  description: string;
  squareFootage?: number;
  yearBuilt?: number;
}): Promise<any> {
  const prompt = `You are a permit assistant for Pinellas County, Florida. Analyze this construction job and provide:
    
1. Required documents/forms (with plain language names)
2. Estimated timeline
3. Estimated cost range
4. Any special requirements

Job Details:
- Type: ${request.jobType}
- Location: ${request.jurisdiction}
- Address: ${request.address}
- Description: ${request.description || 'N/A'}
- Square Footage: ${request.squareFootage || 'N/A'}
- Year Built: ${request.yearBuilt || 'N/A'}

Response format (JSON):
{
  "requirements": [
    {
      "category": "document|license|insurance|inspection|fee",
      "title": "Plain language title",
      "description": "What this is and why needed",
      "isRequired": true,
      "actionType": "Upload|Fill out|Schedule|Pay",
      "sourceUrl": "URL if available",
      "minimumCriteria": "What makes a valid submission",
      "whoCanHelp": "Who can provide this",
      "plainLanguageWhy": "Why the county needs this",
      "acceptedFormats": ["PDF", "JPG"],
      "allowsMultipleUploads": false
    }
  ],
  "estimatedTimeline": "X-Y business days",
  "estimatedCost": "$XXX-XXX",
  "confidenceScore": 0.95
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful permit assistant. Be concise and practical.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content from OpenAI');
    }

    const result = JSON.parse(content);
    
    return {
      ...result,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      }
    };
  } catch (error) {
    console.error('OpenAI error:', error);
    throw error;
  }
}

export async function chatWithAI(
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  jobContext?: { jobType?: string; jurisdiction?: string; address?: string }
): Promise<{ role: string; content: string }> {
  const systemPrompt = `You are a helpful permit assistant for Pinellas County, Florida.
Help contractors with permit questions. Be concise, practical, and friendly.

Job Context:
${jobContext?.jobType ? `- Type: ${jobContext.jobType}` : ''}
${jobContext?.jurisdiction ? `- Jurisdiction: ${jobContext.jurisdiction}` : ''}
${jobContext?.address ? `- Address: ${jobContext.address}` : ''}

Keep responses under 100 words when possible. If you don't know something, direct them to call (727) 464-3888.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    return { role: 'assistant', content };
  } catch (error) {
    console.error('OpenAI chat error:', error);
    throw error;
  }
}
