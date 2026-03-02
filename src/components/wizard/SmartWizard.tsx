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
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { JobType, Jurisdiction, Requirement } from '@/types/permit';
import { getRequirementsForJob } from '@/services/requirements';
import Button from '@/components/shared/Button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

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
}

interface JobTypeOption {
  value: JobType;
  label: string;
  description: string;
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
      { value: 'RE_ROOFING', label: 'Roof Replacement', description: 'Full roof replacement', keywords: ['reroof', 'roofing'] },
      { value: 'ROOF_REPAIR', label: 'Roof Repair', description: 'Patch or repair existing roof', keywords: ['shingle', 'leak', 'repair'] }
    ]
  },
  {
    key: 'hvac',
    label: 'HVAC',
    icon: Wind,
    options: [
      { value: 'AC_HVAC_CHANGEOUT', label: 'AC/HVAC Replacement', description: 'Replace AC unit or HVAC system', keywords: ['air conditioning', 'mechanical'] }
    ]
  },
  {
    key: 'plumbing',
    label: 'Plumbing',
    icon: Droplets,
    options: [
      { value: 'WATER_HEATER', label: 'Water Heater', description: 'Install or replace water heater', keywords: ['tankless', 'heater'] },
      { value: 'PLUMBING_MAIN_LINE', label: 'Plumbing Main Line', description: 'Replace main water or sewer line', keywords: ['main line', 'sewer'] },
      { value: 'SMALL_BATH_REMODEL', label: 'Bathroom Remodel', description: 'Bathroom renovation work', keywords: ['bath', 'bathroom'] }
    ]
  },
  {
    key: 'electrical',
    label: 'Electrical',
    icon: Zap,
    options: [
      { value: 'ELECTRICAL_PANEL', label: 'Electrical Panel', description: 'Upgrade or replace panel', keywords: ['service', 'breaker'] },
      { value: 'ELECTRICAL_REWIRING', label: 'Electrical Rewiring', description: 'Rewire circuits', keywords: ['rewire', 'wiring'] },
      { value: 'EV_CHARGER', label: 'EV Charger', description: 'Install EV charging station', keywords: ['tesla', 'charger', '240v'] },
      { value: 'GENERATOR_INSTALL', label: 'Generator', description: 'Install standby generator', keywords: ['backup power', 'transfer switch'] }
    ]
  },
  {
    key: 'exterior',
    label: 'Exterior',
    icon: Fence,
    options: [
      { value: 'WINDOW_DOOR_REPLACEMENT', label: 'Window/Door Replacement', description: 'Replace windows or doors', keywords: ['impact', 'hurricane'] },
      { value: 'SIDING_EXTERIOR', label: 'Siding/Exterior', description: 'Replace siding or exterior cladding', keywords: ['cladding', 'facade'] },
      { value: 'DECK_INSTALLATION', label: 'Deck Installation', description: 'Build a new deck', keywords: ['deck', 'outdoor'] },
      { value: 'FENCE_INSTALLATION', label: 'Fence Installation', description: 'Install perimeter fencing', keywords: ['fence', 'gate'] }
    ]
  },
  {
    key: 'remodeling',
    label: 'Remodeling',
    icon: Paintbrush,
    options: [
      { value: 'KITCHEN_REMODEL', label: 'Kitchen Remodel', description: 'Renovate kitchen', keywords: ['kitchen', 'remodel'] },
      { value: 'ROOM_ADDITION', label: 'Room Addition', description: 'Add square footage', keywords: ['addition', 'expansion'] }
    ]
  },
  {
    key: 'safety',
    label: 'Safety',
    icon: Shield,
    options: [
      { value: 'POOL_BARRIER', label: 'Pool Barrier', description: 'Install pool safety fence or barrier', keywords: ['pool', 'barrier', 'safety'] }
    ]
  },
  {
    key: 'structural',
    label: 'Structural',
    icon: Building2,
    options: [
      { value: 'FOUNDATION_REPAIR', label: 'Foundation Repair', description: 'Structural foundation work', keywords: ['structural', 'foundation'] }
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

const JURISDICTIONS: { value: Jurisdiction; label: string }[] = [
  { value: 'PINELLAS_COUNTY', label: 'Pinellas County (Unincorporated)' },
  { value: 'ST_PETERSBURG', label: 'City of St. Petersburg' },
  { value: 'CLEARWATER', label: 'City of Clearwater' },
  { value: 'LARGO', label: 'City of Largo' },
  { value: 'PALM_HARBOR', label: 'Palm Harbor' }
];

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
  const [data, setData] = useState<Partial<WizardData>>({
    jobType: initialData?.jobType,
    jurisdiction: initialData?.jurisdiction,
    address: initialData?.address || '',
    description: initialData?.description || ''
  });
  const [requirements, setRequirements] = useState<Requirement[]>(initialData?.requirements || []);
  const selectedJobType = JOB_TYPE_OPTIONS.find((option) => option.value === data.jobType);
  const totalSteps = 4;

  const requiredCount = requirements.filter((req) => req.isRequired).length;
  const optionalCount = requirements.length - requiredCount;

  const handleNext = async () => {
    if (step === 3) {
      await analyzeRequirements();
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
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
    } catch {
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
      requirements
    });
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!data.jobType;
      case 2:
        return !!data.jurisdiction;
      case 3:
        return (data.address || '').length > 5;
      case 4:
        return requirements.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
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
          {['Job Type', 'Location', 'Details', 'Requirements'].map((label, index) => (
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
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">What type of job?</h2>
          <p className="text-muted-foreground">Search and select the type of work you're doing</p>

          <Popover open={isJobTypeOpen} onOpenChange={setIsJobTypeOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                role="combobox"
                aria-expanded={isJobTypeOpen}
                className="w-full rounded-2xl border bg-background px-4 py-3 text-left transition-all hover:border-primary/50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex items-center gap-3">
                    {selectedJobType ? (
                      <>
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${CATEGORY_STYLES[selectedJobType.category]}`}>
                          <selectedJobType.icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold truncate">{selectedJobType.label}</div>
                          <div className="text-sm text-muted-foreground truncate">{selectedJobType.description}</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 text-primary">
                          <ChevronDown className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold">Choose job type</div>
                          <div className="text-sm text-muted-foreground">Search or browse categories</div>
                        </div>
                      </>
                    )}
                  </div>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isJobTypeOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" sideOffset={8} className="w-[min(var(--radix-popover-trigger-width),95vw)] rounded-2xl border p-0 shadow-xl">
              <Command>
                <CommandInput placeholder="Search job type or keyword..." className="h-12 text-base" />
                <CommandList className="max-h-[65vh]">
                  <CommandEmpty>No job type found.</CommandEmpty>
                  {JOB_TYPE_CATEGORIES.map((category) => {
                    const CategoryIcon = category.icon;
                    return (
                      <CommandGroup key={category.key} heading={category.label}>
                        {category.options.map((type) => (
                          <CommandItem
                            key={type.value}
                            value={type.value}
                            keywords={[type.label, type.description, category.label, ...type.keywords]}
                            title={type.description}
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
                              <div className="text-xs text-muted-foreground leading-tight mt-0.5">{type.description}</div>
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
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Where is the job located?</h2>
          <p className="text-muted-foreground">We use this to find the right permit office.</p>

          <div className="space-y-3">
            {JURISDICTIONS.map((j) => (
              <button
                key={j.value}
                onClick={() => setData({ ...data, jurisdiction: j.value })}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  data.jurisdiction === j.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="font-medium">{j.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Job Details</h2>

          <div>
            <label className="block text-sm font-medium mb-2">Property Address *</label>
            <input
              type="text"
              value={data.address}
              onChange={(e) => setData({ ...data, address: e.target.value })}
              placeholder="123 Main St, St Petersburg, FL 33710"
              className="w-full px-4 py-3 rounded-xl border bg-background"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Job Description (Optional)</label>
            <textarea
              value={data.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              placeholder="Describe the work being done..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border bg-background resize-none"
            />
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">AI-Generated Requirements</h2>
          <p className="text-muted-foreground">Based on your job details, here are the requirements:</p>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="font-medium text-primary">Click Create Job to open your checklist page.</div>
            <p className="mt-1 text-sm text-muted-foreground">
              {requiredCount} required, {optionalCount} optional
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

      <div className="flex justify-between mt-8">
        <Button variant="secondary" onClick={handleBack} disabled={step === 1 || createState === 'creating'}>
          <ArrowLeft size={18} className="mr-2" />
          Back
        </Button>

        {step < 4 ? (
          <Button onClick={handleNext} disabled={!canProceed() || isAnalyzing} loading={isAnalyzing}>
            {isAnalyzing ? 'Analyzing...' : 'Next'}
            <ArrowRight size={18} className="ml-2" />
          </Button>
        ) : (
          <Button onClick={handleComplete} variant="primary" loading={createState === 'creating'} disabled={createState === 'created'}>
            <Check size={18} className="mr-2" />
            {createState === 'created' ? 'Job Created' : 'Create Job'}
          </Button>
        )}
      </div>
    </div>
  );
}
