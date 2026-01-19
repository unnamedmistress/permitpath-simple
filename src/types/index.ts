// Job Types
export type JobType = "ELECTRICAL_PANEL" | "WATER_HEATER" | "BATH_REMODEL";
export type Jurisdiction = "PINELLAS" | "TAMPA";
export type JobStatus = "IN_PROGRESS" | "READY_FOR_PREVIEW";

export interface Job {
  id: string;
  sessionId: string;
  jobType: JobType;
  jurisdiction: Jurisdiction;
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
  extractedData: Record<string, unknown>;
  answers: Record<string, unknown>;
  title?: string;
  address?: string;
}

// Photo Types
export interface Photo {
  id: string;
  jobId: string;
  url: string;
  thumbnailUrl?: string;
  extractedData?: Record<string, unknown>;
  uploadedAt: Date;
  status: "UPLOADING" | "PROCESSING" | "COMPLETE" | "ERROR";
}

// Checklist Types
export type ChecklistItemStatus = "PENDING" | "ACTIVE" | "COMPLETE";

export interface ChecklistItem {
  id: string;
  jobId: string;
  title: string;
  description: string;
  status: ChecklistItemStatus;
  order: number;
  value?: string;
  isConfirmed: boolean;
}

// Message Types
export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  jobId: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

// App Context Types
export interface AppState {
  currentJobId: string | null;
  sessionId: string;
  demoMode: boolean;
  isLoading: boolean;
}

export type AppAction =
  | { type: "SET_CURRENT_JOB"; payload: string | null }
  | { type: "SET_DEMO_MODE"; payload: boolean }
  | { type: "SET_LOADING"; payload: boolean };

// Form Types
export interface NewJobFormData {
  jobType: JobType;
  jurisdiction: Jurisdiction;
  address?: string;
}

// UI Types
export interface NavItem {
  label: string;
  icon: string;
  path: string;
}
