import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import PageWrapper from '@/components/layout/PageWrapper';
import TabbedChecklist from '@/components/new-ui/TabbedChecklist';
import { useJob } from '@/hooks/useJobs';
import { useDocumentUpload } from '@/services/storage';
import { Job } from '@/types/permit';

export default function SimplifiedWizardPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { job, isLoading, error, fetchJob, updateRequirementStatus } = useJob(jobId || null);
  const { upload, getDocuments } = useDocumentUpload();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    if (!jobId) {
      navigate('/simple/job-type');
      return;
    }

    loadJobData();
  }, [jobId, navigate]);

  const loadJobData = async () => {
    setLoading(true);
    try {
      await fetchJob();
      if (jobId) {
        const docsResult = await getDocuments(jobId);
        if (docsResult.success) {
          setDocuments(docsResult.documents);
        }
      }
    } catch (err) {
      toast.error('Failed to load job data');
    } finally {
      setLoading(false);
    }
  };

  const handleRequirementAction = (action: 'upload' | 'apply', requirementId: string) => {
    if (action === 'upload') {
      // Scroll to the requirement or trigger upload
      const element = document.getElementById(`req-${requirementId}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleDocumentUpload = async (reqId: string, file: File) => {
    if (!jobId) return;

    try {
      const result = await upload(jobId, file, reqId);
      if (result.success) {
        toast.success(`${file.name} uploaded!`);
        // Mark requirement as completed
        await updateRequirementStatus(reqId, 'completed');
        // Refresh documents
        const docsResult = await getDocuments(jobId);
        if (docsResult.success) {
          setDocuments(docsResult.documents);
        }
      } else {
        toast.error(result.error || 'Upload failed');
      }
    } catch (err) {
      toast.error('Failed to upload document');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  if (loading || isLoading) {
    return (
      <PageWrapper hasBottomNav={false}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse space-y-4 w-full max-w-md px-4">
            <div className="h-32 bg-muted rounded-xl" />
            <div className="h-12 bg-muted rounded-xl" />
            <div className="h-64 bg-muted rounded-xl" />
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (error || !job) {
    return (
      <PageWrapper hasBottomNav={false}>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Job not found</h2>
            <p className="text-muted-foreground mb-4">
              {error || 'This job may have been deleted'}
            </p>
            <button
              onClick={() => navigate('/simple/job-type')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
            >
              Create New Job
            </button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper hasBottomNav={false}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-card border-b sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="font-semibold text-foreground truncate">
                  Permit Checklist
                </h1>
                <p className="text-xs text-muted-foreground truncate">
                  {job.jobType.replace(/_/g, ' ')}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-2xl mx-auto px-4 py-4 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TabbedChecklist
              job={{
                id: job.id,
                jobType: job.jobType,
                address: job.address,
                jurisdiction: job.jurisdiction,
                requirements: job.requirements,
                estimatedCost: job.estimatedCost,
                estimatedDays: job.estimatedDays,
              }}
              onRequirementAction={handleRequirementAction}
              onDocumentUpload={handleDocumentUpload}
            />
          </motion.div>
        </main>
      </div>
    </PageWrapper>
  );
}
