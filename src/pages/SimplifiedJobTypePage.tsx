import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Camera, ListChecks } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import SimplifiedJobTypeGrid, { JobType } from '@/components/new-ui/SimplifiedJobTypeGrid';
import Button from '@/components/shared/Button';
import PhotoScopeCapture from '@/components/permit/PhotoScopeCapture';
import { useJobs } from '@/hooks/useJobs';

type EntryMode = 'select' | 'photo';

export default function SimplifiedJobTypePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { createJob } = useJobs();
  const [selectedJobType, setSelectedJobType] = useState<JobType | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [entryMode, setEntryMode] = useState<EntryMode>('select');

  // ── Manual select flow ────────────────────────────────────────────────────

  const handleJobTypeSelect = (jobType: JobType) => {
    setSelectedJobType(jobType);
  };

  const handleContinue = async () => {
    if (!selectedJobType) return;
    setIsCreating(true);
    try {
      const newJob = await createJob({
        jobType: selectedJobType.id,
        jurisdiction: 'PINELLAS_COUNTY',
        address: '',
      }, []);

      if (newJob?.id) {
        toast.success('Job created!');
        navigate(`/simple/details/${newJob.id}`);
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

  // ── Photo confirm flow ─────────────────────────────────────────────────────

  const handlePhotoConfirm = async (
    jobTypeId: string,
    scopeOfWork: string,
    shortDescription: string
  ) => {
    setIsCreating(true);
    try {
      const newJob = await createJob({
        jobType: jobTypeId,
        jurisdiction: 'PINELLAS_COUNTY',
        address: '',
        description: scopeOfWork,
      }, []);

      if (newJob?.id) {
        toast.success('Job created from photo!');
        navigate(`/simple/details/${newJob.id}`);
      } else {
        toast.error('Failed to create job');
      }
    } catch (err) {
      console.error('Failed to create job from photo:', err);
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
                {entryMode === 'photo' ? t('jobType.takePhoto') : t('jobType.title')}
              </h1>
              <p className="text-muted-foreground text-center mt-1 text-sm">
                {entryMode === 'photo' ? t('jobType.photoSubtitle') : t('jobType.subtitle')}
              </p>
            </motion.div>

            {/* Mode toggle pills */}
            <div className="flex gap-2 mt-4 p-1 bg-muted rounded-xl">
              <button
                onClick={() => setEntryMode('select')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  entryMode === 'select'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ListChecks size={15} />
                {t('jobType.selectType')}
              </button>
              <button
                onClick={() => setEntryMode('photo')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  entryMode === 'photo'
                    ? 'bg-gradient-to-r from-violet-600 to-teal-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Camera size={15} />
                {t('jobType.takePhoto')}
                {/* "New" badge */}
                <span className="ml-0.5 text-[9px] font-black bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded-full leading-none">
                  {t('common.new')}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 py-6 sm:py-8 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
              {entryMode === 'select' ? (
                <motion.div
                  key="select"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2 }}
                >
                  <SimplifiedJobTypeGrid
                    onSelect={handleJobTypeSelect}
                    selectedId={selectedJobType?.id}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="photo"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.2 }}
                >
                  {isCreating ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                        className="w-12 h-12 rounded-full border-4 border-violet-200 border-t-violet-600"
                      />
                      <p className="text-sm text-slate-500">Creating your permit job…</p>
                    </div>
                  ) : (
                    <PhotoScopeCapture
                      jurisdiction="Pinellas County, FL"
                      onConfirm={handlePhotoConfirm}
                      onCancel={() => setEntryMode('select')}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Footer — only shown in manual select mode */}
        <AnimatePresence>
          {entryMode === 'select' && (
            <motion.footer
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-card border-t px-4 py-4 safe-area-inset-bottom"
            >
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
            </motion.footer>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}
