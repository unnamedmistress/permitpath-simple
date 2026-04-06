// ─────────────────────────────────────────────────────────────────────────────
// Hillsborough County Jurisdiction Data
// Building departments, permit fees, ZIP map, city patterns
// Week 8 | PermitPath 90-day sprint
// ─────────────────────────────────────────────────────────────────────────────

import type { BuildingDepartment } from '@/data/jurisdictionData';
import type { Jurisdiction } from '@/types/permit';
import type { PermitFee } from '@/data/permitFees';

// ─── Building Departments ────────────────────────────────────────────────────

export const HILLSBOROUGH_COUNTY_BUILDING: BuildingDepartment = {
  name: 'Hillsborough County Development Services',
  address: '601 E Kennedy Blvd, 12th Floor',
  city: 'Tampa',
  zipCode: '33602',
  phone: '(813) 272-5600',
  email: 'bldginfo@hillsboroughcounty.org',
  website: 'https://www.hillsboroughcounty.org/en/residents/property-owners-and-tenants/get-a-building-permit',
  onlinePortal: 'https://hc-aca.hillsboroughcounty.org/CitizenAccess/',
  hours: 'Monday – Friday: 8:00 AM – 4:30 PM',
  walkInAvailable: true,
  notes: 'Serves all unincorporated Hillsborough County. Online permit lookup and scheduling available 24/7.',
};

export const TAMPA_BUILDING_DEPT: BuildingDepartment = {
  name: 'City of Tampa – Construction Services & Permitting',
  address: '1400 N. Boulevard',
  city: 'Tampa',
  zipCode: '33607',
  phone: '(813) 274-3100',
  email: 'permits@tampagov.net',
  website: 'https://www.tampa.gov/permits',
  onlinePortal: 'https://permits.tampa.gov/CitizenAccess/',
  hours: 'Monday – Friday: 8:00 AM – 4:00 PM',
  walkInAvailable: true,
  notes: 'Serves all City of Tampa addresses. Online ePlan review via ProjectDox.',
};

export const TEMPLE_TERRACE_BUILDING_DEPT: BuildingDepartment = {
  name: 'Temple Terrace Building & Inspections',
  address: '11250 N 56th Street',
  city: 'Temple Terrace',
  zipCode: '33617',
  phone: '(813) 506-6450',
  website: 'https://www.templeterrace.com/284/Building-Inspections',
  hours: 'Monday – Friday: 8:00 AM – 4:30 PM',
  walkInAvailable: true,
};

export const PLANT_CITY_BUILDING_DEPT: BuildingDepartment = {
  name: 'Plant City Building Department',
  address: '302 W Reynolds St',
  city: 'Plant City',
  zipCode: '33563',
  phone: '(813) 659-4200',
  website: 'https://www.plantcitygov.com/137/Building-Department',
  hours: 'Monday – Friday: 7:30 AM – 4:00 PM',
  walkInAvailable: true,
};

// ─── City → Department map ────────────────────────────────────────────────────

export const HILLSBOROUGH_CITY_DEPARTMENTS: Record<string, BuildingDepartment> = {
  Tampa: TAMPA_BUILDING_DEPT,
  'Temple Terrace': TEMPLE_TERRACE_BUILDING_DEPT,
  'Plant City': PLANT_CITY_BUILDING_DEPT,
  // Brandon, Riverview, Valrico → unincorporated → Hillsborough County
  Brandon: HILLSBOROUGH_COUNTY_BUILDING,
  Riverview: HILLSBOROUGH_COUNTY_BUILDING,
  Valrico: HILLSBOROUGH_COUNTY_BUILDING,
  Seffner: HILLSBOROUGH_COUNTY_BUILDING,
  Gibsonton: HILLSBOROUGH_COUNTY_BUILDING,
  Wimauma: HILLSBOROUGH_COUNTY_BUILDING,
  Lutz: HILLSBOROUGH_COUNTY_BUILDING,
  'Land O Lakes': HILLSBOROUGH_COUNTY_BUILDING,
  Lithia: HILLSBOROUGH_COUNTY_BUILDING,
};

// ─── ZIP → Jurisdiction map ───────────────────────────────────────────────────

export const HILLSBOROUGH_ZIP_MAP: Record<string, Jurisdiction> = {
  // City of Tampa
  '33601': 'TAMPA', '33602': 'TAMPA', '33603': 'TAMPA', '33604': 'TAMPA',
  '33605': 'TAMPA', '33606': 'TAMPA', '33607': 'TAMPA', '33608': 'TAMPA',
  '33609': 'TAMPA', '33610': 'TAMPA', '33611': 'TAMPA', '33612': 'TAMPA',
  '33613': 'TAMPA', '33614': 'TAMPA', '33615': 'TAMPA', '33616': 'TAMPA',
  '33618': 'TAMPA', '33619': 'TAMPA', '33620': 'TAMPA', '33621': 'TAMPA',
  '33624': 'TAMPA', '33625': 'TAMPA', '33626': 'TAMPA', '33629': 'TAMPA',
  '33634': 'TAMPA', '33635': 'TAMPA', '33637': 'TAMPA', '33647': 'TAMPA',
  // Temple Terrace
  '33617': 'TEMPLE_TERRACE',
  // Plant City
  '33563': 'PLANT_CITY', '33564': 'PLANT_CITY', '33565': 'PLANT_CITY',
  '33566': 'PLANT_CITY', '33567': 'PLANT_CITY',
  // Brandon (unincorporated)
  '33510': 'BRANDON', '33511': 'BRANDON',
  // Riverview (unincorporated)
  '33569': 'RIVERVIEW', '33578': 'RIVERVIEW', '33579': 'RIVERVIEW',
  // Valrico (unincorporated)
  '33594': 'VALRICO', '33596': 'VALRICO',
  // Other unincorporated
  '33592': 'HILLSBOROUGH_COUNTY', // Thonotosassa
  '33549': 'HILLSBOROUGH_COUNTY', // Lutz
  '33556': 'HILLSBOROUGH_COUNTY', // Odessa
  '33558': 'HILLSBOROUGH_COUNTY', // Lutz
  '33559': 'HILLSBOROUGH_COUNTY', // Lutz
  '33598': 'HILLSBOROUGH_COUNTY', // Wimauma
  '33534': 'HILLSBOROUGH_COUNTY', // Gibsonton
  '33527': 'HILLSBOROUGH_COUNTY', // Dover
  '33523': 'HILLSBOROUGH_COUNTY', // Dade City area
};

// ─── City name patterns (ordered longest-match first) ─────────────────────────

export const HILLSBOROUGH_CITY_PATTERNS: Array<{
  patterns: string[];
  jurisdiction: Jurisdiction;
  label: string;
}> = [
  {
    patterns: ['temple terrace', 'temple ter'],
    jurisdiction: 'TEMPLE_TERRACE',
    label: 'Temple Terrace',
  },
  {
    patterns: ['plant city'],
    jurisdiction: 'PLANT_CITY',
    label: 'Plant City',
  },
  {
    patterns: ['riverview'],
    jurisdiction: 'RIVERVIEW',
    label: 'Riverview',
  },
  {
    patterns: ['valrico'],
    jurisdiction: 'VALRICO',
    label: 'Valrico',
  },
  {
    patterns: ['brandon'],
    jurisdiction: 'BRANDON',
    label: 'Brandon',
  },
  {
    patterns: ['tampa'],
    jurisdiction: 'TAMPA',
    label: 'Tampa',
  },
];

// ─── Permit Fees — Hillsborough ───────────────────────────────────────────────

export const HILLSBOROUGH_PERMIT_FEES: PermitFee[] = [
  // ── Hillsborough County (unincorporated) ───────────────────────────────────
  {
    jurisdictionId: 'hillsborough-county',
    jurisdictionName: 'Hillsborough County',
    jobType: 'AC_HVAC_CHANGEOUT',
    feeStructure: 'flat',
    baselineRange: { min: 155, max: 260, notes: 'Residential mechanical permit + $35 DBPR surcharge' },
    officialScheduleUrl: 'https://www.hillsboroughcounty.org/en/residents/property-owners-and-tenants/get-a-building-permit/fee-schedule',
    lastUpdated: '2026-01-30',
  },
  {
    jurisdictionId: 'hillsborough-county',
    jurisdictionName: 'Hillsborough County',
    jobType: 'RE_ROOFING',
    feeStructure: 'tiered',
    baselineRange: { min: 210, max: 520, notes: 'Based on roofing squares (100 sq ft each)' },
    calculator: { formula: 'Math.max(210, project_value * 0.013)', description: 'Greater of $210 or 1.3% of project value' },
    officialScheduleUrl: 'https://www.hillsboroughcounty.org/en/residents/property-owners-and-tenants/get-a-building-permit/fee-schedule',
    lastUpdated: '2026-01-30',
  },
  {
    jurisdictionId: 'hillsborough-county',
    jurisdictionName: 'Hillsborough County',
    jobType: 'ELECTRICAL_PANEL',
    feeStructure: 'flat',
    baselineRange: { min: 115, max: 225, notes: 'Residential electrical permit + state surcharge' },
    officialScheduleUrl: 'https://www.hillsboroughcounty.org/en/residents/property-owners-and-tenants/get-a-building-permit/fee-schedule',
    lastUpdated: '2026-01-30',
  },
  {
    jurisdictionId: 'hillsborough-county',
    jurisdictionName: 'Hillsborough County',
    jobType: 'WATER_HEATER',
    feeStructure: 'flat',
    baselineRange: { min: 80, max: 160, notes: 'Standard residential water heater' },
    officialScheduleUrl: 'https://www.hillsboroughcounty.org/en/residents/property-owners-and-tenants/get-a-building-permit/fee-schedule',
    lastUpdated: '2026-01-30',
  },
  {
    jurisdictionId: 'hillsborough-county',
    jurisdictionName: 'Hillsborough County',
    jobType: 'SMALL_BATH_REMODEL',
    feeStructure: 'percentage',
    baselineRange: { min: 160, max: 850, notes: 'Multiple trade permits may be required' },
    calculator: { formula: 'project_value * 0.015', description: 'Approx 1.5% of project value' },
    officialScheduleUrl: 'https://www.hillsboroughcounty.org/en/residents/property-owners-and-tenants/get-a-building-permit/fee-schedule',
    lastUpdated: '2026-01-30',
  },
  {
    jurisdictionId: 'hillsborough-county',
    jurisdictionName: 'Hillsborough County',
    jobType: 'KITCHEN_REMODEL',
    feeStructure: 'percentage',
    baselineRange: { min: 220, max: 1100, notes: 'Varies by scope — multiple trade permits typical' },
    calculator: { formula: 'project_value * 0.015', description: 'Approx 1.5% of project value' },
    officialScheduleUrl: 'https://www.hillsboroughcounty.org/en/residents/property-owners-and-tenants/get-a-building-permit/fee-schedule',
    lastUpdated: '2026-01-30',
  },
  {
    jurisdictionId: 'hillsborough-county',
    jurisdictionName: 'Hillsborough County',
    jobType: 'WINDOW_DOOR_REPLACEMENT',
    feeStructure: 'flat',
    baselineRange: { min: 110, max: 320, notes: 'Impact-rated products require Florida Product Approval' },
    officialScheduleUrl: 'https://www.hillsboroughcounty.org/en/residents/property-owners-and-tenants/get-a-building-permit/fee-schedule',
    lastUpdated: '2026-01-30',
  },
  {
    jurisdictionId: 'hillsborough-county',
    jurisdictionName: 'Hillsborough County',
    jobType: 'EV_CHARGER',
    feeStructure: 'flat',
    baselineRange: { min: 80, max: 160, notes: 'Level 2 residential EVSE installation' },
    officialScheduleUrl: 'https://www.hillsboroughcounty.org/en/residents/property-owners-and-tenants/get-a-building-permit/fee-schedule',
    lastUpdated: '2026-01-30',
  },
  {
    jurisdictionId: 'hillsborough-county',
    jurisdictionName: 'Hillsborough County',
    jobType: 'GENERATOR_INSTALL',
    feeStructure: 'flat',
    baselineRange: { min: 165, max: 375, notes: 'Standby generator — electrical + fuel gas permits' },
    officialScheduleUrl: 'https://www.hillsboroughcounty.org/en/residents/property-owners-and-tenants/get-a-building-permit/fee-schedule',
    lastUpdated: '2026-01-30',
  },
  {
    jurisdictionId: 'hillsborough-county',
    jurisdictionName: 'Hillsborough County',
    jobType: 'ROOM_ADDITION',
    feeStructure: 'percentage',
    baselineRange: { min: 550, max: 2750, notes: 'All trades, plan review, structural' },
    calculator: { formula: 'project_value * 0.02', description: 'Approx 2% of project value' },
    officialScheduleUrl: 'https://www.hillsboroughcounty.org/en/residents/property-owners-and-tenants/get-a-building-permit/fee-schedule',
    lastUpdated: '2026-01-30',
  },
  {
    jurisdictionId: 'hillsborough-county',
    jurisdictionName: 'Hillsborough County',
    jobType: 'FENCE_INSTALLATION',
    feeStructure: 'flat',
    baselineRange: { min: 55, max: 165, notes: 'Required for fences over 6 ft; pool barriers always required' },
    officialScheduleUrl: 'https://www.hillsboroughcounty.org/en/residents/property-owners-and-tenants/get-a-building-permit/fee-schedule',
    lastUpdated: '2026-01-30',
  },
  {
    jurisdictionId: 'hillsborough-county',
    jurisdictionName: 'Hillsborough County',
    jobType: 'DECK_INSTALLATION',
    feeStructure: 'tiered',
    baselineRange: { min: 215, max: 430, notes: 'Includes plan review and two inspections' },
    officialScheduleUrl: 'https://www.hillsboroughcounty.org/en/residents/property-owners-and-tenants/get-a-building-permit/fee-schedule',
    lastUpdated: '2026-01-30',
  },

  // ── City of Tampa ──────────────────────────────────────────────────────────
  {
    jurisdictionId: 'tampa',
    jurisdictionName: 'City of Tampa',
    jobType: 'AC_HVAC_CHANGEOUT',
    feeStructure: 'flat',
    baselineRange: { min: 160, max: 275, notes: 'City of Tampa mechanical permit + state surcharge' },
    officialScheduleUrl: 'https://www.tampa.gov/permits/fee-schedule',
    lastUpdated: '2026-01-30',
  },
  {
    jurisdictionId: 'tampa',
    jurisdictionName: 'City of Tampa',
    jobType: 'RE_ROOFING',
    feeStructure: 'tiered',
    baselineRange: { min: 225, max: 560, notes: 'Based on project value, minimum $225' },
    calculator: { formula: 'Math.max(225, project_value * 0.014)', description: 'Greater of $225 or 1.4% of project value' },
    officialScheduleUrl: 'https://www.tampa.gov/permits/fee-schedule',
    lastUpdated: '2026-01-30',
  },
  {
    jurisdictionId: 'tampa',
    jurisdictionName: 'City of Tampa',
    jobType: 'ELECTRICAL_PANEL',
    feeStructure: 'flat',
    baselineRange: { min: 120, max: 235, notes: 'Residential panel upgrade' },
    officialScheduleUrl: 'https://www.tampa.gov/permits/fee-schedule',
    lastUpdated: '2026-01-30',
  },
  {
    jurisdictionId: 'tampa',
    jurisdictionName: 'City of Tampa',
    jobType: 'WATER_HEATER',
    feeStructure: 'flat',
    baselineRange: { min: 85, max: 165, notes: 'Standard residential replacement' },
    officialScheduleUrl: 'https://www.tampa.gov/permits/fee-schedule',
    lastUpdated: '2026-01-30',
  },
  {
    jurisdictionId: 'tampa',
    jurisdictionName: 'City of Tampa',
    jobType: 'KITCHEN_REMODEL',
    feeStructure: 'percentage',
    baselineRange: { min: 235, max: 1200, notes: 'Multiple trade permits; plan review required for structural changes' },
    calculator: { formula: 'project_value * 0.016', description: 'Approx 1.6% of project value' },
    officialScheduleUrl: 'https://www.tampa.gov/permits/fee-schedule',
    lastUpdated: '2026-01-30',
  },
  {
    jurisdictionId: 'tampa',
    jurisdictionName: 'City of Tampa',
    jobType: 'ROOM_ADDITION',
    feeStructure: 'percentage',
    baselineRange: { min: 600, max: 3000, notes: 'Full plan review, all trades, inspections' },
    calculator: { formula: 'project_value * 0.021', description: 'Approx 2.1% of project value' },
    officialScheduleUrl: 'https://www.tampa.gov/permits/fee-schedule',
    lastUpdated: '2026-01-30',
  },
  {
    jurisdictionId: 'tampa',
    jurisdictionName: 'City of Tampa',
    jobType: 'FENCE_INSTALLATION',
    feeStructure: 'flat',
    baselineRange: { min: 60, max: 170, notes: 'Over 6 ft requires permit; all pool barriers required' },
    officialScheduleUrl: 'https://www.tampa.gov/permits/fee-schedule',
    lastUpdated: '2026-01-30',
  },
  {
    jurisdictionId: 'tampa',
    jurisdictionName: 'City of Tampa',
    jobType: 'WINDOW_DOOR_REPLACEMENT',
    feeStructure: 'flat',
    baselineRange: { min: 115, max: 330, notes: 'Impact-rated products require Florida Product Approval number' },
    officialScheduleUrl: 'https://www.tampa.gov/permits/fee-schedule',
    lastUpdated: '2026-01-30',
  },
];

// ─── Helper: resolve Hillsborough building department from address ─────────────

export function getHillsboroughBuildingDepartment(address?: string): BuildingDepartment {
  if (!address) return HILLSBOROUGH_COUNTY_BUILDING;
  const normalized = address.toLowerCase();
  for (const [city, dept] of Object.entries(HILLSBOROUGH_CITY_DEPARTMENTS)) {
    if (normalized.includes(city.toLowerCase())) return dept;
  }
  return HILLSBOROUGH_COUNTY_BUILDING;
}

// ─── Jurisdiction display metadata ────────────────────────────────────────────

export interface JurisdictionMeta {
  id: Jurisdiction;
  label: string;
  county: 'Pinellas' | 'Hillsborough';
  dept: BuildingDepartment;
  feeId: string;   // matches PermitFee.jurisdictionId
}

export const HILLSBOROUGH_JURISDICTIONS: JurisdictionMeta[] = [
  { id: 'HILLSBOROUGH_COUNTY', label: 'Hillsborough County (unincorporated)', county: 'Hillsborough', dept: HILLSBOROUGH_COUNTY_BUILDING, feeId: 'hillsborough-county' },
  { id: 'TAMPA',               label: 'City of Tampa',                        county: 'Hillsborough', dept: TAMPA_BUILDING_DEPT,           feeId: 'tampa' },
  { id: 'TEMPLE_TERRACE',      label: 'Temple Terrace',                       county: 'Hillsborough', dept: TEMPLE_TERRACE_BUILDING_DEPT,   feeId: 'hillsborough-county' },
  { id: 'PLANT_CITY',          label: 'Plant City',                           county: 'Hillsborough', dept: PLANT_CITY_BUILDING_DEPT,       feeId: 'hillsborough-county' },
  { id: 'BRANDON',             label: 'Brandon',                              county: 'Hillsborough', dept: HILLSBOROUGH_COUNTY_BUILDING,   feeId: 'hillsborough-county' },
  { id: 'RIVERVIEW',           label: 'Riverview',                            county: 'Hillsborough', dept: HILLSBOROUGH_COUNTY_BUILDING,   feeId: 'hillsborough-county' },
  { id: 'VALRICO',             label: 'Valrico',                              county: 'Hillsborough', dept: HILLSBOROUGH_COUNTY_BUILDING,   feeId: 'hillsborough-county' },
];
