import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter, Clock, CheckCircle, AlertCircle, ChevronRight, Trash2, RefreshCw, HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { useJobs } from "@/hooks/useJobs";
import { calculateProgress } from "@/services/requirements";
import { Job } from "@/types/permit";
import { toast } from "sonner";

const statusConfig = {
  draft: { icon: Clock, color: "text-steel", bg: "bg-sky", label: "Draft" },
  requirements_pending: { icon: AlertCircle, color: "text-safetyOrange", bg: "bg-safetyOrange/10", label: "Needs Documents", description: "We're generating your personalized checklist. This usually takes 30 seconds." },
  documents_pending: { icon: Clock, color: "text-blueprint", bg: "bg-sky", label: "Gathering Docs" },
  ready_to_submit: { icon: CheckCircle, color: "text-forest", bg: "bg-forest/10", label: "Ready to Submit" },
  submitted: { icon: Clock, color: "text-purple-600", bg: "bg-purple-50", label: "Submitted" },
  under_review: { icon: Clock, color: "text-safetyOrange", bg: "bg-safetyOrange/10", label: "Under Review" },
  approved: { icon: CheckCircle, color: "text-forest", bg: "bg-forest/10", label: "Approved" },
  rejected: { icon: AlertCircle, color: "text-crimson", bg: "bg-crimson/10", label: "Needs Revision" },
  closed: { icon: CheckCircle, color: "text-steel", bg: "bg-sky", label: "Closed" },
};

// Skeleton loader for job cards
function JobCardSkeleton() {
  return (
    <div className="w-full p-4 rounded-xl border border-lightGray bg-white animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-sky rounded w-3/4" />
          <div className="h-3 bg-sky rounded w-1/2" />
          <div className="h-2 bg-sky rounded w-full mt-3" />
        </div>
      </div>
    </div>
  );
}

// Empty state component with illustration
function EmptyState({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12 px-4"
    >
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-32 h-32 mx-auto mb-6"
      >
        <img 
          src="/images/empty-state.svg" 
          alt="No jobs yet" 
          className="w-full h-full object-contain"
        />
      </motion.div>
      <h3 className="font-semibold text-charcoal mb-2 text-lg">No jobs yet</h3>
      <p className="text-sm text-steel mb-6 max-w-xs mx-auto">
        Start your first project and get your personalized permit checklist
      </p>
      <Button 
        onClick={onCreateNew}
        className="bg-blueprint hover:bg-blueprint-700"
      >
        <Plus size={16} className="mr-2" />
        Start New Job
      </Button>
    </motion.div>
  );
}

export default function MyJobsPage() {
  const navigate = useNavigate();
  const { jobs, isLoading, error, fetchJobs, deleteJob } = useJobs();
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Filter jobs based on search query
  const filteredJobs = jobs.filter(job => 
    job.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.jobType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort jobs: active first, then by date
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    const aActive = a.status !== "approved" && a.status !== "closed";
    const bActive = b.status !== "approved" && b.status !== "closed";
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const activeJobs = sortedJobs.filter(j => j.status !== "approved" && j.status !== "closed");
  const completedJobs = sortedJobs.filter(j => j.status === "approved" || j.status === "closed");

  const handleDeleteJob = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this job?")) return;
    
    setDeletingJobId(jobId);
    try {
      await deleteJob(jobId);
      toast.success("Job deleted successfully");
    } catch (err) {
      toast.error("Failed to delete job");
    } finally {
      setDeletingJobId(null);
    }
  };

  const renderJobCard = (job: Job, index: number) => {
    const progress = calculateProgress(job.requirements);
    const status = statusConfig[job.status] || statusConfig.draft;
    const StatusIcon = status.icon;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <button
          key={job.id}
          onClick={() => navigate(`/wizard/${job.id}`)}
          className="w-full text-left p-4 rounded-xl border border-lightGray bg-white hover:shadow-md transition-all group"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold truncate text-charcoal">{formatAnyJobType(job.jobType)}</h3>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color} cursor-help flex items-center gap-1`}>
                      {status.label}
                      {status.description && <HelpCircle size={10} />}
                    </span>
                  </TooltipTrigger>
                  {status.description && (
                    <TooltipContent side="top">
                      <p className="max-w-xs text-xs">{status.description}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </div>
              <p className="text-sm text-steel truncate">{job.address}</p>
              <p className="text-xs text-steel mt-1">{job.jurisdiction.replace(/_/g, " ")}</p>
              
              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-steel">Progress</span>
                  <span className="font-medium text-charcoal">{progress}%</span>
                </div>
                <div className="h-2 bg-sky rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="h-full bg-blueprint"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <ChevronRight size={20} className="text-steel shrink-0" />
              <button
                onClick={(e) => handleDeleteJob(job.id, e)}
                disabled={deletingJobId === job.id}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-crimson/10 text-steel hover:text-crimson"
                title="Delete job"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </button>
      </motion.div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <PageWrapper>
        <div className="px-4 sm:px-0 space-y-4">
          <div className="h-8 bg-sky rounded w-1/3 animate-pulse" />
          <div className="h-10 bg-sky rounded w-full animate-pulse" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => <JobCardSkeleton key={i} />)}
          </div>
        </div>
      </PageWrapper>
    );
  }

  // Error state
  if (error) {
    return (
      <PageWrapper>
        <div className="px-4 sm:px-0 text-center py-12">
          <AlertCircle size={48} className="text-crimson mx-auto mb-4" />
          <h3 className="font-semibold mb-2 text-charcoal">Failed to load jobs</h3>
          <p className="text-sm text-steel mb-4">{error}</p>
          <Button onClick={fetchJobs} variant="outline">
            <RefreshCw size={16} className="mr-2" />
            Try Again
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <TooltipProvider>
    <PageWrapper>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6 px-4 sm:px-0"
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-charcoal">My Jobs</h1>
          <p className="text-steel text-sm">
            {activeJobs.length} active, {completedJobs.length} completed
          </p>
        </div>
        <Button 
          onClick={() => navigate("/new")} 
          size="sm" 
          className="shrink-0 bg-blueprint hover:bg-blueprint-700"
        >
          <Plus size={16} className="mr-1" />
          New
        </Button>
      </motion.div>

      {/* Search & Filter */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 mb-6 px-4 sm:px-0"
      >
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel" />
          <input
            type="text"
            placeholder="Search by address or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-lightGray bg-white text-sm text-charcoal focus:border-blueprint focus:ring-2 focus:ring-blueprint/20"
          />
        </div>
        <Button variant="outline" size="sm" className="px-3 shrink-0">
          <Filter size={16} />
        </Button>
      </motion.div>

      {jobs.length === 0 ? (
        <EmptyState onCreateNew={() => navigate("/new")} />
      ) : (
        <div className="space-y-6 px-4 sm:px-0">
          {/* Active Jobs */}
          {activeJobs.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-steel uppercase tracking-wide mb-3">
                Active ({activeJobs.length})
              </h2>
              <div className="space-y-3">
                <AnimatePresence>
                  {activeJobs.map((job, index) => renderJobCard(job, index))}
                </AnimatePresence>
              </div>
            </section>
          )}

          {/* Completed Jobs */}
          {completedJobs.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-steel uppercase tracking-wide mb-3">
                Completed ({completedJobs.length})
              </h2>
              <div className="space-y-3">
                <AnimatePresence>
                  {completedJobs.map((job, index) => renderJobCard(job, index + activeJobs.length))}
                </AnimatePresence>
              </div>
            </section>
          )}

          {/* No search results */}
          {filteredJobs.length === 0 && searchQuery && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <p className="text-steel">No jobs match your search</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSearchQuery("")}
                className="mt-2"
              >
                Clear Search
              </Button>
            </motion.div>
          )}
        </div>
      )}
    </PageWrapper>
    </TooltipProvider>
  );
}
