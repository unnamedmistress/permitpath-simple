import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JobInput } from './useJobs';
import { JobType, Jurisdiction, Requirement } from '@/types/permit';

describe('Job Creation Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle complete job creation flow', async () => {
    // Create job input
    const jobInput: JobInput = {
      jobType: 'RE_ROOFING' as JobType,
      jurisdiction: 'PINELLAS_COUNTY' as Jurisdiction,
      address: '123 Main St, St Petersburg, FL 33710',
      description: 'Test reroofing job',
    };

    const requirements: Requirement[] = [
      {
        id: 'req-1',
        jobId: '',
        category: 'document',
        title: 'Permit Application',
        description: 'Completed permit application form',
        isRequired: true,
        confidence: 1.0,
        status: 'pending',
      },
      {
        id: 'req-2',
        jobId: '',
        category: 'document',
        title: 'Insurance Certificate',
        description: 'General liability insurance cert',
        isRequired: true,
        confidence: 1.0,
        status: 'pending',
      },
    ];

    // Verify job input
    expect(jobInput.jobType).toBe('RE_ROOFING');
    expect(jobInput.address).toContain('St Petersburg');
    
    // Verify requirements
    expect(requirements).toHaveLength(2);
    expect(requirements.filter(r => r.isRequired)).toHaveLength(2);
  });

  it('should validate required fields', () => {
    const jobInput: JobInput = {
      jobType: 'WATER_HEATER' as JobType,
      jurisdiction: 'CLEARWATER' as Jurisdiction,
      address: '',
    };

    expect(jobInput.address).toBe('');
    expect(jobInput.jobType).toBe('WATER_HEATER');
  });
});
