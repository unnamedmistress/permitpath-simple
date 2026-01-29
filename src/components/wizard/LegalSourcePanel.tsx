import { ExternalLink, X, BookOpen, Calendar, Shield } from "lucide-react";
import { LegalSource } from "@/types";

interface LegalSourcePanelProps {
  source: LegalSource;
  onClose: () => void;
}

export default function LegalSourcePanel({ source, onClose }: LegalSourcePanelProps) {
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-card border-t-2 border-primary rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[60vh] overflow-hidden">
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="flex items-start justify-between px-5 pb-4">
          <div className="flex items-start gap-3 flex-1 pr-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <BookOpen size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg leading-tight">
                {source.label}
              </h3>
              {source.lastUpdated && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Calendar size={12} />
                  <span>Updated: {source.lastUpdated}</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors -mr-2"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>
        
        {/* Content */}
        <div className="px-5 pb-6 space-y-4 overflow-y-auto max-h-[calc(60vh-160px)]">
          <div className="bg-muted/50 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Shield size={16} className="text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                {source.description}
              </p>
            </div>
          </div>
          
          <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
            <p className="text-xs text-primary font-medium mb-2">
              📚 Official Documentation
            </p>
            <p className="text-xs text-muted-foreground">
              This links to the official source. The information there is legally binding and always up-to-date.
            </p>
          </div>
        </div>
        
        {/* Action Button */}
        <div className="px-5 pb-6 pt-2 border-t border-border bg-card">
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-lg"
          >
            <ExternalLink size={18} />
            View Official Source
          </a>
          
          <p className="text-xs text-center text-muted-foreground mt-3">
            Opens in a new tab • Official government website
          </p>
        </div>
      </div>
    </>
  );
}
