// Job Types - Expanded based on contractor feedback
export type JobType = 
  // HVAC & Mechanical
  | "AC_HVAC_CHANGEOUT"
  | "WATER_HEATER"
  
  // Roofing (TOP PRIORITY per contractor feedback)
  | "RE_ROOFING"
  | "ROOF_REPAIR"
  
  // Electrical
  | "ELECTRICAL_PANEL"
  | "ELECTRICAL_REWIRING"
  | "EV_CHARGER"
  | "GENERATOR_INSTALL"
  
  // Plumbing
  | "PLUMBING_MAIN_LINE"
  
  // Interior Remodeling
  | "SMALL_BATH_REMODEL"
  | "KITCHEN_REMODEL"
  
  // Exterior
  | "WINDOW_DOOR_REPLACEMENT"
  | "SIDING_EXTERIOR"
  | "DECK_INSTALLATION"
  | "FENCE_INSTALLATION"
  | "POOL_BARRIER"
  
  // Structural
  | "ROOM_ADDITION"
  | "FOUNDATION_REPAIR";

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
  userId?: string;
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
  storagePath?: string;
  extractedData?: Record<string, unknown>;
  uploadedAt: Date;
  status: "UPLOADING" | "PROCESSING" | "COMPLETE" | "ERROR";
  userId?: string;
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
