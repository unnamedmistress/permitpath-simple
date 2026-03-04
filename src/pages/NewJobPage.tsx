import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckCircle, Video, FileText, Phone, ChevronRight, Home, MapPin, Clock, Sparkles, Shield, DollarSign, Info, AlertTriangle, WifiOff } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import Button from '@/components/shared/Button';
import SmartWizard, { CreateJobState, WizardData } from '@/components/wizard/SmartWizard';
import { useJobs, JobInput } from '@/hooks/useJobs';
import { Job, Requirement } from '@/types/permit';
import { motion, AnimatePresence } from 'framer-motion';
import { saveJob } from '@/services/jobStorage';
import { v4 as uuidv4 } from 'uuid';

// Simple error boundary component
function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
      <h3 className="text-red-700 font-semibold">Something went wrong</h3>
      <p className="text-red-600 text-sm mt-1">{error.message}</p>
    </div>
  );
}

// Success Modal Component
function SuccessModal({ 
  job, 
  onContinue, 
  onViewTutorial 
}: { 
  job: Job; 
  onContinue: () => void;
  onViewTutorial: () => void;
}) {
  const requiredCount = job.requirements.filter(r => r.isRequired).length;
  const optionalCount = job.requirements.length - requiredCount;
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/95 flex items-center justify-center z-50 p-4"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-card rounded-2xl border shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 text-white text-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle size={32} className="text-green-600" />
          </motion.div>
          <h2 className="text-2xl font-bold">Job Created!</h2>
          <p className="text-green-100 mt-1">
            {job.jobType.replace(/_/g, ' ')}
          </p>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Job Details */}
          <div className="flex items-start gap-3 p-4 bg-muted rounded-xl">
            <MapPin size={20} className="text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">{job.address}</p>
              <p className="text-sm text-muted-foreground">{job.jurisdiction.replace(/_/g, ' ')}</p>
            </div>
          </div>
          
          {/* What's Next */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Clock size={18} className="text-primary" />
              What's Next?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Pick one to get started:
            </p>
            
            <div className="space-y-2">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onViewTutorial}
                className="w-full flex items-center gap-3 p-4 rounded-xl border hover:border-primary hover:bg-primary/5 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-200 transition-colors">
                  <Video size={20} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Watch 3-min tutorial</p>
                  <p className="text-xs text-muted-foreground">Learn how to use your checklist</p>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onContinue}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-primary bg-primary/5 hover:bg-primary/10 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <FileText size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-primary">Review requirements</p>
                  <p className="text-xs text-muted-foreground">See what documents you need</p>
                </div>
                <ChevronRight size={18} className="text-primary" />
              </motion.button>
              
              <motion.a 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="tel:727-464-3199"
                className="w-full flex items-center gap-3 p-4 rounded-xl border hover:border-green-500 hover:bg-green-50 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0 group-hover:bg-green-200 transition-colors">
                  <Phone size={20} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Call for help</p>
                  <p className="text-xs text-muted-foreground">(727) 464-3199</p>
                </div>
                <ChevronRight size={18} className="text-muted-foreground" />
              </motion.a>
            </div>
          </div>
          
          {/* Document Summary */}
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm font-medium text-blue-900 mb-2">
              {job.requirements.length} documents needed:
            </p>
            <div className="flex flex-wrap gap-2">
              {requiredCount > 0 && (
                <span className="text-xs px-2 py-1 rounded-full bg-white text-blue-700 border border-blue-200">
                  {requiredCount} required
                </span>
              )}
              {optionalCount > 0 && (
                <span className="text-xs px-2 py-1 rounded-full bg-white text-blue-600 border border-blue-200">
                  {optionalCount} optional
                </span>
              )}
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Typical timeline: 2-4 weeks from submission to approval
            </p>
          </div>

          {/* Trust Signals */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Shield size={16} className="text-green-600 shrink-0" />
              <p className="text-xs text-green-700">
                <strong>PermitPath is FREE.</strong> Permit fees go directly to your county.
              </p>
            </div>
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <DollarSign size={16} className="text-amber-600 shrink-0" />
              <p className="text-xs text-amber-700">
                Cost estimates are approximate. Pay your county directly when applying.
              </p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t bg-muted/30">
          <Button 
            className="w-full" 
            size="lg"
            onClick={onContinue}
          >
            Go to My Checklist
            <ChevronRight size={18} className="ml-1" />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Skeleton loader for initial load
function NewJobSkeleton() {
  return (
    <div className="container max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-3/4 mx-auto" />
        <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
        <div className="h-32 bg-muted rounded-xl" />
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    </div>
  );
}

// Network status hook
function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
}

export default function NewJobPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { createJob, isLoading: isCreatingJob, error: jobError } = useJobs();
  const [createState, setCreateState] = useState<CreateJobState>('idle');
  const [createError, setCreateError] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [lastAttemptData, setLastAttemptData] = useState<WizardData | null>(null);
  const [createdJob, setCreatedJob] = useState<Job | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const isOnline = useNetworkStatus();
  const prefill = location.state?.prefill as Partial<WizardData> | undefined;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleWizardComplete = async (data: WizardData) => {
    console.log('[NewJobPage] Starting job creation...', data);
    
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    setLastAttemptData(data);
    setCreateState('creating');
    setCreateError(null);

    try {
      // Validate required fields before submission
      if (!data.jobType) {
        throw new Error('Job type is required');
      }
      if (!data.jurisdiction) {
        throw new Error('Jurisdiction is required');
      }
      if (!data.address || data.address.trim().length < 3) {
        throw new Error('A valid address is required');
      }
      if (!data.requirements || data.requirements.length === 0) {
        throw new Error('Requirements must be analyzed before creating job');
      }

      const jobInput: JobInput = {
        jobType: data.jobType,
        jurisdiction: data.jurisdiction,
        address: data.address,
        description: data.description,
        contractorInfo: data.contractorInfo,
        budgetTimeline: data.budgetTimeline,
        buildingDetails: data.buildingDetails,
        permitHistory: data.permitHistory,
      };

      let job: Job;
      
      try {
        // Try to create job via Supabase
        job = await createJob(jobInput, data.requirements);
        console.log('[NewJobPage] Job created via Supabase:', job.id);
      } catch (supabaseError) {
        console.warn('[NewJobPage] Supabase creation failed, falling back to localStorage:', supabaseError);
        
        // Fallback: Create job locally
        const localJob: Job = {
          id: uuidv4(),
          contractorId: 'local-user',
          jobType: data.jobType,
          jurisdiction: data.jurisdiction,
          address: data.address,
          description: data.description || '',
          status: 'requirements_pending',
          requirements: data.requirements.map(r => ({ 
            ...r, 
            jobId: 'temp',
            id: r.id || uuidv4()
          })),
          documents: [],
          inspections: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          contractorInfo: data.contractorInfo,
          budgetTimeline: data.budgetTimeline,
          buildingDetails: data.buildingDetails,
          permitHistory: data.permitHistory,
        };
        
        // Update requirements with correct jobId
        localJob.requirements = localJob.requirements.map(r => ({ ...r, jobId: localJob.id }));
        
        // Save to localStorage
        try {
          saveJob(localJob);
          console.log('[NewJobPage] Job saved to localStorage:', localJob.id);
          job = localJob;
          
          // Show warning that job is stored locally
          toast.warning('Job saved locally', {
            description: 'We could not connect to our servers. Your job is saved on this device only.'
          });
        } catch (localStorageError) {
          console.error('[NewJobPage] localStorage fallback failed:', localStorageError);
          throw new Error('Unable to save job. Please check your browser storage settings and try again.');
        }
      }
      
      setCreatedJob(job);
      setCreateState('created');
      
      // Show success modal instead of immediate navigation
      setShowSuccessModal(true);
      
      // Show toast for accessibility/screen readers
      toast.success('Job created successfully!', {
        description: `Created ${data.jobType} job with ${data.requirements.length} requirements`
      });
      
    } catch (error) {
      console.error('[NewJobPage] Job creation failed:', error);
      setCreateState('failed');
      
      // Get specific error message
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred. Please try again.';
      
      setCreateError(errorMessage);
      toast.error('Failed to create job', {
        description: errorMessage
      });
    }
  };

  const handleContinueToChecklist = () => {
    if (createdJob) {
      navigate(`/wizard/${createdJob.id}`);
    }
  };

  const handleViewTutorial = () => {
    // Open tutorial in new tab or modal (placeholder for now)
    toast.info('Tutorial coming soon!', {
      description: 'We are working on video tutorials for each job type.'
    });
    // Still navigate to checklist after showing message
    setTimeout(() => {
      handleContinueToChecklist();
    }, 2000);
  };

  const handleRetryCreate = () => {
    if (lastAttemptData) {
      handleWizardComplete(lastAttemptData);
    } else {
      setCreateState('idle');
      setCreateError(null);
    }
  };

  if (error) {
    return (
      <PageWrapper hasBottomNav={false}>
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <ErrorFallback error={error} />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper hasBottomNav={false}>
      <div className="container max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4 sm:mb-8"
        >
          {/* FIXED: Accurate time estimate */}
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs sm:text-sm font-medium text-primary mb-3 sm:mb-4">
            Takes about 8-12 minutes
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">Start a Permit Job</h1>
          <p className="text-sm text-muted-foreground">Tell us about your job. We will make your permit checklist.</p>
        </motion.div>

        {/* FIXED: Offline warning shown BEFORE form */}
        {!isOnline && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 sm:mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4"
          >
            <div className="flex items-start gap-3">
              <WifiOff className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800">You're currently offline</p>
                <p className="text-sm text-amber-700 mt-1">
                  You can still fill out this form. Your job will be saved locally on this device and synced when you reconnect.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4 sm:mb-8 rounded-xl border bg-card p-3 sm:p-4"
        >
          <h2 className="font-semibold text-sm sm:text-base mb-2">Before you start</h2>
          <ul className="space-y-1 text-xs sm:text-sm text-muted-foreground">
            <li>Job address</li>
            <li>Type of work (roof, electrical, plumbing, etc.)</li>
            <li>Any photos or notes you already have</li>
          </ul>
        </motion.div>

        {/* AI Assistant Option */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4 sm:mb-6"
        >
          <Link
            to="/ai-assistant"
            className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles size={18} className="text-primary sm:hidden" />
              <Sparkles size={20} className="text-primary hidden sm:block" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-xs sm:text-sm">Try AI chat with photos</h3>
              <p className="text-xs text-muted-foreground truncate">Describe your job in plain words and upload photos. We'll figure out the permits.</p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground sm:hidden" />
            <ChevronRight size={18} className="text-muted-foreground hidden sm:block" />
          </Link>
        </motion.div>


        <SmartWizard
          onComplete={handleWizardComplete}
          createState={createState}
          createError={createError}
          onRetryCreate={handleRetryCreate}
          initialData={prefill}
        />

        <AnimatePresence>
          {createState === 'creating' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 flex items-center justify-center z-50"
            >
              <div className="text-center">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"
                />
                <p className="text-muted-foreground">Creating your job and opening checklist...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showSuccessModal && createdJob && (
            <SuccessModal
              job={createdJob}
              onContinue={handleContinueToChecklist}
              onViewTutorial={handleViewTutorial}
            />
          )}
        </AnimatePresence>

        {/* Legal Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 pt-6 border-t border-border"
        >
          <p className="text-[10px] sm:text-xs text-muted-foreground text-center leading-relaxed">
            This tool provides general information only and does not constitute legal advice.
            Always consult with a qualified professional for your specific situation.
          </p>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
