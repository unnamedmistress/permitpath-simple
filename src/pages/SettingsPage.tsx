import { useState } from "react";
import { ExternalLink, AlertTriangle, Check, X } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import { isFirebaseConfigured, isOpenAIConfigured } from "@/config/env";
import { clearSessionId, getSessionId } from "@/utils/sessionId";

export default function SettingsPage() {
  const [sessionId] = useState(getSessionId());
  const firebaseConfigured = isFirebaseConfigured();
  const openaiConfigured = isOpenAIConfigured();

  const handleClearSession = () => {
    if (confirm("This will clear your session ID and all local data. Continue?")) {
      clearSessionId();
      localStorage.clear();
      window.location.reload();
    }
  };

  const ConfigStatus = ({ configured, label }: { configured: boolean; label: string }) => (
    <div className="flex items-center justify-between py-3">
      <span className="text-foreground">{label}</span>
      {configured ? (
        <span className="flex items-center gap-1 text-success text-sm font-medium">
          <Check size={16} />
          Configured
        </span>
      ) : (
        <span className="flex items-center gap-1 text-muted-foreground text-sm">
          <X size={16} />
          Not configured
        </span>
      )}
    </div>
  );

  return (
    <PageWrapper>
      {/* Header */}
      <header className="bg-card px-6 pt-8 pb-6 border-b border-border safe-area-inset-top">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">App configuration and info</p>
      </header>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* API Configuration */}
        <section className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="font-semibold text-foreground">API Configuration</h2>
          </div>
          <div className="px-4 divide-y divide-border">
            <ConfigStatus configured={firebaseConfigured} label="Firebase" />
            <ConfigStatus configured={openaiConfigured} label="OpenAI" />
          </div>
          
          {(!firebaseConfigured || !openaiConfigured) && (
            <div className="px-4 py-3 bg-warning/10 border-t border-warning/20">
              <div className="flex items-start gap-2">
                <AlertTriangle size={18} className="text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Setup Required</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add your API keys to the .env file to enable all features.
                    Use Demo Mode to test without configuration.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Session Info */}
        <section className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="font-semibold text-foreground">Session</h2>
          </div>
          <div className="px-4 py-3">
            <label className="text-sm text-muted-foreground">Session ID</label>
            <p className="font-mono text-sm text-foreground break-all mt-1">{sessionId}</p>
          </div>
          <div className="px-4 py-3 border-t border-border">
            <button
              onClick={handleClearSession}
              className="text-destructive text-sm font-medium hover:underline"
            >
              Clear Session & Data
            </button>
          </div>
        </section>

        {/* Environment Setup */}
        <section className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="font-semibold text-foreground">Setup Guide</h2>
          </div>
          <div className="px-4 py-4">
            <p className="text-sm text-muted-foreground mb-4">
              To enable all features, create a .env file in the project root with:
            </p>
            <pre className="bg-muted rounded-lg p-3 text-xs font-mono text-foreground overflow-x-auto">
{`VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id
VITE_OPENAI_API_KEY=sk-your_openai_key`}
            </pre>
          </div>
        </section>

        {/* About */}
        <section className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="font-semibold text-foreground">About</h2>
          </div>
          <div className="px-4 py-3 space-y-2">
            <p className="text-sm text-foreground">
              <strong>AI Permit Assistant</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              Version 1.0.0
            </p>
            <p className="text-sm text-muted-foreground">
              Helps contractors document permit requirements using AI-powered
              photo analysis and guided checklists.
            </p>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}
