import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileText, Clock, ChevronRight, Zap, Droplet, Bath, Sun, SquareStack, Fence, BatteryCharging, Car, Wrench } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { useJob } from "@/hooks/useJob";
import { Job, JobType } from "@/types";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

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

export default function HomePage() {
  const navigate = useNavigate();
  const { jobs, isLoading, fetchJobs } = useJob();

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

  return (
    <PageWrapper>
      {/* Compact Header */}
      <header className="bg-primary px-4 pt-4 pb-8 safe-area-inset-top">
        <h1 className="text-xl font-bold text-primary-foreground">
          AI Permit Assistant
        </h1>
        <p className="text-xs text-primary-foreground/80 mt-0.5">
          Document permit requirements with AI
        </p>
      </header>

      {/* Content */}
      <div className="px-3 -mt-4">
        {/* New Job Card - Compact */}
        <button
          onClick={() => navigate("/new")}
          className="w-full bg-card rounded-xl p-3 shadow-md border border-border flex items-center gap-3 mb-4 hover:shadow-lg transition-shadow active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Plus size={20} className="text-primary-foreground" />
          </div>
          <div className="flex-1 text-left">
            <h2 className="text-sm font-semibold text-foreground">Start New Job</h2>
            <p className="text-xs text-muted-foreground">
              Begin documenting a new permit
            </p>
          </div>
          <ChevronRight size={18} className="text-muted-foreground" />
        </button>

        {/* Recent Jobs */}
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Recent Jobs</h2>
          <span className="text-xs text-muted-foreground">{jobs.length} total</span>
        </div>

        {isLoading ? (
          <div className="py-8">
            <LoadingSpinner text="Loading jobs..." />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-8">
            <FileText size={36} className="mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No jobs yet</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Start your first job to begin
            </p>
          </div>
        ) : (
          <div className="space-y-2 pb-20">
            {jobs
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .map((job) => {
                const Icon = JOB_ICONS[job.jobType];
                return (
                  <button
                    key={job.id}
                    onClick={() => navigate(`/wizard/${job.id}`)}
                    className="job-card w-full text-left"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon size={16} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-foreground truncate">
                          {job.title || JOB_LABELS[job.jobType]}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {job.address || job.jurisdiction}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[10px]">
                          <span className={`font-medium ${getStatusColor(job.status)}`}>
                            {getStatusLabel(job.status)}
                          </span>
                          <span className="text-muted-foreground flex items-center gap-0.5">
                            <Clock size={10} />
                            {formatDate(job.updatedAt)}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground mt-1" />
                    </div>
                  </button>
                );
              })}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}