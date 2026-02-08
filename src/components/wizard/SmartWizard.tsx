import { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { JobType, Jurisdiction, Requirement } from '@/types/permit';
import { getRequirementsForJob } from '@/services/requirements';
import Button from '@/components/shared/Button';

interface SmartWizardProps {
  onComplete: (data: WizardData) => void;
}

export interface WizardData {
  jobType: JobType;
  jurisdiction: Jurisdiction;
  address: string;
  description: string;
  requirements: Requirement[];
}

const JOB_TYPES: { value: JobType; label: string; description: string }[] = [
  { value: 'RE_ROOFING', label: 'Roof Replacement', description: 'Full roof replacement' },
  { value: 'ROOF_REPAIR', label: 'Roof Repair', description: 'Patch or repair existing roof' },
  { value: 'AC_HVAC_CHANGEOUT', label: 'AC/HVAC Replacement', description: 'Replace AC unit' },
  { value: 'WATER_HEATER', label: 'Water Heater', description: 'Install new water heater' },
  { value: 'ELECTRICAL_PANEL', label: 'Electrical Panel', description: 'Upgrade or replace panel' },
  { value: 'ELECTRICAL_REWIRING', label: 'Electrical Rewiring', description: 'Rewire circuits' },
  { value: 'EV_CHARGER', label: 'EV Charger', description: 'Install EV charging station' },
  { value: 'GENERATOR_INSTALL', label: 'Generator', description: 'Install standby generator' },
  { value: 'PLUMBING_MAIN_LINE', label: 'Plumbing Main Line', description: 'Replace main water/sewer line' },
  { value: 'SMALL_BATH_REMODEL', label: 'Bathroom Remodel', description: 'Renovate bathroom' },
  { value: 'KITCHEN_REMODEL', label: 'Kitchen Remodel', description: 'Renovate kitchen' },
  { value: 'WINDOW_DOOR_REPLACEMENT', label: 'Window/Door', description: 'Replace windows or doors' },
  { value: 'SIDING_EXTERIOR', label: 'Siding/Exterior', description: 'Replace siding' },
  { value: 'DECK_INSTALLATION', label: 'Deck Installation', description: 'Build new deck' },
  { value: 'FENCE_INSTALLATION', label: 'Fence', description: 'Install fence' },
  { value: 'POOL_BARRIER', label: 'Pool Barrier', description: 'Install pool safety fence' },
  { value: 'ROOM_ADDITION', label: 'Room Addition', description: 'Add square footage' },
  { value: 'FOUNDATION_REPAIR', label: 'Foundation Repair', description: 'Structural foundation work' }
];

const JURISDICTIONS: { value: Jurisdiction; label: string }[] = [
  { value: 'PINELLAS_COUNTY', label: 'Pinellas County (Unincorporated)' },
  { value: 'ST_PETERSBURG', label: 'City of St. Petersburg' },
  { value: 'CLEARWATER', label: 'City of Clearwater' },
  { value: 'LARGO', label: 'City of Largo' },
  { value: 'PALM_HARBOR', label: 'Palm Harbor' }
];

export default function SmartWizard({ onComplete }: SmartWizardProps) {
  console.log('SmartWizard mounting...');
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [data, setData] = useState<Partial<WizardData>>({
    jobType: undefined,
    jurisdiction: undefined,
    address: '',
    description: ''
  });
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  
  useEffect(() => {
    console.log('SmartWizard mounted, step:', step);
  }, []);

  const totalSteps = 4;

  const handleJobTypeSelection = async (jobType: JobType) => {
    console.log('handleJobTypeSelection:', jobType);
    try {
      const reqs = await getRequirementsForJob(
        jobType,
        data.jurisdiction,
        data.address,
        data.description
      );
      onComplete({
        jobType,
        jurisdiction: data.jurisdiction!,
        address: data.address,
        description: data.description!,
        requirements: reqs
      });
      toast.success('Job created successfully!', {
        description: `Created ${jobType} job with ${reqs.length} requirements`
      });
    } catch (error) {
      console.error('Failed to create job:', error);
      toast.error('Failed to create job');
    } finally {
      setIsAnalyzing(false);
    }
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
      toast.success('Requirements analyzed!', {
        description: `Found ${reqs.length} requirements for this job`
      });
    } catch (error) {
      toast.error('Failed to analyze requirements');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleComplete = () => {
    console.log('handleComplete called');
    if (!data.jobType || !data.jurisdiction || !data.address) {
      console.log('Missing required data, cannot complete');
      return;
    }
    
    console.log('Completing wizard with data:', { jobType: data.jobType, jurisdiction: data.jurisdiction, address: data.address });
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
      case 1: return !!data.jobType;
      case 2: return !!data.jurisdiction;
      case 3: return data.address.length > 5;
      case 4: return requirements.length > 0;
      default: return false;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {['Job Type', 'Location', 'Details', 'Requirements'].map((label, index) => (
            <div key={label} className={`text-xs font-medium ${
              index + 1 <= step ? 'text-primary' : 'text-muted-foreground'
            }`}>
              {label}
            </div>
          ))}
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Job Type */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">What type of job?</h2>
          <p className="text-muted-foreground">Select the type of work you're doing</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {JOB_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => handleJobTypeSelection(type.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  data.jobType === type.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="font-medium">{type.label}</div>
                <div className="text-sm text-muted-foreground">{type.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Jurisdiction */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Where is the job?</h2>
          <p className="text-muted-foreground">Select the jurisdiction</p>
          
          <div className="space-y-3">
            {JURISDICTIONS.map((j) => (
              <button
                key={j.value}
                onClick={() => setData({ ...data, jurisdiction: j.value })}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  data.jurisdiction === j.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="font-medium">{j.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Address & Description */}
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

      {/* Step 4: Requirements Preview */}
      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">AI-Generated Requirements</h2>
          <p className="text-muted-foreground">
            Based on your job details, here are the requirements:
          </p>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {requirements.map((req, index) => (
              <div
                key={req.id}
                className="p-3 rounded-lg border bg-card"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    req.isRequired ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{req.title}</div>
                    <div className="text-sm text-muted-foreground">{req.description}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded bg-muted capitalize">
                        {req.category}
                      </span>
                      {req.isRequired && (
                        <span className="text-xs text-red-500">Required</span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {Math.round(req.confidence * 100)}% confidence
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="font-medium text-primary">Ready to create your job?</div>
            <div className="text-sm text-muted-foreground">
              We'll set up your permit checklist with these requirements.
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button
          variant="secondary"
          onClick={handleBack}
          disabled={step === 1}
        >
          <ArrowLeft size={18} className="mr-2" />
          Back
        </Button>

        {step < 4 ? (
          <Button
            onClick={handleNext}
            disabled={!canProceed() || isAnalyzing}
            loading={isAnalyzing}
          >
            {isAnalyzing ? 'Analyzing...' : 'Next'}
            <ArrowRight size={18} className="ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleComplete}
            variant="primary"
          >
            <Check size={18} className="mr-2" />
            Create Job
          </Button>
        )}
      </div>
    </div>
  );
}
