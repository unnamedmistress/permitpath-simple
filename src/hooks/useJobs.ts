import { useState, useEffect, useCallback } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '@/config/supabase';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { Job, Requirement, ContractorInfo, BudgetTimeline, BuildingDetails, PermitHistory } from '@/types/permit';
import { JobType, Jurisdiction } from '@/types';

export interface JobInput {
  jobType: JobType;
  jurisdiction: Jurisdiction;
  address?: string;
  description?: string;
  // Phase 2: New fields
  contractorInfo?: ContractorInfo;
  budgetTimeline?: BudgetTimeline;
  buildingDetails?: BuildingDetails;
  permitHistory?: PermitHistory;
}

export function useJobs() {
  const { user, isAuthenticated } = useSupabaseAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const fetchJobs = useCallback(async () => {
    if (!isSupabaseConfigured() || !isAuthenticated) {
      setJobs([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
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

  const createJob = useCallback(async (input: JobInput, requirements: Requirement[]): Promise<Job | null> => {
    if (!isSupabaseConfigured() || !isAuthenticated) {
      setError('Authentication required');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .insert({
          user_id: user?.id,
          job_type: input.jobType,
          jurisdiction: input.jurisdiction,
          address: input.address,
          description: input.description,
          status: 'requirements_pending',
        })
        .select()
        .single();

      if (jobError) throw jobError;

      if (requirements.length > 0) {
        const requirementsData = requirements.map((req) => ({
          job_id: jobData.id,
          category: req.category,
          title: req.title,
          description: req.description,
          is_required: req.isRequired,
          status: 'pending',
        }));

        await supabase.from('requirements').insert(requirementsData);
      }

      const newJob: Job = {
        id: jobData.id,
        contractorId: jobData.user_id,
        jobType: jobData.job_type,
        jurisdiction: jobData.jurisdiction,
        address: jobData.address || '',
        description: jobData.description || '',
        status: jobData.status,
        requirements: requirements.map(r => ({ ...r, jobId: jobData.id })),
        documents: [],
        inspections: [],
        createdAt: new Date(jobData.created_at),
        updatedAt: new Date(jobData.updated_at),
        // Phase 2: New fields
        contractorInfo: input.contractorInfo,
        budgetTimeline: input.budgetTimeline,
        buildingDetails: input.buildingDetails,
        permitHistory: input.permitHistory,
      };

      setJobs(prev => [newJob, ...prev]);
      return newJob;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create job';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isAuthenticated]);

  const updateJob = useCallback(async (jobId: string, updates: Partial<Job>): Promise<void> => {
    if (!isSupabaseConfigured() || !isAuthenticated) return;

    try {
      const supabase = getSupabaseClient();
      await supabase
        .from('jobs')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', jobId)
        .eq('user_id', user?.id);

      setJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, ...updates, updatedAt: new Date() } : job
      ));
    } catch (err) {
      console.error('Error updating job:', err);
    }
  }, [user?.id, isAuthenticated]);

  const deleteJob = useCallback(async (jobId: string): Promise<void> => {
    if (!isSupabaseConfigured() || !isAuthenticated) return;

    try {
      const supabase = getSupabaseClient();
      await supabase.from('jobs').delete().eq('id', jobId).eq('user_id', user?.id);
      setJobs(prev => prev.filter(job => job.id !== jobId));
    } catch (err) {
      console.error('Error deleting job:', err);
    }
  }, [user?.id, isAuthenticated]);

  useEffect(() => {
    if (!isSupabaseConfigured() || !isAuthenticated) return;

    const supabase = getSupabaseClient();
    const newChannel = supabase
      .channel('jobs-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'jobs',
        filter: `user_id=eq.${user?.id}`,
      }, () => fetchJobs())
      .subscribe();

    setChannel(newChannel);
    return () => { newChannel.unsubscribe(); };
  }, [user?.id, isAuthenticated, fetchJobs]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  return { jobs, isLoading, error, fetchJobs, createJob, updateJob, deleteJob };
}

export function useJob(jobId: string | null) {
  const { user, isAuthenticated } = useSupabaseAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJob = useCallback(async () => {
    if (!jobId || !isSupabaseConfigured() || !isAuthenticated) {
      setJob(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
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
    if (!jobId || !isSupabaseConfigured()) return;

    try {
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
