import { FileText, CheckCircle2, DollarSign, ClipboardCheck } from "lucide-react";
import { BuildingDepartment } from "@/data/jurisdictionData";
import { Job, DetailedScope } from "@/types";

interface ApplicationGuideProps {
  department: BuildingDepartment;
  permitTypes: string[];
  inspections: string[];
  job: Job;
}

export default function ApplicationGuide({ department, permitTypes, inspections, job }: ApplicationGuideProps) {
  const scope = job.detailedScope || {};

  // Generate work description based on scope
  const generateWorkDescription = (): string => {
    const actions: string[] = [];
    
    if (scope.movingPlumbingFixtures) {
      actions.push(`moving plumbing fixtures (${scope.plumbingDetails || "sink/toilet/shower"})`);
    }
    if (scope.addingWaterLines) {
      actions.push("adding water supply lines");
    }
    if (scope.changingDrainage) {
      actions.push("modifying drainage system");
    }
    if (scope.addingCircuits) {
      actions.push("adding electrical circuits");
    }
    if (scope.relocatingOutlets) {
      actions.push("relocating electrical outlets/switches");
    }
    if (scope.removingWalls) {
      actions.push("removing/altering walls");
    }
    if (scope.changingLayout) {
      actions.push("changing bathroom layout");
    }
    
    if (actions.length === 0) {
      return "Bathroom remodel - cosmetic updates only (tile, fixtures in same location, painting)";
    }
    
    return `Bathroom remodel including: ${actions.join(", ")}. No structural changes to load-bearing elements.`;
  };

  const workDescription = generateWorkDescription();

  // Estimate permit fees based on permit types
  const estimateFees = (): string => {
    const basePerPermit = 100;
    const total = permitTypes.length * basePerPermit;
    const low = Math.max(50, total - 50);
    const high = total + 100;
    return `$${low}-$${high}`;
  };

  return (
    <section>
      <h3 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-1.5">
        <FileText size={16} className="text-primary" />
        How to Fill Out Your Permit Application
      </h3>

      <div className="space-y-3">
        {/* Step 1: Online Portal */}
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 font-semibold text-sm">
              1
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-foreground mb-1">
                Log in to the Online Portal
              </h4>
              <p className="text-xs text-muted-foreground mb-2">
                Go to: {department.onlinePortal || department.website}
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Click "Create Account" if first time</li>
                <li>You'll need: Email, property address, owner information</li>
                <li>Some portals allow guest applications without account</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Step 2: Select Permit Type */}
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 font-semibold text-sm">
              2
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-foreground mb-1">
                Select Permit Type
              </h4>
              <p className="text-xs text-muted-foreground mb-2">
                Choose the appropriate permit(s):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {permitTypes.map((permit, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded"
                  >
                    {permit}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Select: "Alteration/Repair" or "Remodel" category
              </p>
            </div>
          </div>
        </div>

        {/* Step 3: Property Information */}
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 font-semibold text-sm">
              3
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-foreground mb-1">
                Complete Property Information
              </h4>
              <div className="space-y-2 mt-2">
                <div className="bg-muted/30 rounded p-2">
                  <p className="text-xs text-muted-foreground">Property Address:</p>
                  <p className="text-sm text-foreground font-medium">
                    {job.address || "[Your address]"}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  • Parcel ID: (Look up on property appraiser website if needed)<br />
                  • Property owner name: [Your name or LLC]<br />
                  • Contact information: [Your phone/email]
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Describe the Work */}
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 font-semibold text-sm">
              4
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-foreground mb-1">
                Describe the Work
              </h4>
              <p className="text-xs text-muted-foreground mb-2">
                Use this description (customize as needed):
              </p>
              <div className="bg-muted/30 rounded p-3">
                <p className="text-xs text-foreground font-mono leading-relaxed">
                  {workDescription}
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(workDescription);
                  // Could add toast notification here
                }}
                className="text-xs text-primary hover:underline mt-2"
              >
                📋 Copy to clipboard
              </button>
            </div>
          </div>
        </div>

        {/* Step 5: Required Documents */}
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 font-semibold text-sm">
              5
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-foreground mb-1">
                Attach Required Documents
              </h4>
              <div className="space-y-1.5 mt-2">
                <label className="flex items-start gap-2 text-xs text-foreground">
                  <input type="checkbox" className="mt-0.5" disabled />
                  <span>Plot plan or property survey (showing bathroom location)</span>
                </label>
                {permitTypes.some(p => p.includes("Plumbing")) && (
                  <label className="flex items-start gap-2 text-xs text-foreground">
                    <input type="checkbox" className="mt-0.5" disabled />
                    <span>Plumbing fixture schedule (list of fixtures and locations)</span>
                  </label>
                )}
                {permitTypes.some(p => p.includes("Electrical")) && (
                  <label className="flex items-start gap-2 text-xs text-foreground">
                    <input type="checkbox" className="mt-0.5" disabled />
                    <span>Electrical load calculation (if adding circuits)</span>
                  </label>
                )}
                <label className="flex items-start gap-2 text-xs text-foreground">
                  <input type="checkbox" className="mt-0.5" disabled />
                  <span>Contractor license (if using licensed contractor)</span>
                </label>
                {scope.estimatedValue && scope.estimatedValue > 5000 && (
                  <label className="flex items-start gap-2 text-xs text-foreground">
                    <input type="checkbox" className="mt-0.5" disabled />
                    <span>Notice of Commencement (for projects over $5,000)</span>
                  </label>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                💡 Tip: Simple hand-drawn sketches are often acceptable for minor remodels. Show fixture locations and dimensions.
              </p>
            </div>
          </div>
        </div>

        {/* Step 6: Pay Fees */}
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 font-semibold text-sm">
              6
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-foreground mb-1 flex items-center gap-2">
                Pay Permit Fees
                <DollarSign size={14} className="text-success" />
              </h4>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-foreground">
                  Estimated fee: <strong>{estimateFees()}</strong>
                </p>
                <p className="text-xs text-muted-foreground">
                  • Payment methods: Credit card (online), check (in person)<br />
                  • Exact fees determined by building department<br />
                  • Fees may include: Base permit + plan review + inspections
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 7: Schedule Inspections */}
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 font-semibold text-sm">
              7
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm text-foreground mb-1 flex items-center gap-2">
                Schedule Inspections
                <ClipboardCheck size={14} className="text-success" />
              </h4>
              <p className="text-xs text-muted-foreground mb-2">
                You'll need these inspections during your project:
              </p>
              <ol className="space-y-1.5">
                {inspections.map((inspection, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-foreground">
                    <span className="w-4 h-4 rounded-full bg-success/20 text-success flex items-center justify-center flex-shrink-0 text-xs font-semibold mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{inspection}</span>
                  </li>
                ))}
              </ol>
              <p className="text-xs text-muted-foreground mt-2">
                ⏰ Schedule inspections 24-48 hours in advance. Do NOT cover work until it's inspected!
              </p>
            </div>
          </div>
        </div>

        {/* Success Indicator */}
        <div className="bg-success/5 border border-success/20 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-success" />
            <p className="text-xs text-success font-medium">
              Once all inspections pass, your permit will be finalized and your remodel is officially complete!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
