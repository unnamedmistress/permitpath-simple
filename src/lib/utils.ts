import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { JobType } from "@/types/permit";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatJobTypeLabel(jobType: JobType): string {
  const labels: Record<JobType, string> = {
    AC_HVAC_CHANGEOUT: "AC/HVAC Changeout",
    WATER_HEATER: "Water Heater",
    RE_ROOFING: "Re-Roofing",
    ROOF_REPAIR: "Roof Repair",
    ELECTRICAL_PANEL: "Electrical Panel",
    ELECTRICAL_REWIRING: "Electrical Rewiring",
    EV_CHARGER: "EV Charger",
    GENERATOR_INSTALL: "Generator Install",
    PLUMBING_MAIN_LINE: "Plumbing Main Line",
    SMALL_BATH_REMODEL: "Bath Remodel",
    KITCHEN_REMODEL: "Kitchen Remodel",
    WINDOW_DOOR_REPLACEMENT: "Window/Door Replacement",
    SIDING_EXTERIOR: "Siding/Exterior",
    DECK_INSTALLATION: "Deck Installation",
    FENCE_INSTALLATION: "Fence Installation",
    POOL_BARRIER: "Pool Barrier",
    ROOM_ADDITION: "Room Addition",
    FOUNDATION_REPAIR: "Foundation Repair",
  };
  return labels[jobType] || jobType.replace(/_/g, " ");
}

// Grid IDs (SimplifiedJobTypeGrid) → human-readable display names
const GRID_ID_LABELS: Record<string, string> = {
  ROOF_REPLACEMENT: "Re-Roofing",
  BATHROOM_REMODEL: "Bath Remodel",
  AC_HVAC:          "AC/HVAC",
  WINDOW_DOOR:      "Window / Door",
  DECK_PATIO:       "Deck / Patio",
  FENCE:            "Fence",
  WATER_HEATER:     "Water Heater",
  INTERIOR_PAINT:   "Interior Paint",
};

/** Formats ANY job-type string — canonical or simplified-grid ID — to a readable label. */
export function formatAnyJobType(jobType: string): string {
  if (!jobType) return "";
  if (GRID_ID_LABELS[jobType]) return GRID_ID_LABELS[jobType];
  // Try canonical labels (cast required because JobType union doesn't include grid IDs)
  const canonical = formatJobTypeLabel(jobType as JobType);
  if (canonical !== jobType.replace(/_/g, " ")) return canonical; // label map hit
  // Fallback: title-case the raw string
  return jobType.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}
