// ─────────────────────────────────────────────────────────────────────────────
// ContractorMatchList — full match results panel used inside wizard
// Week 9 | PermitPath 90-day sprint
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, MapPin, Info } from 'lucide-react';
import type { Jurisdiction } from '@/types/permit';
import { findMatches } from '@/services/contractorMatchService';
import ContractorMatchCard from '@/components/permit/ContractorMatchCard';

interface ContractorMatchListProps {
  jobType: string;
  jurisdiction: Jurisdiction;
  jobId?: string;
  estimatedValue?: number;
}

// Human-readable job type label
function jobTypeLabel(jobType: string): string {
  return jobType
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ContractorMatchList({
  jobType,
  jurisdiction,
  jobId,
  estimatedValue,
}: ContractorMatchListProps) {
  const result = useMemo(
    () => findMatches({ jobType, jurisdiction, estimatedValue }),
    [jobType, jurisdiction, estimatedValue]
  );

  const jurisdictionLabel = jurisdiction.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 px-4 py-4"
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center">
            <Users className="h-4 w-4 text-teal-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Matched Contractors</h3>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-teal-700">
              <MapPin className="h-3 w-3" />
              {jurisdictionLabel}
              <span className="text-teal-400">·</span>
              {jobTypeLabel(jobType)}
            </div>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
              {result.totalFound} licensed contractors serve your area.
              All matches are sorted by rating, verified status, and availability.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Match cards */}
      {result.matches.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center">
          <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-600">No matches found</p>
          <p className="text-xs text-gray-400 mt-1">
            Try a different jurisdiction or job type.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {result.matches.map((contractor, index) => (
            <ContractorMatchCard
              key={contractor.id}
              contractor={contractor}
              rank={index}
              jobId={jobId}
            />
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-start gap-2 rounded-xl bg-gray-50 px-3 py-3"
      >
        <Info className="h-3.5 w-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-gray-400 leading-relaxed">
          PermitPath verifies license numbers with the Florida DBPR at the time of registration.
          Always confirm a contractor's license and insurance before signing a contract.
          Listings are not endorsements.
        </p>
      </motion.div>
    </div>
  );
}
