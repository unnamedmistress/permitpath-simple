import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter, Clock, CheckCircle, AlertCircle, ChevronRight, ClipboardList, Trash2, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/shared/Button";
import { useJobs } from "@/hooks/useJobs";
import { calculateProgress } from "@/services/requirements";
import { Job } from "@/types/permit";
import { toast } from "sonner";

const statusConfig = {
  draft: { icon: Clock, color: "text-gray-500", bg: "bg-gray-100", label: "Draft" },
  requirements_pending: { icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50", label: "Needs Documents" },
  documents_pending: { icon: Clock, color: "text-blue-600", bg: "bg-blue-50", label: "Gathering Docs" },
  ready_to_submit: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", label: "Ready to Submit" },
  submitted: { icon: Clock, color: "text-purple-600", bg: "bg-purple-50", label: "Submitted" },
  under_review: { icon: Clock, color: "text-orange-600", bg: "bg-orange-50", label: "Under Review" },
  approved: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", label: "Approved" },
  rejected: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", label: "Needs Revision" },
  closed: { icon: CheckCircle, color: "text-gray-600", bg: "bg-gray-50", label: "Closed" },
};

// Skeleton loader for job cards
function JobCardSkeleton() {
  return (
    <div className="w-full p-4 rounded-xl border bg-card animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
          <div className="h-2 bg-muted rounded w-full mt-3" />
        </div>
      </div>
    </div>
  );
}

// Empty state component
function EmptyState({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8 sm:py-12 px-3 sm:px-0"
    >
      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
        <ClipboardList size={24} className="sm:w-8 sm:h-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold mb-1 text-base sm:text-lg">No permits yet</h3>
      <p className="text-xs sm:text-sm text-muted-foreground mb-4">
        Start your first permit job
      </p>
      <Button onClick={onCreateNew} className="w-full sm:w-auto">
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
    // Active jobs first
    const aActive = a.status !== "approved" && a.status !== "closed";
    const bActive = b.status !== "approved" && b.status !== "closed";
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;
    // Then by date (newest first)
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
          className="w-full text-left p-4 rounded-xl border bg-card hover:shadow-md transition-shadow group"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold truncate">{job.jobType.replace(/_/g, " ")}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                  {status.label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">{job.address}</p>
              <p className="text-xs text-muted-foreground mt-1">{job.jurisdiction.replace(/_/g, " ")}</p>
              
              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <ChevronRight size={20} className="text-muted-foreground shrink-0" />
              <button
                onClick={(e) => handleDeleteJob(job.id, e)}
                disabled={deletingJobId === job.id}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-100 text-muted-foreground hover:text-red-600"
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
        <div className="px-3 sm:px-0 space-y-4">
          <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
          <div className="h-10 bg-muted rounded w-full animate-pulse" />
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
        <div className="px-3 sm:px-0 text-center py-12">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Failed to load jobs</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchJobs} variant="outline">
            <RefreshCw size={16} className="mr-2" />
            Try Again
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4 sm:mb-6 px-3 sm:px-0"
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">My Permits</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            {activeJobs.length} active, {completedJobs.length} completed
          </p>
        </div>
        <Button onClick={() => navigate("/new")} size="sm" className="shrink-0">
          <Plus size={16} className="mr-1" />
          New
        </Button>
      </motion.div>

      {/* Search & Filter */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 mb-4 px-3 sm:px-0"
      >
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by address or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border bg-background text-sm"
          />
        </div>
        <Button variant="outline" size="sm" className="px-3 shrink-0">
          <Filter size={16} />
        </Button>
      </motion.div>

      {jobs.length === 0 ? (
        <EmptyState onCreateNew={() => navigate("/new")} />
      ) : (
        <div className="space-y-4 sm:space-y-6 px-3 sm:px-0">
          {/* Active Jobs */}
          {activeJobs.length > 0 && (
            <section>
              <h2 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 sm:mb-3">
                Active ({activeJobs.length})
              </h2>
              <div className="space-y-2 sm:space-y-3">
                <AnimatePresence>
                  {activeJobs.map((job, index) => renderJobCard(job, index))}
                </AnimatePresence>
              </div>
            </section>
          )}

          {/* Completed Jobs */}
          {completedJobs.length > 0 && (
            <section>
              <h2 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 sm:mb-3">
                Completed ({completedJobs.length})
              </h2>
              <div className="space-y-2 sm:space-y-3">
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
              <p className="text-muted-foreground">No jobs match your search</p>
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
  );
}
