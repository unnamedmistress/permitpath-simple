// ─────────────────────────────────────────────────────────────────────────────
// Contractor Matching Service
// Returns ranked contractor matches for a given job type + jurisdiction.
// Demo: seeded mock data. Production: replace findMatches() with API call.
// Week 9 | PermitPath 90-day sprint
// ─────────────────────────────────────────────────────────────────────────────

import type {
  MatchedContractor,
  ContractorMatchRequest,
  ContractorMatchResult,
  ContactEvent,
  ContactMethod,
} from '@/types/contractorMatch';
import type { ContractorRole } from '@/types/contractor';
import { CONTRACTOR_ROLE_LABELS } from '@/types/contractor';

const CONTACT_LOG_KEY = 'permitpath:match:contacts';

// ─── Job-type → trade role mapping ───────────────────────────────────────────

const JOB_TYPE_ROLE_MAP: Record<string, ContractorRole[]> = {
  RE_ROOFING:              ['roofing'],
  ROOF_REPAIR:             ['roofing'],
  AC_HVAC_CHANGEOUT:       ['hvac'],
  WATER_HEATER:            ['plumbing'],
  ELECTRICAL_PANEL:        ['electrical'],
  ELECTRICAL_REWIRING:     ['electrical'],
  EV_CHARGER:              ['electrical'],
  GENERATOR_INSTALL:       ['electrical', 'general_contractor'],
  PLUMBING_MAIN_LINE:      ['plumbing'],
  SMALL_BATH_REMODEL:      ['plumbing', 'general_contractor'],
  KITCHEN_REMODEL:         ['general_contractor', 'plumbing', 'electrical'],
  WINDOW_DOOR_REPLACEMENT: ['general_contractor'],
  SIDING_EXTERIOR:         ['general_contractor'],
  DECK_INSTALLATION:       ['general_contractor', 'framing'],
  FENCE_INSTALLATION:      ['general_contractor'],
  POOL_BARRIER:            ['general_contractor'],
  ROOM_ADDITION:           ['general_contractor', 'framing'],
  FOUNDATION_REPAIR:       ['general_contractor'],
  // PhotoScope ids (snake_case)
  electrical_panel_upgrade: ['electrical'],
  bathroom_remodel:         ['plumbing', 'general_contractor'],
  roof_replacement:         ['roofing'],
  hvac_replacement:         ['hvac'],
  kitchen_remodel:          ['general_contractor'],
  water_heater:             ['plumbing'],
  ev_charger_installation:  ['electrical'],
  window_door_replacement:  ['general_contractor'],
  home_addition:            ['general_contractor', 'framing'],
  flooring:                 ['flooring'],
};

// ─── Demo contractor pool ─────────────────────────────────────────────────────

const DEMO_CONTRACTORS: MatchedContractor[] = [
  // Roofers
  {
    id: 'c-roof-1',
    companyName: 'Suncoast Roofing Solutions',
    contactName: 'Mike Torres',
    role: 'roofing',
    roleLabel: 'Roofer',
    phone: '(727) 555-0141',
    email: 'mike@suncoastroofing.com',
    licenseNumber: 'CCC1335421',
    licenseVerified: true,
    insuranceVerified: true,
    serviceAreas: ['Pinellas County', 'Hillsborough County'],
    rating: 4.9,
    reviewCount: 214,
    jobsCompleted: 318,
    responseTimeHours: 2,
    isPro: true,
    specialties: ['GAF certified', 'hurricane straps', 'flat roofs'],
    yearsExperience: 18,
    availableNow: true,
    estimatedStartDays: 7,
  },
  {
    id: 'c-roof-2',
    companyName: 'Gulf Coast Roofing Inc.',
    contactName: 'Sandra Webb',
    role: 'roofing',
    roleLabel: 'Roofer',
    phone: '(813) 555-0182',
    email: 'sandra@gulfcoastroofing.com',
    licenseNumber: 'CCC1289034',
    licenseVerified: true,
    insuranceVerified: true,
    serviceAreas: ['Hillsborough County', 'Pasco County'],
    rating: 4.7,
    reviewCount: 143,
    jobsCompleted: 201,
    responseTimeHours: 4,
    isPro: true,
    specialties: ['metal roofing', 'tile re-roof', 'insurance claims'],
    yearsExperience: 12,
    availableNow: true,
    estimatedStartDays: 10,
  },
  {
    id: 'c-roof-3',
    companyName: 'Bay Area Shingles',
    contactName: 'James Patel',
    role: 'roofing',
    roleLabel: 'Roofer',
    phone: '(727) 555-0213',
    email: 'james@bayareashingles.com',
    licenseNumber: 'CCC1301567',
    licenseVerified: true,
    insuranceVerified: false,
    serviceAreas: ['Pinellas County'],
    rating: 4.3,
    reviewCount: 67,
    jobsCompleted: 89,
    responseTimeHours: 24,
    isPro: false,
    specialties: ['asphalt shingles', 'roof repair'],
    yearsExperience: 6,
    availableNow: false,
    estimatedStartDays: 21,
  },

  // Electricians
  {
    id: 'c-elec-1',
    companyName: 'Pinellas Premier Electric',
    contactName: 'Dana Nguyen',
    role: 'electrical',
    roleLabel: 'Electrician',
    phone: '(727) 555-0162',
    email: 'dana@ppelectric.com',
    licenseNumber: 'EC13010234',
    licenseVerified: true,
    insuranceVerified: true,
    serviceAreas: ['Pinellas County', 'Hillsborough County'],
    rating: 4.8,
    reviewCount: 189,
    jobsCompleted: 276,
    responseTimeHours: 3,
    isPro: true,
    specialties: ['panel upgrades', 'EV chargers', 'whole-home rewire', 'generators'],
    yearsExperience: 15,
    availableNow: true,
    estimatedStartDays: 5,
  },
  {
    id: 'c-elec-2',
    companyName: 'Tampa Bay Electric Co.',
    contactName: 'Chris Mendez',
    role: 'electrical',
    roleLabel: 'Electrician',
    phone: '(813) 555-0194',
    email: 'chris@tbelectric.com',
    licenseNumber: 'EC13008765',
    licenseVerified: true,
    insuranceVerified: true,
    serviceAreas: ['Hillsborough County'],
    rating: 4.6,
    reviewCount: 112,
    jobsCompleted: 158,
    responseTimeHours: 6,
    isPro: true,
    specialties: ['panel upgrades', 'commercial', 'smart home'],
    yearsExperience: 9,
    availableNow: true,
    estimatedStartDays: 8,
  },

  // Plumbers
  {
    id: 'c-plum-1',
    companyName: 'FlowRight Plumbing',
    contactName: 'Angela Kim',
    role: 'plumbing',
    roleLabel: 'Plumber',
    phone: '(727) 555-0177',
    email: 'angela@flowrightplumbing.com',
    licenseNumber: 'CFC1429011',
    licenseVerified: true,
    insuranceVerified: true,
    serviceAreas: ['Pinellas County', 'Hillsborough County'],
    rating: 4.9,
    reviewCount: 231,
    jobsCompleted: 344,
    responseTimeHours: 2,
    isPro: true,
    specialties: ['water heaters', 'tankless', 'repiping', 'main line'],
    yearsExperience: 20,
    availableNow: true,
    estimatedStartDays: 3,
  },
  {
    id: 'c-plum-2',
    companyName: 'Clear Flow Services',
    contactName: 'Roberto Silva',
    role: 'plumbing',
    roleLabel: 'Plumber',
    phone: '(813) 555-0206',
    email: 'roberto@clearflow.com',
    licenseNumber: 'CFC1430288',
    licenseVerified: true,
    insuranceVerified: true,
    serviceAreas: ['Hillsborough County'],
    rating: 4.5,
    reviewCount: 88,
    jobsCompleted: 120,
    responseTimeHours: 8,
    isPro: false,
    specialties: ['water heaters', 'drain cleaning'],
    yearsExperience: 7,
    availableNow: true,
    estimatedStartDays: 5,
  },

  // HVAC
  {
    id: 'c-hvac-1',
    companyName: 'CoolBreeze HVAC',
    contactName: 'Tom Larson',
    role: 'hvac',
    roleLabel: 'HVAC Technician',
    phone: '(727) 555-0148',
    email: 'tom@coolbreezehvac.com',
    licenseNumber: 'CAC1818562',
    licenseVerified: true,
    insuranceVerified: true,
    serviceAreas: ['Pinellas County', 'Hillsborough County'],
    rating: 4.8,
    reviewCount: 307,
    jobsCompleted: 445,
    responseTimeHours: 1,
    isPro: true,
    specialties: ['Carrier', 'Lennox', 'mini-splits', 'ductwork'],
    yearsExperience: 22,
    availableNow: true,
    estimatedStartDays: 4,
  },
  {
    id: 'c-hvac-2',
    companyName: 'Sunstate Air Conditioning',
    contactName: 'Lisa Okafor',
    role: 'hvac',
    roleLabel: 'HVAC Technician',
    phone: '(813) 555-0219',
    email: 'lisa@sunstateac.com',
    licenseNumber: 'CAC1822001',
    licenseVerified: true,
    insuranceVerified: true,
    serviceAreas: ['Hillsborough County', 'Pasco County'],
    rating: 4.6,
    reviewCount: 155,
    jobsCompleted: 223,
    responseTimeHours: 3,
    isPro: true,
    specialties: ['Trane', 'Rheem', 'heat pumps'],
    yearsExperience: 11,
    availableNow: false,
    estimatedStartDays: 12,
  },

  // General Contractors
  {
    id: 'c-gc-1',
    companyName: 'Suncoast Premier Contracting',
    contactName: 'David Park',
    role: 'general_contractor',
    roleLabel: 'General Contractor',
    phone: '(727) 555-0134',
    email: 'david@suncoastpremier.com',
    licenseNumber: 'CGC1524789',
    licenseVerified: true,
    insuranceVerified: true,
    serviceAreas: ['Pinellas County', 'Hillsborough County'],
    rating: 4.9,
    reviewCount: 178,
    jobsCompleted: 256,
    responseTimeHours: 4,
    isPro: true,
    specialties: ['additions', 'remodels', 'window/door', 'decks'],
    yearsExperience: 16,
    availableNow: true,
    estimatedStartDays: 14,
  },
  {
    id: 'c-gc-2',
    companyName: 'Bay Builders LLC',
    contactName: 'Maria Castillo',
    role: 'general_contractor',
    roleLabel: 'General Contractor',
    phone: '(813) 555-0243',
    email: 'maria@baybuilders.com',
    licenseNumber: 'CGC1531022',
    licenseVerified: true,
    insuranceVerified: true,
    serviceAreas: ['Hillsborough County'],
    rating: 4.7,
    reviewCount: 93,
    jobsCompleted: 134,
    responseTimeHours: 6,
    isPro: true,
    specialties: ['kitchen remodels', 'bathroom remodels', 'tile work'],
    yearsExperience: 10,
    availableNow: true,
    estimatedStartDays: 10,
  },
  {
    id: 'c-gc-3',
    companyName: 'HomePro Renovations',
    contactName: 'Steve Garcia',
    role: 'general_contractor',
    roleLabel: 'General Contractor',
    phone: '(727) 555-0259',
    email: 'steve@homeproreno.com',
    licenseNumber: 'CGC1519334',
    licenseVerified: true,
    insuranceVerified: true,
    serviceAreas: ['Pinellas County'],
    rating: 4.5,
    reviewCount: 61,
    jobsCompleted: 87,
    responseTimeHours: 12,
    isPro: false,
    specialties: ['fencing', 'decks', 'exterior siding'],
    yearsExperience: 8,
    availableNow: false,
    estimatedStartDays: 18,
  },
];

// ─── Matching logic ───────────────────────────────────────────────────────────

const HILLSBOROUGH_JURS = new Set([
  'HILLSBOROUGH_COUNTY', 'TAMPA', 'TEMPLE_TERRACE',
  'PLANT_CITY', 'BRANDON', 'RIVERVIEW', 'VALRICO', 'BRANDON_UNINCORP',
]);

function jurisdictionToServiceArea(jurisdiction: string): string {
  return HILLSBOROUGH_JURS.has(jurisdiction) ? 'Hillsborough County' : 'Pinellas County';
}

function scoreContractor(c: MatchedContractor, targetArea: string): number {
  let score = 0;
  if (c.isPro) score += 20;
  if (c.licenseVerified) score += 15;
  if (c.insuranceVerified) score += 10;
  if (c.availableNow) score += 10;
  if (c.serviceAreas.includes(targetArea)) score += 10;
  score += c.rating * 6;               // max 30 at 5.0 stars
  score -= c.responseTimeHours * 0.5;  // penalize slow responders
  return score;
}

export function findMatches(request: ContractorMatchRequest): ContractorMatchResult {
  const { jobType, jurisdiction } = request;
  const roles = JOB_TYPE_ROLE_MAP[jobType] ?? ['general_contractor'];
  const targetArea = jurisdictionToServiceArea(jurisdiction as string);

  const candidates = DEMO_CONTRACTORS.filter((c) => {
    // Must match at least one required role
    if (!roles.includes(c.role)) return false;
    // Must serve the area (or serve both counties)
    const servesArea =
      c.serviceAreas.includes(targetArea) ||
      c.serviceAreas.includes('Pinellas County') ||
      c.serviceAreas.includes('Hillsborough County');
    return servesArea;
  });

  // Sort by score descending
  const sorted = candidates.sort(
    (a, b) => scoreContractor(b, targetArea) - scoreContractor(a, targetArea)
  );

  return {
    matches: sorted.slice(0, 5), // top 5
    totalFound: sorted.length,
    jobType,
    jurisdiction,
    generatedAt: new Date().toISOString(),
  };
}

// ─── Contact event logging ────────────────────────────────────────────────────

export function logContactEvent(
  contractorId: string,
  method: ContactMethod,
  jobId?: string
): void {
  try {
    const existing: ContactEvent[] = JSON.parse(
      localStorage.getItem(CONTACT_LOG_KEY) ?? '[]'
    );
    existing.push({
      contractorId,
      method,
      jobId,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(CONTACT_LOG_KEY, JSON.stringify(existing));
  } catch {
    // non-critical
  }
}

export function getContactHistory(): ContactEvent[] {
  try {
    return JSON.parse(localStorage.getItem(CONTACT_LOG_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function hasContacted(contractorId: string): boolean {
  return getContactHistory().some((e) => e.contractorId === contractorId);
}

// ─── Convenience: get display initials ───────────────────────────────────────

export function getInitials(companyName: string): string {
  return companyName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}
