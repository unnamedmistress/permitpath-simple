// PermitPath Types - Redesigned

export interface Contractor {
  id: string;
  email: string;
  businessName: string;
  licenseNumber?: string;
  phone?: string;
  createdAt: Date;
}

export interface Job {
  id: string;
  contractorId: string;
  jobType: JobType;
  jurisdiction: Jurisdiction;
  address: string;
  description?: string;
  status: JobStatus;
  requirements: Requirement[];
  documents: Document[];
  inspections: Inspection[];
  createdAt: Date;
  updatedAt: Date;
}

export type JobStatus = 
  | 'draft'
  | 'requirements_pending'
  | 'documents_pending'
  | 'ready_to_submit'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'closed';

export type JobType = 
  | 'RE_ROOFING'
  | 'ROOF_REPAIR'
  | 'AC_HVAC_CHANGEOUT'
  | 'WATER_HEATER'
  | 'ELECTRICAL_PANEL'
  | 'ELECTRICAL_REWIRING'
  | 'EV_CHARGER'
  | 'GENERATOR_INSTALL'
  | 'PLUMBING_MAIN_LINE'
  | 'SMALL_BATH_REMODEL'
  | 'KITCHEN_REMODEL'
  | 'WINDOW_DOOR_REPLACEMENT'
  | 'SIDING_EXTERIOR'
  | 'DECK_INSTALLATION'
  | 'FENCE_INSTALLATION'
  | 'POOL_BARRIER'
  | 'ROOM_ADDITION'
  | 'FOUNDATION_REPAIR';

export type Jurisdiction = 
  | 'PINELLAS_COUNTY'
  | 'ST_PETERSBURG'
  | 'CLEARWATER'
  | 'LARGO'
  | 'PALM_HARBOR';

export interface Requirement {
  id: string;
  jobId: string;
  category: RequirementCategory;
  title: string;
  description: string;
  isRequired: boolean;
  confidence: number; // AI confidence score
  status: RequirementStatus;
  notes?: string;
}

export type RequirementCategory =
  | 'document'
  | 'drawing'
  | 'inspection'
  | 'fee'
  | 'license'
  | 'insurance';

export type RequirementStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'not_applicable';

export interface Document {
  id: string;
  jobId: string;
  requirementId?: string;
  name: string;
  fileUrl: string;
  fileType: string;
  status: DocumentStatus;
  validationResult?: ValidationResult;
  uploadedAt: Date;
}

export type DocumentStatus =
  | 'uploaded'
  | 'validating'
  | 'valid'
  | 'invalid'
  | 'expired';

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  extractedData?: Record<string, string>;
}

export interface ValidationIssue {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface Inspection {
  id: string;
  jobId: string;
  type: string;
  scheduledDate?: Date;
  completedDate?: Date;
  status: InspectionStatus;
  result?: 'pass' | 'fail' | 'partial';
  notes?: string;
}

export type InspectionStatus =
  | 'pending'
  | 'scheduled'
  | 'completed'
  | 're_inspection_needed';

// AI Types
export interface JobAnalysisRequest {
  jobType: JobType;
  jurisdiction: Jurisdiction;
  address: string;
  description: string;
  squareFootage?: number;
  yearBuilt?: number;
}

export interface JobAnalysisResponse {
  requirements: Requirement[];
  estimatedTimeline: string;
  estimatedCost: string;
  confidenceScore: number;
}
