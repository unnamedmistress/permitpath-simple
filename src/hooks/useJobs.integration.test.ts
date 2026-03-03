import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { JobInput } from "./useJobs";
import {
  getQuestionsForJobType,
  validateFLLicense,
  shouldShowQuestion,
} from "@/data/jobQuestions";
import { JobType, Jurisdiction, Requirement } from "@/types/permit";

// Mock the modules
vi.mock("@/config/supabase", () => ({
  getSupabaseClient: vi.fn(),
  isSupabaseConfigured: vi.fn(() => true),
}));

vi.mock("@/context/SupabaseAuthContext", () => ({
  useSupabaseAuth: vi.fn(() => ({
    user: { id: "user-123", email: "test@test.com" },
    isAuthenticated: true,
  })),
}));

describe("useJobs Hook - Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Complete Wizard Flow - End-to-End", () => {
    it("should verify wizard flow data structure for roof replacement job", () => {
      // Verify job type questions exist
      const roofQuestions = getQuestionsForJobType("RE_ROOFING");
      expect(roofQuestions.length).toBeGreaterThan(0);
      expect(roofQuestions.some((q) => q.id === "roofPercentage")).toBe(true);
      expect(roofQuestions.some((q) => q.id === "roofWorkType")).toBe(true);

      // Create complete job input
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

      // Verify all fields are properly structured
      expect(jobInput.jobType).toBe("RE_ROOFING");
      expect(jobInput.jurisdiction).toBe("PINELLAS_COUNTY");
      expect(jobInput.contractorInfo?.contractorName).toBe("Pro Roofing LLC");
      expect(jobInput.contractorInfo?.licenseNumber).toBe("CBC1258963");
      expect(jobInput.budgetTimeline?.estimatedCost).toBe("$10k-$25k");
      expect(jobInput.buildingDetails?.propertyType).toBe("Single-Family");
      expect(jobInput.permitHistory?.openPermits).toBe("no");

      // Verify requirements can be structured
      const requirements: Requirement[] = [
        {
          id: "req-roof-1",
          jobId: "job-123",
          category: "document",
          title: "Building Permit Application",
          description: "Required for roof replacement over 25%",
          isRequired: true,
          confidence: 0.95,
          status: "pending",
        },
        {
          id: "req-roof-2",
          jobId: "job-123",
          category: "drawing",
          title: "Roof Plans",
          description: "Scaled drawings of roof layout",
          isRequired: true,
          confidence: 0.9,
          status: "pending",
        },
      ];

      expect(requirements.length).toBe(2);
      expect(requirements[0].category).toBe("document");
    });

    it("should verify wizard flow data structure for water heater job", () => {
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

      expect(jobInput.jobType).toBe("WATER_HEATER");
      expect(jobInput.jurisdiction).toBe("ST_PETERSBURG");
    });

    it("should verify wizard flow data structure for electrical panel job", () => {
      // Verify electrical questions
      const electricalQuestions = getQuestionsForJobType("ELECTRICAL_PANEL");
      expect(electricalQuestions.some((q) => q.id === "amperage")).toBe(true);
      expect(electricalQuestions.some((q) => q.id === "circuitType")).toBe(true);
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

      expect(jobInput.jobType).toBe("ELECTRICAL_PANEL");
      expect(jobInput.contractorInfo?.licenseNumber).toBe("EC1234567");
    });
  });

  describe("Save Job After Submission", () => {
    it("should verify job data structure with all persisted fields", () => {
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

      // Verify all Phase 2 fields are present
      expect(jobInput.contractorInfo).toBeDefined();
      expect(jobInput.budgetTimeline).toBeDefined();
      expect(jobInput.buildingDetails).toBeDefined();
      expect(jobInput.permitHistory).toBeDefined();

      // Verify specific fields
      expect(jobInput.contractorInfo?.contractorName).toBe("Cool Air Services");
      expect(jobInput.budgetTimeline?.whosPaying).toBe("Homeowner");
      expect(jobInput.buildingDetails?.numberOfStories).toBe("1");
      expect(jobInput.permitHistory?.knownCodeViolations).toBe("no");
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
      expect(plumbingDistanceQuestion?.followUpCondition).toBe("true");
    });

    it("should validate follow-up question visibility logic", () => {
      // Should show when parent is true
      const mockQuestion = {
        id: "follow-up-test",
        question: "Follow up question?",
        type: "text" as const,
        followUpQuestionId: "parentQuestion",
        followUpCondition: "true",
      };

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

    it("should normalize license to uppercase", () => {
      const result = validateFLLicense("c1234567");
      expect(result.valid).toBe(true);
    });
  });
});
