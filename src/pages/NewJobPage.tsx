import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PageWrapper from '@/components/layout/PageWrapper';
import SmartWizard, { WizardData } from '@/components/wizard/SmartWizard';
import { Job, JobStatus } from '@/types/permit';

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
  const [isCreating, setIsCreating] = useState(false);

  const handleWizardComplete = async (data: WizardData) => {
    setIsCreating(true);
    try {
      const job = createJobInMemory(data);
      toast.success('Job created successfully!', {
        description: `Created ${data.jobType} job with ${data.requirements.length} requirements`
      });
      navigate(`/wizard/${job.id}`);
    } catch (error) {
      console.error('Failed to create job:', error);
      toast.error('Failed to create job');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <PageWrapper hasBottomNav={false}>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Job</h1>
          <p className="text-muted-foreground">
            AI-powered permit requirements for Pinellas County contractors
          </p>
        </div>

        <SmartWizard onComplete={handleWizardComplete} />

        {isCreating && (
          <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Creating your job...</p>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
