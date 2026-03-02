import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PageWrapper from '@/components/layout/PageWrapper';
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

export default function NewJobPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [createState, setCreateState] = useState<CreateJobState>('idle');
  const [createError, setCreateError] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [lastAttemptData, setLastAttemptData] = useState<WizardData | null>(null);
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
      setCreateState('created');
      toast.success('Job created successfully!', {
        description: `Created ${data.jobType} job with ${data.requirements.length} requirements`
      });
      navigate(`/wizard/${job.id}`);

      timeoutRef.current = window.setTimeout(() => {
        setCreateState('failed');
        setCreateError('Navigation took too long. Your job was created. Please retry to open it.');
      }, 10000);
    } catch (error) {
      console.error('Failed to create job:', error);
      setCreateState('failed');
      setCreateError('Could not create your job. Please try again.');
      toast.error('Failed to create job');
    }
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
      </div>
    </PageWrapper>
  );
}
