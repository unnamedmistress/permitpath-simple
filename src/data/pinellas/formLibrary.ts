// Pinellas County Form Library
// Direct links to official permit forms and applications

export interface PermitForm {
  id: string;
  formName: string;
  description: string;
  jurisdiction: string;
  jobTypes: string[];
  category: 'application' | 'checklist' | 'affidavit' | 'subcontractor' | 'supplemental';
  
  // URLs
  officialUrl: string;
  downloadUrl: string;
  
  // Metadata
  fileFormat: 'PDF' | 'DOCX' | 'online';
  pages?: number;
  lastVerified: string; // ISO date
  
  // Usage info
  requiredFor: string[]; // requirement IDs this form satisfies
  filledBy: 'contractor' | 'owner' | 'architect' | 'engineer' | 'city';
  notarizationRequired: boolean;
  
  // Pre-fillable fields (for PDF processing)
  prefillableFields?: string[];
  
  // Help text
  instructions: string[];
  commonMistakes: string[];
}

export const PINELLAS_FORMS: PermitForm[] = [
  {
    id: 'BDRS-001',
    formName: 'Building Permit Application',
    description: 'Primary permit application for all building work in unincorporated Pinellas County',
    jurisdiction: 'PINELLAS_COUNTY',
    jobTypes: ['RE_ROOFING', 'AC_HVAC_CHANGEOUT', 'WATER_HEATER', 'ELECTRICAL_PANEL', 'KITCHEN_REMODEL', 'SMALL_BATH_REMODEL', 'WINDOW_DOOR_REPLACEMENT', 'ROOM_ADDITION'],
    category: 'application',
    officialUrl: 'https://aca-prod.accela.com/pinellas/Default.aspx',
    downloadUrl: 'https://pinellas.gov/wp-content/uploads/2024/10/sample-permit-application-packet.pdf',
    fileFormat: 'online',
    lastVerified: '2025-03-01',
    requiredFor: ['perm_application'],
    filledBy: 'contractor',
    notarizationRequired: false,
    prefillableFields: ['contractor_name', 'license_number', 'address', 'job_description', 'owner_name', 'owner_address'],
    instructions: [
      'Fill out Sections 1-4 completely',
      'Provide detailed job description',
      'List all subcontractors if applicable',
      'Sign and date on page 4',
    ],
    commonMistakes: [
      'Forgetting to list all subcontractors',
      'Incomplete job description',
      'Wrong license number format',
      'Missing owner signature on page 4',
    ],
  },
  {
    id: 'BDRS-EXP-001',
    formName: 'Express Permit - Water Heater',
    description: 'Online express permit for water heater replacement (same capacity/type)',
    jurisdiction: 'PINELLAS_COUNTY',
    jobTypes: ['WATER_HEATER'],
    category: 'application',
    officialUrl: 'https://aca-prod.accela.com/pinellas/Default.aspx',
    downloadUrl: 'https://aca-prod.accela.com/pinellas/Default.aspx',
    fileFormat: 'online',
    lastVerified: '2025-03-01',
    requiredFor: ['perm_application'],
    filledBy: 'contractor',
    notarizationRequired: false,
    instructions: [
      'Apply online through Access Portal',
      'Upload photo of existing water heater',
      'Provide manufacturer specs for new unit',
      'Pay fee online ($60)',
      'Permit issued same day if qualified',
    ],
    commonMistakes: [
      'Applying for wrong permit type (use Express, not standard)',
      'Not uploading required photos',
      'Changing to different fuel type (requires standard permit)',
    ],
  },
  {
    id: 'BDRS-EXP-002',
    formName: 'Express Permit - Re-Roofing',
    description: 'Online express permit for roof replacement (same materials)',
    jurisdiction: 'PINELLAS_COUNTY',
    jobTypes: ['RE_ROOFING'],
    category: 'application',
    officialUrl: 'https://aca-prod.accela.com/pinellas/Default.aspx',
    downloadUrl: 'https://aca-prod.accela.com/pinellas/Default.aspx',
    fileFormat: 'online',
    lastVerified: '2025-03-01',
    requiredFor: ['perm_application'],
    filledBy: 'contractor',
    notarizationRequired: false,
    instructions: [
      'Apply online through Access Portal',
      'Upload roof photos (existing condition)',
      'Provide roofing material specifications',
      'Confirm no structural changes',
      'Pay fee online ($75)',
    ],
    commonMistakes: [
      'Not including photos of existing roof',
      'Changing roof pitch (requires standard permit)',
      'Changing from shingle to metal (may require additional review)',
    ],
  },
  {
    id: 'BDRS-EXP-003',
    formName: 'Express Permit - Windows/Doors',
    description: 'Online express permit for window/door replacement (same size/location)',
    jurisdiction: 'PINELLAS_COUNTY',
    jobTypes: ['WINDOW_DOOR_REPLACEMENT'],
    category: 'application',
    officialUrl: 'https://aca-prod.accela.com/pinellas/Default.aspx',
    downloadUrl: 'https://aca-prod.accela.com/pinellas/Default.aspx',
    fileFormat: 'online',
    lastVerified: '2025-03-01',
    requiredFor: ['perm_application'],
    filledBy: 'contractor',
    notarizationRequired: false,
    instructions: [
      'Apply online through Access Portal',
      'Upload photos of existing windows/doors',
      'Provide cut sheets for new units',
      'Confirm same size and operation',
      'Pay fee online ($60)',
    ],
    commonMistakes: [
      'Enlarging openings (requires standard permit)',
      'Changing from window to door (requires standard permit)',
      'Not providing impact rating for hurricane zones',
    ],
  },
  {
    id: 'BDRS-EXP-004',
    formName: 'Express Permit - AC Changeout',
    description: 'Online express permit for HVAC changeout (no ductwork changes)',
    jurisdiction: 'PINELLAS_COUNTY',
    jobTypes: ['AC_HVAC_CHANGEOUT'],
    category: 'application',
    officialUrl: 'https://aca-prod.accela.com/pinellas/Default.aspx',
    downloadUrl: 'https://aca-prod.accela.com/pinellas/Default.aspx',
    fileFormat: 'online',
    lastVerified: '2025-03-01',
    requiredFor: ['perm_application'],
    filledBy: 'contractor',
    notarizationRequired: false,
    instructions: [
      'Apply online through Access Portal',
      'Upload photo of existing unit with nameplate',
      'Provide manufacturer specs for new unit',
      'Confirm same location and capacity',
      'Pay fee online ($85)',
    ],
    commonMistakes: [
      'Relocating unit (requires standard permit)',
      'Changing capacity (requires load calculation)',
      'Modifying ductwork (requires standard permit)',
    ],
  },
  {
    id: 'BDRS-CON-001',
    formName: 'Contractor Authorization Form',
    description: 'Required when contractor signs permit on behalf of owner',
    jurisdiction: 'PINELLAS_COUNTY',
    jobTypes: ['ALL'],
    category: 'affidavit',
    officialUrl: 'https://pinellas.gov/wp-content/uploads/2024/10/sample-permit-application-packet.pdf',
    downloadUrl: 'https://pinellas.gov/wp-content/uploads/2024/10/sample-permit-application-packet.pdf',
    fileFormat: 'PDF',
    pages: 1,
    lastVerified: '2025-03-01',
    requiredFor: ['contractor_auth'],
    filledBy: 'owner',
    notarizationRequired: true,
    prefillableFields: ['owner_name', 'owner_address', 'contractor_name', 'property_address'],
    instructions: [
      'Owner must sign in presence of notary',
      'Contractor information must match license records',
      'Valid for one year from notarization date',
      'Attach copy to permit application',
    ],
    commonMistakes: [
      'Not getting notarized (will be rejected)',
      'Contractor name does not match license',
      'Expired form (over 1 year old)',
    ],
  },
  {
    id: 'BDRS-SUB-001',
    formName: 'Subcontractor Sign-On Form',
    description: 'Required for each subcontractor working on the project',
    jurisdiction: 'PINELLAS_COUNTY',
    jobTypes: ['ALL'],
    category: 'subcontractor',
    officialUrl: 'https://pinellas.gov/wp-content/uploads/2024/10/sample-permit-application-packet.pdf',
    downloadUrl: 'https://pinellas.gov/wp-content/uploads/2024/10/sample-permit-application-packet.pdf',
    fileFormat: 'PDF',
    pages: 1,
    lastVerified: '2025-03-01',
    requiredFor: ['subcontractor_docs'],
    filledBy: 'contractor',
    notarizationRequired: false,
    prefillableFields: ['subcontractor_name', 'license_number', 'trade', 'insurance_info'],
    instructions: [
      'One form per subcontractor',
      'Include license number for each trade',
      'Attach certificate of insurance',
      'Must be signed by primary contractor',
    ],
    commonMistakes: [
      'Missing subcontractor license numbers',
      'Expired insurance certificates',
      'Trade not clearly indicated',
    ],
  },
  {
    id: 'BDRS-CKL-001',
    formName: 'Express Permit Checklist',
    description: 'Complete list of express permits and required documentation',
    jurisdiction: 'PINELLAS_COUNTY',
    jobTypes: ['ALL'],
    category: 'checklist',
    officialUrl: 'https://pinellas.gov/express-permits/',
    downloadUrl: 'https://pinellas.gov/express-permits/',
    fileFormat: 'online',
    lastVerified: '2025-03-01',
    requiredFor: [],
    filledBy: 'contractor',
    notarizationRequired: false,
    instructions: [
      'Review to confirm project qualifies for express permit',
      'Gather all required documents before applying',
      'Check for any recent updates to express permit list',
    ],
    commonMistakes: [
      'Assuming project qualifies without checking criteria',
      'Missing required photos or specs',
    ],
  },
];

// Get forms for a specific job type
export function getFormsForJobType(jobType: string): PermitForm[] {
  return PINELLAS_FORMS.filter(form => 
    form.jobTypes.includes(jobType) || form.jobTypes.includes('ALL')
  );
}

// Get primary application form
export function getPrimaryApplicationForm(jobType: string): PermitForm | undefined {
  const forms = getFormsForJobType(jobType);
  return forms.find(form => 
    form.category === 'application' && 
    form.jobTypes.includes(jobType)
  ) || forms.find(form => form.category === 'application');
}

// Check if job type is express eligible
export function isExpressEligible(jobType: string): boolean {
  return PINELLAS_FORMS.some(form => 
    form.category === 'application' && 
    form.id.startsWith('BDRS-EXP') &&
    form.jobTypes.includes(jobType)
  );
}

// Get contact info for form questions
export function getFormSupportContact(): {
  phone: string;
  email: string;
  hours: string;
  address: string;
} {
  return {
    phone: '(727) 464-3888',
    email: 'buildingpermits@pinellas.gov',
    hours: 'Monday-Friday, 8:00 AM - 4:00 PM',
    address: '440 Court Street, Clearwater, FL 33756',
  };
}
