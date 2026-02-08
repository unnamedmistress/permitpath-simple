import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Job } from "@/types/permit";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Job storage utilities
const JOBS_STORAGE_KEY = 'permitpath_jobs';

export function getJobsFromMemory(): Job[] {
  try {
    const stored = localStorage.getItem(JOBS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function getJobFromMemory(jobId: string): Job | null {
  const jobs = getJobsFromMemory();
  return jobs.find(job => job.id === jobId) || null;
}

export function saveJobToMemory(job: Job): void {
  const jobs = getJobsFromMemory();
  const existingIndex = jobs.findIndex(j => j.id === job.id);
  if (existingIndex >= 0) {
    jobs[existingIndex] = job;
  } else {
    jobs.push(job);
  }
  localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
}

export function deleteJobFromMemory(jobId: string): void {
  const jobs = getJobsFromMemory();
  const filtered = jobs.filter(job => job.id !== jobId);
  localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(filtered));
}
