// PermitPath Types - Redesigned

export interface Contractor {
  id: string;
  email: string;
  businessName: string;
  licenseNumber?: string;
  phone?: string;
  createdAt: Date;
}

// Contractor Information
export interface ContractorInfo {
  contractorName?: string;
  licenseNumber?: string;
  yearsExperience?: '0-2' | '3-5' | '5-10' | '10+';
  hasInsurance?: boolean;
}

// Worker Type
export type WorkerType = 'homeowner-diy' | 'homeowner-hiring' | 'contractor';

// Budget & Timeline
export interface BudgetTimeline {
  estimatedCost?: '<$1k' | '$1k-$5k' | '$5k-$10k' | '$10k-$25k' | '$25k+';
  desiredStartDate?: string; // ISO date string
  projectDuration?: '<1 week' | '1-2 weeks' | '2-4 weeks' | '1-2 months' | '2+ months';
}

// Building Details
export interface BuildingDetails {
  propertyType?: 'Single-Family' | 'Condo' | 'Townhouse' | 'Commercial';
  numberOfStories?: '1' | '2' | '3+';
  yearBuilt?: number;
  previousWorkOnThis?: boolean;
}

// Permit History
export interface PermitHistory {
  openPermits?: 'yes' | 'no' | 'unsure';
  knownCodeViolations?: 'yes' | 'no' | 'unsure';
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
  // Phase 2: New fields
  workerType?: WorkerType;
  contractorInfo?: ContractorInfo;
  budgetTimeline?: BudgetTimeline;
  buildingDetails?: BuildingDetails;
  permitHistory?: PermitHistory;
  // Checklist fields
  estimatedCost?: string;
  estimatedTimeline?: string;
  permitNotRequired?: boolean;
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
  // Pinellas County
  | 'PINELLAS_COUNTY'
  | 'ST_PETERSBURG'
  | 'CLEARWATER'
  | 'LARGO'
  | 'DUNEDIN'
  | 'TARPON_SPRINGS'
  | 'SEMINOLE'
  | 'PINELLAS_PARK'
  | 'GULFPORT'
  | 'ST_PETE_BEACH'
  | 'TREASURE_ISLAND'
  | 'MADEIRA_BEACH'
  | 'INDIAN_SHORES'
  | 'SOUTH_PASADENA'
  | 'BELLEAIR'
  | 'PALM_HARBOR'
  // Hillsborough County (Week 8)
  | 'HILLSBOROUGH_COUNTY'
  | 'TAMPA'
  | 'TEMPLE_TERRACE'
  | 'PLANT_CITY'
  | 'BRANDON'
  | 'RIVERVIEW'
  | 'VALRICO'
  | 'BRANDON_UNINCORP';

export type County = 'PINELLAS' | 'HILLSBOROUGH';

/** Map any Jurisdiction to its parent County */
export const JURISDICTION_COUNTY: Record<Jurisdiction, County> = {
  PINELLAS_COUNTY: 'PINELLAS',
  ST_PETERSBURG: 'PINELLAS',
  CLEARWATER: 'PINELLAS',
  LARGO: 'PINELLAS',
  DUNEDIN: 'PINELLAS',
  TARPON_SPRINGS: 'PINELLAS',
  SEMINOLE: 'PINELLAS',
  PINELLAS_PARK: 'PINELLAS',
  GULFPORT: 'PINELLAS',
  ST_PETE_BEACH: 'PINELLAS',
  TREASURE_ISLAND: 'PINELLAS',
  MADEIRA_BEACH: 'PINELLAS',
  INDIAN_SHORES: 'PINELLAS',
  SOUTH_PASADENA: 'PINELLAS',
  BELLEAIR: 'PINELLAS',
  PALM_HARBOR: 'PINELLAS',
  HILLSBOROUGH_COUNTY: 'HILLSBOROUGH',
  TAMPA: 'HILLSBOROUGH',
  TEMPLE_TERRACE: 'HILLSBOROUGH',
  PLANT_CITY: 'HILLSBOROUGH',
  BRANDON: 'HILLSBOROUGH',
  RIVERVIEW: 'HILLSBOROUGH',
  VALRICO: 'HILLSBOROUGH',
  BRANDON_UNINCORP: 'HILLSBOROUGH',
};

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
  actionType?: string;
  sourceUrl?: string;
  minimumCriteria?: string;
  whoCanHelp?: string;
  plainLanguageWhy?: string;
  acceptedFormats?: string[];
  allowsMultipleUploads?: boolean;
  goodUploadExample?: string;
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
  // Job-specific answers from the wizard
  buildingType?: string;
  isAlteringShape?: boolean;
  isTankless?: boolean;
  isGas?: boolean;
  deckHeight?: string;
  isAttached?: boolean;
  fenceHeight?: string;
  fenceMaterial?: string;
  panelAmps?: string;
  hvacTonnage?: string;
}

export interface JobAnalysisResponse {
  requirements: Requirement[];
  estimatedTimeline: string;
  estimatedCost: string;
  confidenceScore: number;
  fallback?: boolean;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}
