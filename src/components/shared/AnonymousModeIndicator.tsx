import { useState } from 'react';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { User, X, Cloud, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AnonymousModeIndicator() {
  const { isAuthenticated } = useSupabaseAuth();
  const [dismissed, setDismissed] = useState(false);
  
  // Don't show if user is authenticated or if dismissed
  if (isAuthenticated || dismissed) {
    return null;
  }
  
  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-40 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg p-3 pr-8 relative">
        {/* Dismiss button */}
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-colors"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
        
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <User size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">
              Using anonymously
            </p>
            <p className="text-xs text-blue-100 mt-0.5">
              Your progress is saved on this device.
            </p>
            <Link
              to="/auth"
              className="inline-flex items-center gap-1 text-xs text-white/90 hover:text-white underline mt-2"
            >
              <Cloud size={12} />
              Sign up to save to cloud
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact version for header/inline use
export function AnonymousModeBadge() {
  const { isAuthenticated } = useSupabaseAuth();
  
  if (isAuthenticated) {
    return null;
  }
  
  return (
    <Link
      to="/auth"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium hover:bg-blue-200 transition-colors"
    >
      <Info size={12} />
      <span className="hidden sm:inline">Using anonymously</span>
      <span className="sm:hidden">Guest</span>
    </Link>
  );
}

// Inline version with tooltip-like info
export function AnonymousModeNotice() {
  const { isAuthenticated } = useSupabaseAuth();
  const [showInfo, setShowInfo] = useState(false);
  
  if (isAuthenticated) {
    return null;
  }
  
  return (
    <div className="relative">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <User size={14} />
        <span>Using anonymously</span>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="text-blue-600 hover:underline text-xs"
        >
          {showInfo ? 'Hide info' : 'Learn more'}
        </button>
      </div>
      
      {showInfo && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
          <p className="mb-1">
            <strong>Your data is stored locally on this device.</strong>
          </p>
          <p>
            If you clear your browser data or switch devices, you may lose your progress.{' '}
            <Link to="/auth" className="underline font-medium">
              Create an account
            </Link>{' '}
            to save your work to the cloud and access it anywhere.
          </p>
        </div>
      )}
    </div>
  );
}
