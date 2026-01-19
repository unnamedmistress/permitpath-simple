import { useState, useCallback } from "react";
import { Job, JobType, Jurisdiction, JobStatus } from "@/types";
import { getSessionId } from "@/utils/sessionId";

// In-memory storage for jobs (demo mode)
let memoryJobs: Job[] = [];

export function useJob() {
  const [jobs, setJobs] = useState<Job[]>(memoryJobs);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // In demo mode, use memory storage
      const sessionId = getSessionId();
      const userJobs = memoryJobs.filter((j) => j.sessionId === sessionId);
      setJobs(userJobs);
    } catch (err) {
      setError("Failed to fetch jobs");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createJob = useCallback(
    async (jobType: JobType, jurisdiction: Jurisdiction, address?: string): Promise<Job> => {
      setIsLoading(true);
      setError(null);
      try {
        const sessionId = getSessionId();
        const newJob: Job = {
          id: `job-${Date.now()}`,
          sessionId,
          jobType,
          jurisdiction,
          status: "IN_PROGRESS",
          createdAt: new Date(),
          updatedAt: new Date(),
          extractedData: {},
          answers: {},
          address,
          title: getJobTitle(jobType, address),
        };

        memoryJobs = [...memoryJobs, newJob];
        setJobs((prev) => [...prev, newJob]);
        setCurrentJob(newJob);
        return newJob;
      } catch (err) {
        setError("Failed to create job");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getJob = useCallback(async (jobId: string): Promise<Job | null> => {
    setIsLoading(true);
    try {
      const job = memoryJobs.find((j) => j.id === jobId) || null;
      setCurrentJob(job);
      return job;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateJob = useCallback(
    async (jobId: string, updates: Partial<Job>): Promise<void> => {
      setIsLoading(true);
      try {
        memoryJobs = memoryJobs.map((j) =>
          j.id === jobId ? { ...j, ...updates, updatedAt: new Date() } : j
        );
        setJobs([...memoryJobs]);
        if (currentJob?.id === jobId) {
          setCurrentJob({ ...currentJob, ...updates, updatedAt: new Date() });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [currentJob]
  );

  const deleteJob = useCallback(async (jobId: string): Promise<void> => {
    memoryJobs = memoryJobs.filter((j) => j.id !== jobId);
    setJobs([...memoryJobs]);
    if (currentJob?.id === jobId) {
      setCurrentJob(null);
    }
  }, [currentJob]);

  return {
    jobs,
    currentJob,
    isLoading,
    error,
    fetchJobs,
    createJob,
    getJob,
    updateJob,
    deleteJob,
    setCurrentJob,
  };
}

function getJobTitle(jobType: JobType, address?: string): string {
  const typeLabels: Record<JobType, string> = {
    ELECTRICAL_PANEL: "Panel Upgrade",
    WATER_HEATER: "Water Heater",
    BATH_REMODEL: "Bath Remodel",
  };
  const label = typeLabels[jobType];
  return address ? `${label} - ${address.split(",")[0]}` : label;
}
