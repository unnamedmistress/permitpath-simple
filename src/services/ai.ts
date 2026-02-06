import OpenAI from 'openai';
import { JobAnalysisRequest, JobAnalysisResponse, Requirement } from '@/types/permit';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function analyzeJobRequirements(
  request: JobAnalysisRequest
): Promise<JobAnalysisResponse> {
  const systemPrompt = `You are a permit requirements expert for Pinellas County, Florida. 
Given a job description, determine the specific permit requirements.

Respond with a JSON object containing:
- requirements: array of requirement objects with category, title, description, isRequired
- estimatedTimeline: typical processing time
- estimatedCost: permit fee estimate
- confidenceScore: 0-1 confidence in the analysis

Categories: document, drawing, inspection, fee, license, insurance`;

  const userPrompt = `Job Type: ${request.jobType}
Jurisdiction: ${request.jurisdiction}
Address: ${request.address}
Description: ${request.description}
${request.squareFootage ? `Square Footage: ${request.squareFootage}` : ''}
${request.yearBuilt ? `Year Built: ${request.yearBuilt}` : ''}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    const result = JSON.parse(content);
    
    return {
      requirements: result.requirements.map((r: any, index: number) => ({
        id: `req-${Date.now()}-${index}`,
        jobId: '', // Will be set by caller
        category: r.category,
        title: r.title,
        description: r.description,
        isRequired: r.isRequired,
        confidence: result.confidenceScore || 0.8,
        status: 'pending'
      })),
      estimatedTimeline: result.estimatedTimeline || '5-10 business days',
      estimatedCost: result.estimatedCost || '$150-500',
      confidenceScore: result.confidenceScore || 0.8
    };
  } catch (error) {
    console.error('AI analysis failed:', error);
    // Return fallback requirements
    return getFallbackRequirements(request.jobType);
  }
}

function getFallbackRequirements(jobType: string): JobAnalysisResponse {
  const baseRequirements: Requirement[] = [
    {
      id: `req-${Date.now()}-1`,
      jobId: '',
      category: 'document',
      title: 'Permit Application',
      description: 'Completed permit application form',
      isRequired: true,
      confidence: 1.0,
      status: 'pending'
    },
    {
      id: `req-${Date.now()}-2`,
      jobId: '',
      category: 'license',
      title: 'Contractor License',
      description: 'Valid Florida contractor license',
      isRequired: true,
      confidence: 1.0,
      status: 'pending'
    },
    {
      id: `req-${Date.now()}-3`,
      jobId: '',
      category: 'insurance',
      title: 'Insurance Certificate',
      description: 'General liability insurance certificate',
      isRequired: true,
      confidence: 1.0,
      status: 'pending'
    }
  ];

  return {
    requirements: baseRequirements,
    estimatedTimeline: '5-10 business days',
    estimatedCost: '$150-500',
    confidenceScore: 0.6
  };
}

export async function validateDocument(
  documentType: string,
  content: string
): Promise<{ isValid: boolean; issues: string[] }> {
  const prompt = `Validate this ${documentType} document. Check for:
1. Expiration dates (flag if expired or expiring soon)
2. Required signatures
3. Completeness
4. Correct form version

Document content: ${content}

Respond with JSON: { "isValid": boolean, "issues": string[] }`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.1
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');
    return {
      isValid: result.isValid ?? true,
      issues: result.issues || []
    };
  } catch (error) {
    console.error('Document validation failed:', error);
    return { isValid: true, issues: [] };
  }
}
