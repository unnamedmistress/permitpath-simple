// ─────────────────────────────────────────────────────────────────────────────
// ContractorUpgradeModal — Stripe Pro subscription CTA
// Week 7 | PermitPath 90-day sprint
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Zap,
  CheckCircle2,
  Star,
  Building2,
  MapPin,
  Bell,
  FileText,
  Loader2,
} from 'lucide-react';
import { startStripeCheckout } from '@/services/contractorService';
import { toast } from 'sonner';

interface ContractorUpgradeModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userEmail?: string;
}

const PRO_FEATURES = [
  { icon: Bell, text: 'Real-time permit leads in your service area' },
  { icon: MapPin, text: 'Multi-county coverage (Pinellas + Hillsborough)' },
  { icon: FileText, text: 'One-click document packet generation' },
  { icon: Building2, text: 'Branded contractor profile for homeowners' },
  { icon: Star, text: 'Priority placement in contractor matching' },
  { icon: Zap, text: 'AI permit pre-screening for each job type' },
];

export default function ContractorUpgradeModal({
  open,
  onClose,
  onSuccess,
  userEmail = '',
}: ContractorUpgradeModalProps) {
  const [email, setEmail] = useState(userEmail);
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    if (!email.trim()) {
      toast.error('Please enter your email to continue');
      return;
    }
    setLoading(true);
    try {
      await startStripeCheckout(email.trim());
      toast.success('Pro account activated! Welcome to PermitPath Pro');
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            key="sheet"
            initial={{ opacity: 0, y: 60, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white shadow-2xl max-h-[92vh] overflow-y-auto md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md md:rounded-3xl"
          >
            {/* Gradient header */}
            <div className="relative rounded-t-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 px-6 pt-8 pb-10 text-white">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full bg-white/20 p-1.5 hover:bg-white/30 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                <Zap className="h-3 w-3 fill-yellow-300 text-yellow-300" />
                Contractor Pro
              </div>

              <h2 className="text-2xl font-bold leading-tight">
                Grow your business<br />with PermitPath Pro
              </h2>
              <p className="mt-2 text-sm text-white/80">
                Connect with homeowners who are ready to hire — right when they start their permit.
              </p>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">$29</span>
                <span className="text-lg text-white/70">/month</span>
                <span className="ml-3 rounded-full bg-green-400/20 px-2.5 py-0.5 text-xs font-medium text-green-200">
                  14-day free trial
                </span>
              </div>
            </div>

            {/* Feature list card */}
            <div className="-mt-4 mx-4 rounded-2xl bg-white shadow-lg border border-gray-100 divide-y divide-gray-50">
              {PRO_FEATURES.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-shrink-0 rounded-xl bg-violet-50 p-2">
                    <Icon className="h-4 w-4 text-violet-600" />
                  </div>
                  <span className="text-sm text-gray-700">{text}</span>
                  <CheckCircle2 className="ml-auto h-4 w-4 flex-shrink-0 text-green-500" />
                </div>
              ))}
            </div>

            {/* Email + CTA */}
            <div className="px-6 pt-6 pb-8 space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Business email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourcompany.com"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleUpgrade()}
              />

              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-200 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-60 transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4 fill-yellow-300 text-yellow-300" />
                )}
                {loading ? 'Setting up your account…' : 'Start free trial — no card required'}
              </button>

              <p className="text-center text-xs text-gray-400">
                Cancel anytime. No contracts. Billed monthly after trial.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
