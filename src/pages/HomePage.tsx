import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Plus, FileText, Clock, ChevronRight, Zap, Droplet, Bath, Sun, SquareStack, Fence, BatteryCharging, Car, MoreVertical, Trash2, Edit3, Home, Briefcase, DollarSign, CheckCircle2, MapPin, Sparkles } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { useJob } from "@/hooks/useJob";
import { Job, JobType } from "@/types";
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
};

const JOB_LABELS: Record<JobType, string> = {
  AC_HVAC_CHANGEOUT: "AC/HVAC",
  WATER_HEATER: "Water Heater",
  RE_ROOFING: "Re-Roofing",
  ELECTRICAL_PANEL: "Electrical Panel",
  WINDOW_DOOR_REPLACEMENT: "Window/Door",
  POOL_BARRIER: "Pool Barrier",
  GENERATOR_INSTALL: "Generator",
  EV_CHARGER: "EV Charger",
  SMALL_BATH_REMODEL: "Bath Remodel",
};

const QUICK_JOB_CARDS = [
  { type: "RE_ROOFING" as JobType, label: "Roof", icon: SquareStack, color: "bg-orange-500" },
  { type: "WATER_HEATER" as JobType, label: "Water Heater", icon: Droplet, color: "bg-blue-500" },
  { type: "ELECTRICAL_PANEL" as JobType, label: "Electrical", icon: Zap, color: "bg-yellow-500" },
  { type: "AC_HVAC_CHANGEOUT" as JobType, label: "AC/HVAC", icon: Sun, color: "bg-green-500" },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { jobs, isLoading, fetchJobs, deleteJob } = useJob();
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: Job["status"]) => {
    return status === "READY_FOR_PREVIEW" ? "text-success" : "text-warning";
  };

  const getStatusLabel = (status: Job["status"]) => {
    return status === "READY_FOR_PREVIEW" ? "Ready" : "In Progress";
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
    try {
      await deleteJob(jobToDelete.id);
      toast.success("Job deleted", {
        description: `"${jobToDelete.title || JOB_LABELS[jobToDelete.jobType]}" has been removed.`,
      });
      setJobToDelete(null);
    } catch (error) {
      toast.error("Failed to delete job");
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

  return (
    <>
      <WelcomeModal />
      <PageWrapper>
      {/* Gradient Header - PermitPath 2.0 */}
      <header className="bg-gradient-to-br from-primary via-primary to-blue-700 px-4 pt-6 pb-8 safe-area-inset-top">
        <h1 className="text-2xl font-bold text-primary-foreground leading-tight">
          Get Your Permit
        </h1>
        <p className="text-lg text-primary-foreground/90 mt-1 font-medium">
          We'll Help You Every Step
        </p>
      </header>

      {/* Content */}
      <div className="px-3 -mt-4">
        
        {/* Quick Job Type Banner */}
        <div className="bg-card rounded-xl p-4 shadow-md border border-border mb-4">
          <p className="text-xs text-muted-foreground mb-3 text-center">Popular Jobs - Tap to Start</p>
          <div className="grid grid-cols-4 gap-2">
            {QUICK_JOB_CARDS.map(({ type, label, icon: Icon, color }) => (
              <button
                key={type}
                onClick={() => navigate(`/new?jobType=${type}`)}
                className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-muted active:scale-95 transition-all"
              >
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shadow-md`}>
                  <Icon size={24} className="text-white" />
                </div>
                <span className="text-[10px] font-medium text-foreground text-center leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* What You'll Need Panel */}
        <div className="bg-card rounded-xl p-4 shadow-md border border-border mb-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">What You'll Need</h2>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Home size={16} className="text-blue-600" />
              </div>
              <span className="text-sm text-foreground">Your property address</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <Briefcase size={16} className="text-green-600" />
              </div>
              <span className="text-sm text-foreground">Your contractor information</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <DollarSign size={16} className="text-yellow-600" />
              </div>
              <span className="text-sm text-foreground">A description of the work (we'll help translate it)</span>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={16} className="text-white" />
              </div>
              <span className="text-sm font-semibold text-green-600">That's it! We'll tell you everything else.</span>
            </div>
          </div>
        </div>

        {/* New Job Card - Primary CTA */}
        <Link
          to="/new"
          className="w-full bg-primary rounded-xl p-4 shadow-md flex items-center gap-3 mb-3 hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer block"
        >
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <Plus size={24} className="text-white" />
          </div>
          <div className="flex-1 text-left">
            <h2 className="text-lg font-bold text-white">Start New Job</h2>
            <p className="text-sm text-white/80">
              We'll make your permit checklist
            </p>
          </div>
          <ChevronRight size={24} className="text-white/60" />
        </Link>

        {/* AI Assistant Option */}
        <Link
          to="/ai-assistant"
          className="w-full bg-card border border-primary/20 rounded-xl p-4 shadow-sm flex items-center gap-3 mb-4 hover:shadow-md hover:bg-primary/5 transition-all active:scale-[0.98] cursor-pointer block"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles size={24} className="text-primary" />
          </div>
          <div className="flex-1 text-left">
            <h2 className="text-lg font-bold text-foreground">AI Permit Assistant</h2>
            <p className="text-sm text-muted-foreground">
              Chat and upload photos. We'll figure out permits.
            </p>
          </div>
          <ChevronRight size={24} className="text-muted-foreground/60" />
        </Link>

        {/* Recent Jobs */}
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Your Jobs</h2>
          <span className="text-xs text-muted-foreground">{jobs.length} total</span>
        </div>

        {isLoading ? (
          <div className="py-8">
            <LoadingSpinner text="Loading jobs..." />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-8 bg-muted rounded-xl">
            <MapPin size={40} className="mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm font-medium text-foreground">No jobs yet</p>
            <p className="text-xs text-muted-foreground mt-1 px-6">
              Tap "Start New Job" to get your permit checklist
            </p>
          </div>
        ) : (
          <div className="space-y-2 pb-20">
            {jobs
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .map((job) => {
                const Icon = JOB_ICONS[job.jobType];
                const isMenuOpen = menuOpenId === job.id;
                return (
                  <div key={job.id} className="relative">
                    <button
                      onClick={() => navigate(`/wizard/${job.id}`)}
                      className="job-card w-full text-left focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon size={16} className="text-primary" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-foreground truncate">
                            {job.title || JOB_LABELS[job.jobType]}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">
                            {job.address || job.jurisdiction}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs">
                            <span className={`font-medium ${getStatusColor(job.status)}`}>
                              {getStatusLabel(job.status)}
                            </span>
                            <span className="text-muted-foreground flex items-center gap-0.5">
                              <Clock size={12} aria-hidden="true" />
                              {formatDate(job.updatedAt)}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleMenuClick(e, job.id)}
                          className="p-1 -mr-1 rounded-lg hover:bg-muted transition-colors"
                          aria-label={`Options for ${job.title || JOB_LABELS[job.jobType]}`}
                        >
                          <MoreVertical size={16} className="text-muted-foreground" />
                        </button>
                      </div>
                    </button>
                    
                    {/* Dropdown menu */}
                    {isMenuOpen && (
                      <div 
                        className="absolute right-2 top-12 z-10 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[140px] animate-in fade-in zoom-in-95 duration-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            navigate(`/wizard/${job.id}`);
                            setMenuOpenId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                        >
                          <Edit3 size={14} />
                          Edit Job
                        </button>
                        <button
                          onClick={() => {
                            setJobToDelete(job);
                            setMenuOpenId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!jobToDelete}
          onClose={() => setJobToDelete(null)}
          onConfirm={handleDeleteJob}
          title="Delete Job?"
        description={`"${jobToDelete?.title || (jobToDelete && JOB_LABELS[jobToDelete.jobType])}" and all its data will be permanently deleted.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
        variant="danger"
      />
    </PageWrapper>
    </>
  );
}
