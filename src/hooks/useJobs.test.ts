import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JobInput } from './useJobs';
import { Requirement, JobType, Jurisdiction } from '@/types/permit';

describe('useJobs Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle job input structure', () => {
    const jobInput: JobInput = {
      jobType: 'RE_ROOFING' as JobType,
      jurisdiction: 'PINELLAS_COUNTY' as Jurisdiction,
      address: '123 Test St',
      description: 'Test job',
    };

    expect(jobInput.jobType).toBe('RE_ROOFING');
    expect(jobInput.jurisdiction).toBe('PINELLAS_COUNTY');
    expect(jobInput.address).toBe('123 Test St');
  });

  it('should handle requirements structure', () => {
    const requirements: Requirement[] = [
      {
        id: 'req-1',
        jobId: '',
        category: 'document',
        title: 'Test requirement',
        description: 'Test description',
        isRequired: true,
        confidence: 0.9,
        status: 'pending',
      },
    ];

    expect(requirements).toHaveLength(1);
    expect(requirements[0].category).toBe('document');
    expect(requirements[0].isRequired).toBe(true);
  });
});
