import { useNavigate } from "react-router-dom";
import PageWrapper from "@/components/layout/PageWrapper";
import DemoToggle from "@/components/demo/DemoToggle";
import SampleDataButton from "@/components/demo/SampleDataButton";
import { useDemoMode } from "@/hooks/useDemoMode";
import { Beaker, Play, Info } from "lucide-react";

export default function DemoPage() {
  const navigate = useNavigate();
  const { isDemoMode, loadSampleData, demoData } = useDemoMode();

  const handleLoadSample = () => {
    const job = loadSampleData();
    // Navigate to wizard with demo job
    navigate(`/wizard/${job.id}`);
  };

  return (
    <PageWrapper>
      {/* Header */}
      <header className="bg-accent px-6 pt-8 pb-12 safe-area-inset-top">
        <div className="flex items-center gap-3">
          <Beaker size={28} className="text-accent-foreground" />
          <h1 className="text-2xl font-bold text-accent-foreground">
            Demo Mode
          </h1>
        </div>
        <p className="text-accent-foreground/80 mt-1">
          Try out the app with sample data
        </p>
      </header>

      {/* Content */}
      <div className="px-4 -mt-6 space-y-4">
        {/* Demo Mode Toggle Card */}
        <div className="bg-card rounded-xl p-5 shadow-md border border-border">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="font-semibold text-foreground">Demo Mode</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Enable demo mode to use the app without Firebase
              </p>
            </div>
            <DemoToggle />
          </div>
        </div>

        {/* Load Sample Data Card */}
        <div className="bg-card rounded-xl p-5 shadow-md border border-border">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Play size={24} className="text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-foreground">Try Sample Job</h2>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Load a pre-filled electrical panel job to see how the wizard works
              </p>
              <SampleDataButton onLoadSample={handleLoadSample} />
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-muted/50 rounded-xl p-5 border border-border">
          <div className="flex items-start gap-3">
            <Info size={20} className="text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-foreground">About Demo Mode</h3>
              <ul className="text-sm text-muted-foreground mt-2 space-y-2">
                <li>• Data is stored locally and will be lost on refresh</li>
                <li>• AI responses are simulated (no API calls)</li>
                <li>• Photo analysis uses placeholder responses</li>
                <li>• Perfect for testing the interface and workflow</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="bg-card rounded-xl p-5 shadow-md border border-border">
          <h2 className="font-semibold text-foreground mb-4">Demo Features</h2>
          <div className="space-y-3">
            {[
              { label: "Job Creation", desc: "Create new permit jobs" },
              { label: "Photo Upload", desc: "Capture and upload photos" },
              { label: "AI Chat", desc: "Simulated AI assistance" },
              { label: "Checklist", desc: "Track permit requirements" },
              { label: "HTML Export", desc: "Download permit package" },
            ].map((feature) => (
              <div key={feature.label} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-success" />
                <div>
                  <span className="font-medium text-foreground">{feature.label}</span>
                  <span className="text-muted-foreground"> — {feature.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
