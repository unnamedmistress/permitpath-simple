import { analyzeJobRequirements } from './ai';
import { JobAnalysisRequest, Requirement, JobType, Jurisdiction } from '@/types/permit';

// Cache for AI-analyzed requirements
const requirementsCache = new Map<string, Requirement[]>();

export async function getRequirementsForJob(
  jobType: JobType,
  jurisdiction: Jurisdiction,
  address: string,
  description?: string
): Promise<Requirement[]> {
  const cacheKey = `${jobType}-${jurisdiction}`;
  
  // Check cache first
  const cached = requirementsCache.get(cacheKey);
  if (cached) {
    console.log('Using cached requirements for:', cacheKey);
    return cached.map(r => ({ ...r, id: `req-${Date.now()}-${Math.random()}` }));
  }

  // Call AI to analyze requirements
  const request: JobAnalysisRequest = {
    jobType,
    jurisdiction,
    address,
    description: description || ''
  };

  try {
    const analysis = await analyzeJobRequirements(request);
    
    // Cache the requirements (without job-specific IDs)
    const cacheableRequirements = analysis.requirements.map(r => ({
      ...r,
      id: '', // Remove job-specific ID for caching
      jobId: ''
    }));
    requirementsCache.set(cacheKey, cacheableRequirements);
    
    return analysis.requirements;
  } catch (error) {
    console.error('Failed to get requirements:', error);
    return getDefaultRequirements(jobType);
  }
}

function getDefaultRequirements(jobType: JobType): Requirement[] {
  // Default requirements by job type
  const defaults: Record<string, Requirement[]> = {
    RE_ROOFING: [
      {
        id: `req-${Date.now()}-1`,
        jobId: '',
        category: 'document',
        title: 'Permit Application',
        description: 'Completed building permit application',
        isRequired: true,
        confidence: 1.0,
        status: 'pending'
      },
      {
        id: `req-${Date.now()}-2`,
        jobId: '',
        category: 'drawing',
        title: 'Roof Plan',
        description: 'Scale drawing showing roof dimensions and materials',
        isRequired: true,
        confidence: 1.0,
        status: 'pending'
      },
      {
        id: `req-${Date.now()}-3`,
        jobId: '',
        category: 'document',
        title: 'Manufacturer Specifications',
        description: 'Product approval sheets for roofing materials',
        isRequired: true,
        confidence: 0.9,
        status: 'pending'
      },
      {
        id: `req-${Date.now()}-4`,
        jobId: '',
        category: 'inspection',
        title: 'Roof Sheathing Inspection',
        description: 'Inspection of roof deck before shingle installation',
        isRequired: true,
        confidence: 1.0,
        status: 'pending'
      },
      {
        id: `req-${Date.now()}-5`,
        jobId: '',
        category: 'inspection',
        title: 'Final Inspection',
        description: 'Final roof inspection after completion',
        isRequired: true,
        confidence: 1.0,
        status: 'pending'
      }
    ]
  };

  return defaults[jobType] || [
    {
      id: `req-${Date.now()}-1`,
      jobId: '',
      category: 'document',
      title: 'Permit Application',
      description: 'Standard permit application form',
      isRequired: true,
      confidence: 1.0,
      status: 'pending'
    }
  ];
}

export function categorizeRequirements(requirements: Requirement[]) {
  return {
    documents: requirements.filter(r => r.category === 'document'),
    drawings: requirements.filter(r => r.category === 'drawing'),
    inspections: requirements.filter(r => r.category === 'inspection'),
    licenses: requirements.filter(r => r.category === 'license'),
    insurance: requirements.filter(r => r.category === 'insurance'),
    fees: requirements.filter(r => r.category === 'fee')
  };
}

export function calculateProgress(requirements: Requirement[]) {
  if (requirements.length === 0) return 0;
  const completed = requirements.filter(r => r.status === 'completed').length;
  return Math.round((completed / requirements.length) * 100);
}
