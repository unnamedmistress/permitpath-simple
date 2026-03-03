// Pinellas County Fee Schedule Data
// Based on 2025 Florida Building Code fee structures

export interface FeeBreakdown {
  basePermitFee: number;
  planReviewFee: number;
  inspectionFee: number;
  stateSurcharge: number;
  technologyFee: number;
  additionalFees: Array<{ name: string; amount: number; description: string }>;
}

export interface CalculatedCost {
  jobType: string;
  jurisdiction: string;
  estimatedValue: number;
  feeBreakdown: FeeBreakdown;
  totalCost: number;
  isExpress: boolean;
  notes: string[];
}

// Valuation-based fee calculation
// Pinellas County uses construction valuation for most permits
const VALUATION_FEE_TIERS = [
  { maxValue: 1000, fee: 100 },
  { maxValue: 50000, feeRate: 0.0085 }, // $8.50 per $1000
  { maxValue: 100000, feeRate: 0.0075 }, // $7.50 per $1000
  { maxValue: 500000, feeRate: 0.0065 }, // $6.50 per $1000
  { maxValue: 1000000, feeRate: 0.0055 }, // $5.50 per $1000
  { maxValue: Infinity, feeRate: 0.0045 }, // $4.50 per $1000
];

// Express permits - flat fees, no review needed
const EXPRESS_PERMIT_FEES: Record<string, number> = {
  'RE_ROOFING': 75,
  'WINDOW_DOOR_REPLACEMENT': 60,
  'WATER_HEATER': 60,
  'AC_HVAC_CHANGEOUT': 85,
  'ELECTRICAL_PANEL': 75,
  'GARAGE_DOOR': 60,
  'GAS_WATER_HEATER': 60,
  'POOL_BARRIER': 50,
};

// Typical job valuations (for estimation)
const TYPICAL_JOB_VALUATIONS: Record<string, { min: number; max: number; typical: number }> = {
  'RE_ROOFING': { min: 8000, max: 25000, typical: 15000 },
  'ROOF_REPAIR': { min: 2000, max: 8000, typical: 4500 },
  'AC_HVAC_CHANGEOUT': { min: 4000, max: 12000, typical: 7000 },
  'WATER_HEATER': { min: 1200, max: 3000, typical: 1800 },
  'ELECTRICAL_PANEL': { min: 2000, max: 6000, typical: 3500 },
  'ELECTRICAL_REWIRING': { min: 5000, max: 20000, typical: 10000 },
  'EV_CHARGER': { min: 1500, max: 5000, typical: 2500 },
  'GENERATOR_INSTALL': { min: 5000, max: 15000, typical: 9000 },
  'PLUMBING_MAIN_LINE': { min: 3000, max: 8000, typical: 5000 },
  'SMALL_BATH_REMODEL': { min: 8000, max: 25000, typical: 15000 },
  'KITCHEN_REMODEL': { min: 15000, max: 60000, typical: 35000 },
  'WINDOW_DOOR_REPLACEMENT': { min: 3000, max: 12000, typical: 6000 },
  'SIDING_EXTERIOR': { min: 8000, max: 30000, typical: 18000 },
  'DECK_INSTALLATION': { min: 5000, max: 20000, typical: 10000 },
  'FENCE_INSTALLATION': { min: 2000, max: 8000, typical: 4500 },
  'POOL_BARRIER': { min: 1000, max: 5000, typical: 2500 },
  'ROOM_ADDITION': { min: 50000, max: 150000, typical: 80000 },
  'FOUNDATION_REPAIR': { min: 10000, max: 50000, typical: 25000 },
};

function calculateValuationFee(valuation: number): number {
  let fee = 0;
  let remainingValue = valuation;

  for (const tier of VALUATION_FEE_TIERS) {
    if (remainingValue <= 0) break;
    
    if ('fee' in tier) {
      // Flat fee tier
      if (remainingValue <= tier.maxValue) {
        fee += tier.fee;
        break;
      }
    } else if (tier.feeRate) {
      // Rate-based tier
      const tierValue = Math.min(remainingValue, tier.maxValue === Infinity ? remainingValue : tier.maxValue - (VALUATION_FEE_TIERS[VALUATION_FEE_TIERS.indexOf(tier) - 1]?.maxValue || 0));
      fee += tierValue * tier.feeRate;
      remainingValue -= tierValue;
    }
  }

  return Math.round(fee);
}

export function calculatePermitCost(
  jobType: string,
  jurisdiction: string = 'PINELLAS_COUNTY',
  customValuation?: number
): CalculatedCost {
  const valuation = customValuation || TYPICAL_JOB_VALUATIONS[jobType]?.typical || 10000;
  const isExpress = EXPRESS_PERMIT_FEES[jobType] !== undefined;
  const notes: string[] = [];

  // Calculate base permit fee
  let basePermitFee: number;
  
  if (isExpress) {
    basePermitFee = EXPRESS_PERMIT_FEES[jobType];
    notes.push('Express permit - same day approval (no plan review needed)');
    notes.push('Apply online through Pinellas County Access Portal');
  } else {
    basePermitFee = calculateValuationFee(valuation);
    notes.push('Standard permit - requires plan review');
    notes.push('Typical review time: 10-14 business days for residential');
  }

  // Calculate additional fees
  const planReviewFee = isExpress ? 0 : Math.round(basePermitFee * 0.5); // 50% of permit fee
  const inspectionFee = isExpress ? 0 : 50; // $50 per inspection for standard permits
  const stateSurcharge = Math.round(basePermitFee * 0.1); // 10% Florida state surcharge
  const technologyFee = isExpress ? 5 : 15; // Online processing fee

  const additionalFees: Array<{ name: string; amount: number; description: string }> = [];

  // Add fees for complex jobs
  if (!isExpress && valuation > 50000) {
    additionalFees.push({
      name: 'Complex Project Review',
      amount: 100,
      description: 'Additional review required for projects over $50,000'
    });
  }

  const feeBreakdown: FeeBreakdown = {
    basePermitFee,
    planReviewFee,
    inspectionFee,
    stateSurcharge,
    technologyFee,
    additionalFees,
  };

  const totalCost = basePermitFee + planReviewFee + inspectionFee + stateSurcharge + technologyFee + 
    additionalFees.reduce((sum, fee) => sum + fee.amount, 0);

  return {
    jobType,
    jurisdiction,
    estimatedValue: valuation,
    feeBreakdown,
    totalCost,
    isExpress,
    notes,
  };
}

export function getHistoricalComparison(jobType: string): { average: number; low: number; high: number; sampleSize: number } {
  // Simulated historical data based on typical ranges
  const typical = TYPICAL_JOB_VALUATIONS[jobType]?.typical || 10000;
  
  return {
    average: Math.round(typical * 0.007), // ~0.7% of valuation
    low: Math.round(typical * 0.005),     // ~0.5% of valuation
    high: Math.round(typical * 0.012),    // ~1.2% of valuation
    sampleSize: Math.floor(Math.random() * 200) + 50, // 50-250 recent permits
  };
}

export function generateCustomerQuote(
  jobType: string,
  permitCost: number,
  contractorMarkup: number = 1.25 // 25% markup by default
): {
  permitCost: number;
  markup: number;
  customerPrice: number;
  lineItems: Array<{ item: string; cost: number; description: string }>;
} {
  const lineItems = [
    { item: 'Permit Fee', cost: permitCost, description: 'Pinellas County building permit' },
    { item: 'Permit Processing', cost: Math.round(permitCost * (contractorMarkup - 1)), description: 'Administrative processing & coordination' },
  ];

  return {
    permitCost,
    markup: contractorMarkup,
    customerPrice: Math.round(permitCost * contractorMarkup),
    lineItems,
  };
}

// Get list of express permits for quick reference
export function getExpressPermits(): Array<{ jobType: string; fee: number; description: string }> {
  return [
    { jobType: 'RE_ROOFING', fee: 75, description: 'Roof replacement (like-for-like)' },
    { jobType: 'WINDOW_DOOR_REPLACEMENT', fee: 60, description: 'Windows/doors (same size/location)' },
    { jobType: 'WATER_HEATER', fee: 60, description: 'Water heater replacement' },
    { jobType: 'AC_HVAC_CHANGEOUT', fee: 85, description: 'HVAC changeout (no ductwork changes)' },
    { jobType: 'ELECTRICAL_PANEL', fee: 75, description: 'Electrical panel upgrade' },
  ];
}

export function isExpressEligible(jobType: string): boolean {
  return EXPRESS_PERMIT_FEES[jobType] !== undefined;
}
