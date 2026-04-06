/**
 * Phase 3: Jurisdiction Intelligence
 * Parses a Pinellas County address string and returns the most likely
 * building-permit jurisdiction (city/municipality) without a network call.
 *
 * Matching is intentionally lenient — it checks for city name substrings
 * after lower-casing the full address.  "St. Pete Beach" must come BEFORE
 * "St. Pete / St. Petersburg" in the list so the longer match wins first.
 */

import { Jurisdiction } from '@/types/permit';
import { HILLSBOROUGH_ZIP_MAP, HILLSBOROUGH_CITY_PATTERNS } from '@/data/hillsborough';

export interface DetectedJurisdiction {
  jurisdiction: Jurisdiction;
  label: string;
  /** high = pattern found in address; low = only a zip-code hint */
  confidence: 'high' | 'low';
}

// Pinellas County ZIP codes → jurisdiction (fallback when city name is absent)
const ZIP_MAP: Record<string, Jurisdiction> = {
  '33701': 'ST_PETERSBURG',
  '33702': 'ST_PETERSBURG',
  '33703': 'ST_PETERSBURG',
  '33704': 'ST_PETERSBURG',
  '33705': 'ST_PETERSBURG',
  '33706': 'ST_PETE_BEACH',      // St. Pete Beach / Treasure Island overlap
  '33707': 'SOUTH_PASADENA',
  '33708': 'MADEIRA_BEACH',
  '33709': 'SEMINOLE',
  '33710': 'ST_PETERSBURG',
  '33711': 'ST_PETERSBURG',
  '33712': 'ST_PETERSBURG',
  '33713': 'ST_PETERSBURG',
  '33714': 'ST_PETERSBURG',
  '33715': 'ST_PETERSBURG',
  '33716': 'ST_PETERSBURG',
  '33755': 'CLEARWATER',
  '33756': 'CLEARWATER',
  '33759': 'CLEARWATER',
  '33760': 'CLEARWATER',
  '33761': 'CLEARWATER',
  '33762': 'CLEARWATER',
  '33763': 'CLEARWATER',
  '33764': 'CLEARWATER',
  '33765': 'CLEARWATER',
  '33767': 'CLEARWATER',
  '33770': 'LARGO',
  '33771': 'LARGO',
  '33772': 'SEMINOLE',
  '33773': 'LARGO',
  '33774': 'LARGO',
  '33776': 'SEMINOLE',
  '33777': 'SEMINOLE',
  '33778': 'LARGO',
  '33781': 'PINELLAS_PARK',
  '33782': 'PINELLAS_PARK',
  '33785': 'INDIAN_SHORES',
  '33786': 'BELLEAIR',
  '34683': 'DUNEDIN',
  '34689': 'TARPON_SPRINGS',
  '34698': 'DUNEDIN',
  '34684': 'PALM_HARBOR',
  '34685': 'PALM_HARBOR',
  '34688': 'PALM_HARBOR',
};

// Ordered most-specific to least-specific so longer city names match first
const CITY_PATTERNS: Array<{ patterns: string[]; jurisdiction: Jurisdiction; label: string }> = [
  {
    patterns: ['st. pete beach', 'st pete beach', 'saint pete beach', 'stpete beach', 'st.pete beach'],
    jurisdiction: 'ST_PETE_BEACH',
    label: 'St. Pete Beach',
  },
  {
    patterns: ['tarpon springs', 'tarpon spgs'],
    jurisdiction: 'TARPON_SPRINGS',
    label: 'Tarpon Springs',
  },
  {
    patterns: ['treasure island'],
    jurisdiction: 'TREASURE_ISLAND',
    label: 'Treasure Island',
  },
  {
    patterns: ['madeira beach', 'madeira bch'],
    jurisdiction: 'MADEIRA_BEACH',
    label: 'Madeira Beach',
  },
  {
    patterns: ['indian shores'],
    jurisdiction: 'INDIAN_SHORES',
    label: 'Indian Shores',
  },
  {
    patterns: ['south pasadena', 's. pasadena'],
    jurisdiction: 'SOUTH_PASADENA',
    label: 'South Pasadena',
  },
  {
    patterns: ['palm harbor'],
    jurisdiction: 'PALM_HARBOR',
    label: 'Palm Harbor',
  },
  {
    patterns: ['pinellas park'],
    jurisdiction: 'PINELLAS_PARK',
    label: 'Pinellas Park',
  },
  {
    patterns: ['clearwater'],
    jurisdiction: 'CLEARWATER',
    label: 'Clearwater',
  },
  {
    patterns: ['gulfport'],
    jurisdiction: 'GULFPORT',
    label: 'Gulfport',
  },
  {
    patterns: ['dunedin'],
    jurisdiction: 'DUNEDIN',
    label: 'Dunedin',
  },
  {
    patterns: ['seminole'],
    jurisdiction: 'SEMINOLE',
    label: 'Seminole',
  },
  {
    patterns: ['belleair'],
    jurisdiction: 'BELLEAIR',
    label: 'Belleair',
  },
  {
    patterns: ['largo'],
    jurisdiction: 'LARGO',
    label: 'Largo',
  },
  {
    patterns: ['st. petersburg', 'saint petersburg', 'st petersburg', 'st. pete', 'st pete', 'stpete'],
    jurisdiction: 'ST_PETERSBURG',
    label: 'St. Petersburg',
  },
];

/**
 * Attempt to detect the Pinellas County jurisdiction from a free-text address.
 * Returns null if the address is too short or no match is found.
 */
export function detectJurisdiction(address: string): DetectedJurisdiction | null {
  if (!address || address.trim().length < 5) return null;

  const normalized = address.toLowerCase();

  // 1. Try city-name patterns first (high confidence)
  for (const entry of CITY_PATTERNS) {
    for (const pattern of entry.patterns) {
      if (normalized.includes(pattern)) {
        return { jurisdiction: entry.jurisdiction, label: entry.label, confidence: 'high' };
      }
    }
  }

  // 2. Fall back to ZIP code lookup (low confidence — ZIP boundaries overlap)
  const zipMatch = normalized.match(/\b(\d{5})\b/);
  if (zipMatch) {
    const zip = zipMatch[1];
    const jur = ZIP_MAP[zip];
    if (jur) {
      const entry = CITY_PATTERNS.find(e => e.jurisdiction === jur);
      return {
        jurisdiction: jur,
        label: entry?.label ?? jur.replace(/_/g, ' '),
        confidence: 'low',
      };
    }
  }

  return null;
}

/**
 * Detect jurisdiction from an address that may be in Pinellas OR Hillsborough county.
 * Returns the best match along with which county it belongs to.
 */
export function detectJurisdictionMultiCounty(address: string): DetectedJurisdiction | null {
  if (!address || address.trim().length < 5) return null;
  const normalized = address.toLowerCase();

  // 1. Hillsborough city patterns (checked first since Tampa is a big city)
  for (const entry of HILLSBOROUGH_CITY_PATTERNS) {
    for (const pattern of entry.patterns) {
      if (normalized.includes(pattern)) {
        return { jurisdiction: entry.jurisdiction, label: entry.label, confidence: 'high' };
      }
    }
  }

  // 2. Pinellas city patterns
  for (const entry of CITY_PATTERNS) {
    for (const pattern of entry.patterns) {
      if (normalized.includes(pattern)) {
        return { jurisdiction: entry.jurisdiction, label: entry.label, confidence: 'high' };
      }
    }
  }

  // 3. ZIP fallback — Hillsborough first, then Pinellas
  const zipMatch = normalized.match(/\b(\d{5})\b/);
  if (zipMatch) {
    const zip = zipMatch[1];
    const hillJur = HILLSBOROUGH_ZIP_MAP[zip];
    if (hillJur) {
      const entry = HILLSBOROUGH_CITY_PATTERNS.find(e => e.jurisdiction === hillJur);
      return { jurisdiction: hillJur, label: entry?.label ?? hillJur.replace(/_/g, ' '), confidence: 'low' };
    }
    const pinJur = ZIP_MAP[zip];
    if (pinJur) {
      const entry = CITY_PATTERNS.find(e => e.jurisdiction === pinJur);
      return { jurisdiction: pinJur, label: entry?.label ?? pinJur.replace(/_/g, ' '), confidence: 'low' };
    }
  }

  return null;
}

/** Quick helper: which county does this address appear to be in? */
export function detectCounty(address: string): 'PINELLAS' | 'HILLSBOROUGH' | null {
  const result = detectJurisdictionMultiCounty(address);
  if (!result) return null;
  const hillJurs: Jurisdiction[] = [
    'HILLSBOROUGH_COUNTY', 'TAMPA', 'TEMPLE_TERRACE', 'PLANT_CITY',
    'BRANDON', 'RIVERVIEW', 'VALRICO', 'BRANDON_UNINCORP',
  ];
  return hillJurs.includes(result.jurisdiction) ? 'HILLSBOROUGH' : 'PINELLAS';
}
