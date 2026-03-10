import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ArrowRight, X, Building2, Hammer, Home, AlertCircle, Check, Sparkles, Brain } from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import PageWrapper from '@/components/layout/PageWrapper';
import { JobTypeGrid, JobTypeList } from '@/components/new-ui/JobTypeGrid';
import { validateQuickStart, QuickStartInput } from '@/types/validation';
import { Job, JobType, Jurisdiction, WorkerType } from '@/types/permit';
import { saveJob, getJobs, deleteJob } from '@/services/jobStorage';
import { analyzeJobRequirements } from '@/services/ai-backend';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { generatePrediction, detectIntent, Prediction } from '@/services/predictionEngine';
import AIPredictionsPanel from '@/components/AIPredictionsPanel';

const JURISDICTIONS: { value: Jurisdiction; label: string }[] = [
  { value: 'PINELLAS_COUNTY', label: 'Pinellas County' },
  { value: 'ST_PETERSBURG', label: 'St. Petersburg' },
  { value: 'CLEARWATER', label: 'Clearwater' },
  { value: 'LARGO', label: 'Largo' },
  { value: 'PALM_HARBOR', label: 'Palm Harbor' },
];

// Job-specific follow-up questions
const JOB_CONDITIONAL_QUESTIONS: Record<JobType, Array<{
  id: string;
  label: string;
  type: 'radio' | 'boolean';
  options?: { value: string; label: string }[];
  field: keyof QuickStartInput;
}>> = {
  RE_ROOFING: [
    {
      id: 'buildingType',
      label: 'What type of building?',
      type: 'radio',
      options: [
        { value: 'single-family', label: 'Single-family home' },
        { value: 'commercial', label: 'Commercial/Other' },
      ],
      field: 'buildingType',
    },
    {
      id: 'isAlteringShape',
      label: 'Are you changing the roof shape or size?',
      type: 'boolean',
      field: 'isAlteringShape',
    },
  ],
  ROOF_REPAIR: [],
  WATER_HEATER: [
    {
      id: 'isTankless',
      label: 'Tank or tankless?',
      type: 'radio',
      options: [
        { value: 'false', label: 'Standard tank' },
        { value: 'true', label: 'Tankless' },
      ],
      field: 'isTankless',
    },
    {
      id: 'isGas',
      label: 'Fuel type?',
      type: 'radio',
      options: [
        { value: 'true', label: 'Gas' },
        { value: 'false', label: 'Electric' },
      ],
      field: 'isGas',
    },
  ],
  ELECTRICAL_PANEL: [
    {
      id: 'panelAmps',
      label: 'New panel size?',
      type: 'radio',
      options: [
        { value: '100', label: '100 amp' },
        { value: '150', label: '150 amp' },
        { value: '200', label: '200 amp' },
        { value: '400', label: '400 amp' },
      ],
      field: 'panelAmps',
    },
  ],
  ELECTRICAL_REWIRING: [],
  AC_HVAC_CHANGEOUT: [
    {
      id: 'hvacTonnage',
      label: 'System size (tonnage)?',
      type: 'radio',
      options: [
        { value: '1.5', label: '1.5 ton' },
        { value: '2', label: '2 ton' },
        { value: '2.5', label: '2.5 ton' },
        { value: '3', label: '3 ton' },
        { value: '3.5', label: '3.5 ton' },
        { value: '4', label: '4 ton' },
        { value: '5', label: '5 ton' },
      ],
      field: 'hvacTonnage',
    },
  ],
  EV_CHARGER: [],
  GENERATOR_INSTALL: [],
  PLUMBING_MAIN_LINE: [],
  SMALL_BATH_REMODEL: [],
  KITCHEN_REMODEL: [],
  WINDOW_DOOR_REPLACEMENT: [],
  SIDING_EXTERIOR: [],
  DECK_INSTALLATION: [
    {
      id: 'deckHeight',
      label: 'Height above ground?',
      type: 'radio',
      options: [
        { value: 'under-30in', label: 'Under 30 inches' },
        { value: 'over-30in', label: '30 inches or higher' },
      ],
      field: 'deckHeight',
    },
    {
      id: 'isAttached',
      label: 'Is the deck attached to your house?',
      type: 'boolean',
      field: 'isAttached',
    },
  ],
  FENCE_INSTALLATION: [
    {
      id: 'fenceHeight',
      label: 'Fence height?',
      type: 'radio',
      options: [
        { value: 'under-4ft', label: 'Under 4 feet' },
        { value: '4-6ft', label: '4 to 6 feet' },
        { value: 'over-6ft', label: 'Over 6 feet' },
      ],
      field: 'fenceHeight',
    },
    {
      id: 'fenceMaterial',
      label: 'Fence material?',
      type: 'radio',
      options: [
        { value: 'wood', label: 'Wood' },
        { value: 'vinyl', label: 'Vinyl / PVC' },
        { value: 'chain-link', label: 'Chain link' },
        { value: 'aluminum', label: 'Aluminum' },
        { value: 'masonry', label: 'Masonry / Block' },
      ],
      field: 'fenceMaterial',
    },
  ],
  POOL_BARRIER: [],
  ROOM_ADDITION: [],
  FOUNDATION_REPAIR: [],
};

export default function QuickStartPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 640px)');
  
  const [step, setStep] = useState<'type' | 'details' | 'ai-predict' | 'generating'>('type');
  const [selectedType, setSelectedType] = useState<JobType | null>(null);
  const [formData, setFormData] = useState<Partial<QuickStartInput>>({
    jurisdiction: 'PINELLAS_COUNTY',
  });
  
  // FIX #1: Read jobType from navigation state and pre-select
  useEffect(() => {
    const passedJobType = location.state?.jobType as JobType | undefined;
    if (passedJobType) {
      setSelectedType(passedJobType);
      setFormData(prev => ({ ...prev, jobType: passedJobType }));
      setStep('details');
      // Clear the state so refresh doesn't re-trigger
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.jobType]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showAIPredictions, setShowAIPredictions] = useState(false);

  const [isSelecting, setIsSelecting] = useState(false);
  
  const handleSelectJobType = useCallback((jobType: JobType) => {
    // FIX #3: Show visual feedback before navigation
    setIsSelecting(true);
    setSelectedType(jobType);
    
    // Brief delay to show selection animation
    setTimeout(() => {
      setFormData(prev => ({ ...prev, jobType }));
      setStep('details');
      setIsSelecting(false);
    }, 300);
  }, []);

  const handleAIPrediction = useCallback(() => {
    if (!formData.description && !selectedType) {
      toast.error('Please describe your project or select a job type first');
      return;
    }
    
    setShowAIPredictions(true);
    
    // Generate predictions based on description or selected type
    if (selectedType && formData.jurisdiction) {
      const prediction = generatePrediction(
        selectedType,
        formData.jurisdiction,
        formData,
        formData.description
      );
      setPredictions([prediction]);
    } else if (formData.description && formData.jurisdiction) {
      const detected = detectIntent(formData.description);
      if (detected.primaryIntent) {
        const prediction = generatePrediction(
          detected.primaryIntent,
          formData.jurisdiction,
          formData,
          formData.description
        );
        setPredictions([prediction]);
      }
    }
  }, [formData, selectedType]);

  const handlePredictionSelect = useCallback((prediction: Prediction) => {
    setSelectedType(prediction.permitType as JobType);
    setFormData(prev => ({ 
      ...prev, 
      jobType: prediction.permitType as JobType 
    }));
    toast.success(`Selected: ${prediction.permitType.replace(/_/g, ' ')}`);
  }, []);

  const handleInputChange = (field: keyof QuickStartInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const handleBack = () => {
    if (step === 'details') {
      setStep('type');
      setSelectedType(null);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  const handleSubmit = async () => {
    const validation = validateQuickStart(formData);
    if (!validation.success) {
      setErrors(validation.errors);
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setStep('generating');

    try {
      const data = validation.data;
      
      // FIX #2: Check for duplicate jobs (same type + address) - only if it has requirements
      const existingJobs = getJobs();
      const normalizedAddress = data.address.toLowerCase().trim();
      const duplicate = existingJobs.find(j => 
        j.jobType === data.jobType && 
        j.address.toLowerCase().trim() === normalizedAddress &&
        j.requirements && j.requirements.length > 0  // Only consider it a duplicate if it has requirements
      );
      
      if (duplicate) {
        toast.info('A job for this address already exists. Redirecting to existing job...');
        navigate(`/wizard/${duplicate.id}`);
        return;
      }
      
      // If there's an old "stuck" job without requirements, remove it
      const stuckJob = existingJobs.find(j => 
        j.jobType === data.jobType && 
        j.address.toLowerCase().trim() === normalizedAddress &&
        (!j.requirements || j.requirements.length === 0)
      );
      if (stuckJob) {
        deleteJob(stuckJob.id);  // Clean up old stuck jobs
      }
      
      const jobId = uuidv4();

      // Create job object
      const job: Job = {
        id: jobId,
        contractorId: 'anonymous',
        jobType: data.jobType,
        jurisdiction: data.jurisdiction,
        address: data.address,
        description: data.description,
        status: 'requirements_pending',
        requirements: [],
        documents: [],
        inspections: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Analyze requirements via backend — pass all job-specific answers
      const analysis = await analyzeJobRequirements({
        jobType: data.jobType,
        jurisdiction: data.jurisdiction,
        address: data.address,
        description: data.description || `Job type: ${data.jobType}`,
        buildingType: formData.buildingType as string | undefined,
        isAlteringShape: formData.isAlteringShape as boolean | undefined,
        isTankless: formData.isTankless as boolean | undefined,
        isGas: formData.isGas as boolean | undefined,
        deckHeight: formData.deckHeight as string | undefined,
        isAttached: formData.isAttached as boolean | undefined,
        fenceHeight: formData.fenceHeight as string | undefined,
        fenceMaterial: formData.fenceMaterial as string | undefined,
        panelAmps: formData.panelAmps as string | undefined,
        hvacTonnage: formData.hvacTonnage as string | undefined,
      });

      // Update job with results
      job.requirements = analysis.requirements.map((r, i) => ({
        ...r,
        id: `req-${jobId}-${i}`,
        jobId,
        status: 'pending',
        confidence: r.confidence || 0.8,
      }));

      // Save to storage
      saveJob(job);

      // Navigate to checklist
      navigate(`/wizard/${jobId}`);
    } catch (error) {
      console.error('Failed to create job:', error);
      toast.error('Something went wrong. Please try again.');
      setStep('details');
    } finally {
      setIsLoading(false);
    }
  };

  const conditionalQuestions = selectedType ? JOB_CONDITIONAL_QUESTIONS[selectedType] : [];

  return (
    <PageWrapper className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={step === 'details' ? handleBack : handleCancel}
          className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {step === 'type' ? <X size={20} /> : <ArrowRight size={20} className="rotate-180" />}
        </button>
        <span className="text-sm font-medium text-gray-500">
          {step === 'type' ? 'Step 1 of 2' : 'Step 2 of 2'}
        </span>
        <button
          onClick={handleCancel}
          className="p-2 -mr-2 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-200 rounded-full mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-blue-500"
          initial={{ width: '0%' }}
          animate={{ 
            width: step === 'type' ? '50%' : '100%'
          }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <AnimatePresence mode="wait">
        {step === 'type' && (
          <motion.div
            key="type-step"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              What work are you doing?
            </h1>
            <p className="text-sm text-gray-500 mb-4">
              Tap the type of job to get your permit checklist
            </p>

            {/* Permit not required info */}
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex gap-2">
              <AlertCircle size={15} className="text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-green-800">
                <span className="font-semibold">Small repairs may not need a permit.</span>{' '}
                Replacing fixtures like faucets, outlets, or light switches typically don't require one. When in doubt, call the county at <a href="tel:7274643888" className="underline font-medium">(727) 464-3888</a>.
              </p>
            </div>

            {isMobile ? (
              <JobTypeList onSelect={handleSelectJobType} selectedType={selectedType || undefined} />
            ) : (
              <JobTypeGrid onSelect={handleSelectJobType} selectedType={selectedType || undefined} />
            )}

            {/* Manual entry option */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center mb-3">
                Don't see your job type listed?
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setStep('details');
                  toast.info('Describe your project and click "Analyze My Project" for AI recommendations');
                }}
              >
                Describe your project in your own words
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'details' && (
          <motion.div
            key="details-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-5"
          >
            <div>
              {selectedType && (
                <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full border border-blue-200 mb-3">
                  <Check size={12} />
                  {selectedType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </div>
              )}
              <h1 className="text-xl font-bold text-gray-900 mb-1">
                Where is the job?
              </h1>
              <p className="text-sm text-gray-500">
                Answer a few quick questions to get your exact checklist
              </p>
            </div>

            {/* Address field */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium">
                Property Address <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  id="address"
                  placeholder="123 Main St, St Petersburg, FL"
                  value={formData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className={`pl-10 ${errors.some(e => e.includes('address')) ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.some(e => e.includes('address')) && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle size={12} />
                  Valid Pinellas County address required
                </p>
              )}
            </div>

            {/* Jurisdiction select */}
            <div className="space-y-2">
              <Label htmlFor="jurisdiction" className="text-sm font-medium">
                Which city or area is the property in?
              </Label>
              <select
                id="jurisdiction"
                value={formData.jurisdiction}
                onChange={(e) => handleInputChange('jurisdiction', e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                {JURISDICTIONS.map((j) => (
                  <option key={j.value} value={j.value}>{j.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400">Not sure? Choose "Pinellas County" — it covers unincorporated areas.</p>
            </div>

            {/* Conditional questions based on job type */}
            {conditionalQuestions.map((question) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <Label className="text-sm font-medium">
                  {question.label}
                </Label>
                
                {question.type === 'radio' ? (
                  <RadioGroup
                    value={formData[question.field]?.toString()}
                    onValueChange={(value) => {
                      const parsed = value === 'true' ? true : value === 'false' ? false : value;
                      handleInputChange(question.field, parsed);
                    }}
                    className="flex flex-wrap gap-2"
                  >
                    {question.options?.map((opt) => (
                      <div key={opt.value}>
                        <RadioGroupItem
                          value={opt.value}
                          id={`${question.id}-${opt.value}`}
                          className="peer sr-only"
                        />
                        <label
                          htmlFor={`${question.id}-${opt.value}`}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 cursor-pointer transition-all peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50 hover:bg-gray-50"
                        >
                          <div className="w-4 h-4 rounded-full border border-gray-300 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500" />
                          <span className="text-sm">{opt.label}</span>
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <div className="flex gap-2">
                    {[
                      { value: false, label: 'No' },
                      { value: true, label: 'Yes' },
                    ].map((opt) => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => handleInputChange(question.field, opt.value)}
                        className={`
                          px-4 py-2 rounded-lg border text-sm font-medium transition-all
                          ${formData[question.field] === opt.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                          }
                        `}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}

            {/* Optional description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Anything else we should know? <span className="text-gray-400 font-normal">(optional)</span>
              </Label>
              <textarea
                id="description"
                placeholder="e.g. 2,000 sq ft roof, 3-tab shingles, built in 1985..."
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full h-20 px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
              />
            </div>

            {/* Validation errors summary */}
            {errors.length > 0 && (
              <div className="p-3 bg-red-50 rounded-lg">
                {errors.map((err, i) => (
                  <p key={i} className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {err}
                  </p>
                ))}
              </div>
            )}

            {/* AI Prediction Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Not sure what you need?</h4>
                  <p className="text-sm text-slate-600">Get AI-powered permit predictions</p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleAIPrediction}
                className="w-full bg-white hover:bg-blue-50 border-blue-200"
              >
                <Brain size={16} className="mr-2" />
                Analyze My Project
              </Button>
            </motion.div>

            {/* AI Predictions Panel */}
            <AnimatePresence>
              {showAIPredictions && predictions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <AIPredictionsPanel
                    predictions={predictions}
                    onSelect={handlePredictionSelect}
                    onRegenerate={handleAIPrediction}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full h-12 text-base font-medium"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Get My Checklist
                  <ArrowRight size={18} />
                </span>
              )}
            </Button>
          </motion.div>
        )}

        {step === 'generating' && (
          <motion.div
            key="generating-step"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Check size={24} className="text-blue-500 animate-pulse" />
              </div>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mt-6">
              Generating your checklist...
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Checking Pinellas County requirements
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
