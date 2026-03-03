import { useState } from "react";
import { ExternalLink, AlertTriangle, Check, X, Settings2, User, Database, Code, Info } from "lucide-react";
import { motion } from "framer-motion";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { isFirebaseConfigured, isOpenAIConfigured } from "@/config/env";
import { clearSessionId, getSessionId } from "@/utils/sessionId";

export default function SettingsPage() {
  const [sessionId] = useState(getSessionId());
  const firebaseConfigured = isFirebaseConfigured();
  const openaiConfigured = isOpenAIConfigured();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  const handleClearSession = () => {
    if (confirm("This will clear your session ID and local data stored in this browser. Continue?")) {
      clearSessionId();
      localStorage.clear();
      window.location.reload();
    }
  };

  const ConfigStatus = ({ configured, label }: { configured: boolean; label: string }) => (
    <div className="flex items-center justify-between py-3">
      <span className="text-charcoal">{label}</span>
      {configured ? (
        <span className="flex items-center gap-1 text-forest text-sm font-medium">
          <Check size={16} />
          Configured
        </span>
      ) : (
        <span className="flex items-center gap-1 text-steel text-sm">
          <X size={16} />
          Not configured
        </span>
      )}
    </div>
  );

  const SettingRow = ({ 
    icon: Icon, 
    label, 
    description, 
    children 
  }: { 
    icon: any; 
    label: string; 
    description?: string; 
    children: React.ReactNode 
  }) => (
    <div className="flex items-center justify-between py-4 border-b border-lightGray last:border-b-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-sky flex items-center justify-center">
          <Icon size={20} className="text-blueprint" />
        </div>
        <div>
          <p className="font-medium text-charcoal">{label}</p>
          {description && <p className="text-xs text-steel">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );

  return (
    <PageWrapper>
      {/* Header */}
      <header className="bg-white px-4 sm:px-6 pt-6 pb-4 border-b border-lightGray">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blueprint flex items-center justify-center">
            <Settings2 size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-charcoal">Settings</h1>
            <p className="text-steel text-sm">App configuration and preferences</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 sm:px-6 py-6 space-y-6">
        {/* Preferences Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-lightGray overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-lightGray bg-sky/50">
            <h2 className="font-semibold text-charcoal flex items-center gap-2">
              <User size={18} className="text-blueprint" />
              Preferences
            </h2>
          </div>
          <div className="px-4">
            <SettingRow 
              icon={Bell}
              label="Notifications"
              description="Receive updates about your permits"
            >
              <Switch 
                checked={notifications} 
                onCheckedChange={setNotifications}
              />
            </SettingRow>
            
            <SettingRow 
              icon={Moon}
              label="Dark Mode"
              description="Coming soon"
            >
              <Switch 
                checked={darkMode} 
                onCheckedChange={setDarkMode}
                disabled
              />
            </SettingRow>
            
            <SettingRow 
              icon={Database}
              label="Auto-save"
              description="Automatically save your progress"
            >
              <Switch 
                checked={autoSave} 
                onCheckedChange={setAutoSave}
              />
            </SettingRow>
          </div>
        </motion.section>

        {/* API Configuration */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-lightGray overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-lightGray bg-sky/50">
            <h2 className="font-semibold text-charcoal flex items-center gap-2">
              <Code size={18} className="text-blueprint" />
              API Configuration
            </h2>
          </div>
          <div className="px-4 divide-y divide-lightGray">
            <ConfigStatus configured={firebaseConfigured} label="Firebase" />
            <ConfigStatus configured={openaiConfigured} label="OpenAI" />
          </div>
          
          {(!firebaseConfigured || !openaiConfigured) && (
            <div className="px-4 py-3 bg-safetyOrange/10 border-t border-safetyOrange/20">
              <div className="flex items-start gap-2">
                <AlertTriangle size={18} className="text-safetyOrange flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-charcoal">Setup Required</p>
                  <p className="text-xs text-steel mt-1">
                    Add your API keys to the .env file to enable all features.
                    Use Demo Mode to test without configuration.
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.section>

        {/* Account */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-lightGray overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-lightGray bg-sky/50">
            <h2 className="font-semibold text-charcoal flex items-center gap-2">
              <User size={18} className="text-blueprint" />
              Account
            </h2>
          </div>
          <div className="px-4 py-4 space-y-4">
            <div>
              <label className="text-sm text-steel block mb-1">Current Mode</label>
              <div className="flex items-center gap-2 p-3 bg-sky rounded-lg">
                <div className="w-2 h-2 bg-forest rounded-full animate-pulse" />
                <p className="text-sm font-medium text-charcoal">Guest Mode</p>
              </div>
              <p className="text-xs text-steel mt-2">No sign-in required. All data is stored locally in your browser.</p>
            </div>
          </div>
        </motion.section>

        {/* Session Info */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-lightGray overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-lightGray bg-sky/50">
            <h2 className="font-semibold text-charcoal flex items-center gap-2">
              <Database size={18} className="text-blueprint" />
              Session
            </h2>
          </div>
          <div className="px-4 py-4">
            <label className="text-sm text-steel block mb-1">Session ID</label>
            <code className="block p-3 bg-sky rounded-lg font-mono text-xs text-charcoal break-all">
              {sessionId}
            </code>
          </div>
          <div className="px-4 py-3 border-t border-lightGray bg-crimson/5">
            <button
              onClick={handleClearSession}
              className="text-crimson text-sm font-medium hover:underline flex items-center gap-1"
            >
              <X size={16} />
              Clear Session & Local Data
            </button>
          </div>
        </motion.section>

        {/* Environment Setup */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl border border-lightGray overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-lightGray bg-sky/50">
            <h2 className="font-semibold text-charcoal flex items-center gap-2">
              <Code size={18} className="text-blueprint" />
              Developer Setup
            </h2>
          </div>
          <div className="px-4 py-4">
            <p className="text-sm text-steel mb-4">
              To enable all features, create a .env file in the project root with:
            </p>
            <pre className="bg-charcoal rounded-lg p-4 text-xs font-mono text-white overflow-x-auto">
{`VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id
VITE_OPENAI_API_KEY=sk-your_openai_key`}
            </pre>
          </div>
        </motion.section>

        {/* About */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl border border-lightGray overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-lightGray bg-sky/50">
            <h2 className="font-semibold text-charcoal flex items-center gap-2">
              <Info size={18} className="text-blueprint" />
              About
            </h2>
          </div>
          <div className="px-4 py-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blueprint flex items-center justify-center">
                <span className="text-white font-bold text-lg">PP</span>
              </div>
              <div>
                <p className="font-semibold text-charcoal">PermitPath</p>
                <p className="text-sm text-steel">Version 1.0.0</p>
              </div>
            </div>
            <p className="text-sm text-steel leading-relaxed">
              PermitPath helps contractors and homeowners navigate the permit process with AI-powered guidance, personalized checklists, and step-by-step support.
            </p>
            <div className="pt-3 border-t border-lightGray">
              <p className="text-xs text-steel">
                © 2024 PermitPath. All rights reserved.
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </PageWrapper>
  );
}

// Missing icon imports
function Bell({ size, className }: { size: number; className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function Moon({ size, className }: { size: number; className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}
