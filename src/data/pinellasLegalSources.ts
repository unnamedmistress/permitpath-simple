import { LegalSource } from "@/types";

// Pinellas County Legal Sources - Official permit and code references
export const LEGAL_SOURCES: Record<string, LegalSource> = {
  // Florida Building Code References
  FBC_105_2: {
    label: "FBC Section 105.2 - Work Exempt from Permit",
    url: "https://codes.iccsafe.org/content/FLBC2023P1/chapter-1-scope-and-administration#FLBC2023P1_Ch01_Sec105.2",
    description: "Lists work that is exempt from building permits, including minor repairs and cosmetic changes.",
    lastUpdated: "2023-12-31"
  },
  FBC_R303: {
    label: "FBC Residential R303 - Light, Ventilation and Heating",
    url: "https://codes.iccsafe.org/content/FLRC2023P1/chapter-3-building-planning#FLRC2023P1_Ch03_SecR303",
    description: "Requirements for bathroom ventilation including exhaust fan CFM ratings and window requirements.",
    lastUpdated: "2023-12-31"
  },
  FBC_PLUMBING: {
    label: "Florida Plumbing Code",
    url: "https://codes.iccsafe.org/content/FLPC2023P1",
    description: "Requirements for plumbing fixtures, drains, water supply, and venting systems.",
    lastUpdated: "2023-12-31"
  },
  FBC_MECHANICAL: {
    label: "Florida Mechanical Code",
    url: "https://codes.iccsafe.org/content/FLMC2023P1",
    description: "HVAC installation requirements, ductwork, and equipment specifications.",
    lastUpdated: "2023-12-31"
  },
  FBC_ROOFING: {
    label: "FBC Chapter 15 - Roof Assemblies",
    url: "https://codes.iccsafe.org/content/FLBC2023P1/chapter-15-roof-assemblies-and-rooftop-structures",
    description: "Requirements for roof coverings, deck attachment, and secondary water barriers.",
    lastUpdated: "2023-12-31"
  },
  
  // National Electrical Code References
  NEC_210_8: {
    label: "NEC Article 210.8 - GFCI Protection",
    url: "https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70",
    description: "Requires GFCI protection for outlets in bathrooms, kitchens, and other wet locations.",
    lastUpdated: "2023-12-31"
  },
  NEC_210_52: {
    label: "NEC Article 210.52 - Dwelling Unit Receptacle Outlets",
    url: "https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70",
    description: "Requirements for receptacle placement in dwelling units including bathrooms.",
    lastUpdated: "2023-12-31"
  },
  NEC_422: {
    label: "NEC Article 422 - Appliances",
    url: "https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70",
    description: "Installation requirements for fixed appliances including water heaters and HVAC equipment.",
    lastUpdated: "2023-12-31"
  },
  NEC_625: {
    label: "NEC Article 625 - Electric Vehicle Charging",
    url: "https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70",
    description: "Requirements for EV charging station installation including circuit sizing and protection.",
    lastUpdated: "2023-12-31"
  },
  
  // Florida Statutes
  FS_713_13: {
    label: "Florida Statute 713.13 - Notice of Commencement",
    url: "https://www.flsenate.gov/Laws/Statutes/2023/713.13",
    description: "Requires recording a Notice of Commencement for construction projects over $2,500 (excluding emergency repairs).",
    lastUpdated: "2023-12-31"
  },
  
  // Pinellas County Resources
  PINELLAS_PERMIT_GUIDE: {
    label: "Pinellas County Permitting Guide",
    url: "https://pinellas.gov/permitting-guide/",
    description: "Comprehensive guide to obtaining building permits in Pinellas County.",
    lastUpdated: "2024-01-01"
  },
  PINELLAS_FORMS: {
    label: "Pinellas County Permit Forms",
    url: "https://pinellas.gov/forms-permit-applications-checklists/",
    description: "Official permit application forms and checklists for all permit types.",
    lastUpdated: "2024-01-01"
  },
  PINELLAS_NOC: {
    label: "Pinellas County NOC Form",
    url: "https://pinellas.gov/notice-of-commencement-form/",
    description: "Notice of Commencement form required for projects valued over $5,000.",
    lastUpdated: "2024-01-01"
  },
  PINELLAS_REROOFING: {
    label: "Pinellas Re-Roofing Affidavit",
    url: "https://pinellas.gov/forms-permit-applications-checklists/",
    description: "Re-roofing Mitigation Affidavit required for all roof replacement projects.",
    lastUpdated: "2024-01-01"
  },
  PINELLAS_TANKLESS: {
    label: "Pinellas Tankless Water Heater Worksheet",
    url: "https://pinellas.gov/forms-permit-applications-checklists/",
    description: "GPM calculation worksheet required for tankless water heater installations.",
    lastUpdated: "2024-01-01"
  },
  PINELLAS_EXPRESS: {
    label: "Pinellas Express Permits",
    url: "https://access.pinellas.gov/",
    description: "Online portal for expedited permit applications for qualifying projects.",
    lastUpdated: "2024-01-01"
  },
  PINELLAS_INSPECTIONS: {
    label: "Pinellas Inspection Scheduling",
    url: "https://access.pinellas.gov/",
    description: "Schedule and manage inspections through the Pinellas County Access portal.",
    lastUpdated: "2024-01-01"
  },
  
  // Pool and Barrier Specific
  PINELLAS_POOL_BARRIER: {
    label: "Pinellas Pool Barrier Requirements",
    url: "https://pinellas.gov/pool-barriers/",
    description: "Requirements for pool safety barriers, gates, and alarms per Florida law.",
    lastUpdated: "2024-01-01"
  },
  FL_POOL_SAFETY: {
    label: "Florida Residential Swimming Pool Safety Act",
    url: "https://www.flsenate.gov/Laws/Statutes/2023/515.27",
    description: "State requirements for residential pool barriers and safety features.",
    lastUpdated: "2023-12-31"
  },
  
  // HVAC Specific
  PINELLAS_HVAC: {
    label: "Pinellas HVAC Permit Requirements",
    url: "https://pinellas.gov/mechanical-permits/",
    description: "Requirements for HVAC changeout permits including like-for-like replacements.",
    lastUpdated: "2024-01-01"
  },
  
  // Generator Specific  
  FBC_GENERATOR: {
    label: "FBC Generator Installation Requirements",
    url: "https://codes.iccsafe.org/content/FLFC2023P1/chapter-12-energy-systems",
    description: "Requirements for standby generator installation including fuel storage and electrical connections.",
    lastUpdated: "2023-12-31"
  },
  
  // Window and Door Specific
  PINELLAS_WINDOW_DOOR: {
    label: "Pinellas Window/Door Replacement Form",
    url: "https://pinellas.gov/forms-permit-applications-checklists/",
    description: "Required form for window and door replacement including product approval numbers.",
    lastUpdated: "2024-01-01"
  },
  FL_PRODUCT_APPROVAL: {
    label: "Florida Product Approval Database",
    url: "https://floridabuilding.org/pr/pr_default.aspx",
    description: "Database of approved building products for use in Florida construction.",
    lastUpdated: "2024-01-01"
  }
};

// Helper function to get legal source by key
export function getLegalSource(key: string): LegalSource | undefined {
  return LEGAL_SOURCES[key];
}

// Helper function to get all sources for a category
export function getLegalSourcesByCategory(category: "building" | "electrical" | "plumbing" | "pinellas"): LegalSource[] {
  const categoryPrefixes: Record<string, string[]> = {
    building: ["FBC_"],
    electrical: ["NEC_"],
    plumbing: ["FBC_PLUMBING"],
    pinellas: ["PINELLAS_", "FS_"]
  };
  
  const prefixes = categoryPrefixes[category] || [];
  return Object.entries(LEGAL_SOURCES)
    .filter(([key]) => prefixes.some(prefix => key.startsWith(prefix)))
    .map(([, source]) => source);
}
