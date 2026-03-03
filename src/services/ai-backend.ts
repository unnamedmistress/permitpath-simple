import { JobAnalysisRequest, JobAnalysisResponse, Requirement } from '@/types/permit';

const API_BASE_URL = '/api/ai';

// Rate limiting storage
const rateLimitTracker = new Map<string, { count: number; resetTime: number }>();

function trackRequest(userId: string): boolean {
  const now = Date.now();
  const record = rateLimitTracker.get(userId);

  if (!record || now > record.resetTime) {
    rateLimitTracker.set(userId, { count: 1, resetTime: now + 60000 });
    return true;
  }

  if (record.count >= 10) {
    return false;
  }

  record.count++;
  return true;
}

function enrichRequirement(requirement: Requirement): Requirement {
  return {
    ...requirement,
    actionType: requirement.actionType || 'Fill out and upload',
    sourceUrl: requirement.sourceUrl || 'https://pinellas.gov/topic/building-development/permits/',
    minimumCriteria: requirement.minimumCriteria || 'Clear address, names, and signatures',
    whoCanHelp: requirement.whoCanHelp || 'County permit desk',
    plainLanguageWhy: requirement.plainLanguageWhy || 'The county needs this to review your job.',
    acceptedFormats: requirement.acceptedFormats || ['PDF', 'JPG', 'PNG'],
    allowsMultipleUploads: requirement.allowsMultipleUploads ?? false,
    goodUploadExample: requirement.goodUploadExample || 'Clear full-page image or PDF'
  };
}

function getFallbackRequirements(jobType: string): Requirement[] {
  return [
    {
      id: `req-fallback-1`,
      jobId: '',
      category: 'document',
      title: 'Permit Application',
      description: 'Completed permit application form',
      isRequired: true,
      confidence: 1.0,
      status: 'pending',
      actionType: 'Fill out and upload',
      sourceUrl: 'https://pinellas.gov/topic/building-development/permits/',
      minimumCriteria: 'Signed form with full property address',
      whoCanHelp: 'County permit desk',
      plainLanguageWhy: 'This starts your permit review.',
      acceptedFormats: ['PDF'],
      allowsMultipleUploads: false,
      goodUploadExample: 'Signed permit form PDF'
    },
    {
      id: `req-fallback-2`,
      jobId: '',
      category: 'license',
      title: 'Contractor License',
      description: 'Valid Florida contractor license',
      isRequired: true,
      confidence: 1.0,
      status: 'pending',
      actionType: 'Upload proof',
      sourceUrl: 'https://www.myfloridalicense.com/',
      minimumCriteria: 'Active license with matching business name',
      whoCanHelp: 'Florida DBPR support',
      plainLanguageWhy: 'County checks licensed workers for permit jobs.',
      acceptedFormats: ['PDF', 'JPG', 'PNG'],
      allowsMultipleUploads: false,
      goodUploadExample: 'License image showing expiration date'
    },
    {
      id: `req-fallback-3`,
      jobId: '',
      category: 'insurance',
      title: 'Insurance Certificate',
      description: 'General liability insurance certificate',
      isRequired: true,
      confidence: 1.0,
      status: 'pending',
      actionType: 'Request from insurer and upload',
      minimumCriteria: 'Coverage dates include permit period',
      whoCanHelp: 'Insurance agent',
      plainLanguageWhy: 'County wants active coverage during work.',
      acceptedFormats: ['PDF'],
      allowsMultipleUploads: true,
      goodUploadExample: 'Certificate with policy dates and limits'
    }
  ];
}

export async function analyzeJobRequirements(request: JobAnalysisRequest): Promise<JobAnalysisResponse> {
  const userId = 'anonymous';

  if (!trackRequest(userId)) {
    return {
      requirements: getFallbackRequirements(request.jobType),
      estimatedTimeline: '5-10 business days',
      estimatedCost: '$150-500',
      confidenceScore: 0.6,
      fallback: true
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.requirements) {
      result.requirements = result.requirements.map(enrichRequirement);
    }

    return {
      requirements: result.requirements || getFallbackRequirements(request.jobType),
      estimatedTimeline: result.estimatedTimeline || '5-10 business days',
      estimatedCost: result.estimatedCost || '$150-500',
      confidenceScore: result.confidenceScore || 0.8,
      fallback: result.fallback || false,
      usage: result.usage
    };
  } catch (error) {
    console.error('Backend analysis failed:', error);
    return {
      requirements: getFallbackRequirements(request.jobType),
      estimatedTimeline: '5-10 business days',
      estimatedCost: '$150-500',
      confidenceScore: 0.6,
      fallback: true
    };
  }
}

export async function chatWithAI(messages: { role: 'user' | 'assistant' | 'system'; content: string }[], jobContext?: { jobType?: string; jurisdiction?: string; address?: string }): Promise<{ message: { role: string; content: string }; fallback: boolean }> {
  const userId = 'anonymous';

  if (!trackRequest(userId)) {
    return {
      message: { role: 'assistant', content: 'You have reached the rate limit. Please try again in a minute.' },
      fallback: true
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId
      },
      body: JSON.stringify({ messages, jobContext })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Chat request failed:', error);
    return {
      message: { role: 'assistant', content: 'I am having trouble connecting. Please try again later or call (727) 464-3888 for assistance.' },
      fallback: true
    };
  }
}
