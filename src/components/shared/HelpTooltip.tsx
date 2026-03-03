import { useState } from 'react';
import { HelpCircle, X, Copy, Check, Phone, Clock, FileText, Award, FileEdit } from 'lucide-react';

interface HelpContent {
  whatItIs: string;
  whatYouNeed: string;
  howToGet: string;
  proTip?: string;
  templateMessage?: string;
  estimatedTime?: string;
  whoCanHelp?: string;
}

interface HelpTooltipProps {
  title: string;
  help: HelpContent;
}

export default function HelpTooltip({ title, help }: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (help.templateMessage) {
      navigator.clipboard.writeText(help.templateMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors"
      >
        <HelpCircle size={14} />
        What's this?
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 animate-in fade-in"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <HelpCircle size={18} className="text-blue-600" />
            {title}
          </h3>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* What It Is */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <FileText size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-sm">What this is</p>
              <p className="text-sm text-muted-foreground">{help.whatItIs}</p>
            </div>
          </div>

          {/* What You Need */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
              <Award size={16} className="text-green-600" />
            </div>
            <div>
              <p className="font-medium text-sm">What you need</p>
              <p className="text-sm text-muted-foreground">{help.whatYouNeed}</p>
            </div>
          </div>

          {/* How To Get */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
              <FileEdit size={16} className="text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-sm">How to get it</p>
              <p className="text-sm text-muted-foreground">{help.howToGet}</p>
              {help.estimatedTime && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock size={12} />
                  Estimated: {help.estimatedTime}
                </p>
              )}
            </div>
          </div>

          {/* Template Message */}
          {help.templateMessage && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-medium text-sm mb-2">Message template</p>
              <p className="text-sm text-muted-foreground bg-white p-3 rounded-lg mb-2">
                {help.templateMessage}
              </p>
              <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy to clipboard'}
              </button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Paste this into a text or email
              </p>
            </div>
          )}

          {/* Pro Tip */}
          {help.proTip && (
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <p className="font-medium text-sm text-amber-900 mb-1">💡 Pro Tip</p>
              <p className="text-sm text-amber-800">{help.proTip}</p>
            </div>
          )}

          {/* Who Can Help */}
          {help.whoCanHelp && (
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <p className="font-medium text-sm text-green-900 mb-1">📞 Who can help</p>
              <p className="text-sm text-green-800">{help.whoCanHelp}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <a 
            href="tel:727-464-3199" 
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <Phone size={16} />
            Call County: (727) 464-3199
          </a>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Hours: Monday-Friday 8am-5pm
          </p>
        </div>
      </div>
    </div>
  );
}
