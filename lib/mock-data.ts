import { ChatMessage, HistoricalPermit, Permit, Prediction } from '@/types';

export const demoUser = {
  id: 'demo-user',
  name: 'Demo Visitor',
};

export function makeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

const now = new Date('2026-03-05T00:00:00.000Z').toISOString();

export const seedPermits: Permit[] = [
  {
    id: 'permit_1',
    title: 'Backyard Deck Addition',
    description: '220 sqft raised deck with stairs and railing',
    type: 'DECK',
    status: 'REVIEWING',
    estimatedDays: 16,
    estimatedCost: 12000,
    squareFootage: 220,
    jurisdiction: 'seattle_wa',
    submittedAt: '2026-02-15T00:00:00.000Z',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'permit_2',
    title: 'EV Charger Installation',
    description: 'Install level 2 charger in garage',
    type: 'ELECTRICAL',
    status: 'SUBMITTED',
    estimatedDays: 8,
    estimatedCost: 1600,
    jurisdiction: 'seattle_wa',
    submittedAt: '2026-03-01T00:00:00.000Z',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'permit_3',
    title: 'Privacy Fence',
    description: '6ft cedar fence around rear property line',
    type: 'FENCE',
    status: 'DRAFT',
    estimatedDays: 6,
    estimatedCost: 3400,
    squareFootage: 300,
    jurisdiction: 'seattle_wa',
    createdAt: now,
    updatedAt: now,
  },
];

export const seedPredictions: Prediction[] = [
  {
    id: 'pred_1',
    permitType: 'DECK',
    confidence: 92,
    triggerType: 'description_analysis',
    requiredDocs: ['Site Plan', 'Construction Drawings', 'Property Survey'],
    estimatedDays: 14,
    rationale: 'Deck projects over 200 sqft in Seattle usually require structural review.',
    status: 'PENDING',
    createdAt: now,
  },
  {
    id: 'pred_2',
    permitType: 'ELECTRICAL',
    confidence: 84,
    triggerType: 'equipment_upgrade',
    requiredDocs: ['Electrical Scope', 'Load Calculations', 'Contractor License'],
    estimatedDays: 7,
    rationale: 'New EV charging circuits generally require electrical permit review.',
    status: 'PENDING',
    createdAt: now,
  },
];

const historicalSeed: Array<Omit<HistoricalPermit, 'id'>> = [
  { permitType: 'DECK', location: 'seattle_wa', squareFootage: 180, complexity: 3, daysToApproval: 11, submissionMonth: 2 },
  { permitType: 'DECK', location: 'seattle_wa', squareFootage: 240, complexity: 6, daysToApproval: 18, submissionMonth: 3 },
  { permitType: 'DECK', location: 'austin_tx', squareFootage: 210, complexity: 4, daysToApproval: 13, submissionMonth: 5 },
  { permitType: 'ELECTRICAL', location: 'seattle_wa', complexity: 2, daysToApproval: 6, submissionMonth: 1 },
  { permitType: 'ELECTRICAL', location: 'austin_tx', complexity: 3, daysToApproval: 8, submissionMonth: 6 },
  { permitType: 'FENCE', location: 'seattle_wa', squareFootage: 160, complexity: 2, daysToApproval: 4, submissionMonth: 4 },
  { permitType: 'FENCE', location: 'miami_fl', squareFootage: 220, complexity: 3, daysToApproval: 7, submissionMonth: 8 },
  { permitType: 'HVAC', location: 'phoenix_az', complexity: 4, daysToApproval: 10, submissionMonth: 7 },
  { permitType: 'PLUMBING', location: 'denver_co', complexity: 3, daysToApproval: 9, submissionMonth: 11 },
  { permitType: 'ADDITION', location: 'seattle_wa', squareFootage: 500, complexity: 8, daysToApproval: 31, submissionMonth: 9 }
];

export const seedHistoricalPermits: HistoricalPermit[] = Array.from({ length: 100 }).map((_, index) => {
  const source = historicalSeed[index % historicalSeed.length];
  return {
    ...source,
    id: `hist_${index + 1}`,
    daysToApproval: Math.max(3, source.daysToApproval + ((index % 5) - 2)),
    complexity: Math.min(10, Math.max(1, source.complexity + ((index % 3) - 1))),
  };
});

export const seedMessages: ChatMessage[] = [
  {
    id: 'msg_welcome',
    role: 'assistant',
    content:
      "Welcome to Permit Concierge. Describe your project, ask for status, or ask for required documents. This is a no-login demo.",
    timestamp: now,
  },
];
