import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Plus, FileText, Clock, ChevronRight, Zap, Droplet, Bath, Sun, SquareStack, Fence, BatteryCharging, Car, MoreVertical, Trash2, Edit3, Home, Briefcase, DollarSign, CheckCircle2, MapPin, Sparkles, Shield, Gift, AlertTriangle, Info } from "lucide-react";
import { motion } from "framer-motion";
import PageWrapper from "@/components/layout/PageWrapper";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { useJobs } from "@/hooks/useJobs";
import { Job, JobType } from "@/types/permit";
import { formatJobTypeLabel } from "@/lib/utils";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import WelcomeModal from "@/components/shared/WelcomeModal";

const JOB_ICONS: Record<JobType, typeof Zap> = {
  AC_HVAC_CHANGEOUT: Sun,
  WATER_HEATER: Droplet,
  RE_ROOFING: SquareStack,
  ELECTRICAL_PANEL: Zap,
  WINDOW_DOOR_REPLACEMENT: SquareStack,
  POOL_BARRIER: Fence,
  GENERATOR_INSTALL: BatteryCharging,
  EV_CHARGER: Car,
  SMALL_BATH_REMODEL: Bath,
  ROOF_REPAIR: SquareStack,
  ELECTRICAL_REWIRING: Zap,
  PLUMBING_MAIN_LINE: Droplet,
  KITCHEN_REMODEL: Home,
  SIDING_EXTERIOR: SquareStack,
  DECK_INSTALLATION: Fence,
  FENCE_INSTALLATION: Fence,
  ROOM_ADDITION: Home,
  FOUNDATION_REPAIR: Home,
};

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

export default function HomePage() {
  const navigate = useNavigate();
  const { jobs, isLoading, deleteJob } = useJobs();
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: Job["status"]) => {
    return status === "approved" || status === "ready_to_submit" ? "text-green-600" : "text-amber-600";
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

  const handleMenuClick = (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    navigator.vibrate?.(10);
    setMenuOpenId(menuOpenId === jobId ? null : jobId);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setMenuOpenId(null);
    if (menuOpenId) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [menuOpenId]);

  // Empty state component
  const EmptyState = useCallback(() => (
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
      <Link
        to="/new"
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <Plus size={16} />
        Start Your First Job
      </Link>
    </motion.div>
  ), []);

  return (
    <>
      <WelcomeModal />
      <PageWrapper>
      {/* UPL Disclaimer Banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-3 py-2">
        <div className="flex items-start gap-2 max-w-4xl mx-auto">
          <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Legal Notice:</strong> This tool provides general information only and does not constitute legal advice. Always consult with a qualified professional for your specific situation.
          </p>
        </div>
      </div>

      {/* Gradient Header - PermitPath 2.0 */}
      <motion.header 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary via-primary to-blue-700 px-3 sm:px-4 pt-4 sm:pt-6 pb-6 sm:pb-8 safe-area-inset-top" 
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
            PermitPath is <strong>FREE</strong> — We help you get permits, county fees are paid separately
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
              <button
                key={type}
                onClick={() => navigate(`/new?jobType=${type}`)}
                className="flex flex-col items-center