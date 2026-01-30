import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  ArrowLeft, Zap, Droplet, Bath, MapPin, Sun, SquareStack, Fence, 
  BatteryCharging, Car, Home, Hammer, Wrench, Search, X 
} from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/shared/Button";
import { useJob } from "@/hooks/useJob";
import { JobType, Jurisdiction } from "@/types";
import JobTemplates from "@/components/jobs/JobTemplates";
import { JobTemplate } from "@/data/jobTemplates";
import { FUNCTIONS_BASE_URL } from "@/config/functions";

interface JobTypeOption {
  type: JobType;
  label: string;
  icon: typeof Zap;
  description: string;
  category: "hvac" | "roofing" | "electrical" | "plumbing" | "interior" | "exterior" | "structural";
  keywords: string[];
  status: "ready" | "beta" | "coming-soon";
}

const JOB_TYPES: JobTypeOption[] = [
  // HVAC & Mechanical
  { 
    type: "AC_HVAC_CHANGEOUT", 
    label: "AC/HVAC Replacement", 
    icon: Sun, 
    description: "Like-for-like unit changeout",
    category: "hvac",
    keywords: ["ac", "hvac", "air conditioning", "heat pump", "cooling", "heating"],
    status: "ready"
  },
  { 
    type: "WATER_HEATER", 
    label: "Water Heater", 
    icon: Droplet, 
    description: "Tank or tankless install",
    category: "hvac",
    keywords: ["water heater", "hot water", "tank", "tankless"],
    status: "ready"
  },
  
  // Roofing (TOP PRIORITY)
  { 
    type: "RE_ROOFING", 
    label: "Roof Replacement", 
    icon: SquareStack, 
    description: "Full re-roof (shingle, tile, metal)",
    category: "roofing",
    keywords: ["roof", "roofing", "reroof", "shingle", "tile", "metal roof"],
    status: "ready"
  },
  { 
    type: "ROOF_REPAIR", 
    label: "Roof Repair", 
    icon: SquareStack, 
    description: "Patch, leak repair, minor work",
    category: "roofing",
    keywords: ["roof repair", "leak", "patch", "roofing"],
    status: "ready"
  },
  
  // Electrical
  { 
    type: "ELECTRICAL_PANEL", 
    label: "Electrical Panel", 
    icon: Zap, 
    description: "Panel upgrade or replacement",
    category: "electrical",
    keywords: ["electrical", "panel", "breaker", "service upgrade", "200 amp"],
    status: "ready"
  },
  { 
    type: "ELECTRICAL_REWIRING", 
    label: "Electrical Rewiring", 
    icon: Zap, 
    description: "Circuit additions, rewiring",
    category: "electrical",
    keywords: ["rewiring", "electrical", "circuits", "wiring", "outlets"],
    status: "ready"
  },
  { 
    type: "EV_CHARGER", 
    label: "EV Charger", 
    icon: Car, 
    description: "Level 2 EV charging station",
    category: "electrical",
    keywords: ["ev", "charger", "electric vehicle", "tesla", "charging"],
    status: "ready"
  },
  { 
    type: "GENERATOR_INSTALL", 
    label: "Generator", 
    icon: BatteryCharging, 
    description: "Standby generator install",
    category: "electrical",
    keywords: ["generator", "standby", "backup power", "generac"],
    status: "ready"
  },
  
  // Plumbing
  { 
    type: "PLUMBING_MAIN_LINE", 
    label: "Plumbing Main Line", 
    icon: Droplet, 
    description: "Main line repair/replacement",
    category: "plumbing",
    keywords: ["plumbing", "main line", "sewer", "water line", "pipe"],
    status: "ready"
  },
  
  // Interior Remodeling
  { 
    type: "SMALL_BATH_REMODEL", 
    label: "Bathroom Remodel", 
    icon: Bath, 
    description: "Bath renovation (any size)",
    category: "interior",
    keywords: ["bathroom", "bath", "remodel", "renovation", "shower", "tub"],
    status: "ready"
  },
  { 
    type: "KITCHEN_REMODEL", 
    label: "Kitchen Remodel", 
    icon: Home, 
    description: "Kitchen renovation",
    category: "interior",
    keywords: ["kitchen", "remodel", "renovation", "cabinets", "countertops"],
    status: "ready"
  },
  
  // Exterior
  { 
    type: "WINDOW_DOOR_REPLACEMENT", 
    label: "Window/Door", 
    icon: SquareStack, 
    description: "Impact windows & doors",
    category: "exterior",
    keywords: ["window", "door", "impact", "replacement", "sliding door"],
    status: "ready"
  },
  { 
    type: "SIDING_EXTERIOR", 
    label: "Siding/Exterior", 
    icon: Home, 
    description: "Siding, soffit, fascia",
    category: "exterior",
    keywords: ["siding", "exterior", "soffit", "fascia", "cladding"],
    status: "ready"
  },
  { 
    type: "DECK_INSTALLATION", 
    label: "Deck Installation", 
    icon: SquareStack, 
    description: "Deck construction or replacement",
    category: "exterior",
    keywords: ["deck", "decking", "patio", "porch"],
    status: "ready"
  },
  { 
    type: "FENCE_INSTALLATION", 
    label: "Fence", 
    icon: Fence, 
    description: "Fence install (may not need permit)",
    category: "exterior",
    keywords: ["fence", "fencing", "privacy fence", "chain link"],
    status: "ready"
  },
  { 
    type: "POOL_BARRIER", 
    label: "Pool Barrier", 
    icon: Fence, 
    description: "Safety fence or enclosure",
    category: "exterior",
    keywords: ["pool", "barrier", "safety fence", "pool cage", "screen enclosure"],
    status: "ready"
  },
  
  // Structural
  { 
    type: "ROOM_ADDITION", 
    label: "Room Addition", 
    icon: Home, 
    description: "Adding square footage",
    category: "structural",
    keywords: ["addition", "room addition", "expansion", "sunroom", "florida room"],
    status: "ready"
  },
  { 
    type: "FOUNDATION_REPAIR", 
    label: "Foundation Repair", 
    icon: Hammer, 
    description: "Structural foundation work",
    category: "structural",
    keywords: ["foundation", "structural", "repair", "underpinning", "pier"],
    status: "ready"
  },
];

const CATEGORY_LABELS = {
  hvac: "🔥 HVAC & Mechanical",
  roofing: "🏠 Roofing (Most Common)",
  electrical: "⚡ Electrical",
  plumbing: "💧 Plumbing",
  interior: "🛋️ Interior Remodeling",
  exterior: "🏡 Exterior",
  structural: "🏗️ Structural"
};

const CATEGORY_ORDER: Array<keyof typeof CATEGORY_LABELS> = [
  "roofing", // Put roofing first based on contractor feedback
  "hvac",
  "electrical",
  "plumbing",
  "interior",
  "exterior",
  "structural"
];

const JURISDICTIONS: { code: Jurisdiction; label: string }[] = [
  { code: "PINELLAS", label: "Pinellas County" },
];

export default function NewJobPage() {
  const navigate = useNavigate();
  const { createJob, isLoading } = useJob();
  
  const [step, setStep] = useState<"type" | "jurisdiction" | "address">("type");
  const [selectedType, setSelectedType] = useState<JobType | null>(null);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<Jurisdiction | null>(null);
  const [address, setAddress] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<{ description: string; placeId: string }[]>([]);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<JobTemplate | null>(null);

  // Filter and group job types
  const filteredJobTypes = useMemo(() => {
    if (!searchQuery.trim()) return JOB_TYPES;
    
    const query = searchQuery.toLowerCase();
    return JOB_TYPES.filter(job => 
      job.label.toLowerCase().includes(query) ||
      job.description.toLowerCase().includes(query) ||
      job.keywords.some(keyword => keyword.includes(query))
    );
  }, [searchQuery]);

  const groupedJobTypes = useMemo(() => {
    const grouped = new Map<string, JobTypeOption[]>();
    
    filteredJobTypes.forEach(job => {
      const category = job.category;
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(job);
    });
    
    return grouped;
  }, [filteredJobTypes]);

  useEffect(() => {
    if (!FUNCTIONS_BASE_URL) return;
    if (step !== "address") return;
    if (address.trim().length < 3) {
      setAddressSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setIsAddressLoading(true);
      try {
        const response = await fetch(
          `${FUNCTIONS_BASE_URL}/placesAutocomplete?input=${encodeURIComponent(address)}`,
          { signal: controller.signal }
        );
        if (!response.ok) return;
        const data = await response.json();
        const predictions = Array.isArray(data?.predictions) ? data.predictions : [];
        setAddressSuggestions(
          predictions.map((item: any) => ({
            description: item.description,
            placeId: item.place_id,
          }))
        );
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setAddressSuggestions([]);
        }
      } finally {
        setIsAddressLoading(false);
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [address, step]);

  const handleTemplateSelect = (template: JobTemplate) => {
    navigator.vibrate?.(10);
    setSelectedTemplate(template);
    setSelectedType(template.jobType);
    setSelectedJurisdiction(template.jurisdiction);
    
    // Pre-fill address if in template
    if (template.preFilledData.notes?.includes("Address")) {
      // Extract address from notes if present
    }
    
    setStep("address");
    toast.success("Template loaded!", {
      description: `Starting with: ${template.name}`,
    });
  };

  const handleTypeSelect = (type: JobType) => {
    navigator.vibrate?.(10);
    setSelectedType(type);
    
    // Auto-select jurisdiction if only one option
    if (JURISDICTIONS.length === 1) {
      setSelectedJurisdiction(JURISDICTIONS[0].code);
      setStep("address");
    } else {
      setStep("jurisdiction");
    }
  };

  const handleJurisdictionSelect = (code: Jurisdiction) => {
    navigator.vibrate?.(10);
    setSelectedJurisdiction(code);
    setStep("address");
  };

  const handleAddressSelect = async (suggestion: { description: string; placeId: string }) => {
    if (!FUNCTIONS_BASE_URL) {
      setAddress(suggestion.description);
      setAddressSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `${FUNCTIONS_BASE_URL}/placeDetails?placeId=${encodeURIComponent(suggestion.placeId)}`
      );
      if (!response.ok) {
        setAddress(suggestion.description);
        return;
      }
      const data = await response.json();
      const formatted = data?.result?.formatted_address || suggestion.description;
      setAddress(formatted);
    } finally {
      setAddressSuggestions([]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedType || !selectedJurisdiction) return;
    
    try {
      const job = await createJob(selectedType, selectedJurisdiction, address || undefined);
      const jobTypeLabel = JOB_TYPES.find(t => t.type === selectedType)?.label || selectedType;
      toast.success("Job created!", {
        description: `${jobTypeLabel} job is ready to document.`,
      });
      navigate(`/wizard/${job.id}`);
    } catch (error) {
      console.error("Failed to create job:", error);
      toast.error("Failed to create job", {
        description: "Please try again.",
      });
    }
  };

  const handleBack = () => {
    if (step === "address") setStep("type");
    else if (step === "jurisdiction") setStep("type");
    else navigate(-1);
  };

  const handleCannotFind = () => {
    toast.info("Project not listed?", {
      description: "Contact Pinellas County Building directly at (727) 464-3199 for help determining permit requirements.",
      duration: 6000,
    });
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
          <p className="text-xs text-muted-foreground">
            {step === "type" && "Select job type"}
            {step === "jurisdiction" && "Select jurisdiction"}
            {step === "address" && "Enter address (optional)"}
          </p>
        </div>
        {step === "type" && (
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors tap-target flex items-center justify-center"
          >
            {showSearch ? <X size={20} /> : <Search size={20} />}
          </button>
        )}
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
            {/* Search Bar */}
            {showSearch && (
              <div className="mb-4">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search project types..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-muted rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Residential Only Notice */}
            {!searchQuery && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 mb-4">
                <p className="text-xs text-primary font-medium">
                  🏠 Residential Permits Only
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  This tool supports single-family and two-family dwellings in Pinellas County. For commercial projects, contact Pinellas County Building Services directly.
                </p>
              </div>
            )}
            
            {/* Job Types - Grouped by Category */}
            {searchQuery && filteredJobTypes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-4">
                  No projects match "{searchQuery}"
                </p>
                <Button
                  onClick={handleCannotFind}
                  variant="secondary"
                  size="sm"
                >
                  My project isn't listed
                </Button>
              </div>
            ) : searchQuery ? (
              <div className="space-y-2">
                <h2 className="text-sm font-semibold text-foreground mb-3">
                  Search Results ({filteredJobTypes.length})
                </h2>
                {filteredJobTypes.map(({ type, label, icon: Icon, description }) => (
                  <button
                    key={type}
                    onClick={() => handleTypeSelect(type)}
                    className="w-full p-3 rounded-xl border-2 text-left flex items-center gap-3 transition-all border-border hover:border-primary/50"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-muted text-muted-foreground">
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-foreground">{label}</h3>
                      <p className="text-xs text-muted-foreground truncate">{description}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <>
                {CATEGORY_ORDER.map(category => {
                  const jobs = groupedJobTypes.get(category);
                  if (!jobs || jobs.length === 0) return null;
                  
                  return (
                    <div key={category} className="mb-6">
                      <h2 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                        {CATEGORY_LABELS[category]}
                      </h2>
                      <div className="space-y-2">
                        {jobs.map(({ type, label, icon: Icon, description, status }) => (
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
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-medium text-foreground">{label}</h3>
                                {status === "ready" && (
                                  <span className="px-1.5 py-0.5 bg-success/10 text-success text-xs font-medium rounded">
                                    ✓ Ready
                                  </span>
                                )}
                                {status === "beta" && (
                                  <span className="px-1.5 py-0.5 bg-warning/10 text-warning text-xs font-medium rounded">
                                    Beta
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">{description}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
                
                {/* Cannot Find Link */}
                <div className="mt-6 p-4 bg-muted rounded-xl">
                  <p className="text-xs text-muted-foreground mb-2">
                    Can't find your project type?
                  </p>
                  <Button
                    onClick={handleCannotFind}
                    variant="secondary"
                    size="sm"
                    className="w-full"
                  >
                    <Wrench size={16} className="mr-2" />
                    Get help from Building Department
                  </Button>
                </div>
              </>
            )}
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
                {isAddressLoading && (
                  <p className="text-xs text-muted-foreground mt-1">Looking up addresses...</p>
                )}
                {addressSuggestions.length > 0 && (
                  <div className="mt-2 rounded-lg border border-border bg-card shadow-sm overflow-hidden">
                    {addressSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.placeId}
                        type="button"
                        onClick={() => handleAddressSelect(suggestion)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                      >
                        {suggestion.description}
                      </button>
                    ))}
                  </div>
                )}
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
