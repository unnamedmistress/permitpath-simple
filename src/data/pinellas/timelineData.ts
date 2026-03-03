// Pinellas County Complete Timeline Engine
// Includes permit review + inspection scheduling

export interface TimelineStage {
  id: string;
  name: string;
  description: string;
  type: 'application' | 'review' | 'approval' | 'inspection' | 'final';
  estimatedDays: { min: number; max: number; typical: number };
  requiresAction: boolean;
  actionName?: string;
  actionUrl?: string;
  canFail: boolean;
  failureDelayDays?: number;
  dependsOn: string[];
  blocksWorkStart: boolean;
}

export interface InspectionType {
  id: string;
  name: string;
  description: string;
  requiredFor: string[]; // job types
  typicalLeadTimeDays: number; // How far in advance to book
  sameDayAvailable: boolean;
  morningSlots: boolean;
  afternoonSlots: boolean;
  onlineScheduling: boolean;
  schedulingUrl: string;
  phoneScheduling: string;
  whatToPrepare: string[];
  commonFailures: string[];
  reInspectionFee: number;
}

export interface CompletePermitTimeline {
  jobType: string;
  isExpress: boolean;
  stages: TimelineStage[];
  totalDaysEstimate: { min: number; max: number; typical: number };
  inspectionTypes: InspectionType[];
  workCanStartDate: { optimistic: Date; typical: Date; pessimistic: Date };
  importantDates: Array<{ name: string; date: Date; description: string }>;
  risks: Array<{ scenario: string; delayDays: number; probability: 'low' | 'medium' | 'high' }>;
}

// Standard inspection types for Pinellas County
const STANDARD_INSPECTIONS: InspectionType[] = [
  {
    id: 'rough-in',
    name: 'Rough-In Inspection',
    description: 'Inspection of work before walls/ceilings are closed',
    requiredFor: ['ELECTRICAL_PANEL', 'ELECTRICAL_REWIRING', 'PLUMBING_MAIN_LINE', 'KITCHEN_REMODEL', 'SMALL_BATH_REMODEL', 'AC_HVAC_CHANGEOUT'],
    typicalLeadTimeDays: 2,
    sameDayAvailable: true,
    morningSlots: true,
    afternoonSlots: true,
    onlineScheduling: true,
    schedulingUrl: 'https://aca-prod.accela.com/pinellas/Default.aspx',
    phoneScheduling: '(727) 464-3888',
    whatToPrepare: [
      'Work complete but NOT covered by drywall/trim',
      'Access to all work areas',
      'Permit card on site',
      'Approved plans available',
    ],
    commonFailures: [
      'Work covered before inspection',
      'No access to attic/crawl space',
      'Missing required supports/hangers',
      'Incorrect wire/pipe sizing',
    ],
    reInspectionFee: 50,
  },
  {
    id: 'final-building',
    name: 'Final Building Inspection',
    description: 'Final inspection of completed work',
    requiredFor: ['RE_ROOFING', 'WINDOW_DOOR_REPLACEMENT', 'KITCHEN_REMODEL', 'SMALL_BATH_REMODEL', 'ROOM_ADDITION', 'DECK_INSTALLATION'],
    typicalLeadTimeDays: 2,
    sameDayAvailable: true,
    morningSlots: true,
    afternoonSlots: true,
    onlineScheduling: true,
    schedulingUrl: 'https://aca-prod.accela.com/pinellas/Default.aspx',
    phoneScheduling: '(727) 464-3888',
    whatToPrepare: [
      'All work 100% complete',
      'All trades signed off',
      'Final grade around structure',
      'Permit card and approved plans on site',
    ],
    commonFailures: [
      'Incomplete work',
      'Missing handrails/guards',
      'Grade not established',
      'Other trade inspections not complete',
    ],
    reInspectionFee: 50,
  },
  {
    id: 'electrical-final',
    name: 'Electrical Final',
    description: 'Final electrical inspection',
    requiredFor: ['ELECTRICAL_PANEL', 'ELECTRICAL_REWIRING', 'EV_CHARGER', 'GENERATOR_INSTALL'],
    typicalLeadTimeDays: 2,
    sameDayAvailable: true,
    morningSlots: true,
    afternoonSlots: true,
    onlineScheduling: true,
    schedulingUrl: 'https://aca-prod.accela.com/pinellas/Default.aspx',
    phoneScheduling: '(727) 464-3888',
    whatToPrepare: [
      'All devices installed and energized',
      'Panel labeled correctly',
      'GFCI/AFCI protection in place',
      'Surge protection if required',
    ],
    commonFailures: [
      'Panel not properly labeled',
      'Missing GFCI protection',
      'Exposed wiring',
      'Incorrect breaker sizing',
    ],
    reInspectionFee: 50,
  },
  {
    id: 'plumbing-final',
    name: 'Plumbing Final',
    description: 'Final plumbing inspection',
    requiredFor: ['WATER_HEATER', 'PLUMBING_MAIN_LINE'],
    typicalLeadTimeDays: 2,
    sameDayAvailable: true,
    morningSlots: true,
    afternoonSlots: true,
    onlineScheduling: true,
    schedulingUrl: 'https://aca-prod.accela.com/pinellas/Default.aspx',
    phoneScheduling: '(727) 464-3888',
    whatToPrepare: [
      'Water pressure test completed',
      'Fixtures installed and operational',
      'Water heater properly vented',
      'Access to water heater',
    ],
    commonFailures: [
      'No pressure test documentation',
      'Improper venting',
      'Missing pan/relief piping',
      'Insufficient combustion air',
    ],
    reInspectionFee: 50,
  },
  {
    id: 'mechanical-final',
    name: 'Mechanical Final',
    description: 'Final HVAC inspection',
    requiredFor: ['AC_HVAC_CHANGEOUT'],
    typicalLeadTimeDays: 2,
    sameDayAvailable: true,
    morningSlots: true,
    afternoonSlots: true,
    onlineScheduling: true,
    schedulingUrl: 'https://aca-prod.accela.com/pinellas/Default.aspx',
    phoneScheduling: '(727) 464-3888',
    whatToPrepare: [
      'Unit operational',
      'Thermostat installed and working',
      'Filter in place',
      'Condensate line connected',
      'Access to both indoor and outdoor units',
    ],
    commonFailures: [
      'Unit not operational',
      'Missing required documentation',
      'Improper clearances',
      'No filter installed',
    ],
    reInspectionFee: 50,
  },
  {
    id: 'roof-final',
    name: 'Roof Final',
    description: 'Final roof inspection',
    requiredFor: ['RE_ROOFING'],
    typicalLeadTimeDays: 2,
    sameDayAvailable: true,
    morningTags: true,
    afternoonSlots: true,
    onlineScheduling: true,
    schedulingUrl: 'https://aca-prod.accela.com/pinellas/Default.aspx',
    phoneScheduling: '(727) 464-3888',
    whatToPrepare: [
      'Roof 100% complete including flashings',
      'Clean and safe access to roof',
      'Ladder available for inspector',
      'Permit card visible',
    ],
    commonFailures: [
      'Incomplete flashings',
      'Debris on roof',
      'Improper fastener exposure',
      'Valleys not properly installed',
    ],
    reInspectionFee: 50,
  },
];

// Get inspections required for a job type
export function getInspectionsForJobType(jobType: string): InspectionType[] {
  return STANDARD_INSPECTIONS.filter(inspection => 
    inspection.requiredFor.includes(jobType)
  );
}

// Generate complete timeline for a job
export function generateTimeline(
  jobType: string,
  isExpress: boolean,
  startDate: Date = new Date()
): CompletePermitTimeline {
  const stages: TimelineStage[] = [];
  const inspectionTypes = getInspectionsForJobType(jobType);
  
  let currentDate = new Date(startDate);
  let stageId = 0;
  
  // Stage 1: Submit Application
  stages.push({
    id: `stage-${stageId++}`,
    name: 'Submit Application',
    description: 'Apply online or in person with all required documents',
    type: 'application',
    estimatedDays: { min: 0, max: 1, typical: 0 },
    requiresAction: true,
    actionName: isExpress ? 'Apply Online (Express)' : 'Apply Online',
    actionUrl: 'https://aca-prod.accela.com/pinellas/Default.aspx',
    canFail: false,
    dependsOn: [],
    blocksWorkStart: true,
  });
  
  if (isExpress) {
    // Express permit: Same day approval
    stages.push({
      id: `stage-${stageId++}`,
      name: 'Permit Issued',
      description: 'Express permits are reviewed and issued the same day',
      type: 'approval',
      estimatedDays: { min: 0, max: 1, typical: 0 },
      requiresAction: false,
      canFail: true,
      failureDelayDays: 3, // May need to convert to standard permit
      dependsOn: ['stage-0'],
      blocksWorkStart: true,
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  } else {
    // Standard permit: Plan review required
    stages.push({
      id: `stage-${stageId++}`,
      name: 'Plan Review',
      description: 'County reviews plans and documents (residential: 10-14 days typical)',
      type: 'review',
      estimatedDays: { min: 7, max: 21, typical: 14 },
      requiresAction: false,
      canFail: true,
      failureDelayDays: 7, // Time to correct and resubmit
      dependsOn: ['stage-0'],
      blocksWorkStart: true,
    });
    
    currentDate.setDate(currentDate.getDate() + 14);
    
    // Approval
    stages.push({
      id: `stage-${stageId++}`,
      name: 'Permit Issued',
      description: 'Permit approved and ready for pickup/download',
      type: 'approval',
      estimatedDays: { min: 0, max: 1, typical: 0 },
      requiresAction: false,
      canFail: false,
      dependsOn: ['stage-1'],
      blocksWorkStart: true,
    });
  }
  
  // Add inspection stages
  const inspectionStages: TimelineStage[] = [];
  
  for (let i = 0; i < inspectionTypes.length; i++) {
    const inspection = inspectionTypes[i];
    const isFinal = inspection.id.includes('final');
    
    // Scheduling stage
    inspectionStages.push({
      id: `stage-inspection-${i}-schedule`,
      name: `Schedule ${inspection.name}`,
      description: `Book inspection (${inspection.typicalLeadTimeDays} days notice)`,
      type: 'inspection',
      estimatedDays: { 
        min: 1, 
        max: inspection.typicalLeadTimeDays + 2, 
        typical: inspection.typicalLeadTimeDays 
      },
      requiresAction: true,
      actionName: 'Schedule Inspection',
      actionUrl: inspection.onlineScheduling ? inspection.schedulingUrl : `tel:${inspection.phoneScheduling}`,
      canFail: false,
      dependsOn: i === 0 ? [stages[stages.length - 1].id] : [inspectionStages[inspectionStages.length - 1].id],
      blocksWorkStart: !isFinal, // Can start work after permit, but rough-in blocks closing
    });
    
    // Inspection itself
    inspectionStages.push({
      id: `stage-inspection-${i}`,
      name: inspection.name,
      description: inspection.description,
      type: 'inspection',
      estimatedDays: { min: 0, max: 1, typical: 0 },
      requiresAction: false,
      canFail: true,
      failureDelayDays: 3, // Time to correct and reschedule
      dependsOn: [`stage-inspection-${i}-schedule`],
      blocksWorkStart: !isFinal,
    });
  }
  
  stages.push(...inspectionStages);
  
  // Calculate total days
  const totalTypical = stages.reduce((sum, stage) => sum + stage.estimatedDays.typical, 0);
  const totalMin = stages.reduce((sum, stage) => sum + stage.estimatedDays.min, 0);
  const totalMax = stages.reduce((sum, stage) => sum + stage.estimatedDays.max, 0);
  
  // Calculate work start dates
  const permitIssuedStageIndex = stages.findIndex(s => s.type === 'approval');
  const permitIssuedDate = new Date(startDate);
  permitIssuedDate.setDate(permitIssuedDate.getDate() + stages.slice(0, permitIssuedStageIndex + 1)
    .reduce((sum, s) => sum + s.estimatedDays.typical, 0));
  
  // Risks
  const risks = [
    {
      scenario: 'Plan review requires corrections',
      delayDays: 7,
      probability: 'medium' as const,
    },
    {
      scenario: 'Inspection fails and requires re-inspection',
      delayDays: 3,
      probability: 'medium' as const,
    },
    {
      scenario: 'Express permit does not qualify - convert to standard',
      delayDays: 14,
      probability: 'low' as const,
    },
    {
      scenario: 'High permit volume extends review times',
      delayDays: 7,
      probability: 'low' as const,
    },
  ];
  
  return {
    jobType,
    isExpress,
    stages,
    totalDaysEstimate: { min: totalMin, max: totalMax, typical: totalTypical },
    inspectionTypes,
    workCanStartDate: {
      optimistic: new Date(startDate.getTime() + totalMin * 24 * 60 * 60 * 1000),
      typical: new Date(startDate.getTime() + totalTypical * 24 * 60 * 60 * 1000),
      pessimistic: new Date(startDate.getTime() + (totalMax + 14) * 24 * 60 * 60 * 1000),
    },
    importantDates: [
      {
        name: 'Permit Issued - Work Can Begin',
        date: permitIssuedDate,
        description: isExpress ? 'Same day (express permit)' : 'After plan review approval',
      },
      {
        name: 'Rough-In Inspection (if required)',
        date: new Date(permitIssuedDate.getTime() + 7 * 24 * 60 * 60 * 1000), // Typical 1 week after start
        description: 'Must pass before closing walls',
      },
    ],
    risks,
  };
}

// Generate calendar export (ICS format)
export function generateCalendarEvents(timeline: CompletePermitTimeline): string {
  const events: string[] = [];
  let currentDate = new Date();
  
  for (const stage of timeline.stages) {
    if (stage.requiresAction && stage.actionName) {
      const eventDate = new Date(currentDate);
      eventDate.setDate(eventDate.getDate() + stage.estimatedDays.typical);
      
      events.push(`BEGIN:VEVENT
UID:${stage.id}@permitpath.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${eventDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${stage.actionName}
DESCRIPTION:${stage.description}
URL:${stage.actionUrl || ''}
END:VEVENT`);
    }
    
    currentDate.setDate(currentDate.getDate() + stage.estimatedDays.typical);
  }
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//PermitPath//Pinellas County Permits//EN
${events.join('\n')}
END:VCALENDAR`;
}

// Get recommended inspection booking date
export function getRecommendedBookingDate(
  inspectionType: InspectionType,
  targetInspectionDate: Date
): Date {
  const bookingDate = new Date(targetInspectionDate);
  bookingDate.setDate(bookingDate.getDate() - inspectionType.typicalLeadTimeDays);
  return bookingDate;
}

export const PINELLAS_CONTACT = {
  name: 'Pinellas County Building and Development Review Services',
  phone: '(727) 464-3888',
  email: 'buildingpermits@pinellas.gov',
  hours: 'Monday-Friday, 8:00 AM - 4:00 PM',
  address: '440 Court Street, Clearwater, FL 33756',
  portalUrl: 'https://aca-prod.accela.com/pinellas/Default.aspx',
  dashboardUrl: 'https://pinellas.gov/building-permit-review-times-activity/',
};
