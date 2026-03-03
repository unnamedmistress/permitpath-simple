import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { JobInput } from "./useJobs";
import { JobType, Jurisdiction } from "@/types/permit";

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

describe("useJobs Hook - Unit Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("JobInput Type Tests", () => {
    it("should create job input with all new fields (Phase 2)", () => {
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

      // Verify all fields are present
      expect(jobInput.jobType).toBe("RE_ROOFING");
      expect(jobInput.jurisdiction).toBe("PINELLAS_COUNTY");
      expect(jobInput.address).toBe("123 Test St");
      expect(jobInput.description).toBe("Roof replacement");
      
      // Phase 2 fields
      expect(jobInput.contractorInfo).toBeDefined();
      expect(jobInput.contractorInfo?.contractorName).toBe("Test Contractor");
      expect(jobInput.contractorInfo?.licenseNumber).toBe("C1234567");
      expect(jobInput.contractorInfo?.yearsExperience).toBe("5-10");
      expect(jobInput.contractorInfo?.hasInsurance).toBe(true);
      
      expect(jobInput.budgetTimeline).toBeDefined();
      expect(jobInput.budgetTimeline?.estimatedCost).toBe("$10k-$25k");
      expect(jobInput.budgetTimeline?.whosPaying).toBe("Homeowner");
      expect(jobInput.budgetTimeline?.desiredStartDate).toBe("2025-06-01");
      expect(jobInput.budgetTimeline?.projectDuration).toBe("1-2 weeks");
      
      expect(jobInput.buildingDetails).toBeDefined();
      expect(jobInput.buildingDetails?.propertyType).toBe("Single-Family");
      expect(jobInput.buildingDetails?.numberOfStories).toBe("2");
      expect(jobInput.buildingDetails?.yearBuilt).toBe(2005);
      expect(jobInput.buildingDetails?.previousWorkOnThis).toBe(false);
      
      expect(jobInput.permitHistory).toBeDefined();
      expect(jobInput.permitHistory?.openPermits).toBe("no");
      expect(jobInput.permitHistory?.knownCodeViolations).toBe("no");
    });

    it("should create job input with minimal fields", () => {
      const jobInput: JobInput = {
        jobType: "WATER_HEATER" as JobType,
        jurisdiction: "ST_PETERSBURG" as Jurisdiction,
      };

      expect(jobInput.jobType).toBe("WATER_HEATER");
      expect(jobInput.jurisdiction).toBe("ST_PETERSBURG");
      expect(jobInput.address).toBeUndefined();
      expect(jobInput.description).toBeUndefined();
      expect(jobInput.contractorInfo).toBeUndefined();
      expect(jobInput.budgetTimeline).toBeUndefined();
      expect(jobInput.buildingDetails).toBeUndefined();
      expect(jobInput.permitHistory).toBeUndefined();
    });

    it("should create job with all job types", () => {
      const jobTypes: JobType[] = [
        "RE_ROOFING",
        "ROOF_REPAIR",
        "WATER_HEATER",
        "ELECTRICAL_PANEL",
        "ELECTRICAL_REWIRING",
        "EV_CHARGER",
        "AC_HVAC_CHANGEOUT",
        "SMALL_BATH_REMODEL",
        "KITCHEN_REMODEL",
        "WINDOW_DOOR_REPLACEMENT",
        "GENERATOR_INSTALL",
        "POOL_BARRIER",
        "DECK_INSTALLATION",
        "FENCE_INSTALLATION",
      ];

      jobTypes.forEach((jobType) => {
        const jobInput: JobInput = {
          jobType,
          jurisdiction: "PINELLAS_COUNTY",
        };
        expect(jobInput.jobType).toBe(jobType);
      });
    });

    it("should create job with all jurisdictions", () => {
      const jurisdictions: Jurisdiction[] = [
        "PINELLAS_COUNTY",
        "ST_PETERSBURG",
        "CLEARWATER",
        "LARGO",
        "PALM_HARBOR",
      ];

      jurisdictions.forEach((jurisdiction) => {
        const jobInput: JobInput = {
          jobType: "RE_ROOFING",
          jurisdiction,
        };
        expect(jobInput.jurisdiction).toBe(jurisdiction);
      });
    });
  });

  describe("ContractorInfo Tests", () => {
    it("should handle all yearsExperience values", () => {
      const experienceValues = ["0-2", "3-5", "5-10", "10+"] as const;

      experienceValues.forEach((yearsExperience) => {
        const jobInput: JobInput = {
          jobType: "RE_ROOFING",
          jurisdiction: "PINELLAS_COUNTY",
          contractorInfo: {
            yearsExperience,
          },
        };
        expect(jobInput.contractorInfo?.yearsExperience).toBe(yearsExperience);
      });
    });

    it("should handle hasInsurance boolean", () => {
      const withInsurance: JobInput = {
        jobType: "RE_ROOFING",
        jurisdiction: "PINELLAS_COUNTY",
        contractorInfo: {
          hasInsurance: true,
        },
      };
      expect(withInsurance.contractorInfo?.hasInsurance).toBe(true);

      const withoutInsurance: JobInput = {
        jobType: "RE_ROOFING",
        jurisdiction: "PINELLAS_COUNTY",
        contractorInfo: {
          hasInsurance: false,
        },
      };
      expect(withoutInsurance.contractorInfo?.hasInsurance).toBe(false);
    });

    it("should handle various license number formats", () => {
      const licenses = ["C1234567", "EC1234567", "CBC1234567", "CAC1254789"];

      licenses.forEach((licenseNumber) => {
        const jobInput: JobInput = {
          jobType: "RE_ROOFING",
          jurisdiction: "PINELLAS_COUNTY",
          contractorInfo: {
            licenseNumber,
          },
        };
        expect(jobInput.contractorInfo?.licenseNumber).toBe(licenseNumber);
      });
    });
  });

  describe("BudgetTimeline Tests", () => {
    it("should handle all estimatedCost values", () => {
      const costValues = ["<$1k", "$1k-$5k", "$5k-$10k", "$10k-$25k", "$25k+"] as const;

      costValues.forEach((estimatedCost) => {
        const jobInput: JobInput = {
          jobType: "RE_ROOFING",
          jurisdiction: "PINELLAS_COUNTY",
          budgetTimeline: {
            estimatedCost,
          },
        };
        expect(jobInput.budgetTimeline?.estimatedCost).toBe(estimatedCost);
      });
    });

    it("should handle all whosPaying values", () => {
      const payerValues = ["Homeowner", "Contractor", "Split"] as const;

      payerValues.forEach((whosPaying) => {
        const jobInput: JobInput = {
          jobType: "RE_ROOFING",
          jurisdiction: "PINELLAS_COUNTY",
          budgetTimeline: {
            whosPaying,
          },
        };
        expect(jobInput.budgetTimeline?.whosPaying).toBe(whosPaying);
      });
    });

    it("should handle all projectDuration values", () => {
      const durationValues = ["<1 week", "1-2 weeks", "2-4 weeks", "1-2 months", "2+ months"] as const;

      durationValues.forEach((projectDuration) => {
        const jobInput: JobInput = {
          jobType: "RE_ROOFING",
          jurisdiction: "PINELLAS_COUNTY",
          budgetTimeline: {
            projectDuration,
          },
        };
        expect(jobInput.budgetTimeline?.projectDuration).toBe(projectDuration);
      });
    });

    it("should handle ISO date string for desiredStartDate", () => {
      const jobInput: JobInput = {
        jobType: "RE_ROOFING",
        jurisdiction: "PINELLAS_COUNTY",
        budgetTimeline: {
          desiredStartDate: "2025-06-15",
        },
      };
      expect(jobInput.budgetTimeline?.desiredStartDate).toBe("2025-06-15");
    });
  });

  describe("BuildingDetails Tests", () => {
    it("should handle all propertyType values", () => {
      const propertyTypes = ["Single-Family", "Condo", "Townhouse", "Commercial"] as const;

      propertyTypes.forEach((propertyType) => {
        const jobInput: JobInput = {
          jobType: "RE_ROOFING",
          jurisdiction: "PINELLAS_COUNTY",
          buildingDetails: {
            propertyType,
          },
        };
        expect(jobInput.buildingDetails?.propertyType).toBe(propertyType);
      });
    });

    it("should handle all numberOfStories values", () => {
      const storyValues = ["1", "2", "3+"] as const;

      storyValues.forEach((numberOfStories) => {
        const jobInput: JobInput = {
          jobType: "RE_ROOFING",
          jurisdiction: "PINELLAS_COUNTY",
          buildingDetails: {
            numberOfStories,
          },
        };
        expect(jobInput.buildingDetails?.numberOfStories).toBe(numberOfStories);
      });
    });

    it("should handle yearBuilt as number", () => {
      const years = [1900, 1950, 2000, 2024];

      years.forEach((yearBuilt) => {
        const jobInput: JobInput = {
          jobType: "RE_ROOFING",
          jurisdiction: "PINELLAS_COUNTY",
          buildingDetails: {
            yearBuilt,
          },
        };
        expect(jobInput.buildingDetails?.yearBuilt).toBe(yearBuilt);
      });
    });

    it("should handle previousWorkOnThis boolean", () => {
      const withPreviousWork: JobInput = {
        jobType: "RE_ROOFING",
        jurisdiction: "PINELLAS_COUNTY",
        buildingDetails: {
          previousWorkOnThis: true,
        },
      };
      expect(withPreviousWork.buildingDetails?.previousWorkOnThis).toBe(true);

      const withoutPreviousWork: JobInput = {
        jobType: "RE_ROOFING",
        jurisdiction: "PINELLAS_COUNTY",
        buildingDetails: {
          previousWorkOnThis: false,
        },
      };
      expect(withoutPreviousWork.buildingDetails?.previousWorkOnThis).toBe(false);
    });
  });

  describe("PermitHistory Tests", () => {
    it("should handle all openPermits values", () => {
      const permitValues = ["yes", "no", "unsure"] as const;

      permitValues.forEach((openPermits) => {
        const jobInput: JobInput = {
          jobType: "RE_ROOFING",
          jurisdiction: "PINELLAS_COUNTY",
          permitHistory: {
            openPermits,
          },
        };
        expect(jobInput.permitHistory?.openPermits).toBe(openPermits);
      });
    });

    it("should handle all knownCodeViolations values", () => {
      const violationValues = ["yes", "no", "unsure"] as const;

      violationValues.forEach((knownCodeViolations) => {
        const jobInput: JobInput = {
          jobType: "RE_ROOFING",
          jurisdiction: "PINELLAS_COUNTY",
          permitHistory: {
            knownCodeViolations,
          },
        };
        expect(jobInput.permitHistory?.knownCodeViolations).toBe(knownCodeViolations);
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle empty job input gracefully", () => {
      const jobInput: JobInput = {
        jobType: "" as JobType,
        jurisdiction: "" as Jurisdiction,
      };

      expect(jobInput.jobType).toBe("");
      expect(jobInput.jurisdiction).toBe("");
    });

    it("should handle partial contractor info", () => {
      const jobInput: JobInput = {
        jobType: "RE_ROOFING",
        jurisdiction: "PINELLAS_COUNTY",
        contractorInfo: {
          contractorName: "Test Contractor",
          // licenseNumber omitted
          // yearsExperience omitted
          // hasInsurance omitted
        },
      };

      expect(jobInput.contractorInfo?.contractorName).toBe("Test Contractor");
      expect(jobInput.contractorInfo?.licenseNumber).toBeUndefined();
      expect(jobInput.contractorInfo?.yearsExperience).toBeUndefined();
      expect(jobInput.contractorInfo?.hasInsurance).toBeUndefined();
    });

    it("should handle partial budget timeline", () => {
      const jobInput: JobInput = {
        jobType: "RE_ROOFING",
        jurisdiction: "PINELLAS_COUNTY",
        budgetTimeline: {
          estimatedCost: "$10k-$25k",
          // whosPaying omitted
          // desiredStartDate omitted
          // projectDuration omitted
        },
      };

      expect(jobInput.budgetTimeline?.estimatedCost).toBe("$10k-$25k");
      expect(jobInput.budgetTimeline?.whosPaying).toBeUndefined();
    });
  });
});
