'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, TrendingDown, Building2, Calendar, DollarSign, AlertTriangle } from 'lucide-react';
import { Job, JobType, Jurisdiction } from '@/types/permit';

// Historical permit data - simulated database
export interface HistoricalPermit {
  id: string;
  jobType: JobType;
  jurisdiction: Jurisdiction;
  location: string;
  daysToApproval: number;
  cost: number;
  submittedAt: Date;
  complexity: 'simple' | 'moderate' | 'complex';
  outcome: 'approved' | 'rejected' | 'pending';
}

interface TimeMachineAnalyticsProps {
  job?: Job;
  className?: string;
}

// Simulated historical database
const HISTORICAL_DATA: HistoricalPermit[] = [
  { id: '1', jobType: 'RE_ROOFING', jurisdiction: 'PINELLAS_COUNTY', location: 'St Petersburg', daysToApproval: 5, cost: 88, submittedAt: new Date('2024-01-15'), complexity: 'simple', outcome: 'approved' },
  { id: '2', jobType: 'RE_ROOFING', jurisdiction: 'PINELLAS_COUNTY', location: 'Clearwater', daysToApproval: 7, cost: 88, submittedAt: new Date('2024-02-01'), complexity: 'simple', outcome: 'approved' },
  { id: '3', jobType: 'RE_ROOFING', jurisdiction: 'ST_PETERSBURG', location: 'St Petersburg', daysToApproval: 4, cost: 88, submittedAt: new Date('2024-02-20'), complexity: 'simple', outcome: 'approved' },
  { id: '4', jobType: 'WATER_HEATER', jurisdiction: 'PINELLAS_COUNTY', location: 'Largo', daysToApproval: 3, cost: 50, submittedAt: new Date('2024-01-10'), complexity: 'simple', outcome: 'approved' },
  { id: '5', jobType: 'WATER_HEATER', jurisdiction: 'CLEARWATER', location: 'Clearwater', daysToApproval: 4, cost: 50, submittedAt: new Date('2024-03-01'), complexity: 'simple', outcome: 'approved' },
  { id: '6', jobType: 'ELECTRICAL_PANEL', jurisdiction: 'PINELLAS_COUNTY', location: 'Palm Harbor', daysToApproval: 8, cost: 88, submittedAt: new Date('2024-01-25'), complexity: 'moderate', outcome: 'approved' },
  { id: '7', jobType: 'ELECTRICAL_PANEL', jurisdiction: 'ST_PETERSBURG', location: 'St Petersburg', daysToApproval: 6, cost: 88, submittedAt: new Date('2024-02-15'), complexity: 'moderate', outcome: 'approved' },
  { id: '8', jobType: 'AC_HVAC_CHANGEOUT', jurisdiction: 'PINELLAS_COUNTY', location: 'St Petersburg', daysToApproval: 7, cost: 88, submittedAt: new Date('2024-03-10'), complexity: 'moderate', outcome: 'approved' },
  { id: '9', jobType: 'SMALL_BATH_REMODEL', jurisdiction: 'PINELLAS_COUNTY', location: 'Clearwater', daysToApproval: 12, cost: 150, submittedAt: new Date('2024-01-20'), complexity: 'moderate', outcome: 'approved' },
  { id: '10', jobType: 'KITCHEN_REMODEL', jurisdiction: 'ST_PETERSBURG', location: 'St Petersburg', daysToApproval: 18, cost: 300, submittedAt: new Date('2024-02-28'), complexity: 'complex', outcome: 'approved' },
  { id: '11', jobType: 'DECK_INSTALLATION', jurisdiction: 'PINELLAS_COUNTY', location: 'Largo', daysToApproval: 10, cost: 150, submittedAt: new Date('2024-03-05'), complexity: 'moderate', outcome: 'approved' },
  { id: '12', jobType: 'ROOM_ADDITION', jurisdiction: 'PINELLAS_COUNTY', location: 'St Petersburg', daysToApproval: 35, cost: 800, submittedAt: new Date('2024-01-05'), complexity: 'complex', outcome: 'approved' },
  { id: '13', jobType: 'RE_ROOFING', jurisdiction: 'CLEARWATER', location: 'Clearwater', daysToApproval: 6, cost: 88, submittedAt: new Date('2024-03-15'), complexity: 'simple', outcome: 'pending' },
  { id: '14', jobType: 'ELECTRICAL_REWIRING', jurisdiction: 'PINELLAS_COUNTY', location: 'St Petersburg', daysToApproval: 14, cost: 200, submittedAt: new Date('2024-02-10'), complexity: 'complex', outcome: 'approved' },
  { id: '15', jobType: 'FENCE_INSTALLATION', jurisdiction: 'LARGO', location: 'Largo', daysToApproval: 4, cost: 88, submittedAt: new Date('2024-03-12'), complexity: 'simple', outcome: 'approved' },
];

// Calculate similarity score between two permits
function calculateSimilarity(job: Job, historical: HistoricalPermit): number {
  let score = 0;
  
  // Job type match (highest weight)
  if (job.jobType === historical.jobType) score += 0.5;
  
  // Jurisdiction match
  if (job.jurisdiction === historical.jurisdiction) score += 0.3;
  
  // Location proximity (simplified - just check if same city mentioned)
  if (job.address && historical.location && 
      job.address.toLowerCase().includes(historical.location.toLowerCase())) {
    score += 0.2;
  }
  
  return Math.min(1, score);
}

// Find similar permits
function findSimilarPermits(
  job: Job, 
  historical: HistoricalPermit[], 
  limit: number = 5
): Array<{ record: HistoricalPermit; score: number }> {
  const scored = historical.map(record => ({
    record,
    score: calculateSimilarity(job, record)
  }));
  
  return scored
    .filter(item => item.score > 0.3) // Minimum similarity threshold
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export default function TimeMachineAnalytics({ job, className = '' }: TimeMachineAnalyticsProps) {
  const analytics = useMemo(() => {
    if (!job) return null;
    
    const similar = findSimilarPermits(job, HISTORICAL_DATA, 8);
    
    if (similar.length === 0) {
      return {
        similarCount: 0,
        averageDays: 0,
        fastestDays: 0,
        slowestDays: 0,
        approvalRate: 0,
        averageCost: 0,
        trend: 'stable' as const,
        comparisons: [],
      };
    }
    
    const approved = similar.filter(s => s.record.outcome === 'approved');
    const days = similar.map(s => s.record.daysToApproval);
    const costs = similar.map(s => s.record.cost);
    
    const averageDays = Math.round(days.reduce((a, b) => a + b, 0) / days.length);
    const fastestDays = Math.min(...days);
    const slowestDays = Math.max(...days);
    const approvalRate = Math.round((approved.length / similar.length) * 100);
    const averageCost = Math.round(costs.reduce((a, b) => a + b, 0) / costs.length);
    
    // Calculate trend (compare recent vs older permits)
    const recent = similar.filter(s => 
      s.record.submittedAt > new Date('2024-02-15')
    );
    const older = similar.filter(s => 
      s.record.submittedAt <= new Date('2024-02-15')
    );
    
    let trend: 'improving' | 'stable' | 'slowing' = 'stable';
    if (recent.length > 0 && older.length > 0) {
      const recentAvg = recent.reduce((a, b) => a + b.record.daysToApproval, 0) / recent.length;
      const olderAvg = older.reduce((a, b) => a + b.record.daysToApproval, 0) / older.length;
      
      if (recentAvg < olderAvg * 0.9) trend = 'improving';
      else if (recentAvg > olderAvg * 1.1) trend = 'slowing';
    }
    
    return {
      similarCount: similar.length,
      averageDays,
      fastestDays,
      slowestDays,
      approvalRate,
      averageCost,
      trend,
      comparisons: similar,
    };
  }, [job]);

  if (!job) {
    return (
      <section className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
        <div className="text-center py-8">
          <Clock size={40} className="text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Time Machine Analytics</h3>
          <p className="text-sm text-slate-500">
            Create or select a permit to see historical comparison insights.
          </p>
        </div>
      </section>
    );
  }

  if (analytics?.similarCount === 0) {
    return (
      <section className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">Time Machine Analytics</h3>
        <p className="text-sm text-slate-500 mb-4">Historical data for this permit type</p>
        
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900">Limited Historical Data</p>
              <p className="text-xs text-amber-700 mt-1">
                We don't have enough similar permits in our database yet. 
                As more permits are processed, you'll see insights here.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Time Machine</h3>
          <p className="text-sm text-slate-500">Historical comparison for similar permits</p>
        </div>
        {analytics?.trend && (
          <div className={`
            flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
            ${analytics.trend === 'improving' ? 'bg-emerald-100 text-emerald-700' : 
              analytics.trend === 'slowing' ? 'bg-amber-100 text-amber-700' : 
              'bg-slate-100 text-slate-700'}
          `}>
            {analytics.trend === 'improving' ? <TrendingDown size={14} /> : 
             analytics.trend === 'slowing' ? <TrendingUp size={14} /> : 
             <Clock size={14} />}
            {analytics.trend === 'improving' ? 'Faster lately' : 
             analytics.trend === 'slowing' ? 'Slower lately' : 'Stable'}
          </div>
        )}
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Comparable"
          value={analytics?.similarCount || 0}
          subtext="Similar permits"
          icon={Building2}
          color="blue"
        />
        <StatCard
          label="Avg Timeline"
          value={`${analytics?.averageDays || 0}d`}
          subtext={`Range: ${analytics?.fastestDays || 0}-${analytics?.slowestDays || 0} days`}
          icon={Calendar}
          color="emerald"
        />
        <StatCard
          label="Approval Rate"
          value={`${analytics?.approvalRate || 0}%`}
          subtext="Success rate"
          icon={TrendingUp}
          color="violet"
        />
        <StatCard
          label="Avg Cost"
          value={`$${analytics?.averageCost || 0}`}
          subtext="Permit fees"
          icon={DollarSign}
          color="amber"
        />
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 text-slate-600 font-medium">Type</th>
              <th className="text-left py-2 text-slate-600 font-medium">Location</th>
              <th className="text-center py-2 text-slate-600 font-medium">Days</th>
              <th className="text-center py-2 text-slate-600 font-medium">Cost</th>
              <th className="text-right py-2 text-slate-600 font-medium">Match</th>
            </tr>
          </thead>
          <tbody>
            {analytics?.comparisons.slice(0, 5).map((item, index) => (
              <motion.tr
                key={item.record.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
              >
                <td className="py-2 text-slate-800">
                  {formatJobType(item.record.jobType)}
                </td>
                <td className="py-2 text-slate-600">
                  {item.record.location}
                </td>
                <td className="py-2 text-center">
                  <span className={`
                    inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                    ${item.record.daysToApproval <= 5 ? 'bg-emerald-100 text-emerald-700' : 
                      item.record.daysToApproval <= 10 ? 'bg-blue-100 text-blue-700' : 
                      'bg-amber-100 text-amber-700'}
                  `}>
                    {item.record.daysToApproval}
                  </span>
                </td>
                <td className="py-2 text-center text-slate-600">
                  ${item.record.cost}
                </td>
                <td className="py-2 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${item.score * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 w-8">
                      {Math.round(item.score * 100)}%
                    </span>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer note */}
      <p className="text-xs text-slate-400 mt-4 text-center">
        Based on {HISTORICAL_DATA.length} permits in Pinellas County database
      </p>
    </section>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  subtext: string;
  icon: React.ElementType;
  color: 'blue' | 'emerald' | 'violet' | 'amber';
}

function StatCard({ label, value, subtext, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    violet: 'bg-violet-50 text-violet-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-7 h-7 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
          <Icon size={14} />
        </div>
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <p className="text-xl font-bold text-slate-900">{value}</p>
      <p className="text-[10px] text-slate-400">{subtext}</p>
    </div>
  );
}

function formatJobType(type: JobType): string {
  return type
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase());
}

// Export for use in other components
export { findSimilarPermits, HISTORICAL_DATA };
export type { HistoricalPermit };
