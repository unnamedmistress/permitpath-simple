/**
 * InspectionSchedulerPanel — Week 10
 *
 * Full inspection scheduling UI for a job. Shows:
 *  • Progress header (X of Y inspections passed)
 *  • Next-up callout
 *  • Expandable InspectionSchedulerCard per phase
 *  • Building department contact strip at bottom
 */

import { useState, useCallback } from 'react';
import { CalendarClock, CheckCircle2, ExternalLink, MapPin, Phone } from 'lucide-react';
import type { JobType, Jurisdiction } from '@/types/permit';
import { getBuildingDepartment } from '@/data/jurisdictionData';
import {
  getOrInitSchedule,
  getInspectionStats,
} from '@/services/inspectionScheduler';
import InspectionSchedulerCard from '@/components/permit/InspectionSchedulerCard';

// ─── Props ───────────────────────────────────────────────────────────────────

interface InspectionSchedulerPanelProps {
  jobId: string;
  jobType: JobType;
  address?: string;
  jurisdiction?: Jurisdiction;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function InspectionSchedulerPanel({
  jobId,
  jobType,
  address,
}: InspectionSchedulerPanelProps) {
  // tick forces a re-render when any card calls onUpdate()
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  // Seed schedule on first render (or retrieve existing)
  const schedule = getOrInitSchedule(jobId, jobType);
  const stats = getInspectionStats(schedule);

  // Building department info (for phone / portal links)
  const dept = getBuildingDepartment(address);

  // Which phase is next (first non-passed, non-waived)
  const nextAppt = schedule.appointments.find(
    (a) => a.status !== 'passed' && a.status !== 'waived'
  );

  const allDone = stats.passed === stats.total && stats.total > 0;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">

      {/* ── Progress banner ── */}
      <div
        className={`rounded-xl p-4 ${
          allDone
            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
        }`}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            {allDone
              ? <CheckCircle2 size={20} className="text-white" />
              : <CalendarClock size={20} className="text-white" />
            }
          </div>
          <div>
            <h2 className="text-base font-bold">
              {allDone ? 'All Inspections Passed! 🎉' : 'Inspection Tracker'}
            </h2>
            <p className="text-xs opacity-90">
              {allDone
                ? 'Your project is ready for final close-out'
                : `${stats.passed} of ${stats.total} inspection${stats.total !== 1 ? 's' : ''} passed`}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        {!allDone && stats.total > 0 && (
          <div className="space-y-1">
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{ width: `${Math.round((stats.passed / stats.total) * 100)}%` }}
              />
            </div>
            <div className="flex gap-4 text-xs opacity-90">
              {stats.passed > 0 && (
                <span>✓ {stats.passed} passed</span>
              )}
              {stats.scheduled > 0 && (
                <span>📅 {stats.scheduled} scheduled</span>
              )}
              {stats.failed > 0 && (
                <span>✗ {stats.failed} failed</span>
              )}
              {stats.pending > 0 && (
                <span>○ {stats.pending} pending</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Next up callout ── */}
      {nextAppt && !allDone && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 flex items-start gap-3">
          <CalendarClock size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-900">Next up: {nextAppt.phaseName}</p>
            <p className="text-xs text-amber-700 mt-0.5">{nextAppt.timing}</p>
            {nextAppt.status === 'scheduled' && nextAppt.scheduledDate && (
              <p className="text-xs font-semibold text-amber-800 mt-1">
                📅 Appointment booked
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Prep tip ── */}
      {!allDone && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold text-slate-700 mb-1">📋 General inspection tips</p>
          <ul className="text-xs text-slate-600 space-y-1">
            <li>• Call or schedule online at least <strong>24–48 hours</strong> in advance</li>
            <li>• Have your <strong>permit card visible</strong> at the job site</li>
            <li>• Contractor or property owner must be <strong>present</strong></li>
            <li>• If failed, fix issues immediately and reschedule — don't leave work covered</li>
            <li>• Take <strong>photos of completed work</strong> before calling for inspection</li>
          </ul>
        </div>
      )}

      {/* ── Inspection cards ── */}
      <div className="space-y-2">
        {schedule.appointments.map((appt, i) => (
          <InspectionSchedulerCard
            key={appt.id}
            appointment={appt}
            jobId={jobId}
            onUpdate={refresh}
            deptPhone={dept.phone}
            deptPortal={dept.onlinePortal}
            defaultOpen={i === 0 && appt.status !== 'passed'}
          />
        ))}
      </div>

      {/* ── Building dept strip ── */}
      <div className="rounded-xl border border-slate-200 bg-card p-4 space-y-2">
        <p className="text-xs font-semibold text-foreground">Your Building Department</p>
        <p className="text-sm font-medium text-foreground">{dept.name}</p>
        <div className="text-xs text-muted-foreground space-y-0.5">
          <div className="flex items-center gap-1.5">
            <MapPin size={12} className="flex-shrink-0" />
            {dept.address}, {dept.city}
          </div>
          <div className="flex items-center gap-1.5">
            <CalendarClock size={12} className="flex-shrink-0" />
            {dept.hours}
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <a
            href={`tel:${dept.phone.replace(/[^0-9]/g, '')}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <Phone size={12} /> {dept.phone}
          </a>
          {dept.onlinePortal && (
            <a
              href={dept.onlinePortal}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-muted text-foreground rounded-lg text-xs font-semibold hover:bg-muted/80 transition-colors"
            >
              <ExternalLink size={12} /> Schedule Online
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
