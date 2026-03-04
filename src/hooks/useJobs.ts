import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient, isSupabaseConfigured, isLocalStorageMode } from '@/config/supabase';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { Job, Requirement, ContractorInfo, BudgetTimeline, BuildingDetails, PermitHistory, WorkerType } from '@/types/permit';
import { JobType, Jurisdiction } from '@/types';

export interface JobInput {
  jobType: JobType;
  jurisdiction: Jurisdiction;
  address?: string;
  description?: string;
  // Phase 2: New fields
  workerType?: WorkerType;
  contractorInfo?: ContractorInfo;
  budgetTimeline?: BudgetTimeline;
  buildingDetails?: BuildingDetails;
  permitHistory?: PermitHistory;
}

// localStorage keys
const STORAGE_KEY_JOBS = 'permitpath:jobs';
const STORAGE_KEY_REQUIREMENTS = 'permitpath:requirements';

// localStorage quota helper
function checkLocalStorageQuota(): { hasSpace: boolean; available: number } {
  try {
    const used = new Blob(Object.values(localStorage)).size;
    const limit = 5 * 1024 * 1024; // 5MB typical limit
    return { hasSpace: used < limit * 0.9, available: limit - used };
  } catch {
    return { hasSpace: true, available: 0 };
  }
}

// localStorage job helpers
function getJobsFromStorage(): Job[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_JOBS);
    if (!data) return [];
    const jobs = JSON.parse(data);
    return jobs.map((j: any) => ({
      ...j,
      createdAt: new Date(j.createdAt),
      updatedAt: new Date(j.updatedAt),
    }));
  } catch {
    return [];
  }
}

function saveJobsToStorage(jobs: Job[]): void {
  try {
    const quota = checkLocalStorageQuota();
    if (!quota.hasSpace) {
      console.warn('[useJobs] LocalStorage quota nearly exceeded');
    }
    localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(jobs));
  } catch (err) {
    console.error('[useJobs] Failed to save jobs to localStorage:', err);
  }
}

function getRequirementsFromStorage(jobId: string): Requirement[] {
  try {
    const data = localStorage.getItem(`${STORAGE_KEY_REQUIREMENTS}:${jobId}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveRequirementsToStorage(jobId: string, requirements: Requirement[]): void {
  try {
    localStorage.setItem(`${STORAGE_KEY_REQUIREMENTS}:${jobId}`, JSON.stringify(requirements));
  } catch (err) {
    console.error('[useJobs] Failed to save requirements to localStorage:', err);
  }
}

export function useJobs() {
  const { user, isAuthenticated } = useSupabaseAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load jobs from localStorage on mount
  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Always use localStorage for jobs in localStorage mode
      if (isLocalStorageMode) {
        const storedJobs = getJobsFromStorage();
        setJobs(storedJobs);
        setIsLoading(false);
        return;
      }

      // Fallback to Supabase if not in localStorage mode
      if (!isSupabaseConfigured() || !isAuthenticated) {
        setJobs([]);
        setIsLoading(false);
        return;
      }

      const supabase = getSupabaseClient();
      const { data, error: fetchError } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const transformedJobs: Job[] = (data || []).map((record: any) => ({
        id: record.id,
        contractorId: record.user_id,
        jobType: record.job_type,
        jurisdiction: record.jurisdiction,
        address: record.address || '',
        description: record.description || '',
        status: record.status,
        requirements: [],
        documents: [],
        inspections: [],
        createdAt: new Date(record.created_at),
        updatedAt: new Date(record.updated_at),
      }));

      setJobs(transformedJobs);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch jobs';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isAuthenticated]);

  const createJob = useCallback(async (input: JobInput, requirements: Requirement[]): Promise<Job> => {
    console.log('[useJobs] Starting createJob:', { jobType: input.jobType, jurisdiction: input.jurisdiction });
    
    setIsLoading(true);
    setError(null);

    try {
      const now = new Date();
      const jobId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const newJob: Job = {
        id: jobId,
        contractorId: user?.id || 'local-user',
        jobType: input.jobType,
        jurisdiction: input.jurisdiction,
        address: input.address || '',
        description: input.description || '',
        status: 'requirements_pending',
        requirements: requirements.map(r => ({ ...r, jobId })),
        documents: [],
        inspections: [],
        createdAt: now,
        updatedAt: now,
        // Phase 2: New fields
        workerType: input.workerType || 'homeowner-diy',
        contractorInfo: input.contractorInfo,
        budgetTimeline: input.budgetTimeline,
        buildingDetails: input.buildingDetails,
        permitHistory: input.permitHistory,
      };

      // Check quota before saving
      const quota = checkLocalStorageQuota();
      if (!quota.hasSpace) {
        throw new Error('Storage limit reached. Please delete some old jobs to create new ones.');
      }

      // Save to localStorage
      const currentJobs = getJobsFromStorage();
      const updatedJobs = [newJob, ...currentJobs];
      saveJobsToStorage(updatedJobs);
      
      // Save requirements separately
      if (requirements.length > 0) {
        saveRequirementsToStorage(jobId, requirements.map(r => ({ ...r, jobId })));
      }

      setJobs(updatedJobs);
      console.log('[useJobs] Job created successfully:', newJob.id);
      return newJob;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create job';
      console.error('[useJobs] createJob failed:', message);
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const updateJob = useCallback(async (jobId: string, updates: Partial<Job>): Promise<void> => {
    try {
      const currentJobs = getJobsFromStorage();
      const updatedJobs = currentJobs.map(job => 
        job.id === jobId 
          ? { ...job, ...updates, updatedAt: new Date() } 
          : job
      );
      saveJobsToStorage(updatedJobs);
      setJobs(updatedJobs);
    } catch (err) {
      console.error('Error updating job:', err);
    }
  }, []);

  const deleteJob = useCallback(async (jobId: string): Promise<void> => {
    try {
      const currentJobs = getJobsFromStorage();
      const updatedJobs = currentJobs.filter(job => job.id !== jobId);
      saveJobsToStorage(updatedJobs);
      
      // Also clean up requirements
      try {
        localStorage.removeItem(`${STORAGE_KEY_REQUIREMENTS}:${jobId}`);
      } catch (e) {
        // Ignore cleanup errors
      }
      
      setJobs(updatedJobs);
    } catch (err) {
      console.error('Error deleting job:', err);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  // Get a single job by ID
  const getJob = useCallback(async (jobId: string): Promise<Job | null> => {
    try {
      if (isLocalStorageMode) {
        const jobs = getJobsFromStorage();
        const foundJob = jobs.find(j => j.id === jobId);
        if (foundJob) {
          const requirements = getRequirementsFromStorage(jobId);
          return { ...foundJob, requirements };
        }
        return null;
      }

      if (!isSupabaseConfigured()) return null;

      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        contractorId: data.user_id,
        jobType: data.job_type,
        jurisdiction: data.jurisdiction,
        address: data.address || '',
        description: data.description || '',
        status: data.status,
        requirements: [],
        documents: [],
        inspections: [],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (err) {
      console.error('Error getting job:', err);
      return null;
    }
  }, []);

  return { jobs, isLoading, error, fetchJobs, createJob, updateJob, deleteJob, getJob };
}

export function useJob(jobId: string | null) {
  const { user, isAuthenticated } = useSupabaseAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJob = useCallback(async () => {
    if (!jobId) {
      setJob(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Always use localStorage in localStorage mode
      if (isLocalStorageMode) {
        const jobs = getJobsFromStorage();
        const foundJob = jobs.find(j => j.id === jobId);
        if (foundJob) {
          const requirements = getRequirementsFromStorage(jobId);
          setJob({ ...foundJob, requirements });
        } else {
          setJob(null);
        }
        setIsLoading(false);
        return;
      }

      // Fallback to Supabase if not in localStorage mode
      if (!isSupabaseConfigured() || !isAuthenticated) {
        setJob(null);
        setIsLoading(false);
        return;
      }

      const supabase = getSupabaseClient();
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .eq('user_id', user?.id)
        .single();

      if (jobError) throw jobError;

      const { data: requirementsData } = await supabase
        .from('requirements')
        .select('*')
        .eq('job_id', jobId);

      const { data: documentsData } = await supabase
        .from('documents')
        .select('*')
        .eq('job_id', jobId);

      const transformedJob: Job = {
        id: jobData.id,
        contractorId: jobData.user_id,
        jobType: jobData.job_type,
        jurisdiction: jobData.jurisdiction,
        address: jobData.address || '',
        description: jobData.description || '',
        status: jobData.status,
        requirements: (requirementsData || []).map((r: any) => ({
          id: r.id,
          jobId: r.job_id,
          category: r.category,
          title: r.title,
          description: r.description,
          isRequired: r.is_required,
          confidence: 0.8,
          status: r.status,
        })),
        documents: (documentsData || []).map((d: any) => ({
          id: d.id,
          jobId: d.job_id,
          requirementId: undefined,
          name: d.file_name,
          fileUrl: d.file_url,
          fileType: d.file_type,
          status: 'uploaded',
          uploadedAt: new Date(d.uploaded_at),
        })),
        inspections: [],
        createdAt: new Date(jobData.created_at),
        updatedAt: new Date(jobData.updated_at),
      };

      setJob(transformedJob);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch job';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [jobId, user?.id, isAuthenticated]);

  const updateRequirementStatus = useCallback(async (requirementId: string, status: string) => {
    if (!jobId) return;

    try {
      if (isLocalStorageMode) {
        const requirements = getRequirementsFromStorage(jobId);
        const updatedRequirements = requirements.map(r => 
          r.id === requirementId ? { ...r, status } as any : r
        );
        saveRequirementsToStorage(jobId, updatedRequirements);
        setJob(prev => prev ? {
          ...prev,
          requirements: prev.requirements.map(r => r.id === requirementId ? { ...r, status } as any : r)
        } : null);
        return;
      }

      if (!isSupabaseConfigured()) return;

      const supabase = getSupabaseClient();
      await supabase.from('requirements').update({ status }).eq('id', requirementId);
      setJob(prev => prev ? {
        ...prev,
        requirements: prev.requirements.map(r => r.id === requirementId ? { ...r, status } as any : r)
      } : null);
    } catch (err) {
      console.error('Error updating requirement:', err);
    }
  }, [jobId]);

  useEffect(() => { fetchJob(); }, [fetchJob]);

  return { job, isLoading, error, fetchJob, updateRequirementStatus, setJob };
}
