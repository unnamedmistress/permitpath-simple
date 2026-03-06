// AI Prediction Engine for QuickStart Flow
// Intent detection + Rule-based permit prediction

import { JobType, Jurisdiction } from '@/types/permit';

export interface Prediction {
  permitType: JobType;
  confidence: number;
  rationale: string;
  requiredDocs: string[];
  estimatedDays: number;
  estimatedCost: string;
  jurisdiction: Jurisdiction;
}

export interface IntentDetectionResult {
  primaryIntent: JobType | null;
  confidence: number;
  extractedEntities: {
    location?: string;
    size?: string;
    material?: string;
    urgency?: string;
  };
  suggestedQuestions: string[];
}

// Intent keywords mapped to job types
const INTENT_KEYWORDS: Record<JobType, string[]> = {
  RE_ROOFING: ['roof', 'shingle', 'tile', 'metal roof', 'new roof', 'replace roof', 'roofing'],
  ROOF_REPAIR: ['leak', 'patch', 'repair roof', 'fix roof', 'damaged roof'],
  AC_HVAC_CHANGEOUT: ['ac', 'air conditioner', 'hvac', 'cooling', 'heat pump', 'furnace', 'central air'],
  WATER_HEATER: ['water heater', 'hot water', 'tankless', 'boiler', 'water tank'],
  ELECTRICAL_PANEL: ['panel', 'breaker', 'electrical panel', 'service upgrade', 'amp', 'electrical service'],
  ELECTRICAL_REWIRING: ['rewire', 'wiring', 'outlets', 'circuits', 'electrical work'],
  EV_CHARGER: ['ev charger', 'electric vehicle', 'tesla charger', 'car charger', 'evse'],
  GENERATOR_INSTALL: ['generator', 'backup power', 'whole house generator', 'standby generator'],
  PLUMBING_MAIN_LINE: ['main line', 'sewer', 'water main', 'plumbing line', 'pipe replacement'],
  SMALL_BATH_REMODEL: ['bathroom', 'bath remodel', 'shower', 'tub', 'vanity', 'toilet'],
  KITCHEN_REMODEL: ['kitchen', 'cabinet', 'countertop', 'kitchen remodel', 'backsplash'],
  WINDOW_DOOR_REPLACEMENT: ['window', 'door', 'sliding door', 'french door', 'entry door'],
  SIDING_EXTERIOR: ['siding', 'exterior', 'stucco', 'vinyl siding', 'hardie', 'facade'],
  DECK_INSTALLATION: ['deck', 'patio', 'porch', 'outdoor deck', 'wood deck'],
  FENCE_INSTALLATION: ['fence', 'fencing', 'privacy fence', 'yard fence'],
  POOL_BARRIER: ['pool', 'fence pool', 'pool safety', 'pool barrier', 'spa'],
  ROOM_ADDITION: ['addition', 'new room', 'expand', 'extension', 'bonus room'],
  FOUNDATION_REPAIR: ['foundation', 'crack', 'settling', 'slab', 'foundation repair'],
};

// Rule engine for permit complexity scoring
interface PermitRule {
  jobType: JobType;
  baseComplexity: number; // 1-10
  triggers: {
    field: string;
    condition: 'equals' | 'contains' | 'gt' | 'lt';
    value: unknown;
    complexityModifier: number;
  }[];
}

const PERMIT_RULES: PermitRule[] = [
  {
    jobType: 'RE_ROOFING',
    baseComplexity: 4,
    triggers: [
      { field: 'isAlteringShape', condition: 'equals', value: true, complexityModifier: 3 },
      { field: 'buildingType', condition: 'equals', value: 'commercial', complexityModifier: 2 },
    ],
  },
  {
    jobType: 'WATER_HEATER',
    baseComplexity: 2,
    triggers: [
      { field: 'isTankless', condition: 'equals', value: true, complexityModifier: 1 },
      { field: 'isGas', condition: 'equals', value: true, complexityModifier: 1 },
    ],
  },
  {
    jobType: 'DECK_INSTALLATION',
    baseComplexity: 3,
    triggers: [
      { field: 'deckHeight', condition: 'equals', value: 'over-30in', complexityModifier: 3 },
      { field: 'isAttached', condition: 'equals', value: true, complexityModifier: 2 },
    ],
  },
  {
    jobType: 'ELECTRICAL_PANEL',
    baseComplexity: 5,
    triggers: [
      { field: 'buildingType', condition: 'equals', value: 'commercial', complexityModifier: 3 },
    ],
  },
  {
    jobType: 'ROOM_ADDITION',
    baseComplexity: 8,
    triggers: [
      { field: 'squareFootage', condition: 'gt', value: 500, complexityModifier: 2 },
    ],
  },
];

// Required documents by job type
const REQUIRED_DOCS: Record<JobType, string[]> = {
  RE_ROOFING: ['Permit Application', 'Roofing Contract', 'Roofing Material Specs', 'Wind Load Documentation'],
  ROOF_REPAIR: ['Permit Application', 'Repair Scope Description', 'Contractor License'],
  AC_HVAC_CHANGEOUT: ['Permit Application', 'HVAC Load Calculation', 'Equipment Specs', 'Contractor License'],
  WATER_HEATER: ['Permit Application', 'Plumbing Layout', 'Equipment Cut Sheets'],
  ELECTRICAL_PANEL: ['Permit Application', 'Electrical Load Calculation', 'Panel Schedule', 'Contractor License'],
  ELECTRICAL_REWIRING: ['Permit Application', 'Electrical Plan', 'Load Calculation'],
  EV_CHARGER: ['Permit Application', 'Electrical Load Calculation', 'Equipment Specs', 'Contractor License'],
  GENERATOR_INSTALL: ['Permit Application', 'Electrical Plans', 'Noise Assessment', 'Fuel Line Diagram'],
  PLUMBING_MAIN_LINE: ['Permit Application', 'Plumbing Plans', 'Site Plan'],
  SMALL_BATH_REMODEL: ['Permit Application', 'Plumbing Plan', 'Floor Plan'],
  KITCHEN_REMODEL: ['Permit Application', 'Plumbing Plan', 'Electrical Plan', 'Floor Plan'],
  WINDOW_DOOR_REPLACEMENT: ['Permit Application', 'Product Cut Sheets', 'Impact Rating (if applicable)'],
  SIDING_EXTERIOR: ['Permit Application', 'Material Samples', 'Wind Load Documentation'],
  DECK_INSTALLATION: ['Permit Application', 'Construction Plans', 'Site Plan', 'Structural Calculations'],
  FENCE_INSTALLATION: ['Permit Application', 'Site Plan', 'Fence Specifications'],
  POOL_BARRIER: ['Permit Application', 'Pool Safety Plan', 'Fence Specifications'],
  ROOM_ADDITION: ['Permit Application', 'Architectural Plans', 'Structural Plans', 'Site Plan', 'Survey'],
  FOUNDATION_REPAIR: ['Permit Application', 'Engineering Report', 'Repair Plan', 'Contractor License'],
};

// Timeline estimates by complexity
function getTimelineEstimate(complexity: number): string {
  if (complexity <= 2) return '~3-5 Days';
  if (complexity <= 4) return '~1-2 Weeks';
  if (complexity <= 6) return '~2-4 Weeks';
  if (complexity <= 8) return '~4-6 Weeks';
  return '~6-8 Weeks';
}

// Cost estimates by job type
function getCostEstimate(jobType: JobType): string {
  const costs: Record<JobType, string> = {
    RE_ROOFING: '$88-250',
    ROOF_REPAIR: '$50-88',
    AC_HVAC_CHANGEOUT: '$88-150',
    WATER_HEATER: '$50-88',
    ELECTRICAL_PANEL: '$88-200',
    ELECTRICAL_REWIRING: '$150-400',
    EV_CHARGER: '$88-150',
    GENERATOR_INSTALL: '$200-500',
    PLUMBING_MAIN_LINE: '$150-300',
    SMALL_BATH_REMODEL: '$150-400',
    KITCHEN_REMODEL: '$300-800',
    WINDOW_DOOR_REPLACEMENT: '$88-200',
    SIDING_EXTERIOR: '$150-400',
    DECK_INSTALLATION: '$150-400',
    FENCE_INSTALLATION: '$88-200',
    POOL_BARRIER: '$88-150',
    ROOM_ADDITION: '$500-2000',
    FOUNDATION_REPAIR: '$300-1000',
  };
  return costs[jobType] || '$88-250';
}

/**
 * Detect intent from user description using keyword matching
 */
export function detectIntent(description: string): IntentDetectionResult {
  const normalizedDesc = description.toLowerCase();
  const scores: Record<JobType, number> = {} as Record<JobType, number>;

  // Score each job type based on keyword matches
  for (const [jobType, keywords] of Object.entries(INTENT_KEYWORDS)) {
    scores[jobType as JobType] = keywords.reduce((score, keyword) => {
      if (normalizedDesc.includes(keyword.toLowerCase())) {
        return score + (keyword.split(' ').length > 1 ? 2 : 1); // Multi-word matches score higher
      }
      return score;
    }, 0);
  }

  // Find best match
  const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const bestMatch = entries[0];
  
  const confidence = bestMatch[1] > 0 
    ? Math.min(95, 60 + bestMatch[1] * 10) 
    : 0;

  // Extract entities (simple pattern matching)
  const extractedEntities: IntentDetectionResult['extractedEntities'] = {};
  
  if (normalizedDesc.match(/\d+\s*(sq\s*ft|square|sf)/)) {
    extractedEntities.size = normalizedDesc.match(/\d+\s*(sq\s*ft|square|sf)/)?.[0];
  }
  
  if (normalizedDesc.match(/(asap|urgent|quick|fast|rush)/)) {
    extractedEntities.urgency = 'high';
  }

  // Generate follow-up questions based on intent
  const suggestedQuestions: string[] = [];
  if (confidence < 80) {
    suggestedQuestions.push('Can you describe the project in more detail?');
  }
  if (!extractedEntities.size && bestMatch[0] === 'ROOM_ADDITION') {
    suggestedQuestions.push('How many square feet is the addition?');
  }

  return {
    primaryIntent: bestMatch[1] > 0 ? bestMatch[0] as JobType : null,
    confidence,
    extractedEntities,
    suggestedQuestions,
  };
}

/**
 * Calculate permit complexity using rule engine
 */
export function calculateComplexity(
  jobType: JobType, 
  formData: Record<string, unknown>
): number {
  const rule = PERMIT_RULES.find(r => r.jobType === jobType);
  if (!rule) return 3; // Default complexity

  let complexity = rule.baseComplexity;

  for (const trigger of rule.triggers) {
    const fieldValue = formData[trigger.field];
    let triggered = false;

    switch (trigger.condition) {
      case 'equals':
        triggered = fieldValue === trigger.value;
        break;
      case 'contains':
        triggered = typeof fieldValue === 'string' && 
          fieldValue.toLowerCase().includes(String(trigger.value).toLowerCase());
        break;
      case 'gt':
        triggered = typeof fieldValue === 'number' && fieldValue > (trigger.value as number);
        break;
      case 'lt':
        triggered = typeof fieldValue === 'number' && fieldValue < (trigger.value as number);
        break;
    }

    if (triggered) {
      complexity += trigger.complexityModifier;
    }
  }

  return Math.min(10, complexity);
}

/**
 * Generate AI prediction for QuickStart flow
 */
export function generatePrediction(
  jobType: JobType,
  jurisdiction: Jurisdiction,
  formData: Record<string, unknown>,
  description?: string
): Prediction {
  // Calculate complexity
  const complexity = calculateComplexity(jobType, formData);
  
  // Determine confidence based on data completeness
  let confidence = 85;
  if (description && description.length > 20) confidence += 5;
  if (formData.address) confidence += 5;
  confidence = Math.min(98, confidence);

  // Generate rationale
  const complexityLabel = complexity <= 3 ? 'straightforward' : complexity <= 6 ? 'moderate' : 'complex';
  const rationale = `Based on your ${complexityLabel} ${jobType.toLowerCase().replace(/_/g, ' ')} project in ${jurisdiction.replace(/_/g, ' ')}, we predict a standard permit process with ${REQUIRED_DOCS[jobType].length} required documents.`;

  return {
    permitType: jobType,
    confidence,
    rationale,
    requiredDocs: REQUIRED_DOCS[jobType],
    estimatedDays: complexity * 3,
    estimatedCost: getCostEstimate(jobType),
    jurisdiction,
  };
}

/**
 * Batch prediction for multiple job types (when confidence is low)
 */
export function generatePredictions(
  description: string,
  jurisdiction: Jurisdiction,
  formData: Record<string, unknown>
): Prediction[] {
  const detected = detectIntent(description);
  
  if (detected.primaryIntent && detected.confidence >= 70) {
    return [generatePrediction(detected.primaryIntent, jurisdiction, formData, description)];
  }

  // Return top 3 possibilities when uncertain
  const possibilities: JobType[] = ['RE_ROOFING', 'WATER_HEATER', 'ELECTRICAL_PANEL'];
  return possibilities.map(type => generatePrediction(type, jurisdiction, formData, description));
}
