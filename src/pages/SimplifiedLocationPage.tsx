import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import SimplifiedLocationSelector, { Location } from '@/components/new-ui/SimplifiedLocationSelector';
import Button from '@/components/shared/Button';
import { useJobs } from '@/hooks/useJobs';

export default function SimplifiedLocationPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { getJob, updateJob } = useJobs();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!jobId) {
      navigate('/simple/job-type');
      return;
    }

    const loadJob = async () => {
      try {
        const job = await getJob(jobId);
        if (job?.jurisdiction) {
          // Pre-select if already set
          setSelectedLocation({
            id: job.jurisdiction,
            label: job.jurisdiction.replace(/_/g, ' '),
            description: ''
          });
        }
      } catch (err) {
        toast.error('Failed to load job');
      } finally {
        setIsLoading(false);
      }
    };

    loadJob();
  }, [jobId, navigate, getJob]);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
  };

  const handleContinue = async () => {
    if (!selectedLocation || !jobId) return;
    
    setIsSaving(true);
    try {
      await updateJob(jobId, {
        jurisdiction: selectedLocation.id,
      });

      toast.success('Location saved!');
      // Navigate to details page
      navigate(`/simple/details/${jobId}`);
    } catch (err) {
      console.error('Failed to save location:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to save location');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/simple/job-type');
  };

  if (isLoading) {
    return (
      <PageWrapper hasBottomNav={false}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-muted rounded mx-auto" />
            <div className="h-4 w-32 bg-muted rounded mx-auto" />
            <div className="space-y-3 mt-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 w-full max-w-md bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper hasBottomNav={false}>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-card border-b px-4 py-4 safe-area-inset-top">
          <div className="max-w-md mx-auto">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Where is the property?
              </h1>
              <p className="text-muted-foreground mt-2">
                Select the city or county
              </p>
            </motion.div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:py-8">
          <div className="max-w-md mx-auto">
            <SimplifiedLocationSelector
              onSelect={handleLocationSelect}
              selectedId={selectedLocation?.id}
            />
          </div>
        </main>

        {/* Footer with Continue Button */}
        <footer className="bg-card border-t px-4 py-4">
          <div className="max-w-md mx-auto">
            <Button
              onClick={handleContinue}
              disabled={!selectedLocation || isSaving}
              loading={isSaving}
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
