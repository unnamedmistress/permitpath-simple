import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, ChevronRight, Sparkles, Shield, Clock,
  DollarSign, CalendarCheck, AlertTriangle, ArrowRight, Search,
} from 'lucide-react';
import { toast } from 'sonner';
import PageWrapper from '@/components/layout/PageWrapper';
import { JobTypeGrid } from '@/components/new-ui/JobTypeGrid';
import { Button } from '@/components/ui/button';
import { useJobs } from '@/hooks/useJobs';
import type { JobType } from '@/types/permit';
import { formatJobTypeLabel } from '@/lib/utils';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { detectIntent } from '@/services/predictionEngine';

// ─── Trust badges ──────────────────────────────────────────────────────────
const TRUST_BADGES = [
  { icon: Shield, label: 'Pinellas County Official' },
  { icon: Clock, label: '30-Second Checklist' },
  { icon: Sparkles, label: 'AI-Powered' },
];

// ─── Confidence anchors ────────────────────────────────────────────────────
// Show key facts before the user starts so anxiety drops before they begin
const CONFIDENCE_ANCHORS = [
  {
    icon: DollarSign,
    colorClass: 'text-green-700',
    bgClass: 'bg-green-50',
    borderClass: 'border-green-200',
    label: 'Typical cost',
    value: '$50 – $250',
  },
  {
    icon: CalendarCheck,
    colorClass: 'text-blueprint-700',
    bgClass: 'bg-blueprint-50',
    borderClass: 'border-blueprint-200',
    label: 'Typical approval',
    value: '1 – 5 days',
  },
  {
    icon: AlertTriangle,
    colorClass: 'text-amber-700',
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-200',
    label: 'Skip penalty',
    value: 'Up to $10K',
  },
];

// ─── Example prompts to seed the text input ────────────────────────────────
const EXAMPLE_PROMPTS = [
  'replacing my roof',
  'new AC unit',
  'electrical panel upgrade',
  'adding a deck',
  'installing a fence',
  'bathroom remodel',
];

export default function HomePageSimple() {
  const navigate = useNavigate();
  const { jobs, loading } = useJobs();
  const [query, setQuery] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ── Conversational submit ──────────────────────────────────────────────
  const handleConversationalSubmit = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed) {
      toast.error('Tell us what you\'re working on first');
      inputRef.current?.focus();
      return;
    }

    setIsDetecting(true);
    try {
      const result = detectIntent(trimmed);

      if (result.primaryIntent) {
        // AI matched a job type — go straight to details
        navigate('/quick-start', { state: { jobType: result.primaryIntent } });
      } else {
        // No clear match — open quick-start without pre-selected type
        // and pass description so the user can refine
        navigate('/quick-start', { state: { description: trimmed } });
      }
    } catch {
      toast.error('Something went wrong. Try picking your job type below.');
    } finally {
      setIsDetecting(false);
    }
  }, [query, navigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleConversationalSubmit();
    }
  };

  const handleSelectJobType = useCallback((jobType: JobType) => {
    navigate('/quick-start', { state: { jobType } });
  }, [navigate]);

  const handleViewAllJobs = () => navigate('/jobs');

  return (
    <PageWrapper className="pb-20">
      {/* ── Hero Section ──────────────────────────────────────────────── */}
      <section className="py-6 md:py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap items-center justify-center gap-2 mb-5"
          >
            {TRUST_BADGES.map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blueprint-50 rounded-full border border-blueprint-100"
              >
                <badge.icon size={13} className="text-blueprint" />
                <span className="text-xs font-medium text-blueprint-700">{badge.label}</span>
              </div>
            ))}
          </motion.div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-tight">
            What are you working on
            <br />
            <span className="text-blueprint">in Pinellas County?</span>
          </h1>
          <p className="text-gray-500 text-sm max-w-xs mx-auto">
            Describe your project and we'll find your permits in seconds.
          </p>
        </motion.div>

        {/* ── PRIMARY: Conversational Input ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-4"
        >
          <div className="relative bg-white rounded-2xl border-2 border-blueprint-200 shadow-md focus-within:border-blueprint focus-within:shadow-lg transition-all">
            <div className="flex items-start gap-3 p-4">
              <Search size={20} className="text-blueprint mt-0.5 flex-shrink-0" />
              <textarea
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. replacing my roof, new AC unit, adding a fence…"
                rows={2}
                className="flex-1 resize-none text-base text-gray-900 placeholder-gray-400 bg-transparent outline-none leading-relaxed"
                style={{ minHeight: 52 }}
              />
            </div>

            {/* Example prompts — horizontally scrollable row */}
            <div className="px-4 pb-3 flex gap-1.5 overflow-x-auto scrollbar-hide" style={{ flexWrap: 'nowrap', overflowX: 'auto' }}>
              {EXAMPLE_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setQuery(p);
                    inputRef.current?.focus();
                  }}
                  style={{ minHeight: 36 }}
                  className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-blueprint-50 hover:text-blueprint transition-colors flex-shrink-0 whitespace-nowrap"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Submit button */}
            <div className="px-4 pb-4">
              <Button
                onClick={handleConversationalSubmit}
                disabled={isDetecting || !query.trim()}
                className="w-full h-12 text-base font-semibold bg-blueprint hover:bg-blueprint-700 text-white gap-2"
              >
                {isDetecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Matching your project…
                  </>
                ) : (
                  <>
                    Get My Permit Checklist
                    <ArrowRight size={18} />
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* ── Confidence anchors ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex gap-2.5 mb-5 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4"
          style={{ flexWrap: 'nowrap', overflowX: 'auto' }}
        >
          {CONFIDENCE_ANCHORS.map((anchor) => (
            <div
              key={anchor.label}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border flex-shrink-0 ${anchor.bgClass} ${anchor.borderClass}`}
            >
              <anchor.icon size={18} className={anchor.colorClass} />
              <div>
                <p className={`text-sm font-bold leading-tight ${anchor.colorClass}`}>
                  {anchor.value}
                </p>
                <p className="text-xs text-gray-500 leading-tight whitespace-nowrap">
                  {anchor.label}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── SECONDARY: Job type grid ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          <button
            onClick={() => setShowGrid(v => !v)}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm text-gray-500 hover:text-blueprint transition-colors"
          >
            <span>{showGrid ? 'Hide job types' : 'Or pick your job type from the list'}</span>
            <ChevronRight
              size={14}
              className={`transition-transform ${showGrid ? 'rotate-90' : ''}`}
            />
          </button>

          <AnimatePresence>
            {showGrid && (
              <motion.div
                key="grid"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-2">
                  <JobTypeGrid onSelect={handleSelectJobType} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* ── Recent Projects ───────────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner text="Loading projects…" />
        </div>
      ) : jobs.length > 0 ? (
        <section className="border-t border-gray-100 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 text-sm">Recent Projects</h2>
            {jobs.length > 3 && (
              <button
                onClick={handleViewAllJobs}
                className="text-sm text-blueprint flex items-center gap-1 hover:underline"
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
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -80 }}
                  transition={{ delay: index * 0.08 }}
                  onClick={() => navigate(`/wizard/${job.id}`)}
                  className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:shadow-md hover:border-blueprint-200 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm">
                        {formatJobTypeLabel(job.jobType)}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">{job.address}</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        job.status === 'ready_to_submit'
                          ? 'bg-green-500'
                          : job.status === 'requirements_pending'
                          ? 'bg-amber-500'
                          : 'bg-blueprint-400'
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
        <section className="border-t border-gray-100 pt-6 mt-2">
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <div className="w-12 h-12 bg-blueprint-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Home size={20} className="text-blueprint" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">No projects yet</h3>
            <p className="text-sm text-gray-500">
              Describe your project above to get started
            </p>
          </div>
        </section>
      )}
    </PageWrapper>
  );
}
