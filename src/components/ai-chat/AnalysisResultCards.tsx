import { ExternalLink, RefreshCcw } from 'lucide-react';
import Button from '@/components/shared/Button';

export interface PermitAssistantAnalysis {
  permitTypes: string[];
  applicationLinks: Array<{ label: string; url: string }>;
  estimatedCostRange: string;
  estimatedTimeline: string;
  nextSteps: string[];
  confidence: number;
  disclaimer: string;
}

interface AnalysisResultCardsProps {
  result: PermitAssistantAnalysis;
  onUsePlan: () => void;
  onFollowUp: () => void;
  onStartOver: () => void;
}

export default function AnalysisResultCards({ result, onUsePlan, onFollowUp, onStartOver }: AnalysisResultCardsProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-4">
        <h3 className="font-semibold">Permit type likely needed</h3>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          {result.permitTypes.map((type) => (
            <li key={type}>- {type}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <h3 className="font-semibold">Apply here</h3>
        <div className="mt-2 space-y-2">
          {result.applicationLinks.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              {link.label}
              <ExternalLink size={14} />
            </a>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <h3 className="font-semibold">Cost range</h3>
          <p className="mt-2 text-sm text-muted-foreground">{result.estimatedCostRange}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <h3 className="font-semibold">Timeline</h3>
          <p className="mt-2 text-sm text-muted-foreground">{result.estimatedTimeline}</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <h3 className="font-semibold">Do this now</h3>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          {result.nextSteps.map((step) => (
            <li key={step}>- {step}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border bg-amber-50 border-amber-200 p-3 text-sm text-amber-900">{result.disclaimer}</div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-2">
        <Button onClick={onUsePlan} className="w-full sm:w-auto">Use this plan</Button>
        <Button variant="outline" onClick={onFollowUp} className="w-full sm:w-auto">
          Ask follow-up
        </Button>
        <Button variant="secondary" onClick={onStartOver} className="w-full sm:w-auto">
          <RefreshCcw size={14} />
          Start over
        </Button>
      </div>
    </div>
  );
}
