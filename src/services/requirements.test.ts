import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getRequirementsForJob,
  categorizeRequirements,
  calculateProgress,
  getDefaultRequirements,
} from "./requirements";
import * as ai from "./ai";

// Mock the AI module
vi.mock("./ai", () => ({
  analyzeJobRequirements: vi.fn(),
}));

describe("getRequirementsForJob", () => {
  const mockAnalyzeJobRequirements = vi.mocked(ai.analyzeJobRequirements);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return requirements from AI when available", async () => {
    const mockRequirements = [
      {
        id: "req-1",
        jobId: "job-1",
        category: "document" as const,
        title: "Permit Application",
        description: "Application form",
        isRequired: true,
        confidence: 0.9,
        status: "pending" as const,
      },
    ];

    mockAnalyzeJobRequirements.mockResolvedValue({
      requirements: mockRequirements,
      estimatedTimeline: "5-10 days",
      estimatedCost: "$150-500",
      confidenceScore: 0.85,
      fallback: false,
    });

    const result = await getRequirementsForJob(
      "RE_ROOFING",
      "PINELLAS_COUNTY",
      "123 Test St"
    );

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Permit Application");
  });

  it("should cache requirements for same job type and jurisdiction", async () => {
    const mockRequirements = [
      {
        id: "req-1",
        jobId: "job-1",
        category: "document" as const,
        title: "Permit Application",
        description: "Application form",
        isRequired: true,
        confidence: 0.9,
        status: "pending" as const,
      },
    ];

    mockAnalyzeJobRequirements.mockResolvedValue({
      requirements: mockRequirements,
      estimatedTimeline: "5-10 days",
      estimatedCost: "$150-500",
      confidenceScore: 0.85,
      fallback: false,
    });

    // First call
    await getRequirementsForJob("RE_ROOFING", "PINELLAS_COUNTY", "123 Test St");
    // Second call - should use cache
    await getRequirementsForJob("RE_ROOFING", "PINELLAS_COUNTY", "456 Other St");

    // AI should only be called once
    expect(mockAnalyzeJobRequirements).toHaveBeenCalledTimes(1);
  });

  it("should return default requirements when AI fails", async () => {
    mockAnalyzeJobRequirements.mockRejectedValue(new Error("API Error"));

    const result = await getRequirementsForJob(
      "RE_ROOFING",
      "PINELLAS_COUNTY",
      "123 Test St"
    );

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].category).toBe("document");
  });

  it("should handle different job types", async () => {
    mockAnalyzeJobRequirements.mockResolvedValue({
      requirements: [
        {
          id: "req-1",
          jobId: "job-1",
          category: "drawing" as const,
          title: "Roof Plan",
          description: "Scale drawing",
          isRequired: true,
          confidence: 0.9,
          status: "pending" as const,
        },
      ],
      estimatedTimeline: "5-10 days",
      estimatedCost: "$150-500",
      confidenceScore: 0.85,
      fallback: false,
    });

    const result = await getRequirementsForJob(
      "RE_ROOFING",
      "PINELLAS_COUNTY",
      "123 Test St"
    );

    expect(result[0].category).toBe("drawing");
  });
});

describe("categorizeRequirements", () => {
  it("should categorize requirements correctly", () => {
    const requirements = [
      {
        id: "req-1",
        jobId: "job-1",
        category: "document" as const,
        title: "Permit Application",
        description: "Form",
        isRequired: true,
        confidence: 1,
        status: "pending" as const,
      },
      {
        id: "req-2",
        jobId: "job-1",
        category: "drawing" as const,
        title: "Roof Plan",
        description: "Drawing",
        isRequired: true,
        confidence: 1,
        status: "pending" as const,
      },
      {
        id: "req-3",
        jobId: "job-1",
        category: "inspection" as const,
        title: "Final Inspection",
        description: "Inspection",
        isRequired: true,
        confidence: 1,
        status: "pending" as const,
      },
    ];

    const categorized = categorizeRequirements(requirements);

    expect(categorized.documents).toHaveLength(1);
    expect(categorized.drawings).toHaveLength(1);
    expect(categorized.inspections).toHaveLength(1);
    expect(categorized.licenses).toHaveLength(0);
  });

  it("should handle empty requirements", () => {
    const categorized = categorizeRequirements([]);

    expect(categorized.documents).toHaveLength(0);
    expect(categorized.drawings).toHaveLength(0);
    expect(categorized.inspections).toHaveLength(0);
    expect(categorized.licenses).toHaveLength(0);
    expect(categorized.insurance).toHaveLength(0);
    expect(categorized.fees).toHaveLength(0);
  });
});

describe("calculateProgress", () => {
  it("should calculate 0% progress when no requirements completed", () => {
    const requirements = [
      { status: "pending" as const },
      { status: "pending" as const },
    ];

    const progress = calculateProgress(requirements as any);

    expect(progress).toBe(0);
  });

  it("should calculate 50% progress when half completed", () => {
    const requirements = [
      { status: "completed" as const },
      { status: "pending" as const },
    ];

    const progress = calculateProgress(requirements as any);

    expect(progress).toBe(50);
  });

  it("should calculate 100% progress when all completed", () => {
    const requirements = [
      { status: "completed" as const },
      { status: "completed" as const },
    ];

    const progress = calculateProgress(requirements as any);

    expect(progress).toBe(100);
  });

  it("should return 0 for empty requirements", () => {
    const progress = calculateProgress([]);

    expect(progress).toBe(0);
  });
});

describe("getDefaultRequirements", () => {
  it("should return roofing-specific requirements for RE_ROOFING", () => {
    const result = getDefaultRequirements("RE_ROOFING");

    expect(result.length).toBeGreaterThan(0);
    expect(result.some((r) => r.title.includes("Roof"))).toBe(true);
  });

  it("should return generic requirements for unknown job type", () => {
    const result = getDefaultRequirements("UNKNOWN_TYPE" as any);

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].category).toBe("document");
  });
});
