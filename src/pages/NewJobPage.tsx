import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, Droplet, Bath, MapPin, Sun, SquareStack, Fence, BatteryCharging, Car, Wrench } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/shared/Button";
import { useJob } from "@/hooks/useJob";
import { useChecklist } from "@/hooks/useChecklist";
import { JobType, Jurisdiction } from "@/types";

const JOB_TYPES: { type: JobType; label: string; icon: typeof Zap; description: string }[] = [
  { type: "SMALL_BATH_REMODEL", label: "Bath Remodel", icon: Bath, description: "Small bathroom renovation" },
  { type: "AC_HVAC_CHANGEOUT", label: "AC/HVAC", icon: Sun, description: "Like-for-like replacement" },
  { type: "WATER_HEATER", label: "Water Heater", icon: Droplet, description: "Tank or tankless install" },
  { type: "RE_ROOFING", label: "Re-Roofing", icon: SquareStack, description: "Shingle, tile, or metal" },
  { type: "ELECTRICAL_PANEL", label: "Electrical Panel", icon: Zap, description: "Panel upgrades" },
  { type: "WINDOW_DOOR_REPLACEMENT", label: "Window/Door", icon: SquareStack, description: "Impact windows & doors" },
  { type: "POOL_BARRIER", label: "Pool Barrier", icon: Fence, description: "Safety fence or enclosure" },
  { type: "GENERATOR_INSTALL", label: "Generator", icon: BatteryCharging, description: "Standby generator" },
  { type: "EV_CHARGER", label: "EV Charger", icon: Car, description: "Level 2 charging" },
];

const JURISDICTIONS: { code: Jurisdiction; label: string }[] = [
  { code: "PINELLAS", label: "Pinellas County" },
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
      {/* Compact Header */}
      <header className="compact-header flex items-center gap-2">
        <button
          onClick={handleBack}
          className="p-1.5 -ml-1.5 rounded-lg hover:bg-muted transition-colors tap-target flex items-center justify-center"
        >
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold text-foreground">New Job</h1>
          <p className="text-[10px] text-muted-foreground">
            {step === "type" && "Step 1: Select job type"}
            {step === "jurisdiction" && "Step 2: Select jurisdiction"}
            {step === "address" && "Step 3: Enter address (optional)"}
          </p>
        </div>
      </header>

      {/* Progress indicator */}
      <div className="px-3 py-2 flex gap-1.5">
        <div className={`h-1 flex-1 rounded-full ${step === "type" || step === "jurisdiction" || step === "address" ? "bg-primary" : "bg-muted"}`} />
        <div className={`h-1 flex-1 rounded-full ${step === "jurisdiction" || step === "address" ? "bg-primary" : "bg-muted"}`} />
        <div className={`h-1 flex-1 rounded-full ${step === "address" ? "bg-primary" : "bg-muted"}`} />
      </div>

      {/* Content */}
      <div className="px-3 py-3 pb-20">
        {step === "type" && (
          <>
            {/* Residential Only Notice */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 mb-4">
              <p className="text-xs text-primary font-medium">
                🏠 Residential Permits Only
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                This tool supports single-family and two-family dwellings in Pinellas County. For commercial projects, contact Pinellas County Building Services directly.
              </p>
            </div>
            
            <h2 className="text-sm font-semibold text-foreground mb-3">
              What type of permit job?
            </h2>
            <div className="space-y-2">
              {JOB_TYPES.map(({ type, label, icon: Icon, description }) => (
                <button
                  key={type}
                  onClick={() => handleTypeSelect(type)}
                  className={`w-full p-3 rounded-xl border-2 text-left flex items-center gap-3 transition-all ${
                    selectedType === type
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedType === type ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-foreground">{label}</h3>
                    <p className="text-xs text-muted-foreground truncate">{description}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {step === "jurisdiction" && (
          <>
            <h2 className="text-sm font-semibold text-foreground mb-3">
              Which jurisdiction?
            </h2>
            <div className="space-y-2">
              {JURISDICTIONS.map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => handleJurisdictionSelect(code)}
                  className={`w-full p-3 rounded-xl border-2 text-left flex items-center gap-3 transition-all ${
                    selectedJurisdiction === code
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedJurisdiction === code ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-foreground">{label}</h3>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {step === "address" && (
          <>
            <h2 className="text-sm font-semibold text-foreground mb-3">
              Job address (optional)
            </h2>
            <div className="space-y-3">
              <div>
                <label htmlFor="address" className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Street Address
                </label>
                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main Street, City, FL 33701"
                  className="w-full px-3 py-2.5 bg-muted rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
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