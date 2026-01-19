import { useState, useCallback } from "react";
import { ChecklistItem, ChecklistItemStatus, JobType, Jurisdiction } from "@/types";

// Checklist templates per job type and jurisdiction
const CHECKLIST_TEMPLATES: Record<JobType, Record<Jurisdiction, Omit<ChecklistItem, "id" | "jobId">[]>> = {
  ELECTRICAL_PANEL: {
    PINELLAS: [
      { title: "Panel Specifications", description: "Confirm main panel amperage, manufacturer, and number of circuits", order: 1, status: "PENDING", isConfirmed: false },
      { title: "Service Entrance", description: "Document service entrance cable size and type (e.g., 2/0 aluminum)", order: 2, status: "PENDING", isConfirmed: false },
      { title: "Grounding System", description: "Verify grounding electrode conductor size and connections", order: 3, status: "PENDING", isConfirmed: false },
      { title: "Load Calculation", description: "Provide NEC Article 220 load calculation worksheet", order: 4, status: "PENDING", isConfirmed: false },
      { title: "Permit Application", description: "Complete electrical permit application form", order: 5, status: "PENDING", isConfirmed: false },
    ],
    TAMPA: [
      { title: "Panel Information", description: "Document panel brand, amperage rating, and circuit count", order: 1, status: "PENDING", isConfirmed: false },
      { title: "Meter Base", description: "Confirm meter base compatibility and FPL requirements", order: 2, status: "PENDING", isConfirmed: false },
      { title: "Main Disconnect", description: "Verify main disconnect location and accessibility", order: 3, status: "PENDING", isConfirmed: false },
      { title: "Bonding", description: "Document bonding of gas, water, and CSST if applicable", order: 4, status: "PENDING", isConfirmed: false },
    ],
  },
  WATER_HEATER: {
    PINELLAS: [
      { title: "Unit Specifications", description: "Record water heater capacity, type, and energy source", order: 1, status: "PENDING", isConfirmed: false },
      { title: "T&P Valve", description: "Confirm temperature and pressure relief valve installation", order: 2, status: "PENDING", isConfirmed: false },
      { title: "Drain Pan", description: "Verify drain pan installation if located in attic or living space", order: 3, status: "PENDING", isConfirmed: false },
      { title: "Venting", description: "Document venting configuration for gas units", order: 4, status: "PENDING", isConfirmed: false },
    ],
    TAMPA: [
      { title: "Equipment Info", description: "Record make, model, and gallon capacity", order: 1, status: "PENDING", isConfirmed: false },
      { title: "Safety Devices", description: "Confirm T&P valve and expansion tank if required", order: 2, status: "PENDING", isConfirmed: false },
      { title: "Location", description: "Document installation location and clearances", order: 3, status: "PENDING", isConfirmed: false },
    ],
  },
  BATH_REMODEL: {
    PINELLAS: [
      { title: "Scope of Work", description: "Define all changes: fixtures, electrical, plumbing, structural", order: 1, status: "PENDING", isConfirmed: false },
      { title: "Plumbing Changes", description: "Document any fixture relocations or additions", order: 2, status: "PENDING", isConfirmed: false },
      { title: "Electrical", description: "Confirm GFCI protection and ventilation fan specs", order: 3, status: "PENDING", isConfirmed: false },
      { title: "Ventilation", description: "Document exhaust fan CFM rating and ducting", order: 4, status: "PENDING", isConfirmed: false },
      { title: "Floor Plan", description: "Provide dimensioned floor plan showing layout", order: 5, status: "PENDING", isConfirmed: false },
    ],
    TAMPA: [
      { title: "Project Scope", description: "List all work items and materials", order: 1, status: "PENDING", isConfirmed: false },
      { title: "Fixtures", description: "Document all fixture types and locations", order: 2, status: "PENDING", isConfirmed: false },
      { title: "Electrical Requirements", description: "Confirm circuits for outlets, lighting, and fan", order: 3, status: "PENDING", isConfirmed: false },
    ],
  },
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
