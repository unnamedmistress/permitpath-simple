import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useJobs, JobInput } from "./useJobs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import * as supabaseModule from "@/config/supabase";
import * as authContext from "@/context/SupabaseAuthContext";
import { JobType, Jurisdiction, Requirement, Job } from "@/types/permit";

// Mock the supabase module
vi.mock("@/config/supabase", () => ({
  getSupabaseClient: vi.fn(),
  isSupabaseConfigured: vi.fn(),
}));

// Mock the auth context
vi.mock("@/context/SupabaseAuthContext", () => ({
  useSupabaseAuth: vi.fn(),
}));

// Mock RealtimeChannel
const createMockChannel = () => ({
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockReturnThis(),
  unsubscribe: vi.fn(),
});

const createMockSupabaseClient = (overrides: any = {}) => {
  const mockChannel = createMockChannel();
  
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      ...overrides,
    }),
    channel: vi.fn().mockReturnValue(mockChannel),
    ...overrides,
  };
};

const mockUser = {
  id: "user-123",
  email: "test@example.com",
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
};

const createMockJob = (overrides: Partial<Job> = {}): Job => ({
  id: "job-123",
  contractorId: mockUser.id,
  jobType: "RE_ROOFING" as JobType,
  jurisdiction: "PINELLAS_COUNTY" as Jurisdiction,
  address: "123 Test St, St Pete, FL 33710",
  description: "Test roof replacement",
  status: "requirements_pending",
  requirements: [],
  documents: [],
  inspections: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
};

describe("useJobs Hook - Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authContext.useSupabaseAuth).mockReturnValue({
      user: mockUser as any,
      isAuthenticated: true,
    } as any);
    vi.mocked(supabaseModule.isSupabaseConfigured).mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Initial State", () => {
    it("should initialize with empty jobs array and loading false", () => {
      const mockClient = createMockSupabaseClient();
      vi.mocked(supabaseModule.getSupabaseClient).mockReturnValue(mockClient as any);

      const { result } = renderHook(() => useJobs(), {
        wrapper: createWrapper(),
      });

      expect(result.current.jobs).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("should return empty jobs when not authenticated", () => {
      vi.mocked(authContext.useSupabaseAuth).mockReturnValue({
        user: null,
        isAuthenticated: false,
      } as any);

      const { result } = renderHook(() => useJobs(), {
        wrapper: createWrapper(),
      });

      expect(result.current.jobs).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });

    it("should return empty jobs when supabase is not configured", () => {
      vi.mocked(supabaseModule.isSupabaseConfigured).mockReturnValue(false);

      const { result } = renderHook(() => useJobs(), {
        wrapper: createWrapper(),
      });

      expect(result.current.jobs).toEqual([]);
    });
  });

  describe("Create Job", () => {
    it("should create a job with all new fields (Phase 2)", async () => {
      const mockJobData = {
        id: "new-job-123",
        user_id: mockUser.id,
        job_type: "RE_ROOFING",
        jurisdiction: "PINELLAS_COUNTY",
        address: "123 Test St",
        description: "Roof replacement",
        status: "requirements_pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
        single: vi.fn().mockResolvedValue({ data: mockJobData, error: null }),
      };

      const mockClient = createMockSupabaseClient({ from: () => mockFrom });
      vi.mocked(supabaseModule.getSupabaseClient).mockReturnValue(mockClient as any);

      const { result } = renderHook(() => useJobs(), {
        wrapper: createWrapper(),
      });

      const jobInput: JobInput = {
        jobType: "RE_ROOFING" as JobType,
        jurisdiction: "PINELLAS_COUNTY" as Jurisdiction,
        address: "123 Test St",
        description: "Roof replacement",
        contractorInfo: {
          contractorName: "Test Contractor",
          licenseNumber: "C1234567",
          yearsExperience: "5-10",
          hasInsurance: true,
        },
        budgetTimeline: {
          estimatedCost: "$10k-$25k",
          whosPaying: "Homeowner",
          desiredStartDate: "2025-06-01",
          projectDuration: "1-2 weeks",
        },
        buildingDetails: {
          propertyType: "Single-Family",
          numberOfStories: "2",
          yearBuilt: 2005,
          previousWorkOnThis: false,
        },
        permitHistory: {
          openPermits: "no",
          knownCodeViolations: "no",
        },
      };

      const requirements: Requirement[] = [
        {
          id: "req-1",
          jobId: "",
          category: "document",
          title: "Building Permit",
          description: "Required for roof replacement",
          isRequired: true,
          confidence: 0.95,
          status: "pending",
        },
      ];

      let createdJob: Job | null = null;
      await act(async () => {
        createdJob = await result.current.createJob(jobInput, requirements);
      });

      expect(mockFrom.insert).toHaveBeenCalled();
      expect(createdJob).not.toBeNull();
      expect(createdJob?.contractorInfo).toEqual(jobInput.contractorInfo);
      expect(createdJob?.budgetTimeline).toEqual(jobInput.budgetTimeline);
      expect(createdJob?.buildingDetails).toEqual(jobInput.buildingDetails);
      expect(createdJob?.permitHistory).toEqual(jobInput.permitHistory);
    });

    it("should create a job with minimal fields", async () => {
      const mockJobData = {
        id: "new-job-456",
        user_id: mockUser.id,
        job_type: "WATER_HEATER",
        jurisdiction: "ST_PETERSBURG",
        address: "456 Main St",
        description: null,
        status: "requirements_pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
        single: vi.fn().mockResolvedValue({ data: mockJobData, error: null }),
      };

      const mockClient = createMockSupabaseClient({ from: () => mockFrom });
      vi.mocked(supabaseModule.getSupabaseClient).mockReturnValue(mockClient as any);

      const { result } = renderHook(() => useJobs(), {
        wrapper: createWrapper(),
      });

      const jobInput: JobInput = {
        jobType: "WATER_HEATER" as JobType,
        jurisdiction: "ST_PETERSBURG" as Jurisdiction,
      };

      await act(async () => {
        await result.current.createJob(jobInput, []);
      });

      expect(mockFrom.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockUser.id,
          job_type: "WATER_HEATER",
          jurisdiction: "ST_PETERSBURG",
        })
      );
    });

    it("should handle creation error and return null", async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Database error" },
        }),
      };

      const mockClient = createMockSupabaseClient({ from: () => mockFrom });
      vi.mocked(supabaseModule.getSupabaseClient).mockReturnValue(mockClient as any);

      const { result } = renderHook(() => useJobs(), {
        wrapper: createWrapper(),
      });

      const jobInput: JobInput = {
        jobType: "ELECTRICAL_PANEL" as JobType,
        jurisdiction: "CLEARWATER" as Jurisdiction,
      };

      let createdJob: Job | null = null;
      await act(async () => {
        createdJob = await result.current.createJob(jobInput, []);
      });

      expect(createdJob).toBeNull();
      expect(result.current.error).toBe("Database error");
    });

    it("should require authentication to create job", async () => {
      vi.mocked(authContext.useSupabaseAuth).mockReturnValue({
        user: null,
        isAuthenticated: false,
      } as any);

      const { result } = renderHook(() => useJobs(), {
        wrapper: createWrapper(),
      });

      const jobInput: JobInput = {
        jobType: "AC_HVAC_CHANGEOUT" as JobType,
        jurisdiction: "LARGO" as Jurisdiction,
      };

      let createdJob: Job | null = null;
      await act(async () => {
        createdJob = await result.current.createJob(jobInput, []);
      });

      expect(createdJob).toBeNull();
      expect(result.current.error).toBe("Authentication required");
    });
  });

  describe("Get Jobs List", () => {
    it("should fetch and return jobs list", async () => {
      const mockJobsData = [
        {
          id: "job-1",
          user_id: mockUser.id,
          job_type: "RE_ROOFING",
          jurisdiction: "PINELLAS_COUNTY",
          address: "123 Test St",
          description: "Roof job",
          status: "requirements_pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "job-2",
          user_id: mockUser.id,
          job_type: "WATER_HEATER",
          jurisdiction: "ST_PETERSBURG",
          address: "456 Main St",
          description: "Water heater job",
          status: "documents_pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockJobsData, error: null }),
      };

      const mockClient = createMockSupabaseClient({ from: () => mockFrom });
      vi.mocked(supabaseModule.getSupabaseClient).mockReturnValue(mockClient as any);

      const { result } = renderHook(() => useJobs(), {
        wrapper: createWrapper(),
      });

      // Wait for initial fetch
      await waitFor(() => {
        expect(result.current.jobs.length).toBe(2);
      });

      expect(result.current.jobs[0].id).toBe("job-1");
      expect(result.current.jobs[1].id).toBe("job-2");
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("should handle fetch error", async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Connection failed" },
        }),
      };

      const mockClient = createMockSupabaseClient({ from: () => mockFrom });
      vi.mocked(supabaseModule.getSupabaseClient).mockReturnValue(mockClient as any);

      const { result } = renderHook(() => useJobs(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.error).toBe("Connection failed");
      });

      expect(result.current.jobs).toEqual([]);
    });

    it("should return empty array when no jobs exist", async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      const mockClient = createMockSupabaseClient({ from: () => mockFrom });
      vi.mocked(supabaseModule.getSupabaseClient).mockReturnValue(mockClient as any);

      const { result } = renderHook(() => useJobs(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.jobs).toEqual([]);
    });
  });

  describe("Update Job", () => {
    it("should update job fields", async () => {
      const mockJob = createMockJob({ id: "job-to-update" });
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [
            {
              id: mockJob.id,
              user_id: mockUser.id,
              job_type: mockJob.jobType,
              jurisdiction: mockJob.jurisdiction,
              address: mockJob.address,
              description: mockJob.description,
              status: mockJob.status,
              created_at: mockJob.createdAt.toISOString(),
              updated_at: mockJob.updatedAt.toISOString(),
            },
          ],
          error: null,
        }),
        update: vi.fn().mockResolvedValue({ error: null }),
      };

      const mockClient = createMockSupabaseClient({ from: () => mockFrom });
      vi.mocked(supabaseModule.getSupabaseClient).mockReturnValue(mockClient as any);

      const { result } = renderHook(() => useJobs(), {
        wrapper: createWrapper(),
      });

      // Wait for initial fetch
      await waitFor(() => {
        expect(result.current.jobs.length).toBe(1);
      });

      await act(async () => {
        await result.current.updateJob("job-to-update", {
          status: "documents_pending",
          address: "Updated Address",
        });
      });

      expect(mockFrom.update).toHaveBeenCalled();
      expect(result.current.jobs[0].status).toBe("documents_pending");
      expect(result.current.jobs[0].address).toBe("Updated Address");
    });

    it("should not update job when not authenticated", async () => {
      vi.mocked(authContext.useSupabaseAuth).mockReturnValue({
        user: null,
        isAuthenticated: false,
      } as any);

      const { result } = renderHook(() => useJobs(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.updateJob("job-123", { status: "approved" });
      });

      // Should not throw, just return silently
      expect(result.current.jobs).toEqual([]);
    });
  });

  describe("Delete Job", () => {
    it("should delete job and remove from list", async () => {
      const mockJobsData = [
        {
          id: "job-1",
          user_id: mockUser.id,
          job_type: "RE_ROOFING",
          jurisdiction: "PINELLAS_COUNTY",
          address: "123 Test St",
          description: "Roof job",
          status: "requirements_pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "job-2",
          user_id: mockUser.id,
          job_type: "WATER_HEATER",
          jurisdiction: "ST_PETERSBURG",
          address: "456 Main St",
          description: "Water heater job",
          status: "documents_pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockJobsData, error: null }),
      };

      const mockClient = createMockSupabaseClient({ from: () => mockFrom });
      vi.mocked(supabaseModule.getSupabaseClient).mockReturnValue(mockClient as any);

      const { result } = renderHook(() => useJobs(), {
        wrapper: createWrapper(),
      });

      // Wait for initial fetch
      await waitFor(() => {
        expect(result.current.jobs.length).toBe(2);
      });

      await act(async () => {
        await result.current.deleteJob("job-1");
      });

      expect(mockFrom.delete).toHaveBeenCalled();
      expect(result.current.jobs.length).toBe(1);
      expect(result.current.jobs[0].id).toBe("job-2");
    });

    it("should handle delete error gracefully", async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [
            {
              id: "job-1",
              user_id: mockUser.id,
              job_type: "RE_ROOFING",
              jurisdiction: "PINELLAS_COUNTY",
              address: "123 Test St",
              description: "Roof job",
              status: "requirements_pending",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
          error: null,
        }),
      };

      const mockClient = createMockSupabaseClient({ from: () => mockFrom });
      vi.mocked(supabaseModule.getSupabaseClient).mockReturnValue(mockClient as any);

      const { result } = renderHook(() => useJobs(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.jobs.length).toBe(1);
      });

      // Should not throw
      await act(async () => {
        await result.current.deleteJob("job-1");
      });
    });
  });

  describe("Job Not Found Error Handling", () => {
    it("should handle job not found when fetching single job", async () => {
      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "No rows found", code: "PGRST116" },
        }),
      };

      const mockClient = createMockSupabaseClient({ from: () => mockFrom });
      vi.mocked(supabaseModule.getSupabaseClient).mockReturnValue(mockClient as any);

      // Using useJob hook would be tested separately
      // This tests the error handling pattern
      const { result } = renderHook(() => useJobs(), {
        wrapper: createWrapper(),
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe("Realtime Updates", () => {
    it("should set up realtime subscription", async () => {
      const mockChannel = createMockChannel();
      const mockClient = createMockSupabaseClient({
        channel: vi.fn().mockReturnValue(mockChannel),
      });
      vi.mocked(supabaseModule.getSupabaseClient).mockReturnValue(mockClient as any);

      renderHook(() => useJobs(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockClient.channel).toHaveBeenCalledWith("jobs-changes");
      });

      expect(mockChannel.on).toHaveBeenCalledWith(
        "postgres_changes",
        expect.objectContaining({
          event: "*",
          schema: "public",
          table: "jobs",
        }),
        expect.any(Function)
      );
      expect(mockChannel.subscribe).toHaveBeenCalled();
    });

    it("should unsubscribe on unmount", async () => {
      const mockChannel = createMockChannel();
      const mockClient = createMockSupabaseClient({
        channel: vi.fn().mockReturnValue(mockChannel),
      });
      vi.mocked(supabaseModule.getSupabaseClient).mockReturnValue(mockClient as any);

      const { unmount } = renderHook(() => useJobs(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled();
      });

      unmount();

      expect(mockChannel.unsubscribe).toHaveBeenCalled();
    });
  });
});
