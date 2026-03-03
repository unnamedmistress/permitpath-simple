import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Plus, FileText, ChevronRight, Zap, Droplet, Bath, Sun, SquareStack, MapPin, Gift } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageWrapper from "@/components/layout/PageWrapper";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { useJobs } from "@/hooks/useJobs";
import { Job, JobType } from "@/types/permit";
import { formatJobTypeLabel } from "@/lib/utils";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import WelcomeModal from "@/components/shared/WelcomeModal";

const QUICK_JOB_CARDS = [
  { type: "RE_ROOFING" as JobType, label: "Roof", icon: SquareStack, color: "bg-orange-500" },
  { type: "WATER_HEATER" as JobType, label: "Water Heater", icon: Droplet, color: "bg-blue-500" },
  { type: "ELECTRICAL_PANEL" as JobType, label: "Electrical", icon: Zap, color: "bg-yellow-500" },
  { type: "AC_HVAC_CHANGEOUT" as JobType, label: "AC/HVAC", icon: Sun, color: "bg-green-500" },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

// Skeleton loader for job cards
function JobCardSkeleton() {
  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border border-border animate-pulse">
      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
      <div className="h-3 bg-muted rounded w-1/2" />
    </div>
  );
}

// Empty state component
function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12 bg-gradient-to-b from-muted/50 to-muted rounded-2xl border border-border"
    >
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <MapPin size={32} className="text-primary/50" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">No jobs yet</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
        Tap "Start New Job" to get your permit checklist
      </p>
      <button
        onClick={onCreate}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <Plus size={16} />
        Start Your First Job
      </button>
    </motion.div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { jobs, isLoading, deleteJob, fetchJobs } = useJobs();
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getStatusLabel = (status: Job["status"]) => {
    const labels: Record<string, string> = {
      approved: "Approved",
      ready_to_submit: "Ready",
      submitted: "Submitted",
      under_review: "In Review",
      requirements_pending: "Requirements Pending",
      documents_pending: "Documents Pending",
      draft: "Draft",
      rejected: "Needs Revision",
      closed: "Closed",
    };
    return labels[status] || status;
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
    try {
      setDeleteLoading(true);
      await deleteJob(jobToDelete.id);
      toast.success("Job deleted", {
        description: `"${formatJobTypeLabel(jobToDelete.jobType)}" has been removed.`,
      });
      setJobToDelete(null);
    } catch (error) {
      toast.error("Failed to delete job");
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusColorClass = (status: Job["status"]) => {
    return status === "approved" || status === "ready_to_submit" 
      ? 'bg-green-100 text-green-700' 
      : status === "rejected" 
        ? 'bg-red-100 text-red-700'
        : 'bg-amber-100 text-amber-700';
  };

  return (
    <PageWrapper>
      <WelcomeModal />
      


      {/* Gradient Header */}
      <motion.header 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary via-primary to-blue-700 px-3 sm:px-4 pt-4 sm:pt-6 pb-6 sm:pb-8" 
        role="banner"
      >
        <h1 className="text-xl sm:text-2xl font-bold text-primary-foreground leading-tight">
          Get Your Permit
        </h1>
        <p className="text-base sm:text-lg text-primary-foreground/90 mt-1 font-medium">
          We'll Help You Every Step
        </p>
      </motion.header>

      {/* FREE Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-3 -mt-2"
      >
        <div className="bg-green-100 border border-green-300 rounded-xl p-2 sm:p-3 flex items-center justify-center gap-2">
          <Gift size={16} className="text-green-700" />
          <p className="text-xs sm:text-sm font-medium text-green-800">
            PermitPath is <strong>FREE</strong>
          </p>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div 
        className="px-3 -mt-4 pt-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        
        {/* Quick Job Type Banner */}
        <motion.div variants={itemVariants} className="bg-card rounded-xl p-3 sm:p-4 shadow-md border border-border mb-4">
          <p className="text-xs text-muted-foreground mb-3 text-center">Popular Jobs - Tap to Start</p>
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {QUICK_JOB_CARDS.map(({ type, label, icon: Icon, color }) => (
              <motion.button
                key={type}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/new?jobType=${type}`)}
                className="flex flex-col items-center gap-1.5 p-2 sm:p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${color} flex items-center justify-center`}>
                  <Icon size={20} className="text-white sm:w-6 sm:h-6" />
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-foreground">{label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Jobs Section */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm sm:text-base font-semibold text-foreground">
              Your Jobs ({jobs.length})
            </h2>
            <button
              onClick={() => navigate("/new")}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs sm:text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus size={14} />
              New Job
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <JobCardSkeleton />
              <JobCardSkeleton />
              <JobCardSkeleton />
            </div>
          ) : jobs.length === 0 ? (
            <EmptyState onCreate={() => navigate("/new")} />
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {jobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => navigate(`/wizard/${job.id}`)}
                    className="bg-card rounded-xl p-3 sm:p-4 shadow-sm border border-border cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <FileText size={20} className="text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">
                            {formatJobTypeLabel(job.jobType)}
                          </h3>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColorClass(job.status)}`}>
                            {getStatusLabel(job.status)}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {job.address || "No address set"}
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                          Started {formatDate(job.createdAt)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </motion.div>

      <ConfirmDialog
        open={!!jobToDelete}
        onClose={() => setJobToDelete(null)}
        onConfirm={handleDeleteJob}
        title="Delete Job"
        description={`Are you sure you want to delete "${jobToDelete ? formatJobTypeLabel(jobToDelete.jobType) : ''}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        destructive
        loading={deleteLoading}
      />

      {/* Legal Footer - Compact */}
      <div className="px-3 py-4 mt-4 border-t border-border">
        <p className="text-[10px] text-muted-foreground text-center">
          This tool provides general information only and does not constitute legal advice.
        </p>
      </div>
    </PageWrapper>
  );
}
