import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter, Clock, CheckCircle, AlertCircle, ChevronRight, ClipboardList } from "lucide-react";
import { useState, useEffect } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/shared/Button";
import { getAllJobsFromMemory } from "./NewJobPage";
import { calculateProgress } from "@/services/requirements";
import { Job } from "@/types/permit";

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

export default function MyJobsPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    setJobs(getAllJobsFromMemory());
  }, []);

  // Sort jobs: active first, then by date
  const sortedJobs = [...jobs].sort((a, b) => {
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

  const renderJobCard = (job: typeof jobs[0]) => {
    const progress = calculateProgress(job.requirements);
    const status = statusConfig[job.status];
    const StatusIcon = status.icon;

    return (
      <button
        key={job.id}
        onClick={() => navigate(`/wizard/${job.id}`)}
        className="w-full text-left p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
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
                <div 
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
          <ChevronRight size={20} className="text-muted-foreground shrink-0" />
        </div>
      </button>
    );
  };

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Permits</h1>
          <p className="text-muted-foreground text-sm">
            {activeJobs.length} active, {completedJobs.length} completed
          </p>
        </div>
        <Button onClick={() => navigate("/new")} size="sm">
          <Plus size={16} className="mr-1" />
          New
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by address or type..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border bg-background text-sm"
          />
        </div>
        <Button variant="outline" size="sm" className="px-3">
          <Filter size={16} />
        </Button>
      </div>

      {jobs.length === 0 ? (
        // Empty State
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <ClipboardList size={32} className="text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-1">No permits yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Start your first permit job
          </p>
          <Button onClick={() => navigate("/new")}>
            <Plus size={16} className="mr-2" />
            Start New Job
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Jobs */}
          {activeJobs.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Active ({activeJobs.length})
              </h2>
              <div className="space-y-3">
                {activeJobs.map(renderJobCard)}
              </div>
            </section>
          )}

          {/* Completed Jobs */}
          {completedJobs.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Completed ({completedJobs.length})
              </h2>
              <div className="space-y-3">
                {completedJobs.map(renderJobCard)}
              </div>
            </section>
          )}
        </div>
      )}
    </PageWrapper>
  );
}
