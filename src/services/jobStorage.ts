import { Job } from '@/types/permit';
import { getSessionId } from '@/utils/sessionId';

const STORAGE_KEY_PREFIX = 'permitpath_jobs_';

// Get device-specific storage key
function getStorageKey(): string {
  const sessionId = getSessionId();
  return `${STORAGE_KEY_PREFIX}${sessionId}`;
}

// Get all jobs for the current device session
export function getJobs(): Job[] {
  try {
    const key = getStorageKey();
    const data = localStorage.getItem(key);
    if (!data) return [];
    
    const jobs = JSON.parse(data);
    // Parse dates back from JSON
    return jobs.map((job: any) => ({
      ...job,
      createdAt: new Date(job.createdAt),
      updatedAt: new Date(job.updatedAt),
      requirements: (job.requirements || []).map((r: any) => ({
        ...r,
        createdAt: r.createdAt ? new Date(r.createdAt) : undefined,
      })),
      documents: (job.documents || []).map((d: any) => ({
        ...d,
        uploadedAt: d.uploadedAt ? new Date(d.uploadedAt) : undefined,
      })),
    }));
  } catch (error) {
    console.error('Error loading jobs from localStorage:', error);
    return [];
  }
}

// Save jobs to localStorage
export function saveJobs(jobs: Job[]): void {
  try {
    const key = getStorageKey();
    localStorage.setItem(key, JSON.stringify(jobs));
  } catch (error) {
    console.error('Error saving jobs to localStorage:', error);
    // If quota exceeded, try to remove old jobs
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('LocalStorage quota exceeded, removing oldest jobs');
      const reducedJobs = jobs.slice(0, Math.max(1, Math.floor(jobs.length / 2)));
      try {
        localStorage.setItem(getStorageKey(), JSON.stringify(reducedJobs));
      } catch (e) {
        console.error('Still failed after reducing jobs:', e);
      }
    }
  }
}

// Get a single job by ID
export function getJob(jobId: string): Job | null {
  const jobs = getJobs();
  return jobs.find(j => j.id === jobId) || null;
}

// Save a single job (creates or updates)
export function saveJob(job: Job): void {
  const jobs = getJobs();
  const existingIndex = jobs.findIndex(j => j.id === job.id);
  
  if (existingIndex >= 0) {
    jobs[existingIndex] = { ...job, updatedAt: new Date() };
  } else {
    jobs.push(job);
  }
  
  saveJobs(jobs);
}

// Delete a job
export function deleteJob(jobId: string): boolean {
  const jobs = getJobs();
  const filtered = jobs.filter(j => j.id !== jobId);
  
  if (filtered.length !== jobs.length) {
    saveJobs(filtered);
    return true;
  }
  return false;
}

// Update a job partially
export function updateJob(jobId: string, updates: Partial<Job>): boolean {
  const jobs = getJobs();
  const jobIndex = jobs.findIndex(j => j.id === jobId);
  
  if (jobIndex >= 0) {
    jobs[jobIndex] = { ...jobs[jobIndex], ...updates, updatedAt: new Date() };
    saveJobs(jobs);
    return true;
  }
  return false;
}

// Get job count
export function getJobCount(): number {
  return getJobs().length;
}

// Clear all jobs for current session
export function clearAllJobs(): void {
  try {
    localStorage.removeItem(getStorageKey());
  } catch (error) {
    console.error('Error clearing jobs:', error);
  }
}

// Export memory functions for backward compatibility
// These are used by NewJobPage.tsx currently
let memoryJobs: Job[] = [];

export function createJobInMemory(job: Job): void {
  memoryJobs.push(job);
  // Also save to localStorage
  saveJob(job);
}

export function getJobFromMemory(jobId: string): Job | undefined {
  // First check memory, then localStorage
  let job = memoryJobs.find(j => j.id === jobId);
  if (!job) {
    job = getJob(jobId) || undefined;
    if (job) {
      memoryJobs.push(job);
    }
  }
  return job;
}

export function getAllJobsFromMemory(): Job[] {
  // Merge memory and localStorage jobs
  const storageJobs = getJobs();
  const allJobIds = new Set([...memoryJobs.map(j => j.id), ...storageJobs.map(j => j.id)]);
  
  const merged: Job[] = [];
  allJobIds.forEach(id => {
    const memoryJob = memoryJobs.find(j => j.id === id);
    const storageJob = storageJobs.find(j => j.id === id);
    // Prefer storage version (more recent)
    if (storageJob) {
      merged.push(storageJob);
    } else if (memoryJob) {
      merged.push(memoryJob);
    }
  });
  
  // Update memory to match merged state
  memoryJobs = merged;
  
  return merged;
}

export function updateJobInMemory(jobId: string, updates: Partial<Job>): void {
  const jobIndex = memoryJobs.findIndex(j => j.id === jobId);
  if (jobIndex >= 0) {
    memoryJobs[jobIndex] = { ...memoryJobs[jobIndex], ...updates, updatedAt: new Date() };
    saveJob(memoryJobs[jobIndex]);
  } else {
    // Try to get from storage and update
    const storageJob = getJob(jobId);
    if (storageJob) {
      const updated = { ...storageJob, ...updates, updatedAt: new Date() };
      memoryJobs.push(updated);
      saveJob(updated);
    }
  }
}

// Migration helper: Migrate anonymous jobs to authenticated user
export async function migrateAnonymousJobsToUser(userId: string, supabaseClient: any): Promise<number> {
  const anonymousJobs = getJobs();
  if (anonymousJobs.length === 0) return 0;
  
  let migratedCount = 0;
  
  for (const job of anonymousJobs) {
    try {
      // Insert job to Supabase
      const { data: jobData, error: jobError } = await supabaseClient
        .from('jobs')
        .insert({
          user_id: userId,
          job_type: job.jobType,
          jurisdiction: job.jurisdiction,
          address: job.address,
          description: job.description,
          status: job.status,
        })
        .select()
        .single();
      
      if (jobError) throw jobError;
      
      // Insert requirements if any
      if (job.requirements && job.requirements.length > 0) {
        const requirementsData = job.requirements.map(req => ({
          job_id: jobData.id,
          category: req.category,
          title: req.title,
          description: req.description,
          is_required: req.isRequired,
          status: req.status,
        }));
        
        await supabaseClient.from('requirements').insert(requirementsData);
      }
      
      migratedCount++;
    } catch (error) {
      console.error(`Failed to migrate job ${job.id}:`, error);
    }
  }
  
  // Clear localStorage jobs after migration
  if (migratedCount > 0) {
    clearAllJobs();
  }
  
  return migratedCount;
}