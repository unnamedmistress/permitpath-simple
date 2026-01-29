/**
 * Intelligent Permit Determination Logic
 * Based on Pinellas County & Florida Building Code requirements
 */

import { DetailedScope, JobType } from "@/types";

export interface PermitRequirement {
  required: boolean;
  permitTypes: string[];
  reasons: string[];
  codeCitations: CodeCitation[];
  exemptionReason?: string;
}

export interface CodeCitation {
  code: string;
  section: string;
  description: string;
  url?: string;
}

// Florida Residential Code & Pinellas County Code Citations
export const CODE_CITATIONS: Record<string, CodeCitation> = {
  FRC_P105_2: {
    code: "Florida Residential Code",
    section: "§P105.2",
    description: "Permits required for alterations to water or drainage systems",
    url: "https://codes.iccsafe.org/content/FRC2023P1"
  },
  FRC_E3801_2: {
    code: "Florida Residential Code",
    section: "§E3801.2",
    description: "Permits required for electrical alterations, including new circuits and relocated wiring",
    url: "https://codes.iccsafe.org/content/FRC2023P1"
  },
  FRC_R105_2: {
    code: "Florida Residential Code",
    section: "§R105.2",
    description: "Building permits required for structural alterations and repairs",
    url: "https://codes.iccsafe.org/content/FRC2023P1"
  },
  FRC_R105_2_EXEMPTION: {
    code: "Florida Residential Code",
    section: "§R105.2 (Exemptions)",
    description: "Cosmetic work not requiring a permit: painting, wallpapering, tiling (surface only), fixture replacement in same location without altering supply/drainage",
    url: "https://codes.iccsafe.org/content/FRC2023P1"
  },
  PINELLAS_500_THRESHOLD: {
    code: "Pinellas County Code",
    section: "General Permit Requirements",
    description: "Permits required for work in excess of $500.00 or which would require an inspection",
    url: "https://pinellas.gov/topic/permits/"
  },
  NEC_210_8: {
    code: "National Electrical Code",
    section: "§210.8",
    description: "GFCI protection required for bathroom receptacles",
    url: "https://codes.iccsafe.org/"
  }
};

/**
 * Determines permit requirements based on detailed scope of work
 */
export function determinePermitRequirements(
  jobType: JobType,
  scope: DetailedScope
): PermitRequirement {
  // Special handling for bathroom remodels
  if (jobType === "SMALL_BATH_REMODEL") {
    return determineBathroomPermitRequirements(scope);
  }
  
  // For other job types, default to permit required
  return {
    required: true,
    permitTypes: getDefaultPermitTypes(jobType),
    reasons: ["This type of work requires a permit in Pinellas County"],
    codeCitations: [CODE_CITATIONS.FRC_R105_2]
  };
}

/**
 * Intelligent bathroom remodel permit determination
 */
function determineBathroomPermitRequirements(scope: DetailedScope): PermitRequirement {
  const reasons: string[] = [];
  const permitTypes: string[] = [];
  const codeCitations: CodeCitation[] = [];
  
  // If no scope details provided yet, show that analysis is incomplete
  if (Object.keys(scope).length === 0) {
    return {
      required: false,
      permitTypes: [],
      reasons: [],
      codeCitations: [],
      exemptionReason: "Please complete the project details questionnaire to determine if a permit is required."
    };
  }
  
  // Check if it's purely cosmetic (explicitly marked OR all modification flags are false)
  const cosmeticOnly = scope.cosmeticOnly === true || (
    scope.movingPlumbingFixtures === false &&
    scope.addingWaterLines === false &&
    scope.changingDrainage === false &&
    scope.addingCircuits === false &&
    scope.relocatingOutlets === false &&
    scope.removingWalls === false &&
    scope.changingLayout === false
  );
  
  if (cosmeticOnly) {
    return {
      required: false,
      permitTypes: [],
      reasons: [],
      codeCitations: [CODE_CITATIONS.FRC_R105_2_EXEMPTION],
      exemptionReason: "You are only replacing fixtures in the same location without moving plumbing connections or adding electrical circuits. This is cosmetic work covered under the maintenance exemption."
    };
  }
  
  // Check plumbing changes (ONLY if explicitly true - not just truthy)
  if (scope.movingPlumbingFixtures === true || scope.addingWaterLines === true || scope.changingDrainage === true) {
    permitTypes.push("Plumbing Permit");
    
    if (scope.movingPlumbingFixtures === true) {
      const fixtures = scope.plumbingDetails || "plumbing fixtures";
      reasons.push(`You are MOVING ${fixtures} to a NEW LOCATION (changing the plumbing layout)`);
    }
    if (scope.addingWaterLines === true) {
      reasons.push("You are adding or extending water supply lines beyond existing connections");
    }
    if (scope.changingDrainage === true) {
      reasons.push("You are modifying the drainage system or waste line locations");
    }
    
    codeCitations.push(CODE_CITATIONS.FRC_P105_2);
  }
  
  // Check electrical changes (ONLY if explicitly true)
  if (scope.addingCircuits === true || scope.relocatingOutlets === true) {
    permitTypes.push("Electrical Permit");
    
    if (scope.addingCircuits === true) {
      reasons.push("You are adding NEW electrical circuits from the panel (not just replacing existing fixtures)");
    }
    if (scope.relocatingOutlets === true) {
      reasons.push("You are relocating electrical outlets or switches to new wall locations");
    }
    
    codeCitations.push(CODE_CITATIONS.FRC_E3801_2);
    codeCitations.push(CODE_CITATIONS.NEC_210_8);
  }
  
  // Check structural changes (ONLY if explicitly true)
  if (scope.removingWalls === true || scope.changingLayout === true) {
    permitTypes.push("Building Permit");
    
    if (scope.removingWalls === true) {
      reasons.push("You are removing or altering walls (structural modification)");
    }
    if (scope.changingLayout === true) {
      reasons.push("You are changing the bathroom layout or expanding the footprint");
    }
    
    codeCitations.push(CODE_CITATIONS.FRC_R105_2);
  }
  
  // Check $500 threshold
  if (scope.estimatedValue && scope.estimatedValue > 500) {
    if (permitTypes.length === 0) {
      // Even cosmetic work over $500 may need review
      reasons.push(`Project value exceeds $500 (estimated: $${scope.estimatedValue.toLocaleString()})`);
      codeCitations.push(CODE_CITATIONS.PINELLAS_500_THRESHOLD);
    }
  }
  
  // Determine if permit required
  const required = permitTypes.length > 0 || (scope.estimatedValue && scope.estimatedValue > 500);
  
  // If no permit required, provide exemption reason
  if (!required) {
    return {
      required: false,
      permitTypes: [],
      reasons: [],
      codeCitations: [CODE_CITATIONS.FRC_R105_2_EXEMPTION],
      exemptionReason: "No plumbing connections are being moved, no electrical circuits are being added, and no structural changes are being made. This work falls under the cosmetic maintenance exemption."
    };
  }
  
  // Remove duplicate permit types
  const uniquePermitTypes = Array.from(new Set(permitTypes));
  
  return {
    required: true,
    permitTypes: uniquePermitTypes,
    reasons,
    codeCitations
  };
}

/**
 * Get default permit types for non-bathroom job types
 */
function getDefaultPermitTypes(jobType: JobType): string[] {
  const permitMap: Record<JobType, string[]> = {
    AC_HVAC_CHANGEOUT: ["Mechanical Permit"],
    WATER_HEATER: ["Plumbing Permit", "Electrical Permit (if electric)"],
    RE_ROOFING: ["Roofing Permit"],
    ELECTRICAL_PANEL: ["Electrical Permit"],
    WINDOW_DOOR_REPLACEMENT: ["Building Permit"],
    POOL_BARRIER: ["Building Permit"],
    GENERATOR_INSTALL: ["Electrical Permit", "Fuel Gas Permit (if applicable)"],
    EV_CHARGER: ["Electrical Permit"],
    SMALL_BATH_REMODEL: [] // Handled by intelligent logic
  };
  
  return permitMap[jobType] || [];
}

/**
 * Get required inspections based on permit types
 */
export function getRequiredInspections(permitTypes: string[]): string[] {
  const inspections: string[] = [];
  
  if (permitTypes.some(p => p.includes("Plumbing"))) {
    inspections.push("Rough Plumbing (before covering walls)");
    inspections.push("Final Plumbing");
  }
  
  if (permitTypes.some(p => p.includes("Electrical"))) {
    inspections.push("Rough Electrical (before covering walls)");
    inspections.push("Final Electrical");
  }
  
  if (permitTypes.some(p => p.includes("Building"))) {
    inspections.push("Framing/Structural (if walls altered)");
    inspections.push("Final Building");
  }
  
  if (permitTypes.some(p => p.includes("Mechanical"))) {
    inspections.push("Mechanical Final");
  }
  
  if (permitTypes.some(p => p.includes("Roofing"))) {
    inspections.push("Dry-In Inspection");
    inspections.push("Final Roofing");
  }
  
  return inspections;
}
