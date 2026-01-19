import { useState, useCallback } from "react";
import { ChecklistItem, ChecklistItemStatus, JobType, Jurisdiction } from "@/types";

// Checklist templates per job type and jurisdiction (Pinellas-focused)
const CHECKLIST_TEMPLATES: Record<JobType, Record<Jurisdiction, Omit<ChecklistItem, "id" | "jobId">[]>> = {
  AC_HVAC_CHANGEOUT: {
    PINELLAS: [
      { title: "Equipment Specifications", description: "Document system type, tonnage, and SEER2 rating", order: 1, status: "PENDING", isConfirmed: false },
      { title: "Location & Ductwork", description: "Verify installation location and ductwork condition", order: 2, status: "PENDING", isConfirmed: false },
      { title: "Electrical Requirements", description: "Confirm electrical service and disconnect specs", order: 3, status: "PENDING", isConfirmed: false },
      { title: "Permit Documents", description: "Complete express permit application", order: 4, status: "PENDING", isConfirmed: false },
    ]
  },
  WATER_HEATER: {
    PINELLAS: [
      { title: "Unit Specifications", description: "Record water heater type, capacity, and fuel source", order: 1, status: "PENDING", isConfirmed: false },
      { title: "Installation Location", description: "Document location and drain pan requirements", order: 2, status: "PENDING", isConfirmed: false },
      { title: "Venting (Gas Units)", description: "Verify venting configuration for gas water heaters", order: 3, status: "PENDING", isConfirmed: false },
      { title: "Permit Documents", description: "Complete express permit application", order: 4, status: "PENDING", isConfirmed: false },
    ]
  },
  RE_ROOFING: {
    PINELLAS: [
      { title: "Roof Type & Material", description: "Select roofing material and document existing conditions", order: 1, status: "PENDING", isConfirmed: false },
      { title: "Deck Fastening", description: "Document deck type and fastening method for mitigation affidavit", order: 2, status: "PENDING", isConfirmed: false },
      { title: "Secondary Water Barrier", description: "Specify underlayment and water barrier installation", order: 3, status: "PENDING", isConfirmed: false },
      { title: "Inspections Required", description: "Understand dry-in and final inspection requirements", order: 4, status: "PENDING", isConfirmed: false },
    ]
  },
  ELECTRICAL_PANEL: {
    PINELLAS: [
      { title: "Panel Specifications", description: "Confirm main panel amperage, manufacturer, and number of circuits", order: 1, status: "PENDING", isConfirmed: false },
      { title: "Service Entrance", description: "Document service entrance cable size and type", order: 2, status: "PENDING", isConfirmed: false },
      { title: "Grounding System", description: "Verify grounding electrode conductor size and connections", order: 3, status: "PENDING", isConfirmed: false },
      { title: "Load Calculation", description: "Provide NEC Article 220 load calculation worksheet", order: 4, status: "PENDING", isConfirmed: false },
      { title: "Permit Documents", description: "Complete electrical permit application form", order: 5, status: "PENDING", isConfirmed: false },
    ]
  },
  WINDOW_DOOR_REPLACEMENT: {
    PINELLAS: [
      { title: "Product Selection", description: "Verify Florida Product Approval numbers for windows/doors", order: 1, status: "PENDING", isConfirmed: false },
      { title: "Opening Layout", description: "Document size and location of each opening", order: 2, status: "PENDING", isConfirmed: false },
      { title: "Impact Rating", description: "Confirm impact rating requirements for wind zone", order: 3, status: "PENDING", isConfirmed: false },
      { title: "Permit Documents", description: "Complete window/door replacement form", order: 4, status: "PENDING", isConfirmed: false },
    ]
  },
  POOL_BARRIER: {
    PINELLAS: [
      { title: "Barrier Type", description: "Select fence, screen enclosure, or other barrier type", order: 1, status: "PENDING", isConfirmed: false },
      { title: "Gate & Latch", description: "Verify self-closing, self-latching gate requirements", order: 2, status: "PENDING", isConfirmed: false },
      { title: "Height & Spacing", description: "Confirm barrier height and picket spacing meet code", order: 3, status: "PENDING", isConfirmed: false },
      { title: "Permit Documents", description: "Complete pool barrier permit application", order: 4, status: "PENDING", isConfirmed: false },
    ]
  },
  GENERATOR_INSTALL: {
    PINELLAS: [
      { title: "Generator Specifications", description: "Document generator size, fuel type, and transfer switch", order: 1, status: "PENDING", isConfirmed: false },
      { title: "Electrical Load Calc", description: "Prepare load calculation for circuits served", order: 2, status: "PENDING", isConfirmed: false },
      { title: "Fuel Connection", description: "Document gas line size and connection requirements", order: 3, status: "PENDING", isConfirmed: false },
      { title: "Setback & Location", description: "Verify setback distances from openings and property lines", order: 4, status: "PENDING", isConfirmed: false },
      { title: "Permit Documents", description: "Complete generator permit application", order: 5, status: "PENDING", isConfirmed: false },
    ]
  },
  EV_CHARGER: {
    PINELLAS: [
      { title: "Charger Level", description: "Determine Level 1 or Level 2 installation", order: 1, status: "PENDING", isConfirmed: false },
      { title: "Electrical Circuit", description: "Document circuit size and panel capacity", order: 2, status: "PENDING", isConfirmed: false },
      { title: "Location", description: "Verify charger mounting location and accessibility", order: 3, status: "PENDING", isConfirmed: false },
      { title: "Permit Documents", description: "Complete express electrical permit", order: 4, status: "PENDING", isConfirmed: false },
    ]
  },
  SMALL_BATH_REMODEL: {
    PINELLAS: [
      { title: "Scope Assessment", description: "Determine if permit is required based on work scope", order: 1, status: "PENDING", isConfirmed: false },
      { title: "Plumbing Work", description: "Document fixture changes and drain/supply modifications", order: 2, status: "PENDING", isConfirmed: false },
      { title: "Electrical Work", description: "Verify GFCI protection and exhaust fan requirements", order: 3, status: "PENDING", isConfirmed: false },
      { title: "Drywall Repairs", description: "Assess drywall repair scope and inspection needs", order: 4, status: "PENDING", isConfirmed: false },
      { title: "Ventilation", description: "Confirm exhaust fan CFM and ducting to exterior", order: 5, status: "PENDING", isConfirmed: false },
      { title: "NOC Requirements", description: "Determine if Notice of Commencement is needed", order: 6, status: "PENDING", isConfirmed: false },
    ]
  }
};

// In-memory storage
let memoryChecklists: Record<string, ChecklistItem[]> = {};

export function useChecklist(jobId: string) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const initializeChecklist = useCallback(
    async (jobType: JobType, jurisdiction: Jurisdiction): Promise<ChecklistItem[]> => {
      const template = CHECKLIST_TEMPLATES[jobType]?.[jurisdiction] || [];
      const newItems: ChecklistItem[] = template.map((item, index) => ({
        ...item,
        id: `${jobId}-${index}`,
        jobId,
        status: index === 0 ? "ACTIVE" : "PENDING",
      }));

      memoryChecklists[jobId] = newItems;
      setItems(newItems);
      return newItems;
    },
    [jobId]
  );

  const fetchChecklist = useCallback(async (): Promise<ChecklistItem[]> => {
    setIsLoading(true);
    try {
      const existing = memoryChecklists[jobId] || [];
      setItems(existing);
      return existing;
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  const updateItem = useCallback(
    async (itemId: string, updates: Partial<ChecklistItem>): Promise<void> => {
      const updatedItems = (memoryChecklists[jobId] || []).map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      );
      memoryChecklists[jobId] = updatedItems;
      setItems(updatedItems);

      // If completing an item, activate the next pending one
      if (updates.status === "COMPLETE") {
        const nextPending = updatedItems.find((i) => i.status === "PENDING");
        if (nextPending) {
          await updateItem(nextPending.id, { status: "ACTIVE" });
        }
      }
    },
    [jobId]
  );

  const confirmItem = useCallback(
    async (itemId: string, value?: string): Promise<void> => {
      await updateItem(itemId, {
        status: "COMPLETE",
        isConfirmed: true,
        value,
      });
    },
    [updateItem]
  );

  const getProgress = useCallback((): number => {
    if (items.length === 0) return 0;
    const completed = items.filter((i) => i.status === "COMPLETE").length;
    return Math.round((completed / items.length) * 100);
  }, [items]);

  return {
    items,
    isLoading,
    initializeChecklist,
    fetchChecklist,
    updateItem,
    confirmItem,
    getProgress,
  };
}
