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
