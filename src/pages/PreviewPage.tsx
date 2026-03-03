import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, FileText, RotateCcw, CheckCircle2, MapPin, ExternalLink, BookOpen, Download, Printer, Mail, Info, Shield, DollarSign, AlertTriangle } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/shared/Button";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useJob } from "@/hooks/useJob";
import { useChecklist } from "@/hooks/useChecklist";
import { usePhotos } from "@/context/PhotoContext";
import { LEGAL_SOURCES } from "@/data/pinellasLegalSources";
import { determinePermitRequirements, getRequiredInspections } from "@/data/permitLogic";
import { getBuildingDepartment } from "@/data/jurisdictionData";
import PermitReasoning from "@/components/preview/PermitReasoning";
import SubmissionGuide from "@/components/preview/SubmissionGuide";
import ApplicationGuide from "@/components/preview/ApplicationGuide";
import FeeEstimate from "@/components/permit/FeeEstimate";
import PhotoGuidelines from "@/components/permit/PhotoGuidelines";
import TimelineEstimate from "@/components/permit/TimelineEstimate";
import LicensingInfo from "@/components/permit/LicensingInfo";
import InspectionCheckpoints from "@/components/permit/InspectionCheckpoints";
import { JobType } from "@/types";

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

// Relevant legal sources by job type
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

export default function PreviewPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  
  const { currentJob, getJob, isLoading: jobLoading, updateJob } = useJob();
  const { items: checklistItems, fetchChecklist } = useChecklist(jobId || "");
  const { photos, loadPhotos } = usePhotos(jobId || "");
  
  const [initialized, setInitialized] = useState(false);
  const [jobNotFound, setJobNotFound] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailConsent, setEmailConsent] = useState(false);
  const [consentTimestamp, setConsentTimestamp] = useState<Date | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;
    
    const init = async () => {
      const job = await getJob(jobId);
      if (!job) {
        setJobNotFound(true);
        toast.error("Job not found", {
          description: "This job may have been deleted or the link is invalid.",
        });
        return;
      }
      
      await fetchChecklist();
      await loadPhotos();
      setInitialized(true);
    };
    
    init();
  }, [jobId, loadPhotos, fetchChecklist, getJob]);

  const handleStartOver = () => {
    navigate("/new");
  };

  const handleBackToDetails = () => {
    navigate(`/details/${jobId}`);
  };

  const handlePrint = () => {
    window.print();
    toast.success("Opening print dialog...");
  };

  const handleDownload = () => {
    // In a real implementation, this would generate a PDF
    // For now, we'll trigger the print dialog
    toast.info("Download PDF", {
      description: "Use your browser's print function and select 'Save as PDF'"
    });
    setTimeout(() => window.print(), 500);
  };

  const handleEmail = () => {
    setEmailError(null);
    
    if (!email || !email.includes('@')) {
      setEmailError("Please enter a valid email address");
      toast.error("Please enter a valid email address");
      return;
    }
    
    if (!emailConsent) {
      setEmailError("You must agree to receive emails");
      toast.error("Please agree to receive emails");
      return;
    }
    
    setSendingEmail(true);
    const timestamp = new Date();
    setConsentTimestamp(timestamp);
    
    // Store email and consent in job data
    if (currentJob && updateJob) {
      updateJob(currentJob.id, { 
        contactEmail: email,
        emailConsent: true,
        emailConsentTimestamp: timestamp.toISOString()
      });
    }
    
    // Simulate sending email (in production this would call an API)
    setTimeout(() => {
      setSendingEmail(false);
      setEmailSent(true);
      toast.success("Checklist emailed!", {
        description: `Your checklist has been emailed to ${email}`
      });
    }, 1000);
  };

  const completedItems = checklistItems.filter(i => i.status === "COMPLETE");
  const pendingItems = checklistItems.filter(i => i.status !== "COMPLETE");

  // Job not found state
  if (jobNotFound) {
    return (
      <PageWrapper hasBottomNav={false}>
        <div className="flex flex-col items-center justify-center h-screen-safe px-4">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
              <span className="text-3xl">🔍</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">Job Not Found</h1>
            <p className="text-sm text-muted-foreground">
              This job may have been deleted or the link is invalid.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!initialized || jobLoading || !currentJob) {
    return (
      <PageWrapper hasBottomNav={false}>
        <div className="flex items-center justify-center h-screen" aria-busy="true">
          <LoadingSpinner size="lg" text="Loading preview..." />
        </div>
      </PageWrapper>
    );
  }

  const jobType = currentJob.jobType;
  const detailedScope = currentJob.detailedScope || {};
  
  // Check if bathroom remodel needs details
  const needsDetails = jobType === "SMALL_BATH_REMODEL" && Object.keys(detailedScope).length === 0;
  
  // Intelligent permit determination
  const permitReq = determinePermitRequirements(jobType, detailedScope);
  const inspections = permitReq.required ? getRequiredInspections(permitReq.permitTypes) : [];
  
  // Jurisdiction determination
  const buildingDept = getBuildingDepartment(currentJob.address);
  
  // Legal sources
  const relevantSourceKeys = JOB_LEGAL_SOURCES[jobType];
  const relevantSources = relevantSourceKeys
    .map(key => ({ key, ...LEGAL_SOURCES[key] }))
    .filter(s => s.label);

  return (
    <PageWrapper hasBottomNav={false}>
      {/* Header */}
      <header className="bg-card border-b border-border px-3 py-3 flex items-center justify-between safe-area-inset-top sticky top-0 z-10" role="banner">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/wizard/${jobId}`)}
            className="p-1.5 -ml-1 rounded-lg hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="Go back to checklist"
          >
            <ArrowLeft size={20} className="text-foreground" aria-hidden="true" />
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
      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 pb-6">
        {/* UPL Disclaimer Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-amber-800">
              <strong>Legal Notice:</strong> This tool provides general information only and does not constitute legal advice. Always consult with a qualified professional for your specific situation.
            </p>
          </div>
        </div>

        {/* Email Capture & Delivery - CAN-SPAM Compliant */}
        <div className="bg-card rounded-lg border border-border p-4" role="region" aria-label="Email checklist">
          <h3 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
            <Mail size={16} className="text-primary" aria-hidden="true" />
            Email Your Checklist
          </h3>
          
          {emailSent ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-600" aria-hidden="true" />
                <p className="text-sm text-green-700">
                  Your checklist has been emailed to <strong>{email}</strong>
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                You can unsubscribe at any time by contacting us.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Send this checklist to your email for easy access on any device.
              </p>
              
              {/* Email Input */}
              <div>
                <label htmlFor="email-input" className="sr-only">Email address</label>
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(null);
                  }}
                  placeholder="your@email.com"
                  className={`w-full px-4 py-2 rounded-xl border bg-background text-sm ${emailError ? 'border-red-500' : ''}`}
                  aria-describedby={emailError ? "email-error" : undefined}
                  aria-invalid={emailError ? "true" : "false"}
                  aria-required="true"
                />
                {emailError && (
                  <p id="email-error" className="text-xs text-red-500 mt-1" role="alert">
                    {emailError}
                  </p>
                )}
              </div>

              {/* CAN-SPAM Consent Checkbox */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="email-consent"
                  checked={emailConsent}
                  onChange={(e) => setEmailConsent(e.target.checked)}
                  className="mt-0.5 shrink-0 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  aria-describedby="consent-description"
                  aria-required="true"
                />
                <label htmlFor="email-consent" className="text-xs text-muted-foreground cursor-pointer">
                  <span id="consent-description">
                    I agree to receive my checklist via email. You can unsubscribe at any time. 
                    <a href="#privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                      Privacy Policy
                    </a>
                  </span>
                </label>
              </div>

              <Button
                onClick={handleEmail}
                variant="primary"
                size="sm"
                loading={sendingEmail}
                disabled={sendingEmail || !email || !emailConsent}
                className="w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label="Send checklist to email"
              >
                Send
              </Button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 print:hidden">
          <Button
            onClick={handlePrint}
            variant="outline"
            size="sm"
            className="flex-1"
            icon={<Printer size={16} />}
          >
            Print
          </Button>
          <Button
            onClick={handleDownload}
            variant="outline"
            size="sm"
            className="flex-1"
            icon={<Download size={16} />}
          >
            PDF
          </Button>
        </div>

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
              {currentJob.address && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{currentJob.address}</p>
              )}
            </div>
          </div>
        </div>

        {/* Needs Details Prompt */}
        {needsDetails && (
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
            <h3 className="font-semibold text-sm text-warning mb-2">
              📋 Additional Details Needed
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              To accurately determine if you need a permit, please complete a few clarifying questions about your project.
            </p>
            <Button
              onClick={handleBackToDetails}
              variant="primary"
              size="sm"
            >
              Complete Project Details
            </Button>
          </div>
        )}

        {/* INTELLIGENT PERMIT REASONING */}
        <PermitReasoning permitReq={permitReq} />

        {/* FEE ESTIMATE - Only show if permit required */}
        {permitReq.required && (
          <>
            <FeeEstimate 
              jobType={jobType}
              jurisdictionId="pinellas-county"
            />
            {/* Trust Signal */}
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Info size={16} className="text-blue-600 shrink-0" />
              <p className="text-xs text-blue-700">
                <strong>Estimate only.</strong> Pay county directly when you submit your application.
              </p>
            </div>
          </>
        )}

        {/* TIMELINE ESTIMATE - Only show if permit required */}
        {permitReq.required && (
          <TimelineEstimate 
            jobType={jobType}
            jurisdiction="Pinellas County"
          />
        )}

        {/* INSPECTION CHECKPOINTS - Only show if permit required */}
        {permitReq.required && (
          <InspectionCheckpoints jobType={jobType} />
        )}

        {/* LICENSING INFO */}
        <LicensingInfo jobType={jobType} />

        {/* PHOTO GUIDELINES */}
        <PhotoGuidelines jobType={jobType} />

        {/* SUBMISSION GUIDE - Only show if permit required */}
        {permitReq.required && (
          <SubmissionGuide department={buildingDept} address={currentJob.address} />
        )}

        {/* REQUIRED INSPECTIONS - Only if permit required */}
        {permitReq.required && inspections.length > 0 && (
          <section>
            <h3 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-success" />
              Required Inspections
            </h3>
            <div className="bg-card rounded-lg border border-border divide-y divide-border">
              {inspections.map((inspection, idx) => (
                <div key={idx} className="p-3 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-success font-semibold text-xs">{idx + 1}</span>
                  </div>
                  <span className="text-sm text-foreground">{inspection}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* APPLICATION GUIDE - Only if permit required */}
        {permitReq.required && (
          <ApplicationGuide 
            department={buildingDept}
            permitTypes={permitReq.permitTypes}
            inspections={inspections}
            job={currentJob}
          />
        )}

        {/* Requirements Checklist */}
        <section>
          <h3 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-1.5">
            <CheckCircle2 size={16} className="text-success" />
            Requirements Checklist
          </h3>
          <div className="bg-card rounded-lg border border-border divide-y divide-border">
            <div className="p-3 bg-primary/5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Progress</span>
                <span className="text-sm font-bold text-primary">
                  {completedItems.length} of {checklistItems.length} complete
                </span>
              </div>
              <div className="mt-2 w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-success transition-all duration-300"
                  style={{ width: `${(completedItems.length / checklistItems.length) * 100}%` }}
                />
              </div>
            </div>
            {checklistItems.map((item) => (
              <div
                key={item.id}
                className={`p-3 ${item.status === "COMPLETE" ? "bg-success/5" : ""}`}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 mt-0.5">
                    {item.status === "COMPLETE" ? (
                      <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center">
                        <CheckCircle2 size={14} className="text-success-foreground" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-border" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-foreground">{item.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                    {item.value && item.status === "COMPLETE" && (
                      <div className="mt-2 px-3 py-2 bg-card rounded-lg border border-border">
                        <pre className="text-xs text-foreground whitespace-pre-wrap font-sans">
                          {typeof item.value === 'string' ? item.value : JSON.stringify(item.value, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

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
          {jobType === "SMALL_BATH_REMODEL" && (
            <Button
              onClick={handleBackToDetails}
              variant="outline"
              size="md"
              className="w-full"
            >
              ← Modify Project Details
            </Button>
          )}
          
          <Button
            onClick={() => navigate(`/wizard/${jobId}`)}
            variant="primary"
            size="md"
            className="w-full"
          >
            Continue Editing Checklist
          </Button>
          
          <Button
            onClick={handleStartOver}
            variant="outline"
            size="md"
            className="w-full"
            icon={<RotateCcw size={16} />}
          >
            Start New Project
          </Button>
        </div>

        {/* Trust Signal Footer */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
          <div className="flex items-center justify-center gap-2">
            <Shield size={16} className="text-green-600" />
            <p className="text-xs text-green-700">
              <strong>PermitPath is FREE.</strong> Permit fees go directly to your county.
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-muted/50 rounded-lg p-3 mt-4">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            <strong>Disclaimer:</strong> This analysis is for informational purposes only. 
            Always verify requirements with {buildingDept.name} before starting work.
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}
