import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Sparkles, Shield, Clock, Home } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import { JobTypeGrid } from '@/components/new-ui/JobTypeGrid';
import { Button } from '@/components/ui/button';
import { useJobs } from '@/hooks/useJobs';
import type { JobType } from '@/types/permit';
import { formatJobTypeLabel } from '@/lib/utils';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

const TRUST_BADGES = [
  { icon: Shield, label: 'Pinellas County Official', color: 'text-blue-600', bg: 'bg-blue-600/10 border border-blue-200' },
  { icon: Clock,  label: '30-Second Checklist',      color: 'text-emerald-600', bg: 'bg-emerald-600/10 border border-emerald-200' },
  { icon: Sparkles, label: 'AI-Powered',             color: 'text-violet-600', bg: 'bg-violet-600/10 border border-violet-200' },
];

export default function HomePageSimple() {
  const navigate = useNavigate();
  const { jobs, loading } = useJobs();

  const handleSelectJobType = useCallback((jobType: JobType) => {
    navigate('/quick-start', { state: { jobType } });
  }, [navigate]);

  return (
    <PageWrapper className="pb-20">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative pt-8 pb-6 md:pt-12 md:pb-8 -mx-4 px-4 mb-6 overflow-hidden rounded-b-3xl"
        style={{
          background: 'linear-gradient(160deg, #EBF4FF 0%, #F0F9FF 40%, #F8FAFF 100%)',
        }}
      >
        {/* Decorative blur orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-sky-200/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative text-center"
        >
          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap items-center justify-center gap-2 mb-5"
          >
            {TRUST_BADGES.map((badge) => (
              <div key={badge.label}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${badge.bg} ${badge.color}`}
              >
                <badge.icon size={13} />
                {badge.label}
              </div>
            ))}
          </motion.div>

          {/* Headline */}
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight tracking-tight">
            What permit do you need
            <br />
            <span className="text-blue-600">in Pinellas County?</span>
          </h1>

          <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto leading-relaxed">
            Get a personalized checklist in 30 seconds.&nbsp;
            <span className="text-gray-700 font-medium">No guesswork, no waiting in lines.</span>
          </p>
        </motion.div>
      </section>

      {/* ── Job type grid ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <JobTypeGrid onSelect={handleSelectJobType} />
      </motion.div>

      {/* ── AI fallback ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 text-center"
      >
        <p className="text-sm text-gray-400 mb-3">— or —</p>
        <Button
          variant="outline"
          onClick={() => navigate('/ai-assistant')}
          className="gap-2 border-violet-200 text-violet-700 hover:bg-violet-50 hover:border-violet-300"
        >
          <Sparkles size={15} />
          Describe your project in your own words
        </Button>
      </motion.div>

      {/* ── Recent projects ───────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner text="Loading projects..." />
        </div>
      ) : jobs.length > 0 ? (
        <section className="border-t border-gray-100 pt-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Projects</h2>
            {jobs.length > 3 && (
              <button
                onClick={() => navigate('/jobs')}
                className="text-sm text-blue-600 flex items-center gap-1 hover:underline"
              >
                View all <ChevronRight size={14} />
              </button>
            )}
          </div>
          <div className="grid gap-3">
            <AnimatePresence>
              {jobs.slice(0, 3).map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.08 }}
                  onClick={() => navigate(`/wizard/${job.id}`)}
                  className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:shadow-md hover:border-blue-200 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm">{formatJobTypeLabel(job.jobType)}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{job.address}</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      job.status === 'ready_to_submit' ? 'bg-green-500' :
                      job.status === 'requirements_pending' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    <span className="text-xs text-gray-500 capitalize">{job.status.replace(/_/g, ' ')}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      ) : (
        <section className="border-t border-gray-100 pt-6 mt-6">
          <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Home size={20} className="text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">No projects yet</h3>
            <p className="text-sm text-gray-500">Select a job type above to get started</p>
          </div>
        </section>
      )}
    </PageWrapper>
  );
}
