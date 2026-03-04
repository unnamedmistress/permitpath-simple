import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowRight } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import SimplifiedJobTypeGrid, { JobType } from '@/components/new-ui/SimplifiedJobTypeGrid';
import Button from '@/components/shared/Button';
import { useJobs } from '@/hooks/useJobs';

export default function SimplifiedJobTypePage() {
  const navigate = useNavigate();
  const { createJob } = useJobs();
  const [selectedJobType, setSelectedJobType] = useState<JobType | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleJobTypeSelect = (jobType: JobType) => {
    setSelectedJobType(jobType);
  };

  const handleContinue = async () => {
    if (!selectedJobType) return;
    
    setIsCreating(true);
    try {
      // Create job with just the job type
      const newJob = await createJob({
        jobType: selectedJobType.id,
        // Will fill in location and details in next steps
        jurisdiction: 'PINELLAS_COUNTY', // Default, will be selectable
        address: '', // Will be filled in later
      }, []); // Empty requirements initially

      if (newJob && newJob.id) {
        toast.success('Job created!');
        // Navigate to location selection
        navigate(`/simple/location/${newJob.id}`);
      } else {
        toast.error('Failed to create job');
      }
    } catch (err) {
      console.error('Failed to create job:', err);
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <PageWrapper hasBottomNav={false}>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-card border-b px-4 py-4 safe-area-inset-top">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground text-center">
                What type of work?
              </h1>
              <p className="text-muted-foreground text-center mt-2">
                Select one to get started
              </p>
            </motion.div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 py-6 sm:py-8">
          <div className="max-w-2xl mx-auto">
            <SimplifiedJobTypeGrid
              onSelect={handleJobTypeSelect}
              selectedId={selectedJobType?.id}
            />
          </div>
        </main>

        {/* Footer with Continue Button */}
        <footer className="bg-card border-t px-4 py-4 safe-area-inset-bottom">
          <div className="max-w-2xl mx-auto">
            <Button
              onClick={handleContinue}
              disabled={!selectedJobType || isCreating}
              loading={isCreating}
              className="w-full"
              size="lg"
              icon={<ArrowRight className="w-5 h-5" />}
            >
              Continue
            </Button>
          </div>
        </footer>
      </div>
    </PageWrapper>
  );
}
