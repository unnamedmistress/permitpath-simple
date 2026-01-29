import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, ExternalLink, RotateCcw, CheckCircle2, AlertCircle, BookOpen, Scale, MapPin } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/shared/Button";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useJob } from "@/hooks/useJob";
import { useChecklist } from "@/hooks/useChecklist";
import { LEGAL_SOURCES } from "@/data/pinellasLegalSources";
import { Photo, ChecklistItem, JobType, LegalSource } from "@/types";

// Access shared photo storage
let memoryPhotos: Record<string, Photo[]> = {};

// Permit requirements by job type
const PERMIT_REQUIREMENTS: Record<JobType, { permits: string[]; inspections: string[]; forms: string[] }> = {
  SMALL_BATH_REMODEL: {
    permits: ["Building Permit (if structural)", "Plumbing Permit (if moving fixtures)", "Electrical Permit (if adding circuits)"],
    inspections: ["Rough Plumbing", "Rough Electrical", "Final Building"],
    forms: ["Permit Application", "Notice of Commencement (if over $5,000)"]
  },
  AC_HVAC_CHANGEOUT: {
    permits: ["Mechanical Permit"],
    inspections: ["Mechanical Final"],
    forms: ["Express Permit Application", "Equipment Specifications"]
  },
  WATER_HEATER: {
    permits: ["Plumbing Permit", "Electrical Permit (if electric)"],
    inspections: ["Plumbing Final", "Electrical Final (if applicable)"],
    forms: ["Express Permit Application", "Tankless Worksheet (if tankless)"]
  },
  RE_ROOFING: {
    permits: ["Roofing Permit"],
    inspections: ["Dry-In Inspection", "Final Roofing"],
    forms: ["Re-Roofing Application", "Mitigation Affidavit", "Notice of Commencement"]
  },
  ELECTRICAL_PANEL: {
    permits: ["Electrical Permit"],
    inspections: ["Rough Electrical", "Final Electrical"],
    forms: ["Electrical Permit Application", "Load Calculation"]
  },
  WINDOW_DOOR_REPLACEMENT: {
    permits: ["Building Permit"],
    inspections: ["Final Building"],
    forms: ["Window/Door Replacement Form", "Product Approval Documentation"]
  },
  POOL_BARRIER: {
    permits: ["Building Permit"],
    inspections: ["Final Pool Barrier"],
    forms: ["Pool Barrier Application", "Gate/Alarm Specifications"]
  },
  GENERATOR_INSTALL: {
    permits: ["Electrical Permit", "Fuel Gas Permit (if applicable)"],
    inspections: ["Electrical Final", "Mechanical Final"],
    forms: ["Generator Application", "Load Calculation", "Site Plan"]
  },
  EV_CHARGER: {
    permits: ["Electrical Permit"],
    inspections: ["Electrical Final"],
    forms: ["Express Permit Application", "Circuit Specifications"]
  }
};

// Relevant legal sources by job type (using Florida Residential Code references)
const JOB_LEGAL_SOURCES: Record<JobType, string[]> = {
  SMALL_BATH_REMODEL: ["FRC_105_2", "FBC_R303", "NEC_210_8", "FBC_PLUMBING", "PINELLAS_PERMIT_GUIDE", "PINELLAS_NOC"],
  AC_HVAC_CHANGEOUT: ["FBC_MECHANICAL", "PINELLAS_HVAC", "PINELLAS_EXPRESS", "PINELLAS_INSPECTIONS"],
  WATER_HEATER: ["FBC_PLUMBING", "NEC_422", "PINELLAS_TANKLESS", "PINELLAS_EXPRESS"],
  RE_ROOFING: ["FRC_ROOFING", "PINELLAS_REROOFING", "PINELLAS_NOC", "PINELLAS_INSPECTIONS"],
  ELECTRICAL_PANEL: ["NEC_210_52", "NEC_210_8", "PINELLAS_PERMIT_GUIDE", "PINELLAS_INSPECTIONS"],
  WINDOW_DOOR_REPLACEMENT: ["PINELLAS_WINDOW_DOOR", "FL_PRODUCT_APPROVAL", "PINELLAS_PERMIT_GUIDE"],
  POOL_BARRIER: ["PINELLAS_POOL_BARRIER", "FL_POOL_SAFETY", "PINELLAS_PERMIT_GUIDE"],
  GENERATOR_INSTALL: ["FBC_GENERATOR", "NEC_422", "PINELLAS_PERMIT_GUIDE", "PINELLAS_INSPECTIONS"],
  EV_CHARGER: ["NEC_625", "PINELLAS_EXPRESS", "PINELLAS_PERMIT_GUIDE"]
};

const JOB_TYPE_LABELS: Record<JobType, string> = {
  SMALL_BATH_REMODEL: "Small Bathroom Remodel",
  AC_HVAC_CHANGEOUT: "AC/HVAC Changeout",
  WATER_HEATER: "Water Heater Installation",
  RE_ROOFING: "Re-Roofing",
  ELECTRICAL_PANEL: "Electrical Panel Upgrade",
  WINDOW_DOOR_REPLACEMENT: "Window/Door Replacement",
  POOL_BARRIER: "Pool Barrier Installation",
  GENERATOR_INSTALL: "Generator Installation",
  EV_CHARGER: "EV Charger Installation"
};

export default function PreviewPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  
  const { currentJob, getJob, isLoading: jobLoading } = useJob();
  const { items: checklistItems, fetchChecklist } = useChecklist(jobId || "");
  
  const [photos, setPhotos] = useState<Photo[]>([]);
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

  const handleStartOver = () => {
    navigate("/new");
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

  const jobType = currentJob?.jobType || "SMALL_BATH_REMODEL";
  const permitInfo = PERMIT_REQUIREMENTS[jobType];
  const relevantSourceKeys = JOB_LEGAL_SOURCES[jobType];
  const relevantSources = relevantSourceKeys.map(key => ({ key, ...LEGAL_SOURCES[key] })).filter(s => s.label);

  return (
    <PageWrapper hasBottomNav={false}>
      {/* Header */}
      <header className="bg-card border-b border-border px-3 py-3 flex items-center justify-between safe-area-inset-top sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/wizard/${jobId}`)}
            className="p-1.5 -ml-1 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <div>
            <h1 className="font-semibold text-sm text-foreground">Permit Summary</h1>
            <p className="text-xs text-muted-foreground">
              {completedItems.length} of {checklistItems.length} items complete
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-3 space-y-4 pb-6">
        {/* Job Summary Card */}
        <div className="bg-card rounded-lg border border-border p-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText size={20} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-sm text-foreground">
                {JOB_TYPE_LABELS[jobType]}
              </h2>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={12} className="text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Pinellas County</p>
              </div>
              {currentJob?.address && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{currentJob.address}</p>
              )}
            </div>
          </div>
        </div>

        {/* Permits You May Need */}
        <section>
          <h3 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-1.5">
            <Scale size={16} className="text-primary" />
            Permits You May Need
          </h3>
          <div className="bg-card rounded-lg border border-border divide-y divide-border">
            {permitInfo.permits.map((permit, idx) => (
              <div key={idx} className="p-3 flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText size={14} className="text-primary" />
                </div>
                <span className="text-sm text-foreground">{permit}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Required Inspections */}
        <section>
          <h3 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-1.5">
            <CheckCircle2 size={16} className="text-success" />
            Required Inspections
          </h3>
          <div className="bg-card rounded-lg border border-border divide-y divide-border">
            {permitInfo.inspections.map((inspection, idx) => (
              <div key={idx} className="p-3 flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-success font-semibold text-xs">{idx + 1}</span>
                </div>
                <span className="text-sm text-foreground">{inspection}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Forms Needed */}
        <section>
          <h3 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-1.5">
            <AlertCircle size={16} className="text-warning" />
            Forms You'll Need
          </h3>
          <div className="bg-card rounded-lg border border-border divide-y divide-border">
            {permitInfo.forms.map((form, idx) => (
              <div key={idx} className="p-3 flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                  <FileText size={14} className="text-warning" />
                </div>
                <span className="text-sm text-foreground">{form}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Your Answers Summary */}
        {completedItems.length > 0 && (
          <section>
            <h3 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-success" />
              Your Answers ({completedItems.length})
            </h3>
            <div className="space-y-2">
              {completedItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-success/5 border border-success/20 rounded-lg p-3"
                >
                  <h4 className="font-medium text-sm text-foreground">{item.title}</h4>
                  {item.value && (
                    <div className="mt-1.5 px-2 py-1.5 bg-card rounded text-xs text-foreground">
                      {item.value}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pending Items */}
        {pendingItems.length > 0 && (
          <section>
            <h3 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-1.5">
              <AlertCircle size={16} className="text-warning" />
              Still Needed ({pendingItems.length})
            </h3>
            <div className="space-y-2">
              {pendingItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-warning/5 border border-warning/20 rounded-lg p-3"
                >
                  <h4 className="font-medium text-sm text-foreground">{item.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Photos */}
        {photos.length > 0 && (
          <section>
            <h3 className="font-semibold text-sm text-foreground mb-2">
              Documentation Photos ({photos.length})
            </h3>
            <div className="grid grid-cols-3 gap-1.5">
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

        {/* Legal Sources & Citations */}
        <section>
          <h3 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-1.5">
            <BookOpen size={16} className="text-primary" />
            Official Sources & Citations
          </h3>
          <div className="bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 mb-3">
            <p className="text-xs text-primary font-medium">
              🏠 Residential Code References
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              All code references are from the 2023 Florida Residential Code (8th Edition) for single-family and two-family dwellings.
            </p>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Tap any source below to read the official requirements.
          </p>
          <div className="space-y-2">
            {relevantSources.map((source) => (
              <a
                key={source.key}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-card rounded-lg border border-border p-3 hover:border-primary/50 hover:bg-primary/5 transition-all group"
              >
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <ExternalLink size={14} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                      {source.label}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {source.description}
                    </p>
                    {source.lastUpdated && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Updated: {source.lastUpdated}
                      </p>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Action Buttons */}
        <div className="pt-3 space-y-2">
          <Button
            onClick={() => navigate(`/wizard/${jobId}`)}
            variant="primary"
            size="md"
            className="w-full"
          >
            Continue Editing
          </Button>
          
          <Button
            onClick={handleStartOver}
            variant="outline"
            size="md"
            className="w-full"
            icon={<RotateCcw size={16} />}
          >
            Start Over
          </Button>
        </div>

        {/* Disclaimer */}
        <div className="bg-muted/50 rounded-lg p-3 mt-4">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            <strong>Disclaimer:</strong> This summary is for informational purposes only. 
            Verify requirements with Pinellas County Building Services before submitting.
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}
