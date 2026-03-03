import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckCircle, Video, FileText, Phone, ChevronRight, Home, MapPin, Clock, Sparkles } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import Button from '@/components/shared/Button';
import SmartWizard, { CreateJobState, WizardData } from '@/components/wizard/SmartWizard';
import { Job } from '@/types/permit';

// Simple error boundary component
function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
      <h3 className="text-red-700 font-semibold">Something went wrong</h3>
      <p className="text-red-600 text-sm mt-1">{error.message}</p>
    </div>
  );
}

// In-memory job storage (replaces Firebase)
const memoryJobs: Map<string, Job> = new Map();

export function createJobInMemory(data: WizardData): Job {
  const job: Job = {
    id: `job-${Date.now()}`,
    contractorId: 'guest', // Guest mode
    jobType: data.jobType,
    jurisdiction: data.jurisdiction,
    address: data.address,
    description: data.description,
    status: 'requirements_pending',
    requirements: data.requirements.map((r, index) => ({
      ...r,
      id: `req-${Date.now()}-${index}`,
      jobId: `job-${Date.now()}`
    })),
    documents: [],
    inspections: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  memoryJobs.set(job.id, job);
  console.log('Job created:', job.id, 'Total jobs:', memoryJobs.size);
  return job;
}

export function getJobFromMemory(id: string): Job | undefined {
  return memoryJobs.get(id);
}

export function getAllJobsFromMemory(): Job[] {
  return Array.from(memoryJobs.values());
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
    <div className="fixed inset-0 bg-background/95 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-card rounded-2xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 text-white text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
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
              <button 
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
              </button>
              
              <button 
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
              </button>
              
              <a 
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
              </a>
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
      </div>
    </div>
  );
}

export default function NewJobPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [createState, setCreateState] = useState<CreateJobState>('idle');
  const [createError, setCreateError] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [lastAttemptData, setLastAttemptData] = useState<WizardData | null>(null);
  const [createdJob, setCreatedJob] = useState<Job | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const prefill = location.state?.prefill as Partial<WizardData> | undefined;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleWizardComplete = async (data: WizardData) => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    setLastAttemptData(data);
    setCreateState('creating');
    setCreateError(null);

    try {
      const job = createJobInMemory(data);
      setCreatedJob(job);
      setCreateState('created');
      
      // Show success modal instead of immediate navigation
      setShowSuccessModal(true);
      
      // Still show toast for accessibility/screen readers
      toast.success('Job created successfully!', {
        description: `Created ${data.jobType} job with ${data.requirements.length} requirements`
      });
    } catch (error) {
      console.error('Failed to create job:', error);
      setCreateState('failed');
      setCreateError('Could not create your job. Please try again.');
      toast.error('Failed to create job');
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
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-4">
            Takes about 3-5 minutes
          </div>
          <h1 className="text-3xl font-bold mb-2">Start a Permit Job</h1>
          <p className="text-muted-foreground">Tell us about your job. We will make your permit checklist.</p>
        </div>

        <div className="mb-8 rounded-xl border bg-card p-4">
          <h2 className="font-semibold mb-2">Before you start</h2>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>Job address</li>
            <li>Type of work (roof, electrical, plumbing, etc.)</li>
            <li>Any photos or notes you already have</li>
          </ul>
        </div>

        {/* AI Assistant Option */}
        <div className="mb-6">
          <Link
            to="/ai-assistant"
            className="flex items-center gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Try AI chat with photos</h3>
              <p className="text-xs text-muted-foreground">Describe your job in plain words and upload photos. We'll figure out the permits.</p>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </Link>
        </div>

        <SmartWizard
          onComplete={handleWizardComplete}
          createState={createState}
          createError={createError}
          onRetryCreate={handleRetryCreate}
          initialData={prefill}
        />

        {createState === 'creating' && (
          <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Creating your job and opening checklist...</p>
            </div>
          </div>
        )}

        {showSuccessModal && createdJob && (
          <SuccessModal
            job={createdJob}
            onContinue={handleContinueToChecklist}
            onViewTutorial={handleViewTutorial}
          />
        )}
      </div>
    </PageWrapper>
  );
}
