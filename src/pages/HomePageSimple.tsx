import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, ArrowRight, ChevronRight, Sparkles, Shield, Clock } from 'lucide-react';
import { toast } from 'sonner';
import PageWrapper from '@/components/layout/PageWrapper';
import { JobTypeGrid } from '@/components/new-ui/JobTypeGrid';
import { Button } from '@/components/ui/button';
import { useJobs } from '@/hooks/useJobs';
import type { Job, JobType } from '@/types/permit';
import { formatJobTypeLabel } from '@/lib/utils';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

// Trust badges
const TRUST_BADGES = [
  { icon: Shield, label: 'Pinellas County Official' },
  { icon: Clock, label: '30-Second Checklist' },
  { icon: Sparkles, label: 'AI-Powered' },
];

export default function HomePageSimple() {
  const navigate = useNavigate();
  const { jobs, loading } = useJobs();
  const [showJobs, setShowJobs] = useState(false);

  const handleSelectJobType = useCallback((jobType: JobType) => {
    navigate('/quick-start', { state: { jobType } });
  }, [navigate]);

  const handleViewAllJobs = () => {
    navigate('/jobs');
  };

  return (
    <PageWrapper className="pb-20">
      {/* Hero Section - One Question Focus */}
      <section className="py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-6"
          >
            {TRUST_BADGES.map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-full"
              >
                <badge.icon size={14} className="text-blue-600" />
                <span className="text-xs font-medium text-blue-700">{badge.label}</span>
              </div>
            ))}
          </motion.div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 leading-tight">
            What permit do you need
            <br />
            <span className="text-blue-600">in Pinellas County?</span>
          </h1>
          
          <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto">
            Get a personalized checklist in 30 seconds. No guesswork, no waiting in lines.
          </p>
        </motion.div>

        {/* Job Type Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <JobTypeGrid onSelect={handleSelectJobType} />
        </motion.div>

        {/* NLP Fallback - Describe in your own words */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-gray-400 mb-3">— or —</p>
          <Button
            variant="outline"
            onClick={() => navigate('/ai-assistant')}
            className="gap-2"
          >
            <Sparkles size={16} />
            Describe your project in your own words
          </Button>
        </motion.div>
      </section>

      {/* Recent Projects Section */}
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner text="Loading projects..." />
        </div>
      ) : jobs.length > 0 ? (
        <section className="border-t border-gray-100 pt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Projects</h2>
            {jobs.length > 3 && (
              <button
                onClick={handleViewAllJobs}
                className="text-sm text-blue-600 flex items-center gap-1 hover:underline"
              >
                View all
                <ChevronRight size={14} />
              </button>
            )}
          </div>

          <div className="grid gap-3">
            <AnimatePresence>
              {jobs.slice(0, 3).map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => navigate(`/wizard/${job.id}`)}
                  className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:shadow-md hover:border-blue-200 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm">
                        {formatJobTypeLabel(job.jobType)}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {job.address}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>
                  
                  {/* Status indicator */}
                  <div className="mt-3 flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        job.status === 'ready_to_submit'
                          ? 'bg-green-500'
                          : job.status === 'requirements_pending'
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}
                    />
                    <span className="text-xs text-gray-500 capitalize">
                      {job.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      ) : (
        // Empty state
        <section className="border-t border-gray-100 pt-8 mt-4">
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Home size={20} className="text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">No projects yet</h3>
            <p className="text-sm text-gray-500">
              Select a job type above to get started
            </p>
          </div>
        </section>
      )}
    </PageWrapper>
  );
}
