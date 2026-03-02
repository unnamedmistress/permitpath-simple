import OpenAI from 'openai';
import { JobAnalysisRequest, JobAnalysisResponse, Requirement } from '@/types/permit';

function getOpenAIClient(): OpenAI | null {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const ctorOrFactory = (OpenAI as unknown as { default?: any }).default || OpenAI;
    try {
      return ctorOrFactory({
        apiKey,
        dangerouslyAllowBrowser: true
      });
    } catch {
      return new ctorOrFactory({
        apiKey,
        dangerouslyAllowBrowser: true
      });
    }
  } catch (error) {
    console.error('OpenAI init failed:', error);
    return null;
  }
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

export async function analyzeJobRequirements(request: JobAnalysisRequest): Promise<JobAnalysisResponse> {
  const systemPrompt = `You are a permit requirements expert for Pinellas County, Florida.
Given a job description, determine the specific permit requirements.

Respond with JSON:
- requirements: [{ category, title, description, isRequired, actionType, sourceUrl, minimumCriteria, whoCanHelp, plainLanguageWhy, acceptedFormats, allowsMultipleUploads, goodUploadExample }]
- estimatedTimeline
- estimatedCost
- confidenceScore`;

  const userPrompt = `Job Type: ${request.jobType}
Jurisdiction: ${request.jurisdiction}
Address: ${request.address}
Description: ${request.description}
${request.squareFootage ? `Square Footage: ${request.squareFootage}` : ''}
${request.yearBuilt ? `Year Built: ${request.yearBuilt}` : ''}`;

  const openai = getOpenAIClient();
  if (!openai) {
    return getFallbackRequirements(request.jobType);
  }

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
    if (!content) throw new Error('No response from AI');
    const result = JSON.parse(content);

    const requirements = Array.isArray(result.requirements)
      ? result.requirements.map((r: any, index: number) =>
          enrichRequirement({
            id: `req-${Date.now()}-${index}`,
            jobId: '',
            category: r.category,
            title: r.title,
            description: r.description,
            isRequired: r.isRequired,
            confidence: result.confidenceScore || 0.8,
            status: 'pending',
            actionType: r.actionType,
            sourceUrl: r.sourceUrl,
            minimumCriteria: r.minimumCriteria,
            whoCanHelp: r.whoCanHelp,
            plainLanguageWhy: r.plainLanguageWhy,
            acceptedFormats: r.acceptedFormats,
            allowsMultipleUploads: r.allowsMultipleUploads,
            goodUploadExample: r.goodUploadExample
          })
        )
      : [];

    return {
      requirements,
      estimatedTimeline: result.estimatedTimeline || '5-10 business days',
      estimatedCost: result.estimatedCost || '$150-500',
      confidenceScore: result.confidenceScore || 0.8,
      fallback: false,
      usage: response.usage
    };
  } catch (error) {
    console.error('AI analysis failed:', error);
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
      id: `req-${Date.now()}-2`,
      jobId: '',
      category: 'license',
      title: 'Contractor License',
      description: 'Valid Florida contractor license',
      isRequired: true,
      confidence: 1.0,
      status: 'pending',
      actionType: 'Upload proof',
      minimumCriteria: 'Active license with matching business name',
      whoCanHelp: 'Florida DBPR support',
      plainLanguageWhy: 'County checks licensed workers for permit jobs.',
      acceptedFormats: ['PDF', 'JPG', 'PNG'],
      allowsMultipleUploads: false,
      goodUploadExample: 'License image showing expiration date'
    },
    {
      id: `req-${Date.now()}-3`,
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

  return {
    requirements: baseRequirements.map(enrichRequirement),
    estimatedTimeline: '5-10 business days',
    estimatedCost: '$150-500',
    confidenceScore: 0.6,
    fallback: true
  };
}

export async function validateDocument(documentType: string, content: string): Promise<{ isValid: boolean; issues: string[] }> {
  const openai = getOpenAIClient();
  if (!openai) return { isValid: true, issues: [] };

  const prompt = `Validate this ${documentType} document. Check for:
1. Expiration dates
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
