import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import SimpleAddressForm from '@/components/new-ui/SimpleAddressForm';
import { useJobs } from '@/hooks/useJobs';

export default function SimplifiedDetailsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { getJob, updateJob } = useJobs();
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [initialAddress, setInitialAddress] = useState('');

  useEffect(() => {
    if (!jobId) {
      navigate('/simple/job-type');
      return;
    }

    const loadJob = async () => {
      try {
        const job = await getJob(jobId);
        if (job?.address) {
          setInitialAddress(job.address);
        }      } catch (err) {
        toast.error('Failed to load job');
      } finally {
        setIsLoading(false);
      }
    };

    loadJob();
  }, [jobId, navigate, getJob]);

  const handleFormSubmit = async (data: { address: string; propertyType: string; latitude?: number; longitude?: number; addressComponents?: { street: string; city: string; state: string; zip: string } }) => {
    if (!jobId) return;

    setIsGenerating(true);
    try {
      // Update job with address, property type, and geocoded data
      await updateJob(jobId, {
        address: data.address,
        ...(data.latitude !== undefined && { latitude: data.latitude }),
        ...(data.longitude !== undefined && { longitude: data.longitude }),
        ...(data.addressComponents && { addressComponents: data.addressComponents }),
        buildingDetails: {
          propertyType: data.propertyType,
        },
      });

      toast.success('Details saved!');
      // Navigate to the simplified checklist/wizard page
      // Note: Requirements generation happens on the backend when job is created
      navigate(`/simple/wizard/${jobId}`);    } catch (err) {
      console.error('Failed to save details:', err);
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
      setIsGenerating(false);
    }
  };

  const handleBack = () => {
    if (jobId) {
      navigate(`/simple/location/${jobId}`);
    } else {
      navigate('/simple/job-type');
    }
  };

  if (isLoading) {
    return (
      <PageWrapper hasBottomNav={false}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-muted rounded mx-auto" />
            <div className="h-4 w-32 bg-muted rounded mx-auto" />
            <div className="h-40 w-full max-w-md bg-muted rounded-lg mt-8" />
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
                Property Details
              </h1>
              <p className="text-muted-foreground mt-2">
                Just two quick questions
              </p>
            </motion.div>
          </div>
        </header>
        {/* Main Content */}
        <main className="flex-1 px-4 py-6 sm:py-8">
          <div className="max-w-md mx-auto">
            {isGenerating ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground">
                  Creating your permit checklist...
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Analyzing requirements for your project
                </p>
              </motion.div>
            ) : (
              <SimpleAddressForm
                onSubmit={handleFormSubmit}
                initialAddress={initialAddress}
              />
            )}
          </div>
        </main>
      </div>
    </PageWrapper>
  );
}
