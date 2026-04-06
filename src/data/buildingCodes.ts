export interface BuildingCodeRef {
  code: string;
  section: string;
  title: string;
  summary: string;
  url: string;
}

export interface JobTypeCodeSet {
  jobType: string;
  displayName: string;
  codes: BuildingCodeRef[];
}

const FBC = "Florida Building Code 8th Edition (2023)";
const FBC_R = "FL Residential Code 8th Ed.";
const NEC = "National Electrical Code (NEC 2023)";
const FPC = "FL Plumbing Code 8th Ed.";
const FMC = "FL Mechanical Code 8th Ed.";

export const BUILDING_CODES: JobTypeCodeSet[] = [
  {
    jobType: "RE_ROOFING", displayName: "Re-Roofing",
    codes: [
      { code: FBC, section: "1516", title: "Reroofing Requirements", summary: "Covers when tear-off is required vs. recover, max layers, and structural evaluation for reroof.", url: "https://codes.iccsafe.org/content/FLBC2023P8/chapter-15-roof-assemblies-and-rooftop-structures" },
      { code: FBC_R, section: "R903.4", title: "Roof Drainage", summary: "All roofs must have controlled drainage that does not flow over public walkways.", url: "https://codes.iccsafe.org/content/FLRC2023P6/chapter-9-roof-assemblies" },
      { code: FBC, section: "1522", title: "Wind Resistance", summary: "Roofing must meet HVHZ wind-resistance requirements for Pinellas County (130+ mph).", url: "https://codes.iccsafe.org/content/FLBC2023P8/chapter-15-roof-assemblies-and-rooftop-structures" },
      { code: FBC_R, section: "R905", title: "Materials & Installation", summary: "Specifies requirements for asphalt shingles, metal, tile, and other roof coverings.", url: "https://codes.iccsafe.org/content/FLRC2023P6/chapter-9-roof-assemblies" },
    ]
  },
  {
    jobType: "ROOF_REPAIR", displayName: "Roof Repair",
    codes: [
      { code: FBC, section: "1516.2", title: "Roof Repairs", summary: "Repairs to existing roofs must comply with original code or current code if scope exceeds 25%.", url: "https://codes.iccsafe.org/content/FLBC2023P8/chapter-15-roof-assemblies-and-rooftop-structures" },
      { code: FBC, section: "1522", title: "Wind Resistance", summary: "Repaired sections must meet current HVHZ wind-resistance standards.", url: "https://codes.iccsafe.org/content/FLBC2023P8/chapter-15-roof-assemblies-and-rooftop-structures" },
    ]
  },
  {
    jobType: "AC_HVAC_CHANGEOUT", displayName: "AC/HVAC Changeout",
    codes: [
      { code: FMC, section: "301", title: "General Mechanical Requirements", summary: "Equipment must be installed per manufacturer specs and accessible for service.", url: "https://codes.iccsafe.org/content/FLMC2023P5/chapter-3-general-regulations" },
      { code: FMC, section: "401", title: "Ventilation", summary: "HVAC systems must provide minimum ventilation per ASHRAE 62.1/62.2.", url: "https://codes.iccsafe.org/content/FLMC2023P5/chapter-4-ventilation" },
      { code: FBC_R, section: "R403", title: "Energy Efficiency", summary: "Replacement systems must meet current SEER2 efficiency minimums (FL: 15 SEER2).", url: "https://codes.iccsafe.org/content/FLRC2023P6/chapter-11-re-energy-efficiency" },
    ]
  },
  {
    jobType: "WATER_HEATER", displayName: "Water Heater",
    codes: [
      { code: FPC, section: "501", title: "Water Heater Installation", summary: "Requirements for expansion tanks, T&P valve discharge, seismic strapping, and clearances.", url: "https://codes.iccsafe.org/content/FLPC2023P5/chapter-5-water-heaters" },
      { code: FBC_R, section: "R403.5", title: "Energy Efficiency - Water Heating", summary: "Replacement water heaters must meet current UEF efficiency standards.", url: "https://codes.iccsafe.org/content/FLRC2023P6/chapter-11-re-energy-efficiency" },
      { code: FPC, section: "504", title: "Safety Devices", summary: "T&P relief valves required, discharge piped to within 6 inches of floor or outside.", url: "https://codes.iccsafe.org/content/FLPC2023P5/chapter-5-water-heaters" },
    ]
  },
  {
    jobType: "ELECTRICAL_PANEL", displayName: "Electrical Panel Upgrade",
    codes: [
      { code: NEC, section: "230", title: "Services", summary: "Requirements for service entrance conductors, disconnects, and panel location.", url: "https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70" },
      { code: NEC, section: "408", title: "Switchboards & Panelboards", summary: "Panel construction, bus ratings, circuit directory, and working clearances (36 in. min).", url: "https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70" },
      { code: NEC, section: "110.26", title: "Working Space", summary: "Minimum 36-inch clear working space in front of panel, 30 inches wide.", url: "https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70" },
    ]
  },
  {
    jobType: "ELECTRICAL_REWIRING", displayName: "Electrical Rewiring",
    codes: [
      { code: NEC, section: "210", title: "Branch Circuits", summary: "Requirements for circuit sizing, GFCI/AFCI protection, and outlet spacing.", url: "https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70" },
      { code: NEC, section: "334", title: "NM Cable (Romex)", summary: "Installation methods, support intervals, and protection requirements for NM cable.", url: "https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70" },
      { code: NEC, section: "210.12", title: "AFCI Protection", summary: "Arc-fault protection required for all 120V 15/20A branch circuits in dwelling units.", url: "https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70" },
    ]
  },
  {
    jobType: "EV_CHARGER", displayName: "EV Charger",
    codes: [
      { code: NEC, section: "625", title: "Electric Vehicle Charging", summary: "Dedicated branch circuit, GFCI protection, and equipment listing requirements for EVSE.", url: "https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70" },
      { code: NEC, section: "210.17", title: "EV Branch Circuit", summary: "Individual branch circuit required, typically 240V 40A for Level 2 charging.", url: "https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70" },
    ]
  },
  {
    jobType: "GENERATOR_INSTALL", displayName: "Generator Installation",
    codes: [
      { code: NEC, section: "702", title: "Optional Standby Systems", summary: "Transfer switch requirements, grounding, and connection to utility service.", url: "https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70" },
      { code: FMC, section: "301.3", title: "Fuel Gas Equipment", summary: "Gas-fired generators require fuel line sizing, shutoff valves, and ventilation.", url: "https://codes.iccsafe.org/content/FLMC2023P5/chapter-3-general-regulations" },
      { code: FBC, section: "1203", title: "Noise & Setbacks", summary: "Permanent generators must meet local noise ordinances and property setback requirements.", url: "https://codes.iccsafe.org/content/FLBC2023P8/chapter-12-interior-environment" },
    ]
  },
  {
    jobType: "PLUMBING_MAIN_LINE", displayName: "Plumbing Main Line",
    codes: [
      { code: FPC, section: "301", title: "General Plumbing Regulations", summary: "Licensed plumber required. All work must conform to FL Plumbing Code.", url: "https://codes.iccsafe.org/content/FLPC2023P5/chapter-3-general-regulations" },
      { code: FPC, section: "701", title: "Drainage Systems", summary: "Pipe sizing, slope requirements (1/4 in. per foot min), and cleanout access.", url: "https://codes.iccsafe.org/content/FLPC2023P5/chapter-7-sanitary-drainage" },
      { code: FPC, section: "603", title: "Water Supply & Distribution", summary: "Pipe material, sizing, and pressure requirements for water supply lines.", url: "https://codes.iccsafe.org/content/FLPC2023P5/chapter-6-water-supply-and-distribution" },
    ]
  },
  {
    jobType: "SMALL_BATH_REMODEL", displayName: "Bath Remodel",
    codes: [
      { code: FPC, section: "405", title: "Fixture Requirements", summary: "Water closet, lavatory, and tub/shower installation and clearance requirements.", url: "https://codes.iccsafe.org/content/FLPC2023P5/chapter-4-fixtures-faucets-and-fixture-fittings" },
      { code: NEC, section: "210.8(A)", title: "Bathroom GFCI", summary: "All 125V receptacles in bathrooms must be GFCI-protected.", url: "https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70" },
      { code: FBC_R, section: "R307", title: "Bathroom Clearances", summary: "Minimum clearances: 15 in. from toilet centerline to wall, 21 in. clear in front.", url: "https://codes.iccsafe.org/content/FLRC2023P6/chapter-3-building-planning" },
    ]
  },
  {
    jobType: "KITCHEN_REMODEL", displayName: "Kitchen Remodel",
    codes: [
      { code: NEC, section: "210.52(B)", title: "Kitchen Receptacles", summary: "Two 20A small-appliance circuits required, GFCI for all countertop receptacles.", url: "https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70" },
      { code: FPC, section: "801", title: "Indirect Waste", summary: "Dishwasher and disposal waste connections, air gap requirements.", url: "https://codes.iccsafe.org/content/FLPC2023P5/chapter-8-indirect-and-special-waste" },
      { code: FMC, section: "505", title: "Kitchen Exhaust", summary: "Range hood exhaust duct material, size, and termination requirements.", url: "https://codes.iccsafe.org/content/FLMC2023P5/chapter-5-exhaust-systems" },
    ]
  },
  {
    jobType: "WINDOW_DOOR_REPLACEMENT", displayName: "Window & Door Replacement",
    codes: [
      { code: FBC, section: "1710", title: "Product Approval", summary: "All windows and doors in FL must be FL Product Approved (FBC NOA or FL# required).", url: "https://codes.iccsafe.org/content/FLBC2023P8/chapter-17-structural-tests-and-special-inspections" },
      { code: FBC, section: "1609", title: "Wind Loads", summary: "Window/door assemblies must meet design pressure for HVHZ (Pinellas: 130+ mph).", url: "https://codes.iccsafe.org/content/FLBC2023P8/chapter-16-structural-design" },
      { code: FBC_R, section: "R612", title: "Skylights & Sloped Glazing", summary: "If replacing skylights, safety glazing and fall protection requirements.", url: "https://codes.iccsafe.org/content/FLRC2023P6/chapter-6-wall-construction" },
    ]
  },
  {
    jobType: "SIDING_EXTERIOR", displayName: "Siding / Exterior",
    codes: [
      { code: FBC, section: "1403", title: "Exterior Wall Coverings", summary: "Material standards, weather-resistive barrier, and attachment requirements.", url: "https://codes.iccsafe.org/content/FLBC2023P8/chapter-14-exterior-walls" },
      { code: FBC, section: "1404.2", title: "Weather Protection", summary: "Water-resistive barrier required behind exterior cladding.", url: "https://codes.iccsafe.org/content/FLBC2023P8/chapter-14-exterior-walls" },
    ]
  },
  {
    jobType: "DECK_INSTALLATION", displayName: "Deck / Patio",
    codes: [
      { code: FBC_R, section: "R507", title: "Exterior Decks", summary: "Prescriptive deck construction: footings, posts, beams, joists, ledger attachment.", url: "https://codes.iccsafe.org/content/FLRC2023P6/chapter-5-floors" },
      { code: FBC_R, section: "R301.5", title: "Live Loads", summary: "Decks must support minimum 40 psf live load per residential code.", url: "https://codes.iccsafe.org/content/FLRC2023P6/chapter-3-building-planning" },
      { code: FBC_R, section: "R312", title: "Guards & Handrails", summary: "Guards required when deck is 30+ inches above grade. Min 36 in. height.", url: "https://codes.iccsafe.org/content/FLRC2023P6/chapter-3-building-planning" },
    ]
  },
  {
    jobType: "FENCE_INSTALLATION", displayName: "Fence Installation",
    codes: [
      { code: FBC_R, section: "R312.2", title: "Fence as Guard", summary: "If fence serves as a guard at grade change, must meet guard height requirements.", url: "https://codes.iccsafe.org/content/FLRC2023P6/chapter-3-building-planning" },
      { code: FBC, section: "3109", title: "Pool Barrier Requirements", summary: "If near a pool, fence must be min 48 in., self-closing/self-latching gate.", url: "https://codes.iccsafe.org/content/FLBC2023P8/chapter-31-special-construction" },
    ]
  },
  {
    jobType: "POOL_BARRIER", displayName: "Pool Barrier",
    codes: [
      { code: FBC, section: "3109", title: "Swimming Pool Enclosures", summary: "48 in. min height, no climbable features, self-closing/self-latching gates required.", url: "https://codes.iccsafe.org/content/FLBC2023P8/chapter-31-special-construction" },
      { code: "FL Statute", section: "515.29", title: "Residential Pool Safety", summary: "FL law requires at least one approved safety feature for all residential pools.", url: "http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0500-0599/0515/0515.html" },
    ]
  },
  {
    jobType: "ROOM_ADDITION", displayName: "Room Addition",
    codes: [
      { code: FBC_R, section: "R301", title: "Design Criteria", summary: "Structural design loads (wind, live, dead) for new construction in HVHZ.", url: "https://codes.iccsafe.org/content/FLRC2023P6/chapter-3-building-planning" },
      { code: FBC_R, section: "R602", title: "Wall Construction", summary: "Wood frame wall construction, headers, bracing, and fastening schedule.", url: "https://codes.iccsafe.org/content/FLRC2023P6/chapter-6-wall-construction" },
      { code: FBC_R, section: "R802", title: "Roof-Ceiling Construction", summary: "Rafter/truss sizing, connections, and roof sheathing for additions.", url: "https://codes.iccsafe.org/content/FLRC2023P6/chapter-8-roof-ceiling-construction" },
      { code: FBC, section: "1612", title: "Flood Loads", summary: "If in flood zone, addition must comply with flood-resistant construction.", url: "https://codes.iccsafe.org/content/FLBC2023P8/chapter-16-structural-design" },
    ]
  },
  {
    jobType: "FOUNDATION_REPAIR", displayName: "Foundation Repair",
    codes: [
      { code: FBC_R, section: "R403", title: "Footings", summary: "Footing depth, width, and reinforcement requirements for FL soil conditions.", url: "https://codes.iccsafe.org/content/FLRC2023P6/chapter-4-foundations" },
      { code: FBC_R, section: "R401.4", title: "Soil Tests", summary: "Geotechnical investigation may be required for foundation repair.", url: "https://codes.iccsafe.org/content/FLRC2023P6/chapter-4-foundations" },
    ]
  },
];

/** Lookup building codes for a given job type (grid ID or canonical) */
export function getCodesForJobType(jobType: string): BuildingCodeRef[] {
  // Map grid IDs to canonical types
  const ALIAS: Record<string, string> = {
    ROOF_REPLACEMENT: "RE_ROOFING",
    ROOF_REPAIR: "ROOF_REPAIR",
    AC_HVAC: "AC_HVAC_CHANGEOUT",
    BATHROOM_REMODEL: "SMALL_BATH_REMODEL",
    WINDOW_DOOR: "WINDOW_DOOR_REPLACEMENT",
    DECK_PATIO: "DECK_INSTALLATION",
    FENCE: "FENCE_INSTALLATION",
    INTERIOR_PAINT: "INTERIOR_PAINT",
    SIDING_EXTERIOR: "SIDING_EXTERIOR",
    KITCHEN_REMODEL: "KITCHEN_REMODEL",
    POOL_BARRIER: "POOL_BARRIER",
    ROOM_ADDITION: "ROOM_ADDITION",
  };
  const canonical = ALIAS[jobType] || jobType;
  const codeSet = BUILDING_CODES.find(c => c.jobType === canonical);
  return codeSet?.codes || [];
}
