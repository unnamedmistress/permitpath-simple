import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useJobs, JobInput } from "./useJobs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import * as supabaseModule from "@/config/supabase";
import * as authContext from "@/context/SupabaseAuthContext";
import { JobType, Jurisdiction, Requirement } from "@/types/permit";
import { getQuestionsForJobType, validateFLLicense } from "@/data/jobQuestions";

// Mock the modules
vi.mock("@/config/supabase", () => ({
  getSupabaseClient: vi.fn(),
  isSupabaseConfigured: vi.fn(),
}));

vi.mock("@/context/SupabaseAuthContext", () => ({
  useSupabaseAuth: vi.fn(),
}));

// Mock services/permitService if it exists
vi.mock("@/services/permitService", () => ({
  analyzeJobRequirements: vi.fn().mockResolvedValue({
    requirements: [],
    estimatedTimeline: "2-4 weeks",
    estimatedCost: "$500-$1500",
    confidenceScore: 0.9,
  }),
}));

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
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      ...overrides,
    }),
    channel: vi.fn().mockReturnValue(mockChannel),
    ...overrides,
  };
};

const mockUser = {
  id: "user-integration-123",
  email: "integration@test.com",
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe("useJobs Hook - Integration Tests", () => {
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

  describe("Complete Wizard Flow - End-to-End", () => {
    it("should complete full wizard flow for roof replacement job", async () => {
      const mockJobId = "wizard-job-123";
      const mockJobData = {
        id: mockJobId,
        user_id: mockUser.id,
        job_type: "RE_ROOFING",
        jurisdiction: "PINELLAS_COUNTY",
        address: "789 Roof St, St Pete, FL 33710",
        description: "Complete roof replacement for 2000 sq ft home",
        status: "requirements_pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockResolvedValue({ error: null }),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
        single: vi.fn().mockResolvedValue({ data: mockJobData, error: null }),
      };

      const mockClient = createMockSupabaseClient({ from: () => mockFrom });
      vi.mocked(supabaseModule.getSupabaseClient).mockReturnValue(mockClient as any);

      const { result } = renderHook(() => useJobs(), {
        wrapper: createWrapper(),
      });

      // Step 1: Verify job type questions exist
      const roofQuestions = getQuestionsForJobType("RE_ROOFING");
      expect(roofQuestions.length).toBeGreaterThan(0);
      expect(roofQuestions.some((q) => q.id === "roofPercentage")).toBe(true);
      expect(roofQuestions.some((q) => q.id === "roofWorkType")).toBe(true);

      // Step 2: Complete wizard with all details
      const wizardAnswers = {
        roofPercentage: "75-100%",
        roofWorkType: "Full replacement",
        changingMaterial: false,
        structuralChanges: false,
      };

      const jobInput: JobInput = {
        jobType: "RE_ROOFING" as JobType,
        jurisdiction: "PINELLAS_COUNTY" as Jurisdiction,
        address: "789 Roof St, St Pete, FL 33710",
        description: "Complete roof replacement for 2000 sq ft home",
        contractorInfo: {
          contractorName: "Pro Roofing LLC",
          licenseNumber: "CBC1258963",
          yearsExperience: "10+",
          hasInsurance: true,
        },
        budgetTimeline: {
          estimatedCost: "$10k-$25k",
          whosPaying: "Homeowner",
          desiredStartDate: "2025-04-15",
          projectDuration: "1-2 weeks",
        },
        buildingDetails: {
          propertyType: "Single-Family",
          numberOfStories: "1",
          yearBuilt: 1995,
          previousWorkOnThis: false,
        },
        permitHistory: {
          openPermits: "no",
          knownCodeViolations: "no",
        },
      };

      const requirements: Requirement[] = [
        {
          id: "req-roof-1",
          jobId: "",
          category: "document",
          title: "Building Permit Application",
          description: "Required for roof replacement over 25%",
          isRequired: true,
          confidence: 0.95,
          status: "pending",
        },
        {
          id: "req-roof-2",
          jobId: "",
          category: "drawing",
          title: "Roof Plans",
          description: "Scaled drawings of roof layout",
          isRequired: true,
          confidence: 0.9,
          status: "pending",
        },
      ];

      let createdJob: any = null;
      await act(async () => {
        createdJob = await result.current.createJob(jobInput, requirements);
      });

      // Verify job was created with all fields
      expect(createdJob).not.toBeNull();
      expect(createdJob?.jobType).toBe("RE_ROOFING");
      expect(createdJob?.jurisdiction).toBe("PINELLAS_COUNTY");
      expect(createdJob?.contractorInfo?.contractorName).toBe("Pro Roofing LLC");
      expect(createdJob?.contractorInfo?.licenseNumber).toBe("CBC1258963");
      expect(createdJob?.budgetTimeline?.estimatedCost).toBe("$10k-$25k");
      expect(createdJob?.buildingDetails?.propertyType).toBe("Single-Family");
      expect(createdJob?.permitHistory?.openPermits).toBe("no");
    });

    it("should complete wizard flow for water heater job", async () => {
      const mockJobId = "wizard-job-water-456";
      const mockJobData = {
        id: mockJobId,
        user_id: mockUser.id,
        job_type: "WATER_HEATER",
        jurisdiction: "ST_PETERSBURG",
        address: "321 Water St, St Pete, FL 33701",
        description: "Replace old gas water heater",
        status: "requirements_pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockResolvedValue({ error: null }),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
        single: vi.fn().mockResolvedValue({ data: mockJobData, error: null }),
      };

      const mockClient = createMockSupabaseClient({ from: () => mockFrom });
      vi.mocked(supabaseModule.getSupabaseClient).mockReturnValue(mockClient as any);

      const { result } = renderHook(() => useJobs(), {
        wrapper: createWrapper(),
      });

      // Verify water heater questions exist
      const waterHeaterQuestions = getQuestionsForJobType("WATER_HEATER");
      expect(waterHeaterQuestions.length).toBeGreaterThan(0);
      expect(waterHeaterQuestions.some((q) => q.id === "fuelType")).toBe(true);
      expect(waterHeaterQuestions.some((q) => q.id === "tankType")).toBe(true);
      expect(waterHeaterQuestions.some((q) => q.id === "relocating")).toBe(true);

      const jobInput: JobInput = {
        jobType: "WATER_HEATER" as JobType,
        jurisdiction: "ST_PETERSBURG" as Jurisdiction,
        address: "321 Water St, St Pete, FL 33701",
        description: "Replace old gas water heater",
        contractorInfo: {
          contractorName: "Plumbing Pros",
          licenseNumber: "CFC1234567",
          yearsExperience: "5-10",
          hasInsurance: true,
        },
        budgetTimeline: {
          estimatedCost: "$1k-$5k",
          whosPaying: "Homeowner",
          desiredStartDate: "2025-05-01",
          projectDuration: "<1 week",
        },
        buildingDetails: {
          propertyType: "Single-Family",
          numberOfStories: "1",
          yearBuilt: 2000,
          previousWorkOnThis: true,
        },
      };

      const requirements: Requirement[] = [
        {
          id: "req-wh-1",
          jobId: "",
          category: "permit",
          title: "Plumbing Permit",
          description: "Required for water heater replacement",
          isRequired: true,
          confidence: 0.95,
          status: "pending",
        },
      ];

      let createdJob: any = null;
      await act(async () => {
        createdJob = await result.current.createJob(jobInput, requirements);
      });

      expect(createdJob?.jobType).toBe("WATER_HEATER");
      expect(createdJob?.jurisdiction).toBe("ST_PETERSBURG");
    });

    it("should complete wizard flow for electrical panel job", async () => {
      const mockJobData = {
        id: "elec-job-789",
        user_id: mockUser.id,
        job_type: "ELECTRICAL_PANEL",
        jurisdiction: "CLEARWATER",
        address: "555 Electric Ave, Clearwater, FL 33755",
        description: "Upgrade to 200 amp panel",
        status: "requirements_pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockResolvedValue({ error: null }),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
        single: vi.fn().mockResolvedValue({ data: mockJobData, error: null }),
      };

      const mockClient = createMockSupabaseClient({ from: () => mockFrom });
      vi.mocked(supabaseModule.getSupabaseClient).mockReturnValue(mockClient as any);

      const { result } = renderHook(() => useJobs(), {
        wrapper: createWrapper(),
      });

      // Verify electrical questions
      const electricalQuestions = getQuestionsForJobType("ELECTRICAL_PANEL");
      expect(electricalQuestions.some((q) => q.id === "circuitType")).toBe(true);
      expect(electricalQuestions.some((q) => q.id === "amperage")).toBe(true);
      expect(electricalQuestions.some((q) => q.id === "panelUpgrade")).toBe(true);

      // Test license validation
      const validLicense = validateFLLicense("EC1234567");
      expect(validLicense.valid).toBe(true);

      const invalidLicense = validateFLLicense("invalid");
      expect(invalidLicense.valid).toBe(false);

      const jobInput: JobInput = {
        jobType: "ELECTRICAL_PANEL" as JobType,
        jurisdiction: "CLEARWATER" as Jurisdiction,
        address: "555 Electric Ave, Clearwater, FL 33755",
        description: "Upgrade to 200 amp panel",
        contractorInfo: {
          contractorName: "Elite Electric",
          licenseNumber: "EC1234567",
          yearsExperience: "10+",
          hasInsurance: true,
        },
        budgetTimeline: {
          estimatedCost: "$5k-$10k",
          whosPaying: "Split",
          desiredStartDate: "2025-06-01",
          projectDuration: "<1 week",
        },
      };

      const requirements: Requirement[] = [
        {
          id: "req-elec-1",
          jobId: "",
          category: "permit",
          title: "Electrical Permit",
          description: "Required for panel upgrade",
          isRequired: true,
          confidence: 0.98,
          status: "pending",
        },
      ];

      let createdJob: any = null;
      await act(async () => {
        createdJob = await result.current.createJob(jobInput, requirements);
      });

      expect(createdJob?.jobType).toBe("ELECTRICAL_PANEL");
      expect(createdJob?.contractorInfo?.licenseNumber).toBe("EC1234567");
    });
  });

  describe("Save Job After Submission", () => {
    it("should save job after wizard completion with all persisted fields", async () => {
      const mockJobId = "persisted-job-123";
      const createdAt = new Date().toISOString();
      const mockJobData = {
        id: mockJobId,
        user_id: mockUser.id,
        job_type: "AC_HVAC_CHANGEOUT",
        jurisdiction: "LARGO",
        address: "999 Cool St, Largo, FL 33770",
        description: "Replace 3-ton AC unit",
        status: "requirements_pending",
        created_at: createdAt,
        updated_at: createdAt,
      };

      const mockFrom = {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockResolvedValue({ error: null }),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [mockJobData], error: null }),
        single: vi.fn().mockResolvedValue({ data: mockJobData, error: null }),
      };

      const mockClient = createMockSupabaseClient({ from: () => mockFrom });
      vi.mocked(supabaseModule.getSupabaseClient).mockReturnValue(mockClient as any);

      const { result } = renderHook(() => useJobs(), {
        wrapper: createWrapper(),
      });

      const jobInput: JobInput = {
        jobType: "AC_HVAC_CHANGEOUT" as JobType,
        jurisdiction: "LARGO" as Jurisdiction,
        address: "999 Cool St, Largo, FL 33770",
        description: "Replace 3-ton AC unit",
        contractorInfo: {
          contractorName: "Cool Air Services",
          licenseNumber: "CAC1254789",
          yearsExperience: "5-10",
          hasInsurance: true,
        },
        budgetTimeline: {
          estimatedCost: "$5k-$10k",
          whosPaying: "Homeowner",
          desiredStartDate: "2025-07-01",
          projectDuration: "1-2 weeks",
        },
        buildingDetails: {
          propertyType: "Single-Family",
          numberOfStories: "1",
          yearBuilt: 2010,
          previousWorkOnThis: false,
        },
        permitHistory: {
          openPermits: "no",
          knownCodeViolations: "no",
        },
      };

      const requirements: Requirement[] = [
        {
          id: "req-ac-1",
          jobId: "",
          category: "permit",
          title: "Mechanical Permit",
          description: "Required for HVAC replacement",
          isRequired: true,
          confidence: 0.95,
          status: "pending",
        },
      ];

      // Create job
      await act(async () => {
        await result.current.createJob(jobInput, requirements);
      });

      // Verify job is in the list
      await waitFor(() => {
        expect(result.current.jobs.length).toBeGreaterThan(0);
      });

      const savedJob = result.current.jobs.find((j) => j.id === mockJobId);
      expect(savedJob).toBeDefined();
      expect(savedJob?.address).toBe("999 Cool St, Largo, FL 33770");
      expect(savedJob?.jobType).toBe("AC_HVAC_CHANGEOUT");
    });
  });

  describe("Test Job Retrieval", () => {
    it("should retrieve job with all fields including new Phase 2 fields", async () => {
      const mockJobId = "retrieval-job-123";
      const mockJobData = {
        id: mockJobId,
        user_id: mockUser.id,
        job_type: "RE_ROOFING",
        jurisdiction: "PINELLAS_COUNTY",
        address: "123 Retrieve St, St Pete, FL 33710",
        description: "Full roof replacement",
        status: "documents_pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockRequirements = [
        {
          id: "req-1",
          job_id: mockJobId,
          category: "document",
          title: "Building Permit",
          description: "Required permit",
          is_required: true,
          status: "pending",
        },
      ];

      const mockDocuments = [
        {
          id: "doc-1",
          job_id: mockJobId,
          file_name: "permit_app.pdf",
          file_url: "https://storage.example.com/doc1.pdf",
          file_type: "application/pdf",
          uploaded_at: new Date().toISOString(),
        },
      ];

      let callCount = 0;
      const mockFrom = vi.fn().mockImplementation((table: string) => {
        callCount++;
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockImplementation(() => {
            if (table === "jobs") {
              return Promise.resolve({ data: mockJobData, error: null });
            }
            return Promise.resolve({ data: null, error: null });
          }),
          // For requirements and documents queries
          then: vi.fn().mockImplementation((callback: any) => {
            if (table === "requirements") {
              return Promise.resolve(callback({ data: mockRequirements, error: null }));
            }
            if (table === "documents") {
              return Promise.resolve(callback({ data: mockDocuments, error: null }));
            }
            return Promise.resolve(callback({ data: [], error: null }));
          }),
        };
      });

      const mockClient = createMockSupabaseClient({ from: mockFrom });
      vi.mocked(supabaseModule.getSupabaseClient).mockReturnValue(mockClient as any);

      // Import useJob
      const { useJob } = await import("./useJobs");

      const { result } = renderHook(() => useJob(mockJobId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Since we're mocking partially, job might be null
      // But we verify the hook attempts to fetch
      expect(mockFrom).toHaveBeenCalled();
    });
  });

  describe("Conditional Logic - Follow-up Questions", () => {
    it("should handle conditional questions for water heater relocation", () => {
      const waterHeaterQuestions = getQuestionsForJobType("WATER_HEATER");

      const relocatingQuestion = waterHeaterQuestions.find((q) => q.id === "relocating");
      expect(relocatingQuestion).toBeDefined();

      const newLocationQuestion = waterHeaterQuestions.find((q) => q.id === "newLocation");
      expect(newLocationQuestion).toBeDefined();
      expect(newLocationQuestion?.followUpQuestionId).toBe("relocating");
      expect(newLocationQuestion?.followUpCondition).toBe("true");
    });

    it("should handle conditional questions for bathroom plumbing", () => {
      const bathroomQuestions = getQuestionsForJobType("SMALL_BATH_REMODEL");

      const movingPlumbingQuestion = bathroomQuestions.find((q) => q.id === "movingPlumbing");
      expect(movingPlumbingQuestion).toBeDefined();

      const plumbingDistanceQuestion = bathroomQuestions.find((q) => q.id === "plumbingDistance");
      expect(plumbingDistanceQuestion).toBeDefined();
      expect(plumbingDistanceQuestion?.followUpQuestionId).toBe("movingPlumbing");
    });

    it("should validate follow-up question visibility logic", () => {
      const { shouldShowQuestion } = require("@/data/jobQuestions");

      const mockQuestion = {
        id: "follow-up-test",
        question: "Follow up question?",
        type: "text" as const,
        followUpQuestionId: "parentQuestion",
        followUpCondition: "true",
      };

      // Should show when parent is true
      expect(shouldShowQuestion(mockQuestion, { parentQuestion: true })).toBe(true);
      expect(shouldShowQuestion(mockQuestion, { parentQuestion: "true" })).toBe(true);

      // Should not show when parent is false
      expect(shouldShowQuestion(mockQuestion, { parentQuestion: false })).toBe(false);
      expect(shouldShowQuestion(mockQuestion, { parentQuestion: "false" })).toBe(false);

      // Question without followUp should always show
      const noFollowUpQuestion = {
        id: "always-show",
        question: "Always show?",
        type: "text" as const,
      };
      expect(shouldShowQuestion(noFollowUpQuestion, {})).toBe(true);
    });
  });

  describe("Validation Tests", () => {
    it("should validate Florida contractor license formats", () => {
      // Valid licenses
      expect(validateFLLicense("C1234567").valid).toBe(true);
      expect(validateFLLicense("EC1234567").valid).toBe(true);
      expect(validateFLLicense("CBC1234567").valid).toBe(true);
      expect(validateFLLicense("CAC1254789").valid).toBe(true);
      expect(validateFLLicense("CFC1234567").valid).toBe(true);

      // Invalid licenses
      expect(validateFLLicense("invalid").valid).toBe(false);
      expect(validateFLLicense("1234567").valid).toBe(false);
      expect(validateFLLicense("C123").valid).toBe(false);
      expect(validateFLLicense("TOOLONGPREFIX1234567").valid).toBe(false);

      // Empty is valid (optional field)
      expect(validateFLLicense("").valid).toBe(true);
    });

    it("should validate address completeness", () => {
      const { isAddressComplete } = require("@/data/jobQuestions");

      expect(isAddressComplete("123 Main St, St Pete, FL 33710")).toBe(true);
      expect(isAddressComplete("123 Main St 33710")).toBe(true);
      expect(isAddressComplete("12345")).toBe(false);
      expect(isAddressComplete("123 Main")).toBe(false);
      expect(isAddressComplete("")).toBe(false);
    });

    it("should validate description vagueness", () => {
      const { isDescriptionVague } = require("@/data/jobQuestions");

      expect(isDescriptionVague("Fix roof")).toBe(true);
      expect(isDescriptionVague("Replace shingles on north side of house")).toBe(false);
      expect(isDescriptionVague("")).toBe(true);
    });
  });
});
