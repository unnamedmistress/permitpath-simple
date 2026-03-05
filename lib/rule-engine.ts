import { IntentAnalysis, PermitType, Prediction } from '@/types';
import { makeId } from '@/lib/mock-data';

type RuleDefinition = {
  permitType: PermitType;
  keywords: string[];
  requiredDocs: string[];
  estimatedDays: number;
  baseConfidence: number;
  rationale: string;
};

const RULES: RuleDefinition[] = [
  {
    permitType: 'DECK',
    keywords: ['deck', 'patio'],
    requiredDocs: ['Site Plan', 'Framing Details', 'Structural Notes'],
    estimatedDays: 14,
    baseConfidence: 88,
    rationale: 'Deck and patio projects usually require structural review permit.',
  },
  {
    permitType: 'FENCE',
    keywords: ['fence'],
    requiredDocs: ['Site Plan', 'Fence Elevation', 'Property Line Notes'],
    estimatedDays: 6,
    baseConfidence: 82,
    rationale: 'Fence height and boundary placement generally trigger a fence permit.',
  },
  {
    permitType: 'ELECTRICAL',
    keywords: ['electrical', 'ev charger', 'outlet', 'panel'],
    requiredDocs: ['Electrical Scope', 'Load Calculation', 'Contractor License'],
    estimatedDays: 7,
    baseConfidence: 86,
    rationale: 'Circuit additions and service upgrades need electrical review.',
  },
  {
    permitType: 'PLUMBING',
    keywords: ['plumbing', 'water heater', 'sewer', 'pipe'],
    requiredDocs: ['Plumbing Diagram', 'Fixture Schedule'],
    estimatedDays: 8,
    baseConfidence: 84,
    rationale: 'Fixture and line changes usually require plumbing permit approval.',
  },
  {
    permitType: 'HVAC',
    keywords: ['hvac', 'furnace', 'air conditioning', 'heat pump'],
    requiredDocs: ['Equipment Specs', 'Mechanical Layout'],
    estimatedDays: 10,
    baseConfidence: 80,
    rationale: 'Mechanical equipment replacements often require HVAC permit checks.',
  },
  {
    permitType: 'ADDITION',
    keywords: ['addition', 'garage', 'new room'],
    requiredDocs: ['Architectural Plan Set', 'Structural Calculations', 'Site Plan'],
    estimatedDays: 25,
    baseConfidence: 90,
    rationale: 'Building additions involve multi-discipline plan review.',
  },
];

export function evaluateIntent(intent: IntentAnalysis): Prediction[] {
  const lower = intent.raw.toLowerCase();

  const matches = RULES.filter((rule) => rule.keywords.some((keyword) => lower.includes(keyword)));

  const fallback: RuleDefinition = {
    permitType: 'BUILDING',
    keywords: [],
    requiredDocs: ['Project Summary', 'Site Plan'],
    estimatedDays: 12,
    baseConfidence: 55,
    rationale: 'General building review suggested due to project ambiguity.',
  };

  const selected = matches.length > 0 ? matches : [fallback];

  return selected
    .map((rule) => {
      let confidence = rule.baseConfidence;
      if (intent.size && intent.size > 200) confidence += 4;
      if (intent.structure !== 'project') confidence += 3;
      confidence = Math.min(98, Math.max(50, Math.round((confidence + intent.confidence) / 2)));

      return {
        id: makeId('pred'),
        permitType: rule.permitType,
        confidence,
        triggerType: 'intent_rule_engine',
        requiredDocs: rule.requiredDocs,
        estimatedDays: rule.estimatedDays,
        rationale: rule.rationale,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      } as Prediction;
    })
    .sort((a, b) => b.confidence - a.confidence);
}
