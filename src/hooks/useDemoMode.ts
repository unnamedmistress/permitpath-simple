import { useState, useCallback } from "react";
import { useAppContext } from "@/context/AppContext";
import { Job, JobType, Jurisdiction, ChecklistItem, Photo, Message } from "@/types";

// Sample job data for demo mode
const SAMPLE_JOB: Job = {
  id: "demo-job-1",
  sessionId: "demo-session",
  jobType: "ELECTRICAL_PANEL",
  jurisdiction: "PINELLAS",
  status: "IN_PROGRESS",
  createdAt: new Date(),
  updatedAt: new Date(),
  extractedData: {
    panelAmperage: "200A",
    manufacturer: "Square D",
    circuits: 40,
  },
  answers: {},
  title: "Panel Upgrade - 123 Main St",
  address: "123 Main Street, Clearwater, FL 33756",
};

const SAMPLE_CHECKLIST: ChecklistItem[] = [
  {
    id: "1",
    jobId: "demo-job-1",
    title: "Panel Specifications",
    description: "Confirm the main panel amperage and manufacturer",
    status: "COMPLETE",
    order: 1,
    value: "200A Square D panel with 40 circuits",
    isConfirmed: true,
  },
  {
    id: "2",
    jobId: "demo-job-1",
    title: "Service Entrance",
    description: "Document the service entrance cable size and type",
    status: "ACTIVE",
    order: 2,
    isConfirmed: false,
  },
  {
    id: "3",
    jobId: "demo-job-1",
    title: "Grounding System",
    description: "Verify grounding electrode conductor and connections",
    status: "PENDING",
    order: 3,
    isConfirmed: false,
  },
  {
    id: "4",
    jobId: "demo-job-1",
    title: "Load Calculation",
    description: "Provide load calculation worksheet",
    status: "PENDING",
    order: 4,
    isConfirmed: false,
  },
];

const SAMPLE_PHOTOS: Photo[] = [
  {
    id: "p1",
    jobId: "demo-job-1",
    url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400",
    uploadedAt: new Date(),
    status: "COMPLETE",
    extractedData: { type: "electrical panel", amperage: "200A" },
  },
];

const SAMPLE_MESSAGES: Message[] = [
  {
    id: "m1",
    jobId: "demo-job-1",
    role: "assistant",
    content: "Welcome! I can see you're working on an electrical panel upgrade in Pinellas County. I'll help you gather all the required documentation. Let's start by confirming the panel specifications.",
    timestamp: new Date(),
  },
];

export function useDemoMode() {
  const { state, dispatch } = useAppContext();
  const [demoData, setDemoData] = useState<{
    job: Job | null;
    checklist: ChecklistItem[];
    photos: Photo[];
    messages: Message[];
  }>({
    job: null,
    checklist: [],
    photos: [],
    messages: [],
  });

  const loadSampleData = useCallback(() => {
    dispatch({ type: "SET_DEMO_MODE", payload: true });
    setDemoData({
      job: SAMPLE_JOB,
      checklist: SAMPLE_CHECKLIST,
      photos: SAMPLE_PHOTOS,
      messages: SAMPLE_MESSAGES,
    });
    return SAMPLE_JOB;
  }, [dispatch]);

  const clearDemoData = useCallback(() => {
    dispatch({ type: "SET_DEMO_MODE", payload: false });
    setDemoData({
      job: null,
      checklist: [],
      photos: [],
      messages: [],
    });
  }, [dispatch]);

  const addDemoMessage = useCallback((content: string, role: "user" | "assistant") => {
    const newMessage: Message = {
      id: `m-${Date.now()}`,
      jobId: demoData.job?.id || "demo",
      role,
      content,
      timestamp: new Date(),
    };
    setDemoData((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));
    return newMessage;
  }, [demoData.job]);

  const addDemoPhoto = useCallback((url: string) => {
    const newPhoto: Photo = {
      id: `p-${Date.now()}`,
      jobId: demoData.job?.id || "demo",
      url,
      uploadedAt: new Date(),
      status: "COMPLETE",
    };
    setDemoData((prev) => ({
      ...prev,
      photos: [...prev.photos, newPhoto],
    }));
    return newPhoto;
  }, [demoData.job]);

  const updateChecklistItem = useCallback((itemId: string, updates: Partial<ChecklistItem>) => {
    setDemoData((prev) => ({
      ...prev,
      checklist: prev.checklist.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
    }));
  }, []);

  return {
    isDemoMode: state.demoMode,
    demoData,
    loadSampleData,
    clearDemoData,
    addDemoMessage,
    addDemoPhoto,
    updateChecklistItem,
  };
}
