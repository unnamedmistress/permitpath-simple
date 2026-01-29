// Job Types - Top 9 Pinellas County Permits
export type JobType = 
  | "AC_HVAC_CHANGEOUT"
  | "WATER_HEATER"
  | "RE_ROOFING"
  | "ELECTRICAL_PANEL"
  | "WINDOW_DOOR_REPLACEMENT"
  | "POOL_BARRIER"
  | "GENERATOR_INSTALL"
  | "EV_CHARGER"
  | "SMALL_BATH_REMODEL";

export type Jurisdiction = "PINELLAS";
export type JobStatus = "IN_PROGRESS" | "READY_FOR_PREVIEW";

// Legal Source Types
export interface LegalSource {
  label: string;
  url: string;
  description: string;
  lastUpdated?: string;
}

// Flowchart Types
export type FlowchartNodeType = "start" | "decision" | "action" | "inspection" | "end";
export type FlowchartNodeStatus = "pending" | "current" | "complete" | "skipped";

export interface FlowchartNode {
  id: string;
  label: string;
  type: FlowchartNodeType;
  status: FlowchartNodeStatus;
  legalSource?: LegalSource;
  nextNodes?: { [condition: string]: string } | string;
  pinellasSpecific?: boolean;
}

// Detailed Scope Types for Permit Reasoning
export interface DetailedScope {
  // Plumbing
  movingPlumbingFixtures?: boolean;
  plumbingDetails?: string;
  addingWaterLines?: boolean;
  changingDrainage?: boolean;
  
  // Electrical
  addingCircuits?: boolean;
  electricalDetails?: string;
  relocatingOutlets?: boolean;
  
  // Structural
  removingWalls?: boolean;
  structuralDetails?: string;
  changingLayout?: boolean;
  
  // Cosmetic flags
  cosmeticOnly?: boolean;
  
  // Value estimation
  estimatedValue?: number;
}

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
  detailedScope?: DetailedScope; // New field for intelligent permit determination
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

// Quick Reply Types
export interface QuickReply {
  label: string;
  value: string;
}

// Conversation Flow Types
export interface QuestionStep {
  id: string;
  intro?: string;
  question: string;
  options: QuickReply[];
  field: string;
  followUp?: {
    [value: string]: string;
  };
  legalSource?: LegalSource;
}

export interface ChecklistQuestions {
  [itemTitle: string]: QuestionStep[];
}
