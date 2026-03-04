// Job-specific question templates for PermitPath
// These questions help gather critical information for permit determination

export type QuestionType = 'radio' | 'toggle' | 'number' | 'text' | 'dropdown' | 'multiselect';

export interface JobQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[];
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  followUpQuestionId?: string; // ID of question to show when condition is met
  followUpCondition?: string; // Value that triggers follow-up
  warningMessage?: string; // Warning to show when this option is selected
  // NEW: Context-aware question filtering
  showIf?: (answers: Record<string, string | boolean | number>) => boolean;
}

export interface JobQuestionCategory {
  jobType: string;
  categoryLabel: string;
  icon: string;
  questions: JobQuestion[];
}

// Bathroom/Vanity Questions
export const bathroomQuestions: JobQuestion[] = [
  {
    id: 'installType',
    question: 'Is this replacing existing or new installation?',
    type: 'radio',
    options: ['Replacing existing', 'New installation'],
    required: true,
    helpText: 'Replacements typically require fewer permits than new installations'
  },
  {
    id: 'movingPlumbing',
    question: 'Are you moving plumbing locations?',
    type: 'toggle',
    required: true,
    helpText: 'Moving plumbing locations requires additional permits and inspections'
  },
  {
    id: 'plumbingDistance',
    question: 'How many feet are you moving plumbing?',
    type: 'number',
    placeholder: 'Enter distance in feet...',
    required: false,
    followUpQuestionId: 'movingPlumbing',
    followUpCondition: 'true'
  },
  {
    id: 'electricalWork',
    question: 'Electrical work needed?',
    type: 'toggle',
    required: false,
    helpText: 'GFCI outlets, lighting, exhaust fans all require electrical permits'
  },
  {
    id: 'flooringChange',
    question: 'Flooring being changed?',
    type: 'toggle',
    required: false
  }
];

// Kitchen-Specific Questions - SEPARATE from bathroom
export const kitchenQuestions: JobQuestion[] = [
  {
    id: 'installType',
    question: 'Is this replacing existing or new installation?',
    type: 'radio',
    options: ['Replacing existing', 'New installation'],
    required: true,
    helpText: 'Replacements typically require fewer permits than new installations'
  },
  {
    id: 'workScope',
    question: 'What type of kitchen work are you doing?',
    type: 'multiselect',
    options: ['Cabinets only', 'Countertops', 'Appliances', 'Plumbing fixtures', 'Electrical', 'Full remodel'],
    required: true,
    helpText: 'Select all that apply to your project'
  },
  {
    id: 'movingPlumbing',
    question: 'Are you moving plumbing locations (sink, dishwasher, ice maker)?',
    type: 'toggle',
    required: true,
    helpText: 'Moving plumbing requires additional permits and inspections'
  },
  {
    id: 'plumbingDistance',
    question: 'How many feet are you moving plumbing?',
    type: 'number',
    placeholder: 'Enter distance in feet...',
    required: false,
    followUpQuestionId: 'movingPlumbing',
    followUpCondition: 'true'
  },
  {
    id: 'electricalWork',
    question: 'What electrical work is needed?',
    type: 'multiselect',
    options: ['None', 'Outlets/GFCI', 'Lighting', 'Appliance circuits', 'Range/cooktop', 'Panel upgrade'],
    required: false,
    helpText: 'Electrical work requires separate permits'
  },
  {
    id: 'applianceChanges',
    question: 'Installing or changing appliances?',
    type: 'toggle',
    required: false,
    helpText: 'New gas lines or 240V circuits may require additional permits'
  },
  {
    id: 'applianceTypes',
    question: 'Which appliances?',
    type: 'multiselect',
    options: ['Gas range/cooktop', 'Electric range', 'Dishwasher', 'Refrigerator with ice maker', 'Built-in microwave', 'Garbage disposal'],
    required: false,
    followUpQuestionId: 'applianceChanges',
    followUpCondition: 'true'
  },
  {
    id: 'cabinetSpecs',
    question: 'Are cabinets custom-built or pre-fabricated?',
    type: 'radio',
    options: ['Pre-fabricated (box store)', 'Custom built on-site', 'Semi-custom'],
    required: false,
    helpText: 'Custom cabinets may require additional inspections'
  },
  {
    id: 'countertopMaterial',
    question: 'Countertop material?',
    type: 'radio',
    options: ['Granite/Stone', 'Quartz', 'Laminate', 'Butcher block', 'Concrete', 'Not changing countertops'],
    required: false
  },
  {
    id: 'flooringChange',
    question: 'Changing flooring?',
    type: 'toggle',
    required: false
  }
];

// Roof Questions
export const roofQuestions: JobQuestion[] = [
  {
    id: 'roofPercentage',
    question: 'Percentage of roof being replaced',
    type: 'dropdown',
    options: ['<25%', '25-50%', '50-75%', '75-100%', 'Full replacement'],
    required: true,
    helpText: 'Replacing more than 25% of your roof typically requires a permit'
  },
  {
    id: 'roofWorkType',
    question: 'Is this repair or full replacement?',
    type: 'radio',
    options: ['Repair', 'Full replacement'],
    required: true
  },
  {
    id: 'changingMaterial',
    question: 'Changing roofing material type?',
    type: 'toggle',
    required: false,
    helpText: 'Changing from shingles to tiles or metal may require engineering review'
  },
  {
    id: 'structuralChanges',
    question: 'Structural changes to roofline?',
    type: 'toggle',
    required: true,
    helpText: 'Changes to roof pitch, dormers, or structure require special permits',
    warningMessage: '⚠️ Structural changes to the roofline may require engineering drawings and additional review. This significantly affects permit requirements and timeline.'
  }
];

// Water Heater Questions
export const waterHeaterQuestions: JobQuestion[] = [
  {
    id: 'fuelType',
    question: 'Gas or electric?',
    type: 'radio',
    options: ['Gas', 'Electric'],
    required: true
  },
  {
    id: 'tankType',
    question: 'Tank or tankless?',
    type: 'radio',
    options: ['Tank', 'Tankless'],
    required: true,
    helpText: 'Tankless units often require additional gas line or electrical upgrades'
  },
  {
    id: 'relocating',
    question: 'Relocating from current position?',
    type: 'toggle',
    required: true,
    helpText: 'Relocating water heaters requires additional plumbing and possibly electrical/gas work'
  },
  {
    id: 'newLocation',
    question: 'New location details',
    type: 'text',
    placeholder: 'Describe the new location (e.g., garage, upstairs closet)...',
    required: false,
    followUpQuestionId: 'relocating',
    followUpCondition: 'true'
  }
];

// Electrical Questions
export const electricalQuestions: JobQuestion[] = [
  {
    id: 'circuitType',
    question: 'Adding new circuits or modifying existing?',
    type: 'radio',
    options: ['New circuits', 'Modifying existing', 'Both'],
    required: true
  },
  {
    id: 'amperage',
    question: 'Total amperage of work',
    type: 'dropdown',
    options: ['< 30 amps', '30-50 amps', '50-100 amps', '100-200 amps', '200+ amps'],
    required: true,
    helpText: 'Higher amperage work requires more detailed plans and inspections'
  },
  {
    id: 'panelUpgrade',
    question: 'Requires panel upgrade?',
    type: 'toggle',
    required: true,
    helpText: 'Panel upgrades require utility coordination and often take longer to permit'
  }
];

// AC/HVAC Questions
export const hvacQuestions: JobQuestion[] = [
  {
    id: 'hvacInstallType',
    question: 'Replacing existing unit or new installation?',
    type: 'radio',
    options: ['Replacing existing', 'New installation'],
    required: true
  },
  {
    id: 'capacityChange',
    question: 'Changing unit capacity (BTU/tons)?',
    type: 'toggle',
    required: false,
    helpText: 'Increasing capacity may require ductwork and electrical upgrades'
  },
  {
    id: 'ductworkMods',
    question: 'Ductwork modifications?',
    type: 'toggle',
    required: false,
    helpText: 'Ductwork changes require separate permits and inspections'
  }
];

// Window/Door Questions
export const windowDoorQuestions: JobQuestion[] = [
  {
    id: 'quantity',
    question: 'How many windows/doors?',
    type: 'dropdown',
    options: ['1-2', '3-5', '6-10', 'More than 10'],
    required: true
  },
  {
    id: 'impactResistant',
    question: 'Impact resistant?',
    type: 'toggle',
    required: false,
    helpText: 'Impact-resistant products are required in some wind zones'
  },
  {
    id: 'floorLocation',
    question: 'What floor?',
    type: 'radio',
    options: ['First floor', 'Second floor', 'Both', 'Higher'],
    required: false
  }
];

// Generator Questions
export const generatorQuestions: JobQuestion[] = [
  {
    id: 'generatorSize',
    question: 'Generator size?',
    type: 'radio',
    options: ['Portable', 'Partial house (10-20kW)', 'Whole house (22kW+)'],
    required: true
  },
  {
    id: 'fuelType',
    question: 'Fuel type?',
    type: 'radio',
    options: ['Natural gas', 'Propane', 'Diesel'],
    required: true,
    helpText: 'Natural gas requires gas line permits and utility coordination'
  },
  {
    id: 'transferSwitch',
    question: 'Installing transfer switch?',
    type: 'toggle',
    required: true,
    helpText: 'Transfer switches require electrical permits and inspection'
  }
];

// Pool Barrier Questions
export const poolBarrierQuestions: JobQuestion[] = [
  {
    id: 'barrierType',
    question: 'Type of barrier?',
    type: 'radio',
    options: ['Fence', 'Pool cover', 'Safety net', 'Door alarm', 'Combination'],
    required: true
  },
  {
    id: 'poolType',
    question: 'Pool type?',
    type: 'radio',
    options: ['Above ground', 'In-ground'],
    required: true
  },
  {
    id: 'gateAlarm',
    question: 'Does fence have self-closing gate with alarm?',
    type: 'toggle',
    required: true,
    helpText: 'Florida law requires specific safety features for pool barriers'
  }
];

// Deck questions
export const deckQuestions: JobQuestion[] = [
  {
    id: 'deckSize',
    question: 'Deck size (approximate sq ft)?',
    type: 'dropdown',
    options: ['< 100 sq ft', '100-200 sq ft', '200-400 sq ft', '400+ sq ft'],
    required: true,
    helpText: 'Decks over 200 sq ft often require detailed structural plans'
  },
  {
    id: 'heightOffGround',
    question: 'Height off ground?',
    type: 'dropdown',
    options: ['Ground level', '1-4 feet', '4-8 feet', '8+ feet'],
    required: true,
    helpText: 'Decks higher than 30 inches require railings and special inspections'
  },
  {
    id: 'attachedToHouse',
    question: 'Attached to house or freestanding?',
    type: 'radio',
    options: ['Attached', 'Freestanding'],
    required: true
  }
];

// Fence questions
export const fenceQuestions: JobQuestion[] = [
  {
    id: 'fenceMaterial',
    question: 'Fence material?',
    type: 'radio',
    options: ['Wood', 'Vinyl', 'Chain link', 'Aluminum', 'Composite'],
    required: true
  },
  {
    id: 'fenceHeight',
    question: 'Fence height?',
    type: 'dropdown',
    options: ['< 4 ft', '4-6 ft', '6-8 ft', '8+ ft'],
    required: true,
    helpText: 'Fences over 6 feet typically require building permits'
  },
  {
    id: 'propertyLine',
    question: 'On property line or setback?',
    type: 'radio',
    options: ['On property line', 'Setback from line'],
    required: true,
    helpText: 'Fences on property lines may require neighbor agreements'
  }
];

// Main export mapping job types to their questions
export const jobQuestionsMap: Record<string, JobQuestion[]> = {
  'SMALL_BATH_REMODEL': bathroomQuestions,
  'KITCHEN_REMODEL': kitchenQuestions, // NOW USING KITCHEN-SPECIFIC QUESTIONS
  'RE_ROOFING': roofQuestions,
  'ROOF_REPAIR': roofQuestions,
  'WATER_HEATER': waterHeaterQuestions,
  'ELECTRICAL_PANEL': electricalQuestions,
  'ELECTRICAL_REWIRING': electricalQuestions,
  'EV_CHARGER': electricalQuestions,
  'AC_HVAC_CHANGEOUT': hvacQuestions,
  'WINDOW_DOOR_REPLACEMENT': windowDoorQuestions,
  'GENERATOR_INSTALL': generatorQuestions,
  'POOL_BARRIER': poolBarrierQuestions,
  'DECK_INSTALLATION': deckQuestions,
  'FENCE_INSTALLATION': fenceQuestions
};

// Helper function to get questions for a job type
export function getQuestionsForJobType(jobType: string): JobQuestion[] {
  return jobQuestionsMap[jobType] || [];
}

// Helper function to check if a job type has specific questions
export function hasJobSpecificQuestions(jobType: string): boolean {
  return jobType in jobQuestionsMap;
}

// NEW: Get requirements based on job type and answers
export function getJobSpecificRequirements(
  jobType: string,
  answers: Record<string, string | boolean | number>
): Array<{ category: string; title: string; description: string; isRequired: boolean }> {
  const requirements: Array<{ category: string; title: string; description: string; isRequired: boolean }> = [];
  
  // Base requirements for all jobs
  requirements.push(
    { category: 'document', title: 'Permit Application', description: 'Completed permit application form', isRequired: true },
    { category: 'license', title: 'Contractor License', description: 'Valid Florida contractor license', isRequired: true }
  );
  
  // Kitchen-specific requirements
  if (jobType === 'KITCHEN_REMODEL') {
    const workScope = answers.workScope as string[] || [];
    const electricalWork = answers.electricalWork as string[] || [];
    const applianceTypes = answers.applianceTypes as string[] || [];
    
    if (workScope.includes('Cabinets only') && workScope.length === 1) {
      // Cabinets-only is often cosmetic
      requirements.push({ category: 'document', title: 'Cabinet Specifications', description: 'Manufacturer specs for pre-fab cabinets OR construction details for custom', isRequired: false });
    } else {
      // Full or partial kitchen remodel
      requirements.push({ category: 'document', title: 'Kitchen Floor Plan', description: 'Scale drawing showing cabinet layout, appliances, and fixtures', isRequired: true });
      
      if (workScope.includes('Countertops')) {
        requirements.push({ category: 'document', title: 'Countertop Specifications', description: 'Material specifications and load calculations if heavy materials', isRequired: true });
      }
      
      if (answers.movingPlumbing === true) {
        requirements.push({ category: 'drawing', title: 'Plumbing Plan', description: 'Plumbing riser diagram showing new locations', isRequired: true });
        requirements.push({ category: 'inspection', title: 'Rough Plumbing Inspection', description: 'Before closing walls', isRequired: true });
      }
    }
    
    // Electrical requirements
    if (electricalWork && electricalWork.length > 0 && !electricalWork.includes('None')) {
      requirements.push({ category: 'document', title: 'Electrical Plan', description: 'Circuit diagram for new outlets, lighting, and appliances', isRequired: true });
      requirements.push({ category: 'inspection', title: 'Rough Electrical Inspection', description: 'Before closing walls', isRequired: true });
      
      if (electricalWork.includes('Panel upgrade')) {
        requirements.push({ category: 'document', title: 'Load Calculation', description: 'Electrical load calculation showing adequate capacity', isRequired: true });
      }
    }
    
    // Appliance-specific
    if (applianceTypes?.includes('Gas range/cooktop')) {
      requirements.push({ category: 'document', title: 'Gas Line Permit', description: 'If adding or extending gas lines', isRequired: true });
      requirements.push({ category: 'inspection', title: 'Gas Line Inspection', description: 'Pressure test and inspection', isRequired: true });
    }
    
    if (applianceTypes?.includes('Refrigerator with ice maker')) {
      requirements.push({ category: 'document', title: 'Ice Maker Line Details', description: 'Plumbing connection for refrigerator ice maker', isRequired: false });
    }
    
    // Final inspection always required for kitchen
    requirements.push({ category: 'inspection', title: 'Final Inspection', description: 'Complete kitchen inspection after all work', isRequired: true });
  }
  
  // Bathroom-specific requirements  
  if (jobType === 'SMALL_BATH_REMODEL') {
    if (answers.movingPlumbing === true) {
      requirements.push({ category: 'drawing', title: 'Plumbing Plan', description: 'Plumbing riser diagram showing fixture locations', isRequired: true });
      requirements.push({ category: 'inspection', title: 'Rough Plumbing Inspection', description: 'Before closing walls', isRequired: true });
    }
    
    if (answers.electricalWork === true) {
      requirements.push({ category: 'document', title: 'Electrical Plan', description: 'GFCI outlet and lighting locations', isRequired: true });
      requirements.push({ category: 'inspection', title: 'Electrical Inspection', description: 'GFCI and lighting verification', isRequired: true });
    }
    
    requirements.push({ category: 'inspection', title: 'Final Inspection', description: 'Complete bathroom inspection', isRequired: true });
  }
  
  // Insurance for larger jobs
  if (jobType === 'KITCHEN_REMODEL' || jobType === 'ROOM_ADDITION') {
    requirements.push({ category: 'insurance', title: 'Insurance Certificate', description: 'General liability coverage', isRequired: true });
  }
  
  return requirements;
}

// Validation helpers
export function validateFLLicense(license: string): { valid: boolean; message?: string } {
  const trimmed = license.trim().toUpperCase();
  
  if (!trimmed) {
    return { valid: true }; // Empty is OK (optional field)
  }
  
  const flLicenseRegex = /^[A-Z]{1,3}\d{7,10}$/;
  
  if (!flLicenseRegex.test(trimmed)) {
    return {
      valid: false,
      message: 'FL contractor licenses are 7-10 digits with 1-3 letter prefix (e.g., C1234567, EC12345678, CBC1234567)'
    };
  }
  
  return { valid: true };
}

// Check if address seems complete (has ZIP code indicator)
export function isAddressComplete(address: string): boolean {
  if (!address || address.trim().length < 10) {
    return false;
  }
  
  // Check for ZIP code pattern (5 digits or 5-4 format)
  const zipRegex = /\b\d{5}(-\d{4})?\b/;
  return zipRegex.test(address);
}

// Check if description is vague
export function isDescriptionVague(description: string): boolean {
  if (!description) return true;
  
  const trimmed = description.trim();
  const wordCount = trimmed.split(/\s+/).filter(w => w.length > 0).length;
  
  return wordCount < 10;
}

// Generate clarification prompts
export function getClarificationPrompts(data: {
  description?: string;
  address?: string;
}): string[] {
  const prompts: string[] = [];
  
  if (isDescriptionVague(data.description || '')) {
    prompts.push('Can you provide more details about the scope of work?');
  }
  
  if (!isAddressComplete(data.address || '')) {
    prompts.push('Please verify the complete address including ZIP code');
  }
  
  return prompts;
}

// Check if a question should show based on follow-up logic
export function shouldShowQuestion(
  question: JobQuestion,
  answers: Record<string, string | boolean>
): boolean {
  if (!question.followUpQuestionId) {
    return true; // No dependency, always show
  }
  
  const parentValue = answers[question.followUpQuestionId];
  
  if (question.followUpCondition === 'true') {
    return parentValue === true || parentValue === 'true';
  }
  
  if (question.followUpCondition === 'false') {
    return parentValue === false || parentValue === 'false';
  }
  
  return parentValue === question.followUpCondition;
}

// Get job-specific icon based on job type
export function getJobCategoryIcon(jobType: string): string {
  const categoryMap: Record<string, string> = {
    'SMALL_BATH_REMODEL': 'bath',
    'KITCHEN_REMODEL': 'utensils',
    'RE_ROOFING': 'home',
    'ROOF_REPAIR': 'home',
    'WATER_HEATER': 'droplets',
    'ELECTRICAL_PANEL': 'zap',
    'ELECTRICAL_REWIRING': 'zap',
    'EV_CHARGER': 'zap',
    'AC_HVAC_CHANGEOUT': 'wind',
    'WINDOW_DOOR_REPLACEMENT': 'square',
    'GENERATOR_INSTALL': 'battery',
    'POOL_BARRIER': 'shield',
    'DECK_INSTALLATION': 'layout',
    'FENCE_INSTALLATION': 'fence'
  };
  
  return categoryMap[jobType] || 'tool';
}

// Get job-specific category label
export function getJobCategoryLabel(jobType: string): string {
  const labelMap: Record<string, string> = {
    'SMALL_BATH_REMODEL': 'Bathroom Details',
    'KITCHEN_REMODEL': 'Kitchen Details',
    'RE_ROOFING': 'Roof Details',
    'ROOF_REPAIR': 'Roof Details',
    'WATER_HEATER': 'Water Heater Details',
    'ELECTRICAL_PANEL': 'Electrical Details',
    'ELECTRICAL_REWIRING': 'Electrical Details',
    'EV_CHARGER': 'Electrical Details',
    'AC_HVAC_CHANGEOUT': 'HVAC Details',
    'WINDOW_DOOR_REPLACEMENT': 'Window/Door Details',
    'GENERATOR_INSTALL': 'Generator Details',
    'POOL_BARRIER': 'Pool Safety Details',
    'DECK_INSTALLATION': 'Deck Details',
    'FENCE_INSTALLATION': 'Fence Details'
  };
  
  return labelMap[jobType] || 'Project Details';
}

// NEW: Generate dynamic description based on answers
export function generateJobDescription(
  jobType: string,
  answers: Record<string, string | boolean | number>
): string {
  if (jobType === 'KITCHEN_REMODEL') {
    const workScope = answers.workScope as string[] || [];
    
    if (workScope.length === 0) {
      return 'Kitchen remodel project';
    }
    
    if (workScope.includes('Cabinets only') && workScope.length === 1) {
      return 'Updating kitchen cabinets only - no plumbing or electrical changes';
    }
    
    if (workScope.includes('Full remodel')) {
      return 'Complete kitchen remodel including cabinets, countertops, and appliances';
    }
    
    const scopeList = workScope.join(', ');
    return `Kitchen project involving: ${scopeList}`;
  }
  
  if (jobType === 'SMALL_BATH_REMODEL') {
    const parts: string[] = ['Bathroom renovation'];
    if (answers.movingPlumbing === true) parts.push('with plumbing relocation');
    if (answers.electricalWork === true) parts.push('including electrical work');
    return parts.join(' ');
  }
  
  return '';
}

export default jobQuestionsMap;
