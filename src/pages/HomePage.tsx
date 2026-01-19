import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileText, Clock, ChevronRight, Zap, Droplet, Bath } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { useJob } from "@/hooks/useJob";
import { Job, JobType } from "@/types";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

const JOB_ICONS: Record<JobType, typeof Zap> = {
  ELECTRICAL_PANEL: Zap,
  WATER_HEATER: Droplet,
  BATH_REMODEL: Bath,
};

const JOB_LABELS: Record<JobType, string> = {
  ELECTRICAL_PANEL: "Electrical Panel",
  WATER_HEATER: "Water Heater",
  BATH_REMODEL: "Bath Remodel",
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
      {/* Header */}
      <header className="bg-primary px-6 pt-8 pb-12 safe-area-inset-top">
        <h1 className="text-2xl font-bold text-primary-foreground">
          AI Permit Assistant
        </h1>
        <p className="text-primary-foreground/80 mt-1">
          Document permit requirements with AI
        </p>
      </header>

      {/* Content */}
      <div className="px-4 -mt-6">
        {/* New Job Card */}
        <button
          onClick={() => navigate("/new")}
          className="w-full bg-card rounded-xl p-5 shadow-md border border-border flex items-center gap-4 mb-6 hover:shadow-lg transition-shadow active:scale-[0.98]"
        >
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <Plus size={24} className="text-primary-foreground" />
          </div>
          <div className="flex-1 text-left">
            <h2 className="font-semibold text-foreground">Start New Job</h2>
            <p className="text-sm text-muted-foreground">
              Begin documenting a new permit
            </p>
          </div>
          <ChevronRight size={20} className="text-muted-foreground" />
        </button>

        {/* Recent Jobs */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Recent Jobs</h2>
          <span className="text-sm text-muted-foreground">{jobs.length} total</span>
        </div>

        {isLoading ? (
          <div className="py-12">
            <LoadingSpinner text="Loading jobs..." />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No jobs yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start your first job to begin documenting
            </p>
          </div>
        ) : (
          <div className="space-y-3">
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
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon size={20} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate">
                          {job.title || JOB_LABELS[job.jobType]}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {job.address || job.jurisdiction}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs">
                          <span className={`font-medium ${getStatusColor(job.status)}`}>
                            {getStatusLabel(job.status)}
                          </span>
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Clock size={12} />
                            {formatDate(job.updatedAt)}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-muted-foreground mt-2" />
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
