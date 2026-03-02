import { describe, it, expect, vi, beforeEach } from "vitest";
import { analyzeJobRequirements, validateDocument } from "./ai";
import OpenAI from "openai";

// Mock OpenAI
vi.mock("openai", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn(),
        },
      },
    })),
  };
});

describe("analyzeJobRequirements", () => {
  let mockCreate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreate = vi.fn();
    (OpenAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    }));
  });

  it("should return AI-analyzed requirements on success", async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              requirements: [
                {
                  category: "document",
                  title: "Permit Application",
                  description: "Completed permit application form",
                  isRequired: true,
                },
              ],
              estimatedTimeline: "5-10 business days",
              estimatedCost: "$150-500",
              confidenceScore: 0.85,
            }),
          },
        },
      ],
      usage: {
        prompt_tokens: 100,
        completion_tokens: 50,
        total_tokens: 150,
      },
    };

    mockCreate.mockResolvedValue(mockResponse);

    const result = await analyzeJobRequirements({
      jobType: "RE_ROOFING",
      jurisdiction: "PINELLAS_COUNTY",
      address: "123 Test St",
      description: "Replace roof shingles",
    });

    expect(result.requirements).toHaveLength(1);
    expect(result.requirements[0].title).toBe("Permit Application");
    expect(result.estimatedTimeline).toBe("5-10 business days");
    expect(result.confidenceScore).toBe(0.85);
  });

  it("should return fallback requirements when AI fails", async () => {
    mockCreate.mockRejectedValue(new Error("API Error"));

    const result = await analyzeJobRequirements({
      jobType: "RE_ROOFING",
      jurisdiction: "PINELLAS_COUNTY",
      address: "123 Test St",
      description: "Replace roof shingles",
    });

    expect(result.requirements).toHaveLength(3);
    expect(result.requirements[0].category).toBe("document");
    expect(result.fallback).toBe(true);
  });

  it("should return fallback when no API key is configured", async () => {
    // Simulate no API key by making OpenAI throw on instantiation
    (OpenAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error("No API key provided");
    });

    const result = await analyzeJobRequirements({
      jobType: "RE_ROOFING",
      jurisdiction: "PINELLAS_COUNTY",
      address: "123 Test St",
    });

    expect(result.requirements).toHaveLength(3);
    expect(result.fallback).toBe(true);
  });

  it("should handle invalid JSON from AI", async () => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: "invalid json",
          },
        },
      ],
      usage: {
        prompt_tokens: 100,
        completion_tokens: 50,
        total_tokens: 150,
      },
    });

    const result = await analyzeJobRequirements({
      jobType: "RE_ROOFING",
      jurisdiction: "PINELLAS_COUNTY",
      address: "123 Test St",
    });

    expect(result.requirements).toHaveLength(3);
    expect(result.fallback).toBe(true);
  });

  it("should include token usage in response", async () => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              requirements: [],
              estimatedTimeline: "5-10 business days",
              estimatedCost: "$150-500",
              confidenceScore: 0.8,
            }),
          },
        },
      ],
      usage: {
        prompt_tokens: 200,
        completion_tokens: 100,
        total_tokens: 300,
      },
    });

    const result = await analyzeJobRequirements({
      jobType: "RE_ROOFING",
      jurisdiction: "PINELLAS_COUNTY",
      address: "123 Test St",
    });

    expect(result.usage).toEqual({
      prompt_tokens: 200,
      completion_tokens: 100,
      total_tokens: 300,
    });
  });
});

describe("validateDocument", () => {
  let mockCreate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreate = vi.fn();
    (OpenAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    }));
  });

  it("should return valid when document passes validation", async () => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              isValid: true,
              issues: [],
            }),
          },
        },
      ],
    });

    const result = await validateDocument("insurance", "valid content");

    expect(result.isValid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it("should return invalid with issues when document fails validation", async () => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              isValid: false,
              issues: ["Expired certificate", "Missing signature"],
            }),
          },
        },
      ],
    });

    const result = await validateDocument("license", "invalid content");

    expect(result.isValid).toBe(false);
    expect(result.issues).toContain("Expired certificate");
  });

  it("should return valid when AI fails", async () => {
    mockCreate.mockRejectedValue(new Error("API Error"));

    const result = await validateDocument("insurance", "content");

    expect(result.isValid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });
});
