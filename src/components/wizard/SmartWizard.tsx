import { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  ChevronDown,
  House,
  Wind,
  Zap,
  Droplets,
  Paintbrush,
  Fence,
  Building2,
  Shield,
  AlertCircle,
  Info,
  Loader2,
  AlertTriangle,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import { JobType, Jurisdiction, Requirement, ContractorInfo, BudgetTimeline, BuildingDetails, PermitHistory } from '@/types/permit';
import { getRequirementsForJob } from '@/services/requirements';
import Button from '@/components/shared/Button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

export type CreateJobState = 'idle' | 'creating' | 'created' | 'failed';

interface SmartWizardProps {
  onComplete: (data: WizardData) => void;
  createState?: CreateJobState;
  createError?: string | null;
  onRetryCreate?: () => void;
  initialData?: Partial<WizardData>;
}

export interface WizardData {
  jobType: JobType;
  jurisdiction: Jurisdiction;
  address: string;
  description: string;
  requirements: Requirement[];
  // Phase 2: New fields
  contractorInfo?: ContractorInfo;
  budgetTimeline?: BudgetTimeline;
  buildingDetails?: BuildingDetails;
  permitHistory?: PermitHistory;
}

interface JobTypeOption {
  value: JobType;
  label: string;
  description: string;
  plainEnglishDescription: string;
  timeline: string;
  costEstimate: string;
  keywords: string[];
}

interface JobTypeCategory {
  key: string;
  label: string;
  icon: typeof House;
  options: JobTypeOption[];
}

const JOB_TYPE_CATEGORIES: JobTypeCategory[] = [
  {
    key: 'roofing',
    label: 'Roofing',
    icon: House,
    options: [
      { value: 'RE_ROOFING', label: 'Roof Replacement', description: 'Full roof replacement', plainEnglishDescription: 'Taking off old roof and putting on new one', timeline: '2-3 weeks', costEstimate: '$8,000 - $15,000', keywords: ['reroof', 'roofing'] },
      { value: 'ROOF_REPAIR', label: 'Roof Repair', description: 'Patch or repair existing roof', plainEnglishDescription: 'Fixing leaks or damaged shingles', timeline: '1-2 days', costEstimate: '$300 - $1,500', keywords: ['shingle', 'leak', 'repair'] }
    ]
  },
  {
    key: 'hvac',
    label: 'HVAC',
    icon: Wind,
    options: [
      { value: 'AC_HVAC_CHANGEOUT', label: 'AC/HVAC Replacement', description: 'Replace AC unit or HVAC system', plainEnglishDescription: 'Installing new air conditioner or heater', timeline: '1-2 days', costEstimate: '$4,000 - $8,000', keywords: ['air conditioning', 'mechanical'] }
    ]
  },
  {
    key: 'plumbing',
    label: 'Plumbing',
    icon: Droplets,
    options: [
      { value: 'WATER_HEATER', label: 'Water Heater', description: 'Install or replace water heater', plainEnglishDescription: 'Putting in new hot water tank', timeline: '3-6 hours', costEstimate: '$800 - $2,500', keywords: ['tankless', 'heater'] },
      { value: 'PLUMBING_MAIN_LINE', label: 'Plumbing Main Line', description: 'Replace main water or sewer line', plainEnglishDescription: 'Fixing the main pipe to your house', timeline: '1-3 days', costEstimate: '$2,000 - $5,000', keywords: ['main line', 'sewer'] },
      { value: 'SMALL_BATH_REMODEL', label: 'Bathroom Remodel', description: 'Bathroom renovation work', plainEnglishDescription: 'Updating bathroom fixtures and layout', timeline: '1-2 weeks', costEstimate: '$3,000 - $8,000', keywords: ['bath', 'bathroom'] }
    ]
  },
  {
    key: 'electrical',
    label: 'Electrical',
    icon: Zap,
    options: [
      { value: 'ELECTRICAL_PANEL', label: 'Electrical Panel', description: 'Upgrade or replace panel', plainEnglishDescription: 'Upgrading your home\'s electrical box', timeline: '1 day', costEstimate: '$1,200 - $3,000', keywords: ['service', 'breaker'] },
      { value: 'ELECTRICAL_REWIRING', label: 'Electrical Rewiring', description: 'Rewire circuits', plainEnglishDescription: 'Replacing old electrical wires', timeline: '3-7 days', costEstimate: '$3,000 - $8,000', keywords: ['rewire', 'wiring'] },
      { value: 'EV_CHARGER', label: 'EV Charger', description: 'Install EV charging station', plainEnglishDescription: 'Adding plug for electric car', timeline: '4-8 hours', costEstimate: '$500 - $2,000', keywords: ['tesla', 'charger', '240v'] },
      { value: 'GENERATOR_INSTALL', label: 'Generator', description: 'Install standby generator', plainEnglishDescription: 'Installing backup power for outages', timeline: '1-2 days', costEstimate: '$3,000 - $8,000', keywords: ['backup power', 'transfer switch'] }
    ]
  },
  {
    key: 'exterior',
    label: 'Exterior',
    icon: Fence,
    options: [
      { value: 'WINDOW_DOOR_REPLACEMENT', label: 'Window/Door Replacement', description: 'Replace windows or doors', plainEnglishDescription: 'Installing new windows or doors', timeline: '1-3 days', costEstimate: '$300 - $1,000 per window', keywords: ['impact', 'hurricane'] },
      { value: 'SIDING_EXTERIOR', label: 'Siding/Exterior', description: 'Replace siding or exterior cladding', plainEnglishDescription: 'New outside covering for your house', timeline: '1-2 weeks', costEstimate: '$5,000 - $15,000', keywords: ['cladding', 'facade'] },
      { value: 'DECK_INSTALLATION', label: 'Deck Installation', description: 'Build a new deck', plainEnglishDescription: 'Building outdoor deck or patio', timeline: '3-7 days', costEstimate: '$4,000 - $12,000', keywords: ['deck', 'outdoor'] },
      { value: 'FENCE_INSTALLATION', label: 'Fence Installation', description: 'Install perimeter fencing', plainEnglishDescription: 'Putting up fence around property', timeline: '1-3 days', costEstimate: '$2,000 - $6,000', keywords: ['fence', 'gate'] }
    ]
  },
  {
    key: 'remodeling',
    label: 'Remodeling',
    icon: Paintbrush,
    options: [
      { value: 'KITCHEN_REMODEL', label: 'Kitchen Remodel', description: 'Renovate kitchen', plainEnglishDescription: 'Updating kitchen cabinets and counters', timeline: '2-6 weeks', costEstimate: '$10,000 - $30,000', keywords: ['kitchen', 'remodel'] },
      { value: 'ROOM_ADDITION', label: 'Room Addition', description: 'Add square footage', plainEnglishDescription: 'Adding new room to your house', timeline: '4-8 weeks', costEstimate: '$20,000 - $60,000', keywords: ['addition', 'expansion'] }
    ]
  },
  {
    key: 'safety',
    label: 'Safety',
    icon: Shield,
    options: [
      { value: 'POOL_BARRIER', label: 'Pool Barrier', description: 'Install pool safety fence or barrier', plainEnglishDescription: 'Safety fence around swimming pool', timeline: '1-2 days', costEstimate: '$1,500 - $4,000', keywords: ['pool', 'barrier', 'safety'] }
    ]
  },
  {
    key: 'structural',
    label: 'Structural',
    icon: Building2,
    options: [
      { value: 'FOUNDATION_REPAIR', label: 'Foundation Repair', description: 'Structural foundation work', plainEnglishDescription: 'Fixing cracks or problems with foundation', timeline: '1-2 weeks', costEstimate: '$2,000 - $10,000', keywords: ['structural', 'foundation'] }
    ]
  }
];

const JOB_TYPE_OPTIONS = JOB_TYPE_CATEGORIES.flatMap((category) =>
  category.options.map((option) => ({ ...option, category: category.label, icon: category.icon }))
);

const CATEGORY_STYLES: Record<string, string> = {
  Roofing: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
  HVAC: 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20',
  Plumbing: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  Electrical: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
  Exterior: 'bg-green-500/10 text-green-700 border-green-500/20',
  Remodeling: 'bg-rose-500/10 text-rose-700 border-rose-500/20',
  Safety: 'bg-violet-500/10 text-violet-700 border-violet-500/20',
  Structural: 'bg-slate-500/10 text-slate-700 border-slate-500/20'
};

// Guided questions by job type
const guidedQuestions: Record<string, { question: string; field: string; options?: string[] }[]> = {
  'WATER_HEATER': [
    { question: 'What brand is your current water heater?', field: 'brand' },
    { question: 'How many gallons?', field: 'gallons', options: ['30 gallons', '40 gallons', '50 gallons', '80 gallons'] },
    { question: 'Is it gas or electric?', field: 'fuelType', options: ['Gas', 'Electric'] },
    { question: 'Where is it located?', field: 'location', options: ['Garage', 'Attic', 'Closet', 'Basement'] }
  ],
  'RE_ROOFING': [
    { question: 'How many squares (roof size)?', field: 'squares', options: ['Under 20', '20-30', '30-50', 'Over 50'] },
    { question: 'What material?', field: 'material', options: ['Asphalt shingles', 'Metal', 'Tile', 'Flat roof'] },
    { question: 'Single story or multi-story?', field: 'stories', options: ['1 story', '2 stories', '3+ stories'] },
    { question: 'Is the roof leaking now?', field: 'leaking', options: ['Yes', 'No', 'Not sure'] }
  ],
  'ELECTRICAL_PANEL': [
    { question: 'What amp service do you need?', field: 'amps', options: ['100 amp', '150 amp', '200 amp', '400 amp'] },
    { question: 'Why are you upgrading?', field: 'reason', options: ['Adding AC', 'Home renovation', 'Old panel unsafe', 'Not enough power'] },
    { question: 'Where is the panel located?', field: 'location', options: ['Garage', 'Outside', 'Basement', 'Closet'] }
  ],
  'AC_HVAC_CHANGEOUT': [
    { question: 'What type of system?', field: 'systemType', options: ['Central AC', 'Heat pump', 'Mini-split', 'Package unit'] },
    { question: 'What ton size?', field: 'tons', options: ['1.5 tons', '2 tons', '2.5 tons', '3 tons', '4 tons', '5 tons'] },
    { question: 'Is this a replacement or new install?', field: 'installType', options: ['Replacement', 'New install', 'Not sure'] }
  ],
  'WINDOW_DOOR_REPLACEMENT': [
    { question: 'How many windows/doors?', field: 'count', options: ['1-2', '3-5', '6-10', 'More than 10'] },
    { question: 'Impact resistant?', field: 'impact', options: ['Yes', 'No', 'Not sure'] },
    { question: 'What floor?', field: 'floor', options: ['First floor', 'Second floor', 'Both'] }
  ],
  'SMALL_BATH_REMODEL': [
    { question: 'What are you changing?', field: 'changes', options: ['Vanity only', 'Shower/tub', 'Toilet', 'Full remodel'] },
    { question: 'Moving any plumbing?', field: 'movingPlumbing', options: ['Yes', 'No', 'Not sure'] }
  ],
  'POOL_BARRIER': [
    { question: 'Type of barrier?', field: 'barrierType', options: ['Fence', 'Pool cover', 'Safety net', 'Door alarm'] },
    { question: 'Pool height?', field: 'poolHeight', options: ['Above ground', 'In-ground'] }
  ],
  'GENERATOR_INSTALL': [
    { question: 'Generator size?', field: 'size', options: ['Portable', 'Whole house (22kW+)', 'Partial house (10-20kW)'] },
    { question: 'Fuel type?', field: 'fuel', options: ['Natural gas', 'Propane', 'Diesel'] }
  ]
};

const JURISDICTIONS: { value: Jurisdiction; label: string }[] = [
  { value: 'PINELLAS_COUNTY', label: 'Pinellas County - areas outside cities' },
  { value: 'ST_PETERSBURG', label: 'City of St. Petersburg' },
  { value: 'CLEARWATER', label: 'City of Clearwater' },
  { value: 'LARGO', label: 'City of Largo' },
  { value: 'PALM_HARBOR', label: 'Palm Harbor area' }
];

// Storage keys for smart defaults
const STORAGE_KEY_JURISDICTION = 'permitpath:lastJurisdiction';

function getStoredJurisdiction(): Jurisdiction | undefined {
  try {
    return localStorage.getItem(STORAGE_KEY_JURISDICTION) as Jurisdiction | undefined;
  } catch {
    return undefined;
  }
}

function storeJurisdiction(jurisdiction: Jurisdiction) {
  try {
    localStorage.setItem(STORAGE_KEY_JURISDICTION, jurisdiction);
  } catch {
    // Ignore storage errors
  }
}

// FL License validation - formats: C1234567, EC1234567, CBC1234567, etc.
function isValidFLLicense(license: string): boolean {
  const flLicenseRegex = /^[A-Z]{1,3}\d{7,10}$/i;
  return flLicenseRegex.test(license.trim());
}

// Year built validation
function isValidYearBuilt(year: number): boolean {
  const currentYear = new Date().getFullYear();
  return year >= 1800 && year <= currentYear + 1;
}

export default function SmartWizard({
  onComplete,
  createState = 'idle',
  createError,
  onRetryCreate,
  initialData
}: SmartWizardProps) {
  const getInitialStep = () => {
    if (initialData?.requirements?.length) return 4;
    if (initialData?.address) return 3;
    if (initialData?.jurisdiction) return 2;
    return 1;
  };

  const [step, setStep] = useState(getInitialStep);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isJobTypeOpen, setIsJobTypeOpen] = useState(false);
  const [showValidationError, setShowValidationError] = useState(false);
  
  // Use stored jurisdiction as default, fallback to initialData or PINELLAS_COUNTY
  const defaultJurisdiction = initialData?.jurisdiction || getStoredJurisdiction() || 'PINELLAS_COUNTY';
  
  const [data, setData] = useState<Partial<WizardData>>({
    jobType: initialData?.jobType,
    jurisdiction: defaultJurisdiction,
    address: initialData?.address || '',
    description: initialData?.description || '',
    contractorInfo: initialData?.contractorInfo || {},
    budgetTimeline: initialData?.budgetTimeline || {},
    buildingDetails: initialData?.buildingDetails || {},
    permitHistory: initialData?.permitHistory || {}
  });
  const [requirements, setRequirements] = useState<Requirement[]>(initialData?.requirements || []);
  const [guidedAnswers, setGuidedAnswers] = useState<Record<string, string>>({});
  const selectedJobType = JOB_TYPE_OPTIONS.find((option) => option.value === data.jobType);
  const totalSteps = 5;

  const requiredCount = requirements.filter((req) => req.isRequired).length;
  const optionalCount = requirements.length - requiredCount;

  const handleNext = async () => {
    console.log('handleNext called, current step:', step);
    // Check if user can proceed, if not show validation error
    if (!canProceed()) {
      console.log('Cannot proceed, validation failed');
      setShowValidationError(true);
      return;
    }
    
    console.log('Proceeding from step', step, 'to', step + 1);
    
    if (step === 3) {
      // Step 3 is Details → analyze requirements and go to Requirements step
      console.log('Step 3 - analyzing requirements');
      await analyzeRequirements();
      return;
    }
    
    setStep(step + 1);
    setShowValidationError(false);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleJurisdictionSelect = (jurisdiction: Jurisdiction) => {
    setData({ ...data, jurisdiction });
    storeJurisdiction(jurisdiction);
  };

  const analyzeRequirements = async () => {
    if (!data.jobType || !data.jurisdiction || !data.address) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsAnalyzing(true);
    try {
      const reqs = await getRequirementsForJob(
        data.jobType,
        data.jurisdiction,
        data.address,
        data.description
      );
      setRequirements(reqs);
      setStep(4);
      toast.success('Requirements analyzed', {
        description: `Found ${reqs.length} checklist items`
      });
    } catch (error) {
      console.error('Failed to analyze requirements:', error);
      toast.error('Failed to analyze requirements');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleComplete = () => {
    if (!data.jobType || !data.jurisdiction || !data.address) {
      toast.error('Please fill in all required fields');
      return;
    }

    onComplete({
      jobType: data.jobType,
      jurisdiction: data.jurisdiction,
      address: data.address,
      description: data.description || '',
      requirements,
      contractorInfo: data.contractorInfo,
      budgetTimeline: data.budgetTimeline,
      buildingDetails: data.buildingDetails,
      permitHistory: data.permitHistory
    });
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!data.jobType;
      case 2:
        return !!data.jurisdiction;
      case 3:
        return (data.address || '').trim().length >= 3;
      case 4:
        return requirements.length > 0;
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-4">
      {createState === 'failed' && createError && (
        <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
            <div className="flex-1">
              <p className="font-semibold text-red-700">We could not open your checklist.</p>
              <p className="mt-1 text-sm text-red-700">{createError}</p>
            </div>
            <Button variant="outline" size="sm" onClick={onRetryCreate}>
              Retry
            </Button>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {['Job Type', 'Location', 'Details', 'Requirements', 'Review'].map((label, index) => (
            <div
              key={label}
              className={`text-xs font-medium ${index + 1 <= step ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {label}
            </div>
          ))}
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(step / totalSteps) * 100}%` }} />
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-3 sm:space-y-4">
          {/* UPL Disclaimer */}
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
            <p>
              <strong>Notice:</strong> This tool provides general information only and does not constitute legal advice. Always consult with a qualified professional for your specific situation.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-semibold">What type of work?</h2>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <button className="p-1 rounded-full hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" aria-label="Job type selection help">
                    <Info size={16} className="text-muted-foreground" aria-hidden="true" />
                  </button>
                </HoverCardTrigger>
                <HoverCardContent className="w-72 p-3">
                  <p className="text-sm text-foreground">
                    Not sure which to pick? <strong>Roof Replacement</strong> means new shingles/tiles. <strong>Roof Repair</strong> means patching leaks. When in doubt, describe your project and we'll help.
                  </p>
                </HoverCardContent>
              </HoverCard>
            </div>
            <p className="text-muted-foreground text-sm sm:text-base">Pick the job that best matches your project</p>
          </div>
          
          {selectedJobType && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${CATEGORY_STYLES[selectedJobType.category]}`}>
                  <selectedJobType.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{selectedJobType.label}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{selectedJobType.plainEnglishDescription}</p>
                  <div className="flex flex-wrap gap-3 mt-3 text-xs">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                      <span className="font-medium">How long:</span> {selectedJobType.timeline}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                      <span className="font-medium">Cost:</span> {selectedJobType.costEstimate}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Popover open={isJobTypeOpen} onOpenChange={setIsJobTypeOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                role="combobox"
                aria-expanded={isJobTypeOpen}
                aria-label={selectedJobType ? `Selected job type: ${selectedJobType.label}` : "Choose job type"}
                className="w-full rounded-2xl border bg-background px-4 py-3 text-left transition-all hover:border-primary/50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex items-center gap-3">
                    {selectedJobType ? (
                      <>
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${CATEGORY_STYLES[selectedJobType.category]}`} aria-hidden="true">
                          <selectedJobType.icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold truncate">{selectedJobType.label}</div>
                          <div className="text-sm text-muted-foreground truncate">{selectedJobType.description}</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 text-primary" aria-hidden="true">
                          <ChevronDown className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold">Choose job type</div>
                          <div className="text-sm text-muted-foreground">Search or browse categories</div>
                        </div>
                      </>
                    )}
                  </div>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isJobTypeOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" sideOffset={8} className="w-[min(var(--radix-popover-trigger-width),95vw)] rounded-2xl border p-0 shadow-xl">
              <Command>
                <CommandInput placeholder="Search job type or keyword..." className="h-12 text-base" />
                <CommandList className="max-h-[60vh] overflow-y-auto">
                  <CommandEmpty>No job type found.</CommandEmpty>
                  {JOB_TYPE_CATEGORIES.map((category) => {
                    const CategoryIcon = category.icon;
                    return (
                      <CommandGroup key={category.key} heading={category.label}>
                        {category.options.map((type) => (
                          <CommandItem
                            key={type.value}
                            value={type.value}
                            keywords={[type.label, type.description, type.plainEnglishDescription, category.label, ...type.keywords]}
                            title={type.plainEnglishDescription}
                            onSelect={() => {
                              setData({ ...data, jobType: type.value });
                              setIsJobTypeOpen(false);
                            }}
                            className="group items-start gap-3 rounded-lg py-2.5 transition-all data-[selected=true]:bg-primary/10"
                          >
                            <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${CATEGORY_STYLES[category.label]}`}>
                              <CategoryIcon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium leading-tight">{type.label}</div>
                              <div className="text-xs text-muted-foreground leading-tight mt-0.5">{type.plainEnglishDescription}</div>
                            </div>
                            <Check className={`h-4 w-4 shrink-0 transition-opacity ${data.jobType === type.value ? 'opacity-100 text-primary' : 'opacity-0'}`} />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    );
                  })}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3 sm:space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-semibold">Where is this job?</h2>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <button className="p-1 rounded-full hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" aria-label="Location selection help">
                    <Info size={16} className="text-muted-foreground" aria-hidden="true" />
                  </button>
                </HoverCardTrigger>
                <HoverCardContent className="w-64 p-3">
                  <p className="text-sm text-foreground">
                    <strong>Not within city limits?</strong> If you pay city taxes, pick your city. Otherwise, select "Pinellas County" for areas outside cities.
                  </p>
                </HoverCardContent>
              </HoverCard>
            </div>
            <p className="text-muted-foreground text-sm sm:text-base">This tells us which city's rules to follow</p>
          </div>
          
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
            <p>Pick the area where the work is happening. Different cities have different permit rules.</p>
          </div>

          {/* Jurisdiction Disclaimer */}
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 flex items-start gap-2">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <p>
              <strong>Requirements vary by jurisdiction.</strong> Verify with your local building department for the most current requirements.
            </p>
          </div>

          {/* Smart default indicator */}
          {getStoredJurisdiction() && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800 flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span>Using your last location. Tap below to change if needed.</span>
            </div>
          )}

          <div className="space-y-2 sm:space-y-3">
            {JURISDICTIONS.map((j) => (
              <button
                key={j.value}
                onClick={() => handleJurisdictionSelect(j.value)}
                className={`w-full p-3 sm:p-4 rounded-xl border-2 text-left transition-all ${
                  data.jurisdiction === j.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="font-medium text-sm sm:text-base">{j.label}</div>
                {j.value === 'PINELLAS_COUNTY' && (
                  <div className="text-xs text-muted-foreground mt-1">Areas outside city limits</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Tell us about the job</h2>
            <p className="text-muted-foreground">The more we know, the better we can help</p>
          </div>

          {/* Property Address */}
          <div>
            <label className="block text-sm font-medium mb-2">Property Address *</label>
            <input
              type="text"
              value={data.address}
              onChange={(e) => setData({ ...data, address: e.target.value })}
              placeholder="Enter property address..."
              required
              className="w-full px-4 py-3 rounded-xl border bg-background"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              Don't know the exact address? Just use "corner of Main and Oak" and we'll figure it out
            </p>
          </div>

          {/* === FIELD SET 1: Contractor Information === */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-600 text-white text-xs flex items-center justify-center">1</span>
              Contractor Information
            </h3>
            
            <div className="space-y-4">
              {/* Contractor Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Contractor/Business Name</label>
                <input
                  type="text"
                  value={data.contractorInfo?.contractorName || ''}
                  onChange={(e) => setData({ 
                    ...data, 
                    contractorInfo: { ...data.contractorInfo, contractorName: e.target.value }
                  })}
                  placeholder="Your business name..."
                  className="w-full px-4 py-3 rounded-xl border bg-background"
                />
              </div>

              {/* License Number */}
              <div>
                <label className="block text-sm font-medium mb-2">FL License Number</label>
                <input
                  type="text"
                  value={data.contractorInfo?.licenseNumber || ''}
                  onChange={(e) => setData({ 
                    ...data, 
                    contractorInfo: { ...data.contractorInfo, licenseNumber: e.target.value }
                  })}
                  placeholder="e.g., C1234567 or CBC1234567"
                  className={`w-full px-4 py-3 rounded-xl border bg-background ${
                    data.contractorInfo?.licenseNumber && !isValidFLLicense(data.contractorInfo.licenseNumber)
                      ? 'border-amber-400 focus:border-amber-500'
                      : ''
                  }`}
                />
                {data.contractorInfo?.licenseNumber && !isValidFLLicense(data.contractorInfo.licenseNumber) && (
                  <p className="text-xs text-amber-600 mt-1">
                    ⚠️ FL licenses typically start with letters (C, EC, CBC) followed by 7-10 digits
                  </p>
                )}
              </div>

              {/* Years of Experience */}
              <div>
                <label className="block text-sm font-medium mb-2">Years of Experience</label>
                <select
                  value={data.contractorInfo?.yearsExperience || ''}
                  onChange={(e) => setData({ 
                    ...data, 
                    contractorInfo: { ...data.contractorInfo, yearsExperience: e.target.value as any }
                  })}
                  className="w-full px-4 py-3 rounded-xl border bg-background"
                >
                  <option value="">Select experience level...</option>
                  <option value="0-2">0-2 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5-10">5-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>

              {/* Has Insurance */}
              <div>
                <label className="block text-sm font-medium mb-2">Do you have liability insurance?</label>
                <div className="flex gap-2">
                  {['yes', 'no'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setData({ 
                        ...data, 
                        contractorInfo: { ...data.contractorInfo, hasInsurance: option === 'yes' }
                      })}
                      className={`flex-1 px-4 py-3 rounded-xl border transition-all ${
                        data.contractorInfo?.hasInsurance === (option === 'yes')
                          ? 'bg-slate-600 text-white border-slate-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {option === 'yes' ? '✓ Yes' : '✗ No'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* === FIELD SET 2: Budget & Timeline === */}
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">2</span>
              Budget & Timeline
            </h3>
            
            <div className="space-y-4">
              {/* Estimated Project Cost */}
              <div>
                <label className="block text-sm font-medium mb-2">Estimated Project Cost</label>
                <select
                  value={data.budgetTimeline?.estimatedCost || ''}
                  onChange={(e) => setData({ 
                    ...data, 
                    budgetTimeline: { ...data.budgetTimeline, estimatedCost: e.target.value as any }
                  })}
                  className="w-full px-4 py-3 rounded-xl border bg-background"
                >
                  <option value="">Select cost range...</option>
                  <option value="<$1k">Under $1,000</option>
                  <option value="$1k-$5k">$1,000 - $5,000</option>
                  <option value="$5k-$10k">$5,000 - $10,000</option>
                  <option value="$10k-$25k">$10,000 - $25,000</option>
                  <option value="$25k+">$25,000+</option>
                </select>
              </div>

              {/* Who's Paying */}
              <div>
                <label className="block text-sm font-medium mb-2">Who's paying for this project?</label>
                <select
                  value={data.budgetTimeline?.whosPaying || ''}
                  onChange={(e) => setData({ 
                    ...data, 
                    budgetTimeline: { ...data.budgetTimeline, whosPaying: e.target.value as any }
                  })}
                  className="w-full px-4 py-3 rounded-xl border bg-background"
                >
                  <option value="">Select who's paying...</option>
                  <option value="Homeowner">Homeowner</option>
                  <option value="Contractor">Contractor</option>
                  <option value="Split">Split between both</option>
                </select>
              </div>

              {/* Desired Start Date */}
              <div>
                <label className="block text-sm font-medium mb-2">Desired Start Date</label>
                <input
                  type="date"
                  value={data.budgetTimeline?.desiredStartDate || ''}
                  onChange={(e) => setData({ 
                    ...data, 
                    budgetTimeline: { ...data.budgetTimeline, desiredStartDate: e.target.value }
                  })}
                  className="w-full px-4 py-3 rounded-xl border bg-background"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Project Duration */}
              <div>
                <label className="block text-sm font-medium mb-2">Expected Project Duration</label>
                <select
                  value={data.budgetTimeline?.projectDuration || ''}
                  onChange={(e) => setData({ 
                    ...data, 
                    budgetTimeline: { ...data.budgetTimeline, projectDuration: e.target.value as any }
                  })}
                  className="w-full px-4 py-3 rounded-xl border bg-background"
                >
                  <option value="">Select duration...</option>
                  <option value="<1 week">Less than 1 week</option>
                  <option value="1-2 weeks">1-2 weeks</option>
                  <option value="2-4 weeks">2-4 weeks</option>
                  <option value="1-2 months">1-2 months</option>
                  <option value="2+ months">2+ months</option>
                </select>
              </div>
            </div>
          </div>

          {/* === FIELD SET 3: Building Details === */}
          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
            <h3 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center">3</span>
              Building Details
            </h3>
            
            <div className="space-y-4">
              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium mb-2">Property Type</label>
                <select
                  value={data.buildingDetails?.propertyType || ''}
                  onChange={(e) => setData({ 
                    ...data, 
                    buildingDetails: { ...data.buildingDetails, propertyType: e.target.value as any }
                  })}
                  className="w-full px-4 py-3 rounded-xl border bg-background"
                >
                  <option value="">Select property type...</option>
                  <option value="Single-Family">Single-Family Home</option>
                  <option value="Condo">Condo/Apartment</option>
                  <option value="Townhouse">Townhouse</option>
                  <option value="Commercial">Commercial Building</option>
                </select>
              </div>

              {/* Number of Stories */}
              <div>
                <label className="block text-sm font-medium mb-2">Number of Stories</label>
                <select
                  value={data.buildingDetails?.numberOfStories || ''}
                  onChange={(e) => setData({ 
                    ...data, 
                    buildingDetails: { ...data.buildingDetails, numberOfStories: e.target.value as any }
                  })}
                  className="w-full px-4 py-3 rounded-xl border bg-background"
                >
                  <option value="">Select stories...</option>
                  <option value="1">1 story</option>
                  <option value="2">2 stories</option>
                  <option value="3+">3+ stories</option>
                </select>
              </div>

              {/* Year Built */}
              <div>
                <label className="block text-sm font-medium mb-2">Year Built</label>
                <input
                  type="number"
                  value={data.buildingDetails?.yearBuilt || ''}
                  onChange={(e) => {
                    const year = parseInt(e.target.value);
                    setData({ 
                      ...data, 
                      buildingDetails: { 
                        ...data.buildingDetails, 
                        yearBuilt: e.target.value ? year : undefined 
                      }
                    });
                  }}
                  placeholder="e.g., 1985"
                  min="1800"
                  max={new Date().getFullYear() + 1}
                  className={`w-full px-4 py-3 rounded-xl border bg-background ${
                    data.buildingDetails?.yearBuilt && !isValidYearBuilt(data.buildingDetails.yearBuilt)
                      ? 'border-amber-400 focus:border-amber-500'
                      : ''
                  }`}
                />
                {data.buildingDetails?.yearBuilt && !isValidYearBuilt(data.buildingDetails.yearBuilt) && (
                  <p className="text-xs text-amber-600 mt-1">
                    ⚠️ Please enter a valid year between 1800 and {new Date().getFullYear() + 1}
                  </p>
                )}
              </div>

              {/* Previous Work on This */}
              <div>
                <label className="block text-sm font-medium mb-2">Has there been previous work done on this property?</label>
                <div className="flex gap-2">
                  {['yes', 'no'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setData({ 
                        ...data, 
                        buildingDetails: { ...data.buildingDetails, previousWorkOnThis: option === 'yes' }
                      })}
                      className={`flex-1 px-4 py-3 rounded-xl border transition-all ${
                        data.buildingDetails?.previousWorkOnThis === (option === 'yes')
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-white text-green-700 border-green-200 hover:border-green-400'
                      }`}
                    >
                      {option === 'yes' ? '✓ Yes' : '✗ No'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* === FIELD SET 4: Permit History === */}
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
            <h3 className="font-semibold text-amber-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center">4</span>
              Permit History
            </h3>
            
            <div className="space-y-4">
              {/* Open Permits */}
              <div>
                <label className="block text-sm font-medium mb-2">Are there any open permits for this property?</label>
                <div className="flex flex-wrap gap-2">
                  {['yes', 'no', 'unsure'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setData({ 
                        ...data, 
                        permitHistory: { ...data.permitHistory, openPermits: option as any }
                      })}
                      className={`px-4 py-3 rounded-xl border transition-all capitalize ${
                        data.permitHistory?.openPermits === option
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-white text-amber-700 border-amber-200 hover:border-amber-400'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Known Code Violations */}
              <div>
                <label className="block text-sm font-medium mb-2">Are there any known code violations?</label>
                <div className="flex flex-wrap gap-2">
                  {['yes', 'no', 'unsure'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setData({ 
                        ...data, 
                        permitHistory: { ...data.permitHistory, knownCodeViolations: option as any }
                      })}
                      className={`px-4 py-3 rounded-xl border transition-all capitalize ${
                        data.permitHistory?.knownCodeViolations === option
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-white text-amber-700 border-amber-200 hover:border-amber-400'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Guided Questions for selected job type */}
          {data.jobType && guidedQuestions[data.jobType] && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                <h3 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center">?</span>
                  Quick Questions About Your Project
                </h3>
                <p className="text-sm text-indigo-700 mb-4">
                  Answer a few quick questions. We'll write the description for you.
                </p>
                
                <div className="space-y-4">
                  {guidedQuestions[data.jobType].map((q, index) => (
                    <div key={q.field}>
                      <label className="block text-sm font-medium text-indigo-900 mb-2">
                        {index + 1}. {q.question}
                      </label>
                      {q.options ? (
                        <div className="flex flex-wrap gap-2">
                          {q.options.map((option) => (
                            <button
                              key={option}
                              onClick={() => {
                                const newAnswers = { ...guidedAnswers, [q.field]: option };
                                setGuidedAnswers(newAnswers);
                                // Auto-build description from answers
                                const answeredQuestions = guidedQuestions[data.jobType!]
                                  .filter(gq => newAnswers[gq.field])
                                  .map(gq => `${gq.field}: ${newAnswers[gq.field]}`)
                                  .join(', ');
                                setData({ ...data, description: answeredQuestions });
                              }}
                              className={`px-3 py-2 rounded-lg text-sm border transition-all ${
                                guidedAnswers[q.field] === option
                                  ? 'bg-indigo-500 text-white border-indigo-500'
                                  : 'bg-white text-indigo-700 border-indigo-200 hover:border-indigo-400'
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={guidedAnswers[q.field] || ''}
                          onChange={(e) => {
                            const newAnswers = { ...guidedAnswers, [q.field]: e.target.value };
                            setGuidedAnswers(newAnswers);
                            // Auto-build description from answers
                            const answeredQuestions = guidedQuestions[data.jobType!]
                              .filter(gq => newAnswers[gq.field])
                              .map(gq => `${gq.field}: ${newAnswers[gq.field]}`)
                              .join(', ');
                            setData({ ...data, description: answeredQuestions });
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-indigo-200 bg-white text-sm"
                          placeholder="Type your answer..."
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Project Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {data.jobType && guidedQuestions[data.jobType] 
                ? 'Or write your own description:' 
                : 'What work are you doing? (Optional)'}
            </label>
            <textarea
              value={data.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              placeholder="Describe what needs fixing or replacing..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border bg-background resize-none"
            />
            <div className="mt-3 rounded-lg bg-muted p-3 text-sm">
              <p className="font-medium text-muted-foreground mb-2">Here's what good descriptions look like:</p>
              <ul className="space-y-1.5 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>"Old roof is leaking. Need new asphalt shingles. House is 2 stories, about 3000 sq ft"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>"Gas water heater failing. 40 gallons. Upstairs bathroom"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>"Electrical panel too old. Need 200 amp upgrade for AC unit"</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">AI-Generated Requirements</h2>
            <p className="text-muted-foreground">Based on your job details, here are the requirements:</p>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="font-medium text-primary">Requirements Analysis Complete</div>
            <p className="mt-1 text-sm text-muted-foreground">
              {requiredCount} required, {optionalCount} optional items found
            </p>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {requirements.map((req, index) => (
              <div key={req.id} className="p-3 rounded-lg border bg-card">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      req.isRequired ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{req.title}</div>
                    <div className="text-sm text-muted-foreground">{req.description}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded bg-muted capitalize">{req.category}</span>
                      {req.isRequired && <span className="text-xs text-red-500">Required</span>}
                      <span className="text-xs text-muted-foreground">{Math.round(req.confidence * 100)}% confidence</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Review & Submit</h2>
            <p className="text-muted-foreground">Review your job details before creating</p>
          </div>

          <div className="rounded-xl border bg-card p-4 space-y-4">
            {/* Job Type Section */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                {selectedJobType && <selectedJobType.icon className="h-5 w-5 text-primary" />}
              </div>
              <div>
                <div className="font-medium text-sm text-muted-foreground">Job Type</div>
                <div className="font-semibold">{selectedJobType?.label}</div>
                <div className="text-sm text-muted-foreground">{selectedJobType?.plainEnglishDescription}</div>
              </div>
            </div>

            {/* Location Section */}
            <div className="border-t pt-4">
              <div className="font-medium text-sm text-muted-foreground mb-2">Location</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-muted-foreground" />
                  <span>{data.address}</span>
                </div>
                <div className="text-sm text-muted-foreground ml-6">
                  {JURISDICTIONS.find(j => j.value === data.jurisdiction)?.label}
                </div>
              </div>
            </div>

            {/* Contractor Information Summary */}
            {(data.contractorInfo?.contractorName || data.contractorInfo?.licenseNumber) && (
              <div className="border-t pt-4">
                <div className="font-medium text-sm text-muted-foreground mb-2">Contractor Information</div>
                <div className="space-y-1 text-sm">
                  {data.contractorInfo?.contractorName && (
                    <div><span className="text-muted-foreground">Business:</span> {data.contractorInfo.contractorName}</div>
                  )}
                  {data.contractorInfo?.licenseNumber && (
                    <div><span className="text-muted-foreground">License:</span> {data.contractorInfo.licenseNumber}</div>
                  )}
                  {data.contractorInfo?.yearsExperience && (
                    <div><span className="text-muted-foreground">Experience:</span> {data.contractorInfo.yearsExperience} years</div>
                  )}
                  {data.contractorInfo?.hasInsurance !== undefined && (
                    <div><span className="text-muted-foreground">Insurance:</span> {data.contractorInfo.hasInsurance ? 'Yes ✓' : 'No ✗'}</div>
                  )}
                </div>
              </div>
            )}

            {/* Budget & Timeline Summary */}
            {(data.budgetTimeline?.estimatedCost || data.budgetTimeline?.whosPaying) && (
              <div className="border-t pt-4">
                <div className="font-medium text-sm text-muted-foreground mb-2">Budget & Timeline</div>
                <div className="space-y-1 text-sm">
                  {data.budgetTimeline?.estimatedCost && (
                    <div><span className="text-muted-foreground">Estimated Cost:</span> {data.budgetTimeline.estimatedCost}</div>
                  )}
                  {data.budgetTimeline?.whosPaying && (
                    <div><span className="text-muted-foreground">Who's Paying:</span> {data.budgetTimeline.whosPaying}</div>
                  )}
                  {data.budgetTimeline?.desiredStartDate && (
                    <div><span className="text-muted-foreground">Start Date:</span> {new Date(data.budgetTimeline.desiredStartDate).toLocaleDateString()}</div>
                  )}
                  {data.budgetTimeline?.projectDuration && (
                    <div><span className="text-muted-foreground">Duration:</span> {data.budgetTimeline.projectDuration}</div>
                  )}
                </div>
              </div>
            )}

            {/* Building Details Summary */}
            {(data.buildingDetails?.propertyType || data.buildingDetails?.yearBuilt) && (
              <div className="border-t pt-4">
                <div className="font-medium text-sm text-muted-foreground mb-2">Building Details</div>
                <div className="space-y-1 text-sm">
                  {data.buildingDetails?.propertyType && (
                    <div><span className="text-muted-foreground">Property Type:</span> {data.buildingDetails.propertyType}</div>
                  )}
                  {data.buildingDetails?.numberOfStories && (
                    <div><span className="text-muted-foreground">Stories:</span> {data.buildingDetails.numberOfStories}</div>
                  )}
                  {data.buildingDetails?.yearBuilt && (
                    <div><span className="text-muted-foreground">Year Built:</span> {data.buildingDetails.yearBuilt}</div>
                  )}
                  {data.buildingDetails?.previousWorkOnThis !== undefined && (
                    <div><span className="text-muted-foreground">Previous Work:</span> {data.buildingDetails.previousWorkOnThis ? 'Yes' : 'No'}</div>
                  )}
                </div>
              </div>
            )}

            {/* Permit History Summary */}
            {(data.permitHistory?.openPermits || data.permitHistory?.knownCodeViolations) && (
              <div className="border-t pt-4">
                <div className="font-medium text-sm text-muted-foreground mb-2">Permit History</div>
                <div className="space-y-1 text-sm">
                  {data.permitHistory?.openPermits && (
                    <div><span className="text-muted-foreground">Open Permits:</span> <span className="capitalize">{data.permitHistory.openPermits}</span></div>
                  )}
                  {data.permitHistory?.knownCodeViolations && (
                    <div><span className="text-muted-foreground">Code Violations:</span> <span className="capitalize">{data.permitHistory.knownCodeViolations}</span></div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            {data.description && (
              <div className="border-t pt-4">
                <div className="font-medium text-sm text-muted-foreground mb-2">Project Description</div>
                <p className="text-sm">{data.description}</p>
              </div>
            )}

            {/* Requirements Summary */}
            <div className="border-t pt-4">
              <div className="font-medium text-sm text-muted-foreground mb-2">Requirements</div>
              <div className="flex items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                  <span>{requirements.length} total items</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700">
                  <span>{requiredCount} required</span>
                </span>
                {optionalCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                    <span>{optionalCount} optional</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-green-50 border border-green-200 p-4">
            <div className="flex items-start gap-3">
              <Check size={20} className="text-green-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-green-900">Ready to create your job</div>
                <p className="text-sm text-green-700 mt-1">
                  We'll save your job to My Jobs and create a personalized checklist to help you get your permit.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inline Validation Error - Only shown after user clicks Next with incomplete fields */}
      {showValidationError && !canProceed() && step < 4 && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-700 flex items-center gap-2">
            <Info size={14} />
            Please complete all required fields to continue
          </p>
        </div>
      )}

      <div className="flex justify-between mt-8">
        <Button 
          variant="secondary" 
          onClick={handleBack} 
          disabled={step === 1 || createState === 'creating'}
          className="transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Go back to previous step"
        >
          <ArrowLeft size={18} className="mr-2" aria-hidden="true" />
          Back
        </Button>

        {step < 4 ? (
          <Button 
            onClick={handleNext} 
            disabled={!canProceed() || isAnalyzing} 
            loading={isAnalyzing}
            className={`transition-all ${!canProceed() ? 'opacity-50' : 'hover:scale-105 active:scale-95'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`}
            aria-label="Continue to next step"
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" aria-hidden="true" />
                Analyzing...
              </>
            ) : (
              <>
                Next
                <ArrowRight size={18} className="ml-2" aria-hidden="true" />
              </>
            )}
          </Button>
        ) : (
          <Button 
            onClick={handleComplete} 
            variant="primary" 
            loading={createState === 'creating'} 
            disabled={createState === 'created'}
            className={`transition-all ${createState === 'created' ? 'bg-green-600 hover:bg-green-600' : 'hover:scale-105 active:scale-95'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`}
            aria-label={createState === 'created' ? "Job created successfully" : "Create job and generate checklist"}
          >
            {createState === 'creating' ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" aria-hidden="true" />
                Creating...
              </>
            ) : createState === 'created' ? (
              <>
                <Check size={18} className="mr-2" aria-hidden="true" />
                Created!
              </>
            ) : (
              <>
                <Check size={18} className="mr-2" aria-hidden="true" />
                Create Job
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
