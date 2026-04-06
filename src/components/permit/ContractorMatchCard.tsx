// ─────────────────────────────────────────────────────────────────────────────
// ContractorMatchCard — single matched contractor display
// Week 9 | PermitPath 90-day sprint
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  CheckCircle2,
  Phone,
  Mail,
  Clock,
  Shield,
  Zap,
  Calendar,
  ChevronDown,
  ChevronUp,
  BadgeCheck,
} from 'lucide-react';
import type { MatchedContractor } from '@/types/contractorMatch';
import { logContactEvent, hasContacted, getInitials } from '@/services/contractorMatchService';
import { toast } from 'sonner';

// Avatar background palette keyed to first initial
const AVATAR_COLORS: Record<string, string> = {
  A: 'bg-rose-500', B: 'bg-orange-500', C: 'bg-amber-500', D: 'bg-yellow-500',
  E: 'bg-lime-500',  F: 'bg-green-500',  G: 'bg-emerald-500', H: 'bg-teal-500',
  I: 'bg-cyan-500',  J: 'bg-sky-500',    K: 'bg-blue-500',    L: 'bg-indigo-500',
  M: 'bg-violet-500',N: 'bg-purple-500', O: 'bg-fuchsia-500', P: 'bg-pink-500',
  Q: 'bg-rose-400',  R: 'bg-orange-400', S: 'bg-teal-600',    T: 'bg-blue-600',
  U: 'bg-indigo-600',V: 'bg-violet-600', W: 'bg-green-600',   X: 'bg-amber-600',
  Y: 'bg-yellow-600',Z: 'bg-sky-600',
};

function avatarColor(name: string): string {
  const first = name.charAt(0).toUpperCase();
  return AVATAR_COLORS[first] ?? 'bg-gray-500';
}

interface ContractorMatchCardProps {
  contractor: MatchedContractor;
  rank: number;
  jobId?: string;
}

export default function ContractorMatchCard({
  contractor: c,
  rank,
  jobId,
}: ContractorMatchCardProps) {
  const [expanded, setExpanded] = useState(rank === 0); // first card open by default
  const [contacted, setContacted] = useState(hasContacted(c.id));

  const initials = getInitials(c.companyName);
  const avatarBg = avatarColor(c.companyName);

  function handleCall() {
    logContactEvent(c.id, 'call', jobId);
    setContacted(true);
    window.open(`tel:${c.phone.replace(/\D/g, '')}`, '_self');
    toast.success(`Calling ${c.companyName}…`);
  }

  function handleEmail() {
    logContactEvent(c.id, 'email', jobId);
    setContacted(true);
    window.open(`mailto:${c.email}?subject=Permit%20Project%20Inquiry`, '_blank');
    toast.success('Opening email…');
  }

  function handleRequest() {
    logContactEvent(c.id, 'request', jobId);
    setContacted(true);
    toast.success(`Quote request sent to ${c.companyName}!`);
  }

  const ratingStars = Array.from({ length: 5 }, (_, i) => i < Math.round(c.rating));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.07 }}
      className={`rounded-2xl border overflow-hidden ${
        rank === 0
          ? 'border-teal-200 shadow-md shadow-teal-50'
          : 'border-gray-100 shadow-sm'
      }`}
    >
      {/* Top band for #1 */}
      {rank === 0 && (
        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-4 py-1.5 flex items-center gap-1.5">
          <Star className="h-3 w-3 text-white fill-white" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Best Match
          </span>
        </div>
      )}

      {/* Card header (always visible) */}
      <div
        className="bg-white px-4 py-4 cursor-pointer"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className={`flex-shrink-0 w-11 h-11 rounded-2xl ${avatarBg} flex items-center justify-center text-white font-bold text-sm`}>
            {initials}
          </div>

          {/* Company + role */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-gray-900 text-sm leading-tight truncate">
                {c.companyName}
              </span>
              {c.isPro && (
                <span className="flex-shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700 uppercase tracking-wide">
                  Pro
                </span>
              )}
              {contacted && (
                <span className="flex-shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                  Contacted
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{c.roleLabel} · {c.contactName}</div>

            {/* Rating row */}
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex gap-0.5">
                {ratingStars.map((filled, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${filled ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-gray-700">{c.rating}</span>
              <span className="text-xs text-gray-400">({c.reviewCount} reviews)</span>
            </div>
          </div>

          {/* Expand toggle */}
          <button className="flex-shrink-0 mt-1 rounded-full bg-gray-50 p-1 hover:bg-gray-100 transition-colors">
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>

        {/* Quick pills */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {c.licenseVerified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
              <BadgeCheck className="h-3 w-3" /> Licensed
            </span>
          )}
          {c.insuranceVerified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
              <Shield className="h-3 w-3" /> Insured
            </span>
          )}
          {c.availableNow ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
              <Zap className="h-3 w-3 fill-teal-500" /> Available now
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600">
              <Calendar className="h-3 w-3" /> Starts in ~{c.estimatedStartDays}d
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
            <Clock className="h-3 w-3" /> Replies in {c.responseTimeHours < 12 ? `${c.responseTimeHours}h` : '1–2 days'}
          </span>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-gray-50 bg-gray-50"
        >
          {/* Stats row */}
          <div className="grid grid-cols-3 divide-x divide-gray-100 px-4 py-3">
            <div className="text-center pr-3">
              <div className="text-base font-bold text-gray-900">{c.jobsCompleted}</div>
              <div className="text-[10px] text-gray-500 leading-tight">Jobs done</div>
            </div>
            <div className="text-center px-3">
              <div className="text-base font-bold text-gray-900">{c.yearsExperience}yr</div>
              <div className="text-[10px] text-gray-500 leading-tight">Experience</div>
            </div>
            <div className="text-center pl-3">
              <div className="text-base font-bold text-gray-900">{c.licenseNumber ?? '—'}</div>
              <div className="text-[10px] text-gray-500 leading-tight">License #</div>
            </div>
          </div>

          {/* Specialties */}
          {c.specialties.length > 0 && (
            <div className="px-4 pb-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Specialties
              </div>
              <div className="flex flex-wrap gap-1.5">
                {c.specialties.map((s) => (
                  <span key={s} className="rounded-full bg-white border border-gray-200 px-2.5 py-0.5 text-xs text-gray-600">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA buttons */}
          <div className="px-4 pb-4 grid grid-cols-3 gap-2">
            <button
              onClick={handleCall}
              className="flex flex-col items-center justify-center gap-1 rounded-xl bg-white border border-gray-200 py-2.5 text-xs font-semibold text-gray-700 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 transition-all active:scale-95"
            >
              <Phone className="h-4 w-4" />
              Call
            </button>
            <button
              onClick={handleEmail}
              className="flex flex-col items-center justify-center gap-1 rounded-xl bg-white border border-gray-200 py-2.5 text-xs font-semibold text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all active:scale-95"
            >
              <Mail className="h-4 w-4" />
              Email
            </button>
            <button
              onClick={handleRequest}
              className="flex flex-col items-center justify-center gap-1 rounded-xl bg-teal-600 border border-teal-600 py-2.5 text-xs font-bold text-white hover:bg-teal-700 transition-all active:scale-95 shadow-sm"
            >
              <CheckCircle2 className="h-4 w-4" />
              Request
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
