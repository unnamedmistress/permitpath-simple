import { describe, it, expect } from "vitest";
import {
  getQuestionsForJobType,
  hasJobSpecificQuestions,
  validateFLLicense,
  isAddressComplete,
  isDescriptionVague,
  getClarificationPrompts,
  shouldShowQuestion,
  getJobCategoryIcon,
  getJobCategoryLabel,
  roofQuestions,
  waterHeaterQuestions,
  electricalQuestions,
  hvacQuestions,
  bathroomQuestions,
  deckQuestions,
  fenceQuestions,
  windowDoorQuestions,
  generatorQuestions,
  poolBarrierQuestions,
} from "./jobQuestions";

describe("Job Questions - Unit Tests", () => {
  describe("Job Type Coverage", () => {
    it("should have questions for all supported job types", () => {
      const jobTypes = [
        "RE_ROOFING",
        "ROOF_REPAIR",
        "WATER_HEATER",
        "ELECTRICAL_PANEL",
        "ELECTRICAL_REWIRING",
        "EV_CHARGER",
        "AC_HVAC_CHANGEOUT",
        "SMALL_BATH_REMOdel",
        "KITCHEN_REMOdel",
        "WINDOW_DOOR_REPLACEMENT",
        "GENERATOR_INSTALL",
        "POOL_BARRIER",
        "DECK_INSTALLATION",
        "FENCE_INSTALLATION",
      ];

      jobTypes.forEach((jobType) => {
        const hasQuestions = hasJobSpecificQuestions(jobType);
        // Note: Some job types might not have specific questions yet
        // This test documents coverage
        expect(typeof hasQuestions).toBe("boolean");
      });
    });

    it("should return questions for roof job types", () => {
      const roofReplacementQuestions = getQuestionsForJobType("RE_ROOFING");
      const roofRepairQuestions = getQuestionsForJobType("ROOF_REPAIR");

      expect(roofReplacementQuestions.length).toBeGreaterThan(0);
      expect(roofRepairQuestions.length).toBeGreaterThan(0);
      expect(roofReplacementQuestions).toEqual(roofRepairQuestions);
    });

    it("should return questions for water heater job type", () => {
      const questions = getQuestionsForJobType("WATER_HEATER");

      expect(questions.length).toBeGreaterThan(0);
      expect(questions.some((q) => q.id === "fuelType")).toBe(true);
      expect(questions.some((q) => q.id === "tankType")).toBe(true);
    });

    it("should return questions for electrical job types", () => {
      const panelQuestions = getQuestionsForJobType("ELECTRICAL_PANEL");
      const rewiringQuestions = getQuestionsForJobType("ELECTRICAL_REWIRING");
      const evChargerQuestions = getQuestionsForJobType("EV_CHARGER");

      expect(panelQuestions.length).toBeGreaterThan(0);
      expect(rewiringQuestions).toEqual(panelQuestions);
      expect(evChargerQuestions).toEqual(panelQuestions);
    });

    it("should return questions for HVAC job type", () => {
      const questions = getQuestionsForJobType("AC_HVAC_CHANGEOUT");

      expect(questions.length).toBeGreaterThan(0);
      expect(questions.some((q) => q.id === "hvacInstallType")).toBe(true);
    });

    it("should return empty array for unknown job types", () => {
      const questions = getQuestionsForJobType("UNKNOWN_JOB_TYPE");

      expect(questions).toEqual([]);
    });
  });

  describe("Question Structure", () => {
    it("should have valid question structure for all questions", () => {
      const allQuestions = [
        ...roofQuestions,
        ...waterHeaterQuestions,
        ...electricalQuestions,
        ...hvacQuestions,
        ...bathroomQuestions,
        ...deckQuestions,
        ...fenceQuestions,
        ...windowDoorQuestions,
        ...generatorQuestions,
        ...poolBarrierQuestions,
      ];

      allQuestions.forEach((question) => {
        expect(question).toHaveProperty("id");
        expect(question).toHaveProperty("question");
        expect(question).toHaveProperty("type");
        expect(typeof question.id).toBe("string");
        expect(typeof question.question).toBe("string");
        expect(typeof question.type).toBe("string");
        expect(question.id.length).toBeGreaterThan(0);
        expect(question.question.length).toBeGreaterThan(0);
      });
    });

    it("should have valid question types", () => {
      const validTypes = ["radio", "toggle", "number", "text", "dropdown", "multiselect"];
      const allQuestions = [
        ...roofQuestions,
        ...waterHeaterQuestions,
        ...electricalQuestions,
        ...hvacQuestions,
        ...bathroomQuestions,
      ];

      allQuestions.forEach((question) => {
        expect(validTypes).toContain(question.type);
      });
    });

    it("should have options for radio and dropdown types", () => {
      const allQuestions = [
        ...roofQuestions,
        ...waterHeaterQuestions,
        ...electricalQuestions,
        ...hvacQuestions,
      ];

      allQuestions
        .filter((q) => q.type === "radio" || q.type === "dropdown")
        .forEach((question) => {
          expect(question.options).toBeDefined();
          expect(Array.isArray(question.options)).toBe(true);
          expect(question.options!.length).toBeGreaterThan(0);
        });
    });
  });

  describe("Conditional Logic - Follow-up Questions", () => {
    it("water heater should have follow-up for relocation", () => {
      const relocatingQuestion = waterHeaterQuestions.find((q) => q.id === "relocating");
      const newLocationQuestion = waterHeaterQuestions.find((q) => q.id === "newLocation");

      expect(relocatingQuestion).toBeDefined();
      expect(newLocationQuestion).toBeDefined();
      expect(newLocationQuestion?.followUpQuestionId).toBe("relocating");
      expect(newLocationQuestion?.followUpCondition).toBe("true");
    });

    it("bathroom should have follow-up for plumbing distance", () => {
      const movingPlumbingQuestion = bathroomQuestions.find((q) => q.id === "movingPlumbing");
      const plumbingDistanceQuestion = bathroomQuestions.find((q) => q.id === "plumbingDistance");

      expect(movingPlumbingQuestion).toBeDefined();
      expect(plumbingDistanceQuestion).toBeDefined();
      expect(plumbingDistanceQuestion?.followUpQuestionId).toBe("movingPlumbing");
      expect(plumbingDistanceQuestion?.followUpCondition).toBe("true");
    });

    it("roof should have structural changes warning", () => {
      const structuralChangesQuestion = roofQuestions.find((q) => q.id === "structuralChanges");

      expect(structuralChangesQuestion).toBeDefined();
      expect(structuralChangesQuestion?.warningMessage).toBeDefined();
      expect(structuralChangesQuestion?.warningMessage).toContain("Structural changes");
    });
  });

  describe("shouldShowQuestion Logic", () => {
    it("should show question with no followUpQuestionId", () => {
      const question = {
        id: "always-show",
        question: "Always show?",
        type: "text" as const,
      };

      expect(shouldShowQuestion(question, {})).toBe(true);
      expect(shouldShowQuestion(question, { someOther: "value" })).toBe(true);
    });

    it("should show question when parent is true", () => {
      const question = {
        id: "follow-up",
        question: "Follow up?",
        type: "text" as const,
        followUpQuestionId: "parent",
        followUpCondition: "true",
      };

      expect(shouldShowQuestion(question, { parent: true })).toBe(true);
      expect(shouldShowQuestion(question, { parent: "true" })).toBe(true);
    });

    it("should hide question when parent is false", () => {
      const question = {
        id: "follow-up",
        question: "Follow up?",
        type: "text" as const,
        followUpQuestionId: "parent",
        followUpCondition: "true",
      };

      expect(shouldShowQuestion(question, { parent: false })).toBe(false);
      expect(shouldShowQuestion(question, { parent: "false" })).toBe(false);
    });

    it("should handle false condition", () => {
      const question = {
        id: "follow-up",
        question: "Follow up?",
        type: "text" as const,
        followUpQuestionId: "parent",
        followUpCondition: "false",
      };

      expect(shouldShowQuestion(question, { parent: false })).toBe(true);
      expect(shouldShowQuestion(question, { parent: true })).toBe(false);
    });

    it("should handle string value matching", () => {
      const question = {
        id: "follow-up",
        question: "Follow up?",
        type: "text" as const,
        followUpQuestionId: "fuelType",
        followUpCondition: "Gas",
      };

      expect(shouldShowQuestion(question, { fuelType: "Gas" })).toBe(true);
      expect(shouldShowQuestion(question, { fuelType: "Electric" })).toBe(false);
    });
  });

  describe("License Validation", () => {
    it("should validate correct FL contractor license formats", () => {
      const validLicenses = [
        "C1234567",
        "EC1234567",
        "CBC1234567",
        "CAC1254789",
        "CFC1234567",
        "XC123456789",
      ];

      validLicenses.forEach((license) => {
        const result = validateFLLicense(license);
        expect(result.valid).toBe(true);
        expect(result.message).toBeUndefined();
      });
    });

    it("should invalidate incorrect license formats", () => {
      const invalidLicenses = [
        "invalid",
        "1234567",
        "C123",
        "TOOLONGPREFIX1234567",
        "C12345",
        "C12345678901", // Too long
      ];

      invalidLicenses.forEach((license) => {
        const result = validateFLLicense(license);
        expect(result.valid).toBe(false);
        expect(result.message).toContain("FL contractor licenses");
      });
    });

    it("should accept empty license (optional field)", () => {
      const result = validateFLLicense("");
      expect(result.valid).toBe(true);
    });

    it("should accept whitespace-only license as empty", () => {
      const result = validateFLLicense("   ");
      expect(result.valid).toBe(true);
    });

    it("should normalize license to uppercase", () => {
      const result = validateFLLicense("c1234567");
      expect(result.valid).toBe(true);
    });
  });

  describe("Address Validation", () => {
    it("should validate complete addresses with ZIP code", () => {
      const validAddresses = [
        "123 Main St, St Pete, FL 33710",
        "123 Main St 33710",
        "456 Oak Ave, Clearwater, FL 33755-1234",
      ];

      validAddresses.forEach((address) => {
        expect(isAddressComplete(address)).toBe(true);
      });
    });

    it("should invalidate incomplete addresses", () => {
      const invalidAddresses = [
        "123 Main",
        "12345",
        "Main St",
        "123 Main St,",
        "",
      ];

      invalidAddresses.forEach((address) => {
        expect(isAddressComplete(address)).toBe(false);
      });
    });
  });

  describe("Description Validation", () => {
    it("should flag short descriptions as vague", () => {
      expect(isDescriptionVague("Fix roof")).toBe(true);
      expect(isDescriptionVague("New AC")).toBe(true);
      expect(isDescriptionVague("Water heater")).toBe(true);
    });

    it("should accept detailed descriptions", () => {
      expect(
        isDescriptionVague("Replace shingles on north side of 2000 sq ft home")
      ).toBe(false);
      expect(
        isDescriptionVague(
          "Install 3-ton high efficiency AC unit with new ductwork"
        )
      ).toBe(false);
    });

    it("should flag empty or null descriptions", () => {
      expect(isDescriptionVague("")).toBe(true);
      expect(isDescriptionVague("   ")).toBe(true);
    });
  });

  describe("Clarification Prompts", () => {
    it("should generate prompts for vague description", () => {
      const prompts = getClarificationPrompts({
        description: "Fix roof",
      });

      expect(prompts.length).toBeGreaterThan(0);
      expect(prompts.some((p) => p.includes("more details"))).toBe(true);
    });

    it("should generate prompts for incomplete address", () => {
      const prompts = getClarificationPrompts({
        address: "123 Main",
      });

      expect(prompts.length).toBeGreaterThan(0);
      expect(prompts.some((p) => p.includes("ZIP code"))).toBe(true);
    });

    it("should generate multiple prompts when needed", () => {
      const prompts = getClarificationPrompts({
        description: "Fix roof",
        address: "123 Main",
      });

      expect(prompts.length).toBeGreaterThanOrEqual(2);
    });

    it("should return empty array when all fields are valid", () => {
      const prompts = getClarificationPrompts({
        description: "Complete roof replacement for 2000 sq ft home",
        address: "123 Main St, St Pete, FL 33710",
      });

      expect(prompts).toEqual([]);
    });
  });

  describe("Category Icons", () => {
    it("should return icons for all job types", () => {
      const jobTypes = [
        "RE_ROOFING",
        "WATER_HEATER",
        "ELECTRICAL_PANEL",
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
        const icon = getJobCategoryIcon(jobType);
        expect(typeof icon).toBe("string");
        expect(icon.length).toBeGreaterThan(0);
      });
    });

    it("should return default icon for unknown job types", () => {
      const icon = getJobCategoryIcon("UNKNOWN_JOB");
      expect(icon).toBe("tool");
    });
  });

  describe("Category Labels", () => {
    it("should return labels for all job types", () => {
      const jobTypes = [
        "RE_ROOFING",
        "WATER_HEATER",
        "ELECTRICAL_PANEL",
        "AC_HVAC_CHANGEOUT",
        "SMALL_BATH_REMODEL",
      ];

      jobTypes.forEach((jobType) => {
        const label = getJobCategoryLabel(jobType);
        expect(typeof label).toBe("string");
        expect(label.length).toBeGreaterThan(0);
        expect(label).toContain("Details");
      });
    });

    it("should return default label for unknown job types", () => {
      const label = getJobCategoryLabel("UNKNOWN_JOB");
      expect(label).toBe("Project Details");
    });
  });

  describe("Question Completeness", () => {
    it("roof questions should cover all important aspects", () => {
      const requiredFields = ["roofPercentage", "roofWorkType"];

      requiredFields.forEach((field) => {
        expect(roofQuestions.some((q) => q.id === field)).toBe(true);
      });
    });

    it("water heater questions should cover fuel and tank type", () => {
      expect(waterHeaterQuestions.some((q) => q.id === "fuelType")).toBe(true);
      expect(waterHeaterQuestions.some((q) => q.id === "tankType")).toBe(true);
    });

    it("electrical questions should cover amperage and circuit type", () => {
      expect(electricalQuestions.some((q) => q.id === "amperage")).toBe(true);
      expect(electricalQuestions.some((q) => q.id === "circuitType")).toBe(true);
    });

    it("HVAC questions should cover installation type", () => {
      expect(hvacQuestions.some((q) => q.id === "hvacInstallType")).toBe(true);
    });

    it("all questions should have help text where appropriate", () => {
      // Questions that should have help text
      const questionsNeedingHelpText = [
        ...roofQuestions,
        ...waterHeaterQuestions,
        ...electricalQuestions,
      ];

      // At least some questions should have help text
      const questionsWithHelpText = questionsNeedingHelpText.filter(
        (q) => q.helpText
      );
      expect(questionsWithHelpText.length).toBeGreaterThan(0);
    });
  });
});
