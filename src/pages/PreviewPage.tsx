import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, FileText } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/shared/Button";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useJob } from "@/hooks/useJob";
import { useChecklist } from "@/hooks/useChecklist";
import { generatePermitPackageHtml, downloadHtml } from "@/utils/exportHtml";
import { Photo, ChecklistItem, Job } from "@/types";

// Access shared photo storage
let memoryPhotos: Record<string, Photo[]> = {};

export default function PreviewPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  
  const { currentJob, getJob, isLoading: jobLoading } = useJob();
  const { items: checklistItems, fetchChecklist } = useChecklist(jobId || "");
  
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [htmlPreview, setHtmlPreview] = useState<string>("");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    
    const init = async () => {
      const job = await getJob(jobId);
      if (!job) {
        navigate("/");
        return;
      }
      
      await fetchChecklist();
      setPhotos(memoryPhotos[jobId] || []);
      setInitialized(true);
    };
    
    init();
  }, [jobId]);

  useEffect(() => {
    if (currentJob && checklistItems.length > 0) {
      const html = generatePermitPackageHtml({
        job: currentJob,
        checklist: checklistItems,
        photos,
      });
      setHtmlPreview(html);
    }
  }, [currentJob, checklistItems, photos]);

  const handleDownloadHtml = () => {
    if (!currentJob) return;
    const filename = `permit-package-${currentJob.jobType.toLowerCase()}-${new Date().toISOString().split("T")[0]}.html`;
    downloadHtml(htmlPreview, filename);
  };

  const completedItems = checklistItems.filter(i => i.status === "COMPLETE");
  const pendingItems = checklistItems.filter(i => i.status !== "COMPLETE");

  if (!initialized || jobLoading) {
    return (
      <PageWrapper hasBottomNav={false}>
        <div className="flex items-center justify-center h-screen">
          <LoadingSpinner size="lg" text="Loading preview..." />
        </div>
      </PageWrapper>
    );
  }

  const JOB_TYPE_LABELS: Record<string, string> = {
    ELECTRICAL_PANEL: "Electrical Panel Upgrade",
    WATER_HEATER: "Water Heater Installation",
    BATH_REMODEL: "Bathroom Remodel",
  };

  return (
    <PageWrapper hasBottomNav={false}>
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-4 flex items-center justify-between safe-area-inset-top sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/wizard/${jobId}`)}
            className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft size={24} className="text-foreground" />
          </button>
          <div>
            <h1 className="font-semibold text-foreground">Preview Package</h1>
            <p className="text-xs text-muted-foreground">
              {completedItems.length} of {checklistItems.length} items complete
            </p>
          </div>
        </div>
        
        <Button
          onClick={handleDownloadHtml}
          variant="primary"
          size="sm"
          icon={<Download size={16} />}
        >
          Download as HTML
        </Button>
      </header>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Job Summary Card */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText size={24} className="text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">
                {currentJob ? JOB_TYPE_LABELS[currentJob.jobType] : "Permit Package"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {currentJob?.jurisdiction === "PINELLAS" ? "Pinellas County" : "City of Tampa"}
              </p>
              {currentJob?.address && (
                <p className="text-sm text-muted-foreground">{currentJob.address}</p>
              )}
            </div>
          </div>
        </div>

        {/* Completed Requirements */}
        {completedItems.length > 0 && (
          <section>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success" />
              Completed Requirements ({completedItems.length})
            </h3>
            <div className="space-y-2">
              {completedItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-success/5 border border-success/20 rounded-lg p-4"
                >
                  <h4 className="font-medium text-foreground">{item.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  {item.value && (
                    <div className="mt-2 px-3 py-2 bg-card rounded text-sm font-mono text-foreground">
                      {item.value}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pending Requirements */}
        {pendingItems.length > 0 && (
          <section>
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-warning" />
              Pending Requirements ({pendingItems.length})
            </h3>
            <div className="space-y-2">
              {pendingItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-warning/5 border border-warning/20 rounded-lg p-4"
                >
                  <h4 className="font-medium text-foreground">{item.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Photos */}
        {photos.length > 0 && (
          <section>
            <h3 className="font-semibold text-foreground mb-3">
              Documentation Photos ({photos.length})
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {photos.filter(p => p.status === "COMPLETE").map((photo) => (
                <img
                  key={photo.id}
                  src={photo.url}
                  alt="Job documentation"
                  className="w-full aspect-square object-cover rounded-lg border border-border"
                />
              ))}
            </div>
          </section>
        )}

        {/* Action Buttons */}
        <div className="pt-4 space-y-3">
          <Button
            onClick={handleDownloadHtml}
            variant="primary"
            size="lg"
            className="w-full"
            icon={<Download size={20} />}
          >
            Download as HTML
          </Button>
          
          <Button
            onClick={() => navigate(`/wizard/${jobId}`)}
            variant="outline"
            size="lg"
            className="w-full"
          >
            Continue Editing
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}
