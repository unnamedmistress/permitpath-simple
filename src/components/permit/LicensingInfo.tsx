import { Shield, ExternalLink, AlertCircle, CheckCircle } from "lucide-react";
import { JobType } from "@/types";

interface LicensingInfoProps {
  jobType: JobType;
}

interface LicenseRequirement {
  required: boolean;
  licenseType?: string;
  licenseCategory?: string;
  description?: string;
  note?: string;
  verifyUrl?: string;
  consequences?: string;
}

const LICENSING_REQUIREMENTS: Record<JobType, LicenseRequirement> = {
  RE_ROOFING: {
    required: true,
    licenseType: "State-Certified Roofing Contractor",
    licenseCategory: "CCC or CBC license",
    description: "Roofing work requires a state-certified contractor with an active roofing license.",
    note: "Homeowners cannot pull permits for roofing - must use licensed contractor",
    verifyUrl: "https://www.myfloridalicense.com/",
    consequences: "Using unlicensed contractors voids insurance claims and warranty"
  },
  ROOF_REPAIR: {
    required: true,
    licenseType: "State-Certified Roofing Contractor",
    licenseCategory: "CCC or CBC license (for repairs over 100 sq ft)",
    description: "Roof repairs over 100 sq ft require licensed contractor.",
    verifyUrl: "https://www.myfloridalicense.com/"
  },
  AC_HVAC_CHANGEOUT: {
    required: true,
    licenseType: "HVAC Contractor License",
    licenseCategory: "CAC (Air Conditioning) or CM (Mechanical) license",
    description: "HVAC work requires state mechanical contractor license.",
    note: "EPA 608 certification also required for refrigerant handling",
    verifyUrl: "https://www.myfloridalicense.com/"
  },
  WATER_HEATER: {
    required: true,
    licenseType: "Licensed Plumber or Contractor",
    licenseCategory: "CFC (Plumbing) or CGC (General) license",
    description: "Plumbing work requires state plumbing contractor license.",
    note: "Homeowners can sometimes pull own permit but must be owner-occupied",
    verifyUrl: "https://www.myfloridalicense.com/"
  },
  ELECTRICAL_PANEL: {
    required: true,
    licenseType: "Licensed Electrician",
    licenseCategory: "EC (Electrical Contractor) or ER (Residential) license",
    description: "All electrical work requires state-licensed electrician.",
    note: "Never attempt electrical work without proper licensing - serious safety hazard",
    verifyUrl: "https://www.myfloridalicense.com/",
    consequences: "Unlicensed electrical work is illegal and extremely dangerous"
  },
  ELECTRICAL_REWIRING: {
    required: true,
    licenseType: "Licensed Electrician",
    licenseCategory: "EC or ER license required",
    description: "Electrical wiring must be performed by state-licensed electrician only.",
    verifyUrl: "https://www.myfloridalicense.com/"
  },
  EV_CHARGER: {
    required: true,
    licenseType: "Licensed Electrician",
    licenseCategory: "EC or ER license",
    description: "EV charger installation requires licensed electrician.",
    note: "Some Level 1 chargers may not require permit, but still need licensed work",
    verifyUrl: "https://www.myfloridalicense.com/"
  },
  GENERATOR_INSTALL: {
    required: true,
    licenseType: "Licensed Electrician + Gas Contractor",
    licenseCategory: "EC/ER license + fuel gas license if applicable",
    description: "Generator installation requires both electrical and gas licenses.",
    verifyUrl: "https://www.myfloridalicense.com/"
  },
  PLUMBING_MAIN_LINE: {
    required: true,
    licenseType: "Licensed Plumbing Contractor",
    licenseCategory: "CFC (Plumbing Contractor) license",
    description: "Main line plumbing work requires state plumbing contractor.",
    verifyUrl: "https://www.myfloridalicense.com/"
  },
  SMALL_BATH_REMODEL: {
    required: false,
    description: "License requirements depend on scope of work",
    note: "Plumbing, electrical, or structural work requires respective trade licenses. Cosmetic-only work may not require license.",
    verifyUrl: "https://www.myfloridalicense.com/"
  },
  KITCHEN_REMODEL: {
    required: false,
    description: "Multiple trade licenses typically required",
    note: "Plumbing changes = plumber license. Electrical changes = electrician license. Structural changes = contractor license.",
    verifyUrl: "https://www.myfloridalicense.com/"
  },
  WINDOW_DOOR_REPLACEMENT: {
    required: false,
    licenseType: "Recommended: Licensed Contractor",
    description: "Window/door installation doesn't always require contractor license for simple replacements.",
    note: "However, product must have Florida Product Approval and be properly installed per manufacturer specs",
    verifyUrl: "https://www.myfloridalicense.com/"
  },
  SIDING_EXTERIOR: {
    required: false,
    licenseType: "Recommended: Licensed Contractor",
    description: "Siding installation often doesn't require contractor license, but quality varies significantly.",
    note: "Major projects may require building contractor license",
    verifyUrl: "https://www.myfloridalicense.com/"
  },
  DECK_INSTALLATION: {
    required: false,
    licenseType: "Recommended: Licensed Building Contractor",
    description: "Deck construction typically requires contractor license for structures over certain size.",
    note: "Small decks (under 200 sq ft, under 30\" high) may not require license in some jurisdictions",
    verifyUrl: "https://www.myfloridalicense.com/"
  },
  FENCE_INSTALLATION: {
    required: false,
    description: "Typically no contractor license required for fence installation",
    note: "However, pool barriers have specific safety requirements - use qualified installer",
    verifyUrl: "https://www.myfloridalicense.com/"
  },
  POOL_BARRIER: {
    required: false,
    licenseType: "Recommended: Pool Barrier Specialist",
    description: "Pool safety barriers don't always require contractor license, but must meet strict code.",
    note: "Life safety code - use experienced installer familiar with pool barrier requirements",
    verifyUrl: "https://www.myfloridalicense.com/"
  },
  ROOM_ADDITION: {
    required: true,
    licenseType: "Licensed General Contractor",
    licenseCategory: "CGC (General Contractor) license required",
    description: "Room additions are major construction requiring general contractor license.",
    note: "Multiple trade licenses also required: electrician, plumber, HVAC contractor",
    verifyUrl: "https://www.myfloridalicense.com/",
    consequences: "Major structural work without proper licensing is dangerous and illegal"
  },
  FOUNDATION_REPAIR: {
    required: true,
    licenseType: "Licensed Contractor + Structural Engineer",
    licenseCategory: "CGC license + PE (Professional Engineer) seal",
    description: "Foundation work requires both licensed contractor AND structural engineer involvement.",
    note: "Most critical license requirement - foundation is life safety issue",
    verifyUrl: "https://www.myfloridalicense.com/",
    consequences: "Improper foundation work can cause catastrophic structural failure"
  },
};

export default function LicensingInfo({ jobType }: LicensingInfoProps) {
  const licensing = LICENSING_REQUIREMENTS[jobType];
  
  if (!licensing) {
    return null;
  }

  return (
    <div className={`rounded-lg border p-4 space-y-3 ${
      licensing.required 
        ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
        : "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
    }`}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
          licensing.required 
            ? "bg-red-500/10" 
            : "bg-blue-500/10"
        }`}>
          <Shield size={20} className={licensing.required ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-foreground">
              {licensing.required ? "⚠️ Licensed Contractor Required" : "💼 Licensing Information"}
            </h3>
          </div>
          {licensing.licenseType && (
            <p className="text-sm font-medium text-foreground">
              {licensing.licenseType}
            </p>
          )}
          {licensing.licenseCategory && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {licensing.licenseCategory}
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <p className="text-xs text-foreground">
          {licensing.description}
        </p>
        
        {licensing.note && (
          <div className={`flex items-start gap-2 p-2 rounded-lg ${
            licensing.required 
              ? "bg-red-100 dark:bg-red-900/20" 
              : "bg-blue-100 dark:bg-blue-900/20"
          }`}>
            <AlertCircle size={14} className={`mt-0.5 flex-shrink-0 ${
              licensing.required ? "text-red-600" : "text-blue-600"
            }`} />
            <p className="text-xs text-foreground">
              <strong>Note:</strong> {licensing.note}
            </p>
          </div>
        )}

        {licensing.consequences && (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700">
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-red-700 dark:text-red-400" />
            <p className="text-xs text-red-900 dark:text-red-200">
              <strong>Warning:</strong> {licensing.consequences}
            </p>
          </div>
        )}
      </div>

      {/* What You Need */}
      {licensing.required && (
        <div className="bg-white dark:bg-gray-900 rounded-lg p-3 space-y-2">
          <h4 className="text-xs font-semibold text-foreground mb-2">✓ Contractor Must Provide:</h4>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-start gap-2">
              <CheckCircle size={14} className="text-success mt-0.5 flex-shrink-0" />
              <span className="text-foreground">Valid state license (not expired)</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle size={14} className="text-success mt-0.5 flex-shrink-0" />
              <span className="text-foreground">General liability insurance</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle size={14} className="text-success mt-0.5 flex-shrink-0" />
              <span className="text-foreground">Workers' compensation (if employees)</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle size={14} className="text-success mt-0.5 flex-shrink-0" />
              <span className="text-foreground">Physical license card or copy</span>
            </div>
          </div>
        </div>
      )}

      {/* Verify License */}
      {licensing.verifyUrl && (
        <div className="pt-2 border-t border-current/20">
          <a
            href={licensing.verifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 text-xs font-medium ${
              licensing.required 
                ? "text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200" 
                : "text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200"
            }`}
          >
            <ExternalLink size={14} />
            Verify Contractor License Online
          </a>
          <p className="text-xs text-muted-foreground mt-1">
            Always verify your contractor's license status before hiring
          </p>
        </div>
      )}

      {/* Homeowner Warning */}
      {licensing.required && (
        <div className="pt-2 border-t border-current/20">
          <p className="text-xs text-foreground">
            <strong>⚠️ Homeowner Alert:</strong> Do not attempt to "pull your own permit" for this work unless you are also a licensed contractor. Many jurisdictions do not allow homeowner permits for licensed trades.
          </p>
        </div>
      )}
    </div>
  );
}
