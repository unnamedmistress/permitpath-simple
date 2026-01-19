import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, Droplet, Bath, MapPin } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/shared/Button";
import { useJob } from "@/hooks/useJob";
import { useChecklist } from "@/hooks/useChecklist";
import { JobType, Jurisdiction } from "@/types";

const JOB_TYPES: { type: JobType; label: string; icon: typeof Zap; description: string }[] = [
  { type: "ELECTRICAL_PANEL", label: "Electrical Panel", icon: Zap, description: "Panel upgrades and replacements" },
  { type: "WATER_HEATER", label: "Water Heater", icon: Droplet, description: "Installation and replacement" },
  { type: "BATH_REMODEL", label: "Bath Remodel", icon: Bath, description: "Bathroom renovation projects" },
];

const JURISDICTIONS: { code: Jurisdiction; label: string }[] = [
  { code: "PINELLAS", label: "Pinellas County" },
  { code: "TAMPA", label: "City of Tampa" },
];

export default function NewJobPage() {
  const navigate = useNavigate();
  const { createJob, isLoading } = useJob();
  const { initializeChecklist } = useChecklist("");
  
  const [step, setStep] = useState<"type" | "jurisdiction" | "address">("type");
  const [selectedType, setSelectedType] = useState<JobType | null>(null);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<Jurisdiction | null>(null);
  const [address, setAddress] = useState("");

  const handleTypeSelect = (type: JobType) => {
    setSelectedType(type);
    setStep("jurisdiction");
  };

  const handleJurisdictionSelect = (code: Jurisdiction) => {
    setSelectedJurisdiction(code);
    setStep("address");
  };

  const handleSubmit = async () => {
    if (!selectedType || !selectedJurisdiction) return;
    
    try {
      const job = await createJob(selectedType, selectedJurisdiction, address || undefined);
      // Initialize checklist with a temporary hook - in real app would use job.id
      navigate(`/wizard/${job.id}`);
    } catch (error) {
      console.error("Failed to create job:", error);
    }
  };

  const handleBack = () => {
    if (step === "address") setStep("jurisdiction");
    else if (step === "jurisdiction") setStep("type");
    else navigate(-1);
  };

  return (
    <PageWrapper hasBottomNav={false}>
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-4 flex items-center gap-3 safe-area-inset-top">
        <button
          onClick={handleBack}
          className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft size={24} className="text-foreground" />
        </button>
        <div>
          <h1 className="font-semibold text-foreground">New Job</h1>
          <p className="text-xs text-muted-foreground">
            {step === "type" && "Step 1: Select job type"}
            {step === "jurisdiction" && "Step 2: Select jurisdiction"}
            {step === "address" && "Step 3: Enter address (optional)"}
          </p>
        </div>
      </header>

      {/* Progress indicator */}
      <div className="px-4 py-3 flex gap-2">
        <div className={`h-1 flex-1 rounded-full ${step === "type" || step === "jurisdiction" || step === "address" ? "bg-primary" : "bg-muted"}`} />
        <div className={`h-1 flex-1 rounded-full ${step === "jurisdiction" || step === "address" ? "bg-primary" : "bg-muted"}`} />
        <div className={`h-1 flex-1 rounded-full ${step === "address" ? "bg-primary" : "bg-muted"}`} />
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {step === "type" && (
          <>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              What type of permit job?
            </h2>
            <div className="space-y-3">
              {JOB_TYPES.map(({ type, label, icon: Icon, description }) => (
                <button
                  key={type}
                  onClick={() => handleTypeSelect(type)}
                  className={`w-full p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all ${
                    selectedType === type
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    selectedType === type ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{label}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {step === "jurisdiction" && (
          <>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Which jurisdiction?
            </h2>
            <div className="space-y-3">
              {JURISDICTIONS.map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => handleJurisdictionSelect(code)}
                  className={`w-full p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all ${
                    selectedJurisdiction === code
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    selectedJurisdiction === code ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{label}</h3>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {step === "address" && (
          <>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Job address (optional)
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-muted-foreground mb-2">
                  Street Address
                </label>
                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main Street, City, FL 33701"
                  className="w-full px-4 py-3 bg-muted rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <Button
                onClick={handleSubmit}
                variant="primary"
                size="lg"
                loading={isLoading}
                className="w-full"
              >
                Start New Job
              </Button>
              
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
              >
                Skip for now
              </button>
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  );
}
