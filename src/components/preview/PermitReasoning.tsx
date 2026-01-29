import { AlertCircle, CheckCircle2, Scale, BookOpen } from "lucide-react";
import { PermitRequirement, CODE_CITATIONS } from "@/data/permitLogic";

interface PermitReasoningProps {
  permitReq: PermitRequirement;
}

export default function PermitReasoning({ permitReq }: PermitReasoningProps) {
  if (!permitReq.required && permitReq.exemptionReason) {
    // NO PERMIT NEEDED
    return (
      <section>
        <h3 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-1.5">
          <CheckCircle2 size={16} className="text-success" />
          Do You Need a Permit?
        </h3>

        <div className="bg-success/10 border border-success/30 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle2 size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-base text-success mb-1">
                ❌ NO permit needed
              </h4>
              <p className="text-sm text-foreground">
                {permitReq.exemptionReason}
              </p>
            </div>
          </div>

          {/* Code Citations */}
          {permitReq.codeCitations && permitReq.codeCitations.length > 0 && (
            <div className="pt-2 border-t border-success/20">
              <p className="text-xs font-medium text-success mb-2 flex items-center gap-1">
                <BookOpen size={12} />
                Legal Basis
              </p>
              <div className="space-y-2">
                {permitReq.codeCitations.map((citation, idx) => (
                  <div key={idx} className="text-xs">
                    <div className="text-muted-foreground">
                      <strong className="text-foreground">
                        {citation.code} {citation.section}:
                      </strong>{" "}
                      {citation.description}
                    </div>
                    {citation.url && (
                      <a
                        href={citation.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-block mt-1"
                      >
                        → View code section
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-success/20">
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> Even though no permit is required, always verify with your local building department if you're unsure. If your project scope changes, you may need a permit.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // PERMIT REQUIRED
  return (
    <section>
      <h3 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-1.5">
        <Scale size={16} className="text-warning" />
        Do You Need a Permit?
      </h3>

      <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 space-y-3">
        <div className="flex items-start gap-2">
          <div className="w-8 h-8 rounded-full bg-warning flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertCircle size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-base text-warning mb-1">
              ✅ YES - Permit Required
            </h4>
            <p className="text-sm text-foreground mb-2">
              Based on your project details, you need a permit. Here's why:
            </p>
          </div>
        </div>

        {/* Reasons */}
        <div className="space-y-2 pl-10">
          {permitReq.reasons.map((reason, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-warning mt-0.5">•</span>
              <p className="text-sm text-foreground flex-1">{reason}</p>
            </div>
          ))}
        </div>

        {/* Permit Types */}
        <div className="pt-2 border-t border-warning/20">
          <p className="text-xs font-medium text-warning mb-2">
            Permit Types You'll Need:
          </p>
          <div className="flex flex-wrap gap-2">
            {permitReq.permitTypes.map((permit, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-warning/20 text-warning text-xs font-medium rounded"
              >
                {permit}
              </span>
            ))}
          </div>
        </div>

        {/* Code Citations */}
        {permitReq.codeCitations && permitReq.codeCitations.length > 0 && (
          <div className="pt-2 border-t border-warning/20">
            <p className="text-xs font-medium text-warning mb-2 flex items-center gap-1">
              <BookOpen size={12} />
              Code References
            </p>
            <div className="space-y-2">
              {permitReq.codeCitations.map((citation, idx) => (
                <div key={idx} className="bg-card rounded p-3 text-xs">
                  <div className="text-muted-foreground">
                    <strong className="text-foreground">
                      {citation.code} {citation.section}:
                    </strong>{" "}
                    {citation.description}
                  </div>
                  {citation.url && (
                    <a
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-block mt-2"
                    >
                      → View code section
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
