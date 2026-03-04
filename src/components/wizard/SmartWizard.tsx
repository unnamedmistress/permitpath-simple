import { useState, useMemo } from 'react';
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
  MapPin,
  HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { JobType, Jurisdiction, Requirement, ContractorInfo, BudgetTimeline, BuildingDetails, PermitHistory, WorkerType } from '@/types/permit';
import { getRequirementsForJob } from '@/services/requirements';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { 
  getQuestionsForJobType, 
  hasJobSpecificQuestions, 
  validateFLLicense,
  getClarificationPrompts,
  shouldShowQuestion,
  JobQuestion,
  generateJobDescription
} from '@/data/jobQuestions';

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
  workerType?: WorkerType;
  contractorInfo?: ContractorInfo;
  budgetTimeline?: BudgetTimeline;
  buildingDetails?: BuildingDetails;
  permitHistory?: PermitHistory;
  jobSpecificAnswers?: Record<string, string | boolean | number>;
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

// CONSOLIDATED JOB TYPES - Removed ambiguous duplicates
const JOB_TYPE_CATEGORIES: JobTypeCategory[] = [
  {
    key: 'roofing',
    label: 'Roofing',
    icon: House,
    options: [
      { value: 'RE_ROOFING', label: 'Roof Replacement', description: 'Full roof replacement - new shingles/tiles on entire roof', plainEnglishDescription: 'Taking off old roof and installing new shingles or tiles', timeline: '2-3 weeks', costEstimate: '$8,000 - $15,000', keywords: ['reroof', 'roofing', 'shingles', 'tiles', 'new roof'] },
      { value: 'ROOF_REPAIR', label: 'Roof Repair', description: 'Patch or repair specific areas - fixes leaks and damage', plainEnglishDescription: 'Fixing leaks, damaged shingles, or small roof areas', timeline: '1-2 days', costEstimate: '$300 - $1,500', keywords: ['shingle', 'leak', 'repair', 'patch', 'fix'] }
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
      { value: 'WATER_HEATER', label: 'Water Heater', description: 'Install or replace water heater (gas or electric)', plainEnglishDescription: 'Installing new hot water tank or tankless heater', timeline: '3-6 hours', costEstimate: '$800 - $2,500', keywords: ['tankless', 'heater', 'hot water'] },
      { value: 'PLUMBING_MAIN_LINE', label: 'Plumbing Main Line', description: 'Replace main water or sewer line', plainEnglishDescription: 'Fixing the main pipe to your house', timeline: '1-3 days', costEstimate: '$2,000 - $5,000', keywords: ['main line', 'sewer'] },
      { value: 'SMALL_BATH_REMODEL', label: 'Bathroom Remodel', description: 'Update bathroom fixtures, vanity, toilet, shower', plainEnglishDescription: 'Updating bathroom fixtures, vanity, or shower', timeline: '1-2 weeks', costEstimate: '$3,000 - $8,000', keywords: ['bath', 'bathroom', 'vanity', 'shower', 'toilet'] }
    ]
  },
  {
    key: 'electrical',
    label: 'Electrical',
    icon: Zap,
    options: [
      { value: 'ELECTRICAL_PANEL', label: 'Electrical Panel', description: 'Upgrade or replace electrical panel/box', plainEnglishDescription: 'Upgrading your home\'s electrical box for more power', timeline: '1 day', costEstimate: '$1,200 - $3,000', keywords: ['service', 'breaker', 'panel', 'electrical box'] },
      { value: 'ELECTRICAL_REWIRING', label: 'Electrical Rewiring', description: 'Rewire circuits or add new wiring', plainEnglishDescription: 'Replacing old electrical wires in your home', timeline: '3-7 days', costEstimate: '$3,000 - $8,000', keywords: ['rewire', 'wiring', 'circuits'] },
      { value: 'EV_CHARGER', label: 'EV Charger', description: 'Install electric vehicle charging station', plainEnglishDescription: 'Adding 240V plug for electric car charging', timeline: '4-8 hours', costEstimate: '$500 - $2,000', keywords: ['tesla', 'charger', '240v', 'electric car'] },
      { value: 'GENERATOR_INSTALL', label: 'Generator', description: 'Install standby backup generator', plainEnglishDescription: 'Installing backup power for outages', timeline: '1-2 days', costEstimate: '$3,000 - $8,000', keywords: ['backup power', 'transfer switch'] }
    ]
  },
  {
    key: 'exterior',
    label: 'Exterior',
    icon: Fence,
    options: [
      { value: 'WINDOW_DOOR_REPLACEMENT', label: 'Window/Door Replacement', description: 'Replace windows or exterior doors', plainEnglishDescription: 'Installing new windows or exterior doors', timeline: '1-3 days', costEstimate: '$300 - $1,000 per window', keywords: ['impact', 'hurricane', 'windows', 'doors'] },
      { value: 'SIDING_EXTERIOR', label: 'Siding/Exterior', description: 'Replace siding or exterior cladding', plainEnglishDescription: 'New outside covering for your house', timeline: '1-2 weeks', costEstimate: '$5,000 - $15,000', keywords: ['cladding', 'facade'] },
      { value: 'DECK_INSTALLATION', label: 'Deck Installation', description: 'Build a new deck or replace existing', plainEnglishDescription: 'Building outdoor deck or patio structure', timeline: '3-7 days', costEstimate: '$4,000 - $12,000', keywords: ['deck', 'outdoor', 'patio'] },
      { value: 'FENCE_INSTALLATION', label: 'Fence Installation', description: 'Install perimeter fencing', plainEnglishDescription: 'Putting up fence around property', timeline: '1-3 days', costEstimate: '$2,000 - $6,000', keywords: ['fence', 'gate'] }
    ]
  },
  {
    key: 'remodeling',
    label: 'Remodeling',
    icon: Paintbrush,
    options: [
      { value: 'KITCHEN_REMODEL', label: 'Kitchen Remodel', description: 'Update cabinets, countertops, appliances, or full kitchen', plainEnglishDescription: 'Updating kitchen cabinets, counters, or appliances', timeline: '2-6 weeks', costEstimate: '$10,000 - $30,000', keywords: ['kitchen', 'remodel', 'cabinets', 'countertops'] },
      { value: 'ROOM_ADDITION', label: 'Room Addition', description: 'Add new room or expand square footage', plainEnglishDescription: 'Adding new room to your house', timeline: '4-8 weeks', costEstimate: '$20,000 - $60,000', keywords: ['addition', 'expansion'] }
    ]
  },
  {
    key: 'safety',
    label: 'Safety',
    icon: Shield,
    options: [
      { value: 'POOL_BARRIER', label: 'Pool Barrier', description: 'Install pool safety fence or barrier', plainEnglishDescription: 'Safety fence around swimming pool', timeline: '1-2 days', costEstimate: '$1,500 - $4,000', keywords: ['pool', 'barrier', 'safety', 'fence'] }
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
  Structural: 'bg-steel/10 text-steel border-steel/20'
};

// CLARIFIED JURISDICTIONS - Better descriptions
const JURISDICTIONS: { value: Jurisdiction; label: string; description: string }[] = [
  { value: 'PINELLAS_COUNTY', label: 'Unincorporated Pinellas County', description: 'Areas outside city limits (subdivisions, rural areas)' },
  { value: 'ST_PETERSBURG', label: 'City of St. Petersburg', description: 'Within St. Petersburg city limits' },
  { value: 'CLEARWATER', label: 'City of Clearwater', description: 'Within Clearwater city limits' },
  { value: 'LARGO', label: 'City of Largo', description: 'Within Largo city limits' },
  { value: 'PALM_HARBOR', label: 'Palm Harbor / East Lake area', description: 'Unincorporated Pinellas County near Palm Harbor' }
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
  
  const defaultJurisdiction = initialData?.jurisdiction || getStoredJurisdiction() || 'PINELLAS_COUNTY';
  
  const [data, setData] = useState<Partial<WizardData>>({
    jobType: initialData?.jobType,
    jurisdiction: defaultJurisdiction,
    address: initialData?.address || '',
    description: initialData?.description || '',
    workerType: initialData?.workerType || 'homeowner-diy',
    contractorInfo: initialData?.contractorInfo || {},
    budgetTimeline: initialData?.budgetTimeline || {},
    buildingDetails: initialData?.buildingDetails || {},
    permitHistory: initialData?.permitHistory || {},
    jobSpecificAnswers: initialData?.jobSpecificAnswers || {}
  });
  const [requirements, setRequirements] = useState<Requirement[]>(initialData?.requirements || []);
  const selectedJobType = JOB_TYPE_OPTIONS.find((option) => option.value === data.jobType);
  const totalSteps = 5;

  const requiredCount = requirements.filter((req) => req.isRequired).length;
  const optionalCount = requirements.length - requiredCount;

  const jobSpecificQuestions = data.jobType ? getQuestionsForJobType(data.jobType) : [];
  const hasJobQuestions = hasJobSpecificQuestions(data.jobType || '');

  const handleNext = async () => {
    if (!canProceed()) {
      setShowValidationError(true);
      return;
    }
    
    if (step === 3) {
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
      workerType: data.workerType || 'homeowner-diy',
      contractorInfo: data.contractorInfo,
      budgetTimeline: data.budgetTimeline,
      buildingDetails: data.buildingDetails,
      permitHistory: data.permitHistory,
      jobSpecificAnswers: data.jobSpecificAnswers
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

  const licenseValidation = data.contractorInfo?.licenseNumber 
    ? validateFLLicense(data.contractorInfo.licenseNumber)
    : { valid: true };

  const clarificationPrompts = getClarificationPrompts({
    description: data.description,
    address: data.address
  });

  // NEW: Filter questions based on job context
  const getFilteredQuestions = () => {
    const answers = data.jobSpecificAnswers || {};
    
    return jobSpecificQuestions.filter(q => {
      // Skip electrical question if work scope doesn't include electrical
      if (q.id === 'electricalWork' && data.jobType === 'KITCHEN_REMODEL') {
        const workScope = answers.workScope as string[] || [];
        // Only show electrical if not doing cabinets-only
        if (workScope.includes('Cabinets only') && workScope.length === 1) {
          return false;
        }
      }
      
      // Skip appliance questions if no appliances selected
      if (q.id === 'applianceTypes' && data.jobType === 'KITCHEN_REMODEL') {
        return answers.applianceChanges === true;
      }
      
      return shouldShowQuestion(q, answers);
    });
  };

  const renderJobQuestion = (question: JobQuestion) => {
    const answers = data.jobSpecificAnswers || {};
    
    // Check if question should be shown based on context
    if (!getFilteredQuestions().find(q => q.id === question.id)) {
      return null;
    }

    const value = answers[question.id];

    const updateAnswer = (val: string | boolean | number | string[]) => {
      const newAnswers = {
        ...answers,
        [question.id]: val
      };
      
      // Auto-update description when work scope changes
      if (question.id === 'workScope' && data.jobType) {
        const newDescription = generateJobDescription(data.jobType, newAnswers);
        if (newDescription) {
          setData({
            ...data,
            jobSpecificAnswers: newAnswers,
            description: newDescription
          });
          return;
        }
      }
      
      setData({
        ...data,
        jobSpecificAnswers: newAnswers
      });
    };

    return (
      <div key={question.id} className="space-y-2">
        <div className="flex items-center gap-2">
          <label className="block text-sm font-medium text-charcoal">{question.question}</label>
          {question.required && <span className="text-crimson">*</span>}
          {question.helpText && (
            <HoverCard>
              <HoverCardTrigger asChild>
                <button className="p-0.5 rounded-full hover:bg-sky transition-colors">
                  <HelpCircle size={14} className="text-steel" />
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="w-64 p-2">
                <p className="text-xs text-charcoal">{question.helpText}</p>
              </HoverCardContent>
            </HoverCard>
          )}
        </div>

        {question.type === 'radio' && question.options && (
          <div className="flex flex-wrap gap-2">
            {question.options.map((option) => (
              <button
                key={option}
                onClick={() => updateAnswer(option)}
                className={`px-3 py-2 rounded-lg text-sm border transition-all ${
                  value === option
                    ? 'bg-blueprint text-white border-blueprint'
                    : 'bg-white text-charcoal border-lightGray hover:border-blueprint/50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {question.type === 'multiselect' && question.options && (
          <div className="flex flex-wrap gap-2">
            {question.options.map((option) => {
              const values = (value as string[]) || [];
              const isSelected = values.includes(option);
              return (
                <button
                  key={option}
                  onClick={() => {
                    const newValues = isSelected
                      ? values.filter(v => v !== option)
                      : [...values, option];
                    updateAnswer(newValues);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm border transition-all ${
                    isSelected
                      ? 'bg-blueprint text-white border-blueprint'
                      : 'bg-white text-charcoal border-lightGray hover:border-blueprint/50'
                  }`}
                >
                  {isSelected ? '✓ ' : ''}{option}
                </button>
              );
            })}
          </div>
        )}

        {question.type === 'toggle' && (
          <div className="flex gap-2">
            {[
              { label: 'Yes', val: true },
              { label: 'No', val: false }
            ].map(({ label, val }) => (
              <button
                key={label}
                onClick={() => updateAnswer(val)}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  value === val
                    ? 'bg-blueprint text-white border-blueprint'
                    : 'bg-white text-charcoal border-lightGray hover:border-blueprint/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {question.type === 'dropdown' && question.options && (
          <select
            value={value as string || ''}
            onChange={(e) => updateAnswer(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-lightGray bg-white text-charcoal focus:border-blueprint focus:ring-2 focus:ring-blueprint/20"
          >
            <option value="">Select...</option>
            {question.options.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        )}

        {question.type === 'number' && (
          <input
            type="number"
            value={value as number || ''}
            onChange={(e) => updateAnswer(parseInt(e.target.value) || 0)}
            placeholder={question.placeholder}
            className="w-full px-3 py-2 rounded-lg border border-lightGray bg-white text-charcoal focus:border-blueprint focus:ring-2 focus:ring-blueprint/20"
          />
        )}

        {question.type === 'text' && (
          <input
            type="text"
            value={value as string || ''}
            onChange={(e) => updateAnswer(e.target.value)}
            placeholder={question.placeholder}
            className="w-full px-3 py-2 rounded-lg border border-lightGray bg-white text-charcoal focus:border-blueprint focus:ring-2 focus:ring-blueprint/20"
          />
        )}

        {question.warningMessage && value && question.followUpCondition === 'true' && value === true && (
          <div className="mt-2 p-3 bg-safetyOrange/10 border border-safetyOrange/20 rounded-lg">
            <p className="text-sm text-safetyOrange">{question.warningMessage}</p>
          </div>
        )}
      </div>
    );
  };

  // Get examples based on selected job type
  const getDescriptionExamples = () => {
    const jobType = data.jobType;
    
    if (jobType?.includes('KITCHEN')) {
      return [
        'Replacing cabinets and countertops. Keeping existing appliances and plumbing locations.',
        'Full kitchen remodel: new cabinets, quartz counters, gas range, and island.',
        'Updating to shaker cabinets and granite counters. No plumbing changes.'
      ];
    }
    
    if (jobType?.includes('BATH')) {
      return [
        'Replacing vanity, toilet, and flooring. Keeping shower in same location.',
        'Full bathroom gut: moving plumbing for new layout, new tub, tile.',
        'Updating vanity and mirror only. Painting existing cabinets.'
      ];
    }
    
    if (jobType?.includes('ROOF')) {
      return [
        'Old roof is leaking. Need new asphalt shingles. House is 2 stories, about 3000 sq ft',
        'Full roof replacement with architectural shingles. Wind mitigation upgrade.',
        'Repairing damaged shingles from storm. About 200 sq ft area.'
      ];
    }
    
    if (jobType?.includes('ELECTRICAL')) {
      return [
        'Electrical panel too old. Need 200 amp upgrade for AC unit',
        'Adding EV charger circuit in garage. Panel has space.',
        'Rewiring kitchen circuits for new appliances and outlets.'
      ];
    }
    
    if (jobType?.includes('DECK')) {
      return [
        'Building new 12x16 deck attached to house. Wood composite decking.',
        'Replacing existing deck boards. Keeping existing structure.',
        'Adding covered deck with roof tie-in to existing house.'
      ];
    }
    
    // Default examples
    return [
      'Old roof is leaking. Need new asphalt shingles. House is 2 stories, about 3000 sq ft',
      'Gas water heater failing. 40 gallons. Upstairs bathroom',
      'Electrical panel too old. Need 200 amp upgrade for AC unit'
    ];
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-6">
      {createState === 'failed' && createError && (
        <div className="mb-6 rounded-xl border border-crimson/30 bg-crimson/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-crimson" />
            <div className="flex-1">
              <p className="font-semibold text-crimson">We could not open your checklist.</p>
              <p className="mt-1 text-sm text-crimson/80">{createError}</p>
            </div>
            <Button variant="outline" size="sm" onClick={onRetryCreate}>
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Clarification Prompts */}
      {clarificationPrompts.length > 0 && step === 3 && (
        <div className="mb-4 p-4 bg-blueprint/5 border border-blueprint/20 rounded-xl">
          <div className="flex items-start gap-2">
            <Info size={18} className="text-blueprint shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blueprint text-sm">We need a bit more information:</p>
              <ul className="mt-2 space-y-1">
                {clarificationPrompts.map((prompt, idx) => (
                  <li key={idx} className="text-sm text-blueprint/80">• {prompt}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {['Job Type', 'Location', 'Details', 'Requirements', 'Review'].map((label, index) => (
            <div
              key={label}
              className={`text-xs font-medium ${index + 1 <= step ? 'text-blueprint' : 'text-steel'}`}
            >
              {label}
            </div>
          ))}
        </div>
        <div className="h-2 bg-sky rounded-full overflow-hidden">
          <div 
            className="h-full bg-blueprint transition-all duration-300" 
            style={{ width: `${(step / totalSteps) * 100}%` }} 
          />
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4 sm:space-y-6">
          {/* UPL Disclaimer */}
          <div className="rounded-lg bg-safetyOrange/10 border border-safetyOrange/20 p-3 text-sm text-safetyOrange">
            <p>
              <strong>Notice:</strong> This tool provides general information only and does not constitute legal advice. Always consult with a qualified professional for your specific situation.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-semibold text-charcoal">What type of work?</h2>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <button className="p-1 rounded-full hover:bg-sky transition-colors" aria-label="Job type selection help">
                    <Info size={16} className="text-steel" aria-hidden="true" />
                  </button>
                </HoverCardTrigger>
                <HoverCardContent className="w-72 p-3">
                  <p className="text-sm text-charcoal">
                    Not sure which to pick? <strong>Roof Replacement</strong> means new shingles/tiles. <strong>Roof Repair</strong> means patching leaks. When in doubt, describe your project and we'll help.
                  </p>
                </HoverCardContent>
              </HoverCard>
            </div>
            <p className="text-steel text-sm sm:text-base">Pick the job that best matches your project</p>
          </div>
          
          {selectedJobType && (
            <div className="rounded-xl border border-blueprint/20 bg-sky p-4">
              <div className="flex items-start gap-3">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${CATEGORY_STYLES[selectedJobType.category]}`}>
                  <selectedJobType.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-charcoal">{selectedJobType.label}</h3>
                  <p className="text-sm text-steel mt-0.5">{selectedJobType.plainEnglishDescription}</p>
                  <div className="flex flex-wrap gap-3 mt-3 text-xs">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky text-blueprint">
                      <span className="font-medium">How long:</span> {selectedJobType.timeline}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-forest/10 text-forest">
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
                className="w-full rounded-2xl border border-lightGray bg-white px-4 py-3 text-left transition-all hover:border-blueprint/50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blueprint focus-visible:ring-offset-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex items-center gap-3">
                    {selectedJobType ? (
                      <>
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${CATEGORY_STYLES[selectedJobType.category]}`} aria-hidden="true">
                          <selectedJobType.icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-charcoal truncate">{selectedJobType.label}</div>
                          <div className="text-sm text-steel truncate">{selectedJobType.description}</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blueprint/20 bg-sky text-blueprint" aria-hidden="true">
                          <ChevronDown className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-charcoal">Choose job type</div>
                          <div className="text-sm text-steel">Search or browse categories</div>
                        </div>
                      </>
                    )}
                  </div>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-steel transition-transform ${isJobTypeOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" sideOffset={8} className="w-[min(var(--radix-popover-trigger-width),95vw)] rounded-2xl border border-lightGray p-0 shadow-xl">
              <Command>
                <CommandInput placeholder="Search job type or keyword..." className="h-12 text-base" />
                <CommandList className="max-h-[60vh] overflow-y-auto">
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
                            className="group items-start gap-3 rounded-lg py-2.5 transition-all data-[selected=true]:bg-blueprint/10"
                          >
                            <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${CATEGORY_STYLES[category.label]}`}>
                              <CategoryIcon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium leading-tight text-charcoal">{type.label}</div>
                              <div className="text-xs text-steel leading-tight mt-0.5">{type.plainEnglishDescription}</div>
                            </div>
                            <Check className={`h-4 w-4 shrink-0 transition-opacity ${data.jobType === type.value ? 'opacity-100 text-blueprint' : 'opacity-0'}`} />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    );
                  })}
                  {/* FIXED: Only show empty state when no categories match */}
                  <CommandEmpty className="py-6 text-center text-sm text-steel">
                    <div className="flex flex-col items-center gap-2">
                      <SearchX className="h-8 w-8 text-steel/50" />
                      <p>No job type found matching your search.</p>
                      <p className="text-xs text-steel/70">Try different keywords like "roof", "electrical", or "kitchen"</p>
                    </div>
                  </CommandEmpty>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 sm:space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-semibold text-charcoal">Where is this job?</h2>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <button className="p-1 rounded-full hover:bg-sky transition-colors" aria-label="Location selection help">
                    <Info size={16} className="text-steel" aria-hidden="true" />
                  </button>
                </HoverCardTrigger>
                <HoverCardContent className="w-72 p-3">
                  <p className="text-sm text-charcoal">
                    <strong>Not sure?</strong> Check your property tax bill or enter your address at <a href="https://www.pinellas.gov/topic/what-jurisdiction/" target="_blank" rel="noopener noreferrer" className="text-blueprint underline">pinellas.gov/what-jurisdiction</a>
                  </p>
                </HoverCardContent>
              </HoverCard>
            </div>
            <p className="text-steel text-sm sm:text-base">This tells us which building department handles your permits</p>
          </div>
          
          <div className="rounded-lg bg-blueprint/5 border border-blueprint/20 p-3 text-sm text-blueprint">
            <p><strong>How to choose:</strong> If you pay city taxes to St. Pete, Clearwater, or Largo, pick your city. Otherwise, select "Unincorporated Pinellas County" for areas outside cities.</p>
          </div>

          {/* Jurisdiction Disclaimer */}
          <div className="rounded-lg bg-safetyOrange/10 border border-safetyOrange/20 p-3 text-sm text-safetyOrange flex items-start gap-2">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
            <p>
              <strong>Requirements vary by jurisdiction.</strong> Verify with your local building department for the most current requirements.
            </p>
          </div>

          {/* Smart default indicator */}
          {getStoredJurisdiction() && (
            <div className="rounded-lg bg-forest/10 border border-forest/20 p-3 text-sm text-forest flex items-center gap-2">
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
                  data.jurisdiction === j.value ? 'border-blueprint bg-sky' : 'border-lightGray hover:border-blueprint/50'
                }`}
              >
                <div className="font-medium text-sm sm:text-base text-charcoal">{j.label}</div>
                <div className="text-xs text-steel mt-1">{j.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-charcoal">Tell us about the job</h2>
            <p className="text-steel">
              {data.workerType === 'homeowner-diy' 
                ? 'Just the basics — about 9 fields' 
                : 'Complete project details'}
              <span className="text-steel/60"> — all fields are optional except address</span>
            </p>
          </div>

          {/* Worker Type Selection - FIRST QUESTION */}
          <div className="p-5 bg-blueprint/5 rounded-xl border border-blueprint/20">
            <h3 className="font-semibold text-charcoal mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blueprint text-white text-xs flex items-center justify-center">1</span>
              Who's doing this work? <span className="text-crimson">*</span>
            </h3>
            <p className="text-sm text-steel mb-4">
              This helps us show you only the fields that matter for your situation.
            </p>
            
            <div className="space-y-2">
              {[
                { value: 'homeowner-diy', label: "I'm a homeowner doing this work myself", desc: "Skip contractor fields — just the basics" },
                { value: 'homeowner-hiring', label: "I'm a homeowner hiring a contractor", desc: "Include contractor details and timeline" },
                { value: 'contractor', label: "I'm a contractor", desc: "Full form with business details" }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setData({ ...data, workerType: option.value as WorkerType })}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    data.workerType === option.value
                      ? 'border-blueprint bg-blueprint/10'
                      : 'border-lightGray hover:border-blueprint/50'
                  }`}
                >
                  <div className="font-medium text-charcoal">{option.label}</div>
                  <div className="text-sm text-steel mt-1">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Property Address */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Property Address <span className="text-crimson">*</span>
            </label>
            <input
              type="text"
              value={data.address}
              onChange={(e) => setData({ ...data, address: e.target.value })}
              placeholder="Enter property address..."
              required
              className="w-full px-4 py-3 rounded-xl border border-lightGray bg-white text-charcoal focus:border-blueprint focus:ring-2 focus:ring-blueprint/20"
            />
            <p className="text-xs text-steel mt-1.5">
              Don't know the exact address? Just use "corner of Main and Oak" and we'll figure it out
            </p>
          </div>

          {/* Job-Specific Questions */}
          {hasJobQuestions && jobSpecificQuestions.length > 0 && (
            <div className="p-5 bg-purple-50 rounded-xl border border-purple-200">
              <h3 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center">📝</span>
                {selectedJobType?.label} Details
              </h3>
              <p className="text-sm text-purple-700 mb-4">
                These questions help us determine the exact permit requirements for your project.
              </p>
              
              <div className="space-y-4">
                {jobSpecificQuestions.map((question) => renderJobQuestion(question))}
              </div>
            </div>
          )}

          {/* Contractor Information - ONLY SHOW IF HIRING OR CONTRACTOR */}
          {(data.workerType === 'homeowner-hiring' || data.workerType === 'contractor') && (
            <div className="p-5 bg-sky rounded-xl border border-lightGray">
              <h3 className="font-semibold text-charcoal mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blueprint text-white text-xs flex items-center justify-center">
                  {data.workerType === 'homeowner-hiring' ? '2' : '2'}
                </span>
                Contractor Information <span className="text-steel text-sm font-normal">— optional</span>
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Contractor/Business Name</label>
                  <input
                    type="text"
                    value={data.contractorInfo?.contractorName || ''}
                    onChange={(e) => setData({ 
                      ...data, 
                      contractorInfo: { ...data.contractorInfo, contractorName: e.target.value }
                    })}
                    placeholder="Your business name..."
                    className="w-full px-4 py-3 rounded-xl border border-lightGray bg-white text-charcoal focus:border-blueprint focus:ring-2 focus:ring-blueprint/20"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-sm font-medium text-charcoal">FL License Number</label>
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <button className="p-0.5 rounded-full hover:bg-sky transition-colors">
                          <HelpCircle size={14} className="text-steel" />
                        </button>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-72 p-3">
                        <p className="text-sm text-charcoal">
                          FL contractor licenses are 7-10 digits with 1-3 letter prefix.<br/>
                          Examples: <code className="bg-sky px-1 rounded">C1234567</code>, <code className="bg-sky px-1 rounded">EC12345678</code>, <code className="bg-sky px-1 rounded">CBC1234567</code>
                        </p>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                  <input
                    type="text"
                    value={data.contractorInfo?.licenseNumber || ''}
                    onChange={(e) => setData({ 
                      ...data, 
                      contractorInfo: { ...data.contractorInfo, licenseNumber: e.target.value.toUpperCase() }
                    })}
                    placeholder="e.g., C1234567 or CBC1234567"
                    className={`w-full px-4 py-3 rounded-xl border bg-white text-charcoal focus:ring-2 ${
                      !licenseValidation.valid && data.contractorInfo?.licenseNumber
                        ? 'border-crimson focus:border-crimson focus:ring-crimson/20'
                        : data.contractorInfo?.licenseNumber && licenseValidation.valid
                          ? 'border-forest focus:border-forest focus:ring-forest/20'
                          : 'border-lightGray focus:border-blueprint focus:ring-blueprint/20'
                    }`}
                  />
                  {!licenseValidation.valid && data.contractorInfo?.licenseNumber && (
                    <p className="text-xs text-crimson mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {licenseValidation.message}
                    </p>
                  )}
                  {licenseValidation.valid && data.contractorInfo?.licenseNumber && (
                    <p className="text-xs text-forest mt-1 flex items-center gap-1">
                      <Check size={12} />
                      Valid FL license format
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Years of Experience</label>
                  <select
                    value={data.contractorInfo?.yearsExperience || ''}
                    onChange={(e) => setData({ 
                      ...data, 
                      contractorInfo: { ...data.contractorInfo, yearsExperience: e.target.value as any }
                    })}
                    className="w-full px-4 py-3 rounded-xl border border-lightGray bg-white text-charcoal focus:border-blueprint focus:ring-2 focus:ring-blueprint/20"
                  >
                    <option value="">Select experience level...</option>
                    <option value="0-2">0-2 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5-10">5-10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Do you have liability insurance?</label>
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
                            ? 'bg-blueprint text-white border-blueprint'
                            : 'bg-white text-charcoal border-lightGray hover:border-blueprint/50'
                        }`}
                      >
                        {option === 'yes' ? '✓ Yes' : '✗ No'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Budget & Timeline - ONLY SHOW IF HIRING OR CONTRACTOR */}
          {(data.workerType === 'homeowner-hiring' || data.workerType === 'contractor') && (
            <div className="p-5 bg-sky rounded-xl border border-lightGray">
              <h3 className="font-semibold text-charcoal mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blueprint text-white text-xs flex items-center justify-center">3</span>
                Budget & Timeline <span className="text-steel text-sm font-normal">— optional</span>
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Estimated Project Cost</label>
                  <select
                    value={data.budgetTimeline?.estimatedCost || ''}
                    onChange={(e) => setData({ 
                      ...data, 
                      budgetTimeline: { ...data.budgetTimeline, estimatedCost: e.target.value as any }
                    })}
                    className="w-full px-4 py-3 rounded-xl border border-lightGray bg-white text-charcoal focus:border-blueprint focus:ring-2 focus:ring-blueprint/20"
                  >
                    <option value="">Select cost range...</option>
                    <option value="<$1k">Under $1,000</option>
                    <option value="$1k-$5k">$1,000 - $5,000</option>
                    <option value="$5k-$10k">$5,000 - $10,000</option>
                    <option value="$10k-$25k">$10,000 - $25,000</option>
                    <option value="$25k+">$25,000+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Desired Start Date</label>
                  <input
                    type="date"
                    value={data.budgetTimeline?.desiredStartDate || ''}
                    onChange={(e) => setData({ 
                      ...data, 
                      budgetTimeline: { ...data.budgetTimeline, desiredStartDate: e.target.value }
                    })}
                    className="w-full px-4 py-3 rounded-xl border border-lightGray bg-white text-charcoal focus:border-blueprint focus:ring-2 focus:ring-blueprint/20"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">Expected Project Duration</label>
                  <select
                    value={data.budgetTimeline?.projectDuration || ''}
                    onChange={(e) => setData({ 
                      ...data, 
                      budgetTimeline: { ...data.budgetTimeline, projectDuration: e.target.value as any }
                    })}
                    className="w-full px-4 py-3 rounded-xl border border-lightGray bg-white text-charcoal focus:border-blueprint focus:ring-2 focus:ring-blueprint/20"
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
          )}

          {/* Building Details */}
          <div className="p-5 bg-forest/5 rounded-xl border border-forest/20">
            <h3 className="font-semibold text-forest mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-forest text-white text-xs flex items-center justify-center">
                {data.workerType === 'homeowner-diy' ? '2' : '4'}
              </span>
              Building Details <span className="text-forest/70 text-sm font-normal">— optional</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Property Type</label>
                <select
                  value={data.buildingDetails?.propertyType || ''}
                  onChange={(e) => setData({ 
                    ...data, 
                    buildingDetails: { ...data.buildingDetails, propertyType: e.target.value as any }
                  })}
                  className="w-full px-4 py-3 rounded-xl border border-lightGray bg-white text-charcoal focus:border-forest focus:ring-2 focus:ring-forest/20"
                >
                  <option value="">Select property type...</option>
                  <option value="Single-Family">Single-Family Home</option>
                  <option value="Condo">Condo/Apartment</option>
                  <option value="Townhouse">Townhouse</option>
                  <option value="Commercial">Commercial Building</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Number of Stories</label>
                <select
                  value={data.buildingDetails?.numberOfStories || ''}
                  onChange={(e) => setData({ 
                    ...data, 
                    buildingDetails: { ...data.buildingDetails, numberOfStories: e.target.value as any }
                  })}
                  className="w-full px-4 py-3 rounded-xl border border-lightGray bg-white text-charcoal focus:border-forest focus:ring-2 focus:ring-forest/20"
                >
                  <option value="">Select stories...</option>
                  <option value="1">1 story</option>
                  <option value="2">2 stories</option>
                  <option value="3+">3+ stories</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Year Built</label>
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
                  className={`w-full px-4 py-3 rounded-xl border bg-white text-charcoal focus:ring-2 ${
                    data.buildingDetails?.yearBuilt && !isValidYearBuilt(data.buildingDetails.yearBuilt)
                      ? 'border-safetyOrange focus:border-safetyOrange focus:ring-safetyOrange/20'
                      : 'border-lightGray focus:border-forest focus:ring-forest/20'
                  }`}
                />
                {data.buildingDetails?.yearBuilt && !isValidYearBuilt(data.buildingDetails.yearBuilt) && (
                  <p className="text-xs text-safetyOrange mt-1">
                    ⚠️ Please enter a valid year between 1800 and {new Date().getFullYear() + 1}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Has there been previous work done on this property?</label>
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
                          ? 'bg-forest text-white border-forest'
                          : 'bg-white text-charcoal border-lightGray hover:border-forest/50'
                      }`}
                    >
                      {option === 'yes' ? '✓ Yes' : '✗ No'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Permit History */}
          <div className="p-5 bg-safetyOrange/5 rounded-xl border border-safetyOrange/20">
            <h3 className="font-semibold text-safetyOrange mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-safetyOrange text-white text-xs flex items-center justify-center">
                {data.workerType === 'homeowner-diy' ? '3' : '5'}
              </span>
              Permit History <span className="text-safetyOrange/70 text-sm font-normal">— optional</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Are there any open permits for this property?</label>
                <div className="flex flex-wrap gap-2">
                  {['yes', 'no', 'unsure'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setData({ 
                        ...data, 
                        permitHistory: { ...data.permitHistory, openPermits: option as any }
                      })}
                      className={`px-4 py-2 rounded-xl border transition-all capitalize ${
                        data.permitHistory?.openPermits === option
                          ? 'bg-safetyOrange text-white border-safetyOrange'
                          : 'bg-white text-charcoal border-lightGray hover:border-safetyOrange/50'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">Are there any known code violations?</label>
                <div className="flex flex-wrap gap-2">
                  {['yes', 'no', 'unsure'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setData({ 
                        ...data, 
                        permitHistory: { ...data.permitHistory, knownCodeViolations: option as any }
                      })}
                      className={`px-4 py-2 rounded-xl border transition-all capitalize ${
                        data.permitHistory?.knownCodeViolations === option
                          ? 'bg-safetyOrange text-white border-safetyOrange'
                          : 'bg-white text-charcoal border-lightGray hover:border-safetyOrange/50'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Project Description */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Project Description <span className="text-steel/60 font-normal">— optional but helpful</span>
            </label>
            <textarea
              value={data.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              placeholder="Describe what needs fixing or replacing..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-lightGray bg-white text-charcoal focus:border-blueprint focus:ring-2 focus:ring-blueprint/20 resize-none"
            />
            <div className="mt-3 rounded-lg bg-sky p-3 text-sm">
              <p className="font-medium text-steel mb-2">Here's what good descriptions look like:</p>
              <ul className="space-y-1.5 text-steel">
                {getDescriptionExamples().map((example, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-forest">✓</span>
                    <span>"{example}"</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-charcoal">AI-Generated Requirements</h2>
            <p className="text-steel">Based on your job details, here are the requirements:</p>
          </div>

          <div className="rounded-xl border border-blueprint/20 bg-sky p-4">
            <div className="font-medium text-blueprint">Requirements Analysis Complete</div>
            <p className="mt-1 text-sm text-steel">
              {requiredCount} required, {optionalCount} optional items found
            </p>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {requirements.map((req, index) => (
              <div key={req.id} className="p-3 rounded-lg border border-lightGray bg-white">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      req.isRequired ? 'bg-blueprint text-white' : 'bg-sky text-steel'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-charcoal">{req.title}</div>
                    <div className="text-sm text-steel">{req.description}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded bg-sky capitalize text-steel">{req.category}</span>
                      {req.isRequired && <span className="text-xs text-crimson font-medium">Required</span>}
                      {!req.isRequired && <span className="text-xs text-steel">Optional</span>}
                      <span className="text-xs text-steel">{Math.round(req.confidence * 100)}% confidence</span>
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
            <h2 className="text-xl font-semibold text-charcoal">Review & Submit</h2>
            <p className="text-steel">Review your job details before creating</p>
          </div>

          <div className="rounded-xl border border-lightGray bg-white p-4 space-y-4">
            {/* Job Type Section */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky flex items-center justify-center shrink-0">
                {selectedJobType && <selectedJobType.icon className="h-5 w-5 text-blueprint" />}
              </div>
              <div>
                <div className="font-medium text-sm text-steel">Job Type</div>
                <div className="font-semibold text-charcoal">{selectedJobType?.label}</div>
                <div className="text-sm text-steel">{selectedJobType?.plainEnglishDescription}</div>
              </div>
            </div>

            {/* Location Section */}
            <div className="border-t border-lightGray pt-4">
              <div className="font-medium text-sm text-steel mb-2">Location</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-charcoal">
                  <MapPin size={16} className="text-steel" />
                  <span>{data.address}</span>
                </div>
                <div className="text-sm text-steel ml-6">
                  {JURISDICTIONS.find(j => j.value === data.jurisdiction)?.label}
                </div>
              </div>
            </div>

            {/* Worker Type Summary */}
            {data.workerType && (
              <div className="border-t border-lightGray pt-4">
                <div className="font-medium text-sm text-steel mb-2">Who's Doing the Work</div>
                <div className="text-sm text-charcoal">
                  {data.workerType === 'homeowner-diy' && "Homeowner doing work themselves"}
                  {data.workerType === 'homeowner-hiring' && "Homeowner hiring a contractor"}
                  {data.workerType === 'contractor' && "Licensed contractor"}
                </div>
              </div>
            )}

            {/* Contractor Information Summary - Only show if hiring or contractor */}
            {(data.workerType === 'homeowner-hiring' || data.workerType === 'contractor') && (data.contractorInfo?.contractorName || data.contractorInfo?.licenseNumber) && (
              <div className="border-t border-lightGray pt-4">
                <div className="font-medium text-sm text-steel mb-2">Contractor Information</div>
                <div className="space-y-1 text-sm text-charcoal">
                  {data.contractorInfo?.contractorName && (
                    <div><span className="text-steel">Business:</span> {data.contractorInfo.contractorName}</div>
                  )}
                  {data.contractorInfo?.licenseNumber && (
                    <div><span className="text-steel">License:</span> {data.contractorInfo.licenseNumber}</div>
                  )}
                  {data.contractorInfo?.yearsExperience && (
                    <div><span className="text-steel">Experience:</span> {data.contractorInfo.yearsExperience} years</div>
                  )}
                  {data.contractorInfo?.hasInsurance !== undefined && (
                    <div><span className="text-steel">Insurance:</span> {data.contractorInfo.hasInsurance ? 'Yes ✓' : 'No ✗'}</div>
                  )}
                </div>
              </div>
            )}

            {/* Budget & Timeline Summary - Only show if hiring or contractor */}
            {(data.workerType === 'homeowner-hiring' || data.workerType === 'contractor') && (data.budgetTimeline?.estimatedCost || data.budgetTimeline?.desiredStartDate) && (
              <div className="border-t border-lightGray pt-4">
                <div className="font-medium text-sm text-steel mb-2">Budget & Timeline</div>
                <div className="space-y-1 text-sm text-charcoal">
                  {data.budgetTimeline?.estimatedCost && (
                    <div><span className="text-steel">Estimated Cost:</span> {data.budgetTimeline.estimatedCost}</div>
                  )}
                  {data.budgetTimeline?.desiredStartDate && (
                    <div><span className="text-steel">Start Date:</span> {new Date(data.budgetTimeline.desiredStartDate).toLocaleDateString()}</div>
                  )}
                  {data.budgetTimeline?.projectDuration && (
                    <div><span className="text-steel">Duration:</span> {data.budgetTimeline.projectDuration}</div>
                  )}
                </div>
              </div>
            )}

            {/* Building Details Summary */}
            {(data.buildingDetails?.propertyType || data.buildingDetails?.yearBuilt) && (
              <div className="border-t border-lightGray pt-4">
                <div className="font-medium text-sm text-steel mb-2">Building Details</div>
                <div className="space-y-1 text-sm text-charcoal">
                  {data.buildingDetails?.propertyType && (
                    <div><span className="text-steel">Property Type:</span> {data.buildingDetails.propertyType}</div>
                  )}
                  {data.buildingDetails?.numberOfStories && (
                    <div><span className="text-steel">Stories:</span> {data.buildingDetails.numberOfStories}</div>
                  )}
                  {data.buildingDetails?.yearBuilt && (
                    <div><span className="text-steel">Year Built:</span> {data.buildingDetails.yearBuilt}</div>
                  )}
                  {data.buildingDetails?.previousWorkOnThis !== undefined && (
                    <div><span className="text-steel">Previous Work:</span> {data.buildingDetails.previousWorkOnThis ? 'Yes' : 'No'}</div>
                  )}
                </div>
              </div>
            )}

            {/* Permit History Summary */}
            {(data.permitHistory?.openPermits || data.permitHistory?.knownCodeViolations) && (
              <div className="border-t border-lightGray pt-4">
                <div className="font-medium text-sm text-steel mb-2">Permit History</div>
                <div className="space-y-1 text-sm text-charcoal">
                  {data.permitHistory?.openPermits && (
                    <div><span className="text-steel">Open Permits:</span> <span className="capitalize">{data.permitHistory.openPermits}</span></div>
                  )}
                  {data.permitHistory?.knownCodeViolations && (
                    <div><span className="text-steel">Code Violations:</span> <span className="capitalize">{data.permitHistory.knownCodeViolations}</span></div>
                  )}
                </div>
              </div>
            )}

            {/* Job-Specific Answers Summary */}
            {data.jobSpecificAnswers && Object.keys(data.jobSpecificAnswers).length > 0 && (
              <div className="border-t border-lightGray pt-4">
                <div className="font-medium text-sm text-steel mb-2">{selectedJobType?.label} Details</div>
                <div className="space-y-1 text-sm text-charcoal">
                  {Object.entries(data.jobSpecificAnswers).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-steel capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>{' '}
                      {Array.isArray(value) 
                        ? value.join(', ') 
                        : typeof value === 'boolean' 
                          ? (value ? 'Yes' : 'No') 
                          : String(value)
                      }
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {data.description && (
              <div className="border-t border-lightGray pt-4">
                <div className="font-medium text-sm text-steel mb-2">Project Description</div>
                <p className="text-sm text-charcoal">{data.description}</p>
              </div>
            )}

            {/* Requirements Summary */}
            <div className="border-t border-lightGray pt-4">
              <div className="font-medium text-sm text-steel mb-2">Requirements</div>
              <div className="flex items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky text-blueprint">
                  <span>{requirements.length} total items</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-crimson/10 text-crimson">
                  <span>{requiredCount} required</span>
                </span>
                {optionalCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky text-steel">
                    <span>{optionalCount} optional</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-forest/10 border border-forest/20 p-4">
            <div className="flex items-start gap-3">
              <Check size={20} className="text-forest shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-forest">Ready to create your job</div>
                <p className="text-sm text-forest/80 mt-1">
                  We'll save your job to My Jobs and create a personalized checklist to help you get your permit.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inline Validation Error */}
      {showValidationError && !canProceed() && step < 4 && (
        <div className="mt-4 p-3 bg-safetyOrange/10 border border-safetyOrange/20 rounded-lg">
          <p className="text-sm text-safetyOrange flex items-center gap-2">
            <Info size={14} />
            Please complete all required fields to continue
          </p>
        </div>
      )}

      {/* CONSISTENT BUTTON STYLING - All buttons use blueprint color */}
      <div className="flex justify-between mt-8">
        <Button 
          variant="outline" 
          onClick={handleBack} 
          disabled={step === 1 || createState === 'creating'}
          className="transition-all"
        >
          <ArrowLeft size={18} className="mr-2" />
          Back
        </Button>

        {step < 4 ? (
          <Button 
            onClick={handleNext} 
            disabled={!canProceed() || isAnalyzing} 
            className="bg-blueprint hover:bg-blueprint-700"
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                Next
                <ArrowRight size={18} className="ml-2" />
              </>
            )}
          </Button>
        ) : (
          <Button 
            onClick={handleComplete} 
            className="bg-blueprint hover:bg-blueprint-700"
            disabled={createState === 'created'}
          >
            {createState === 'creating' ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Creating...
              </>
            ) : createState === 'created' ? (
              <>
                <Check size={18} className="mr-2" />
                Created!
              </>
            ) : (
              <>
                <Check size={18} className="mr-2" />
                Create Job
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

// Import SearchX for empty state
import { SearchX } from 'lucide-react';
