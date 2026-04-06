/**
 * InspectionSchedulerCard — Week 10
 *
 * Interactive card for one inspection phase. Lets the homeowner:
 *  • Schedule the inspection (pick date + window + confirmation #)
 *  • Mark it passed ✓ or failed ✗
 *  • Reschedule after a failure
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  CalendarClock,
  CalendarCheck,
  CalendarX,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Phone,
} from 'lucide-react';
import type { InspectionAppointment, InspectionWindow } from '@/types/inspection';
import {
  scheduleInspection,
  passInspection,
  failInspection,
  rescheduleInspection,
  formatDate,
  todayISO,
} from '@/services/inspectionScheduler';

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending: {
    label: 'Not Scheduled',
    icon: CalendarClock,
    pill: 'bg-slate-100 text-slate-600',
    border: 'border-slate-200',
    header: 'bg-slate-50',
  },
  scheduled: {
    label: 'Scheduled',
    icon: CalendarCheck,
    pill: 'bg-blue-100 text-blue-700',
    border: 'border-blue-200',
    header: 'bg-blue-50',
  },
  passed: {
    label: 'Passed ✓',
    icon: CheckCircle2,
    pill: 'bg-emerald-100 text-emerald-700',
    border: 'border-emerald-200',
    header: 'bg-emerald-50',
  },
  failed: {
    label: 'Failed — Reschedule',
    icon: XCircle,
    pill: 'bg-red-100 text-red-700',
    border: 'border-red-200',
    header: 'bg-red-50',
  },
  waived: {
    label: 'Waived',
    icon: CheckCircle2,
    pill: 'bg-slate-100 text-slate-500',
    border: 'border-slate-200',
    header: 'bg-slate-50',
  },
};

const WINDOW_LABELS: Record<InspectionWindow, string> = {
  morning: 'Morning (8 AM – 12 PM)',
  afternoon: 'Afternoon (1 PM – 5 PM)',
  anytime: 'Anytime',
};

// ─── Props ───────────────────────────────────────────────────────────────────

interface InspectionSchedulerCardProps {
  appointment: InspectionAppointment;
  jobId: string;
  /** Called after any state change so parent can re-render */
  onUpdate: () => void;
  /** Building dept phone for quick-dial */
  deptPhone?: string;
  /** Online scheduling portal URL */
  deptPortal?: string;
  /** Open by default? */
  defaultOpen?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function InspectionSchedulerCard({
  appointment,
  jobId,
  onUpdate,
  deptPhone,
  deptPortal,
  defaultOpen = false,
}: InspectionSchedulerCardProps) {
  const [expanded, setExpanded] = useState(defaultOpen);

  // Schedule form state
  const [schedDate, setSchedDate] = useState('');
  const [schedWindow, setSchedWindow] = useState<InspectionWindow>('anytime');
  const [schedConfirmation, setSchedConfirmation] = useState('');
  const [showScheduleForm, setShowScheduleForm] = useState(false);

  // Fail form state
  const [showFailForm, setShowFailForm] = useState(false);
  const [failNotes, setFailNotes] = useState('');

  const cfg = STATUS_CONFIG[appointment.status];
  const StatusIcon = cfg.icon;

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleSchedule() {
    if (!schedDate) {
      toast.error('Please pick an inspection date');
      return;
    }
    scheduleInspection(jobId, appointment.id, schedDate, schedWindow, schedConfirmation || undefined);
    toast.success(`${appointment.phaseName} scheduled for ${formatDate(schedDate)}`);
    setShowScheduleForm(false);
    setSchedDate('');
    setSchedConfirmation('');
    onUpdate();
  }

  function handlePass() {
    passInspection(jobId, appointment.id);
    toast.success(`🎉 ${appointment.phaseName} passed!`);
    onUpdate();
  }

  function handleFail() {
    failInspection(jobId, appointment.id, failNotes || undefined);
    toast.error(`${appointment.phaseName} failed — fix issues and reschedule`);
    setShowFailForm(false);
    setFailNotes('');
    onUpdate();
  }

  function handleReschedule() {
    rescheduleInspection(jobId, appointment.id);
    toast.info(`${appointment.phaseName} reset — pick a new date`);
    onUpdate();
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={`rounded-xl border ${cfg.border} overflow-hidden`}>
      {/* Card header — always visible */}
      <button
        className={`w-full flex items-center gap-3 px-4 py-3 ${cfg.header} text-left`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-shrink-0">
          <span className="text-sm font-bold text-muted-foreground w-6 inline-block text-center">
            {appointment.phaseIndex + 1}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{appointment.phaseName}</p>
          <p className="text-xs text-muted-foreground truncate">{appointment.timing}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Status pill */}
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.pill} flex items-center gap-1`}>
            <StatusIcon size={11} />
            {cfg.label}
          </span>
          {expanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
        </div>
      </button>

      {/* Expanded body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 space-y-3 bg-card border-t border-inherit">

              {/* ── SCHEDULED: show details + pass/fail ── */}
              {appointment.status === 'scheduled' && appointment.scheduledDate && (
                <div className="space-y-3">
                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                    <CalendarCheck size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">
                        {formatDate(appointment.scheduledDate)}
                      </p>
                      {appointment.scheduledWindow && (
                        <p className="text-xs text-blue-700">{WINDOW_LABELS[appointment.scheduledWindow]}</p>
                      )}
                      {appointment.confirmationNumber && (
                        <p className="text-xs text-blue-600 mt-0.5">
                          Confirmation: <span className="font-mono">{appointment.confirmationNumber}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handlePass}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
                    >
                      <CheckCircle2 size={15} /> Passed
                    </button>
                    <button
                      onClick={() => setShowFailForm(!showFailForm)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-100 text-red-700 text-sm font-semibold hover:bg-red-200 transition-colors"
                    >
                      <XCircle size={15} /> Failed
                    </button>
                    <button
                      onClick={() => setShowScheduleForm(!showScheduleForm)}
                      className="px-3 py-2 rounded-lg bg-muted text-muted-foreground text-sm hover:bg-muted/80 transition-colors"
                      title="Change date"
                    >
                      <Clock size={15} />
                    </button>
                  </div>

                  {/* Fail notes form */}
                  <AnimatePresence>
                    {showFailForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 overflow-hidden"
                      >
                        <textarea
                          placeholder="Describe what failed (optional)…"
                          value={failNotes}
                          onChange={(e) => setFailNotes(e.target.value)}
                          rows={2}
                          className="w-full text-sm border border-red-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
                        />
                        <button
                          onClick={handleFail}
                          className="w-full py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
                        >
                          Confirm Failed
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* ── FAILED: show notes + reschedule ── */}
              {appointment.status === 'failed' && (
                <div className="space-y-3">
                  {appointment.failureNotes && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                      <AlertTriangle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-800">{appointment.failureNotes}</p>
                    </div>
                  )}
                  {appointment.rescheduleCount > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Rescheduled {appointment.rescheduleCount} time{appointment.rescheduleCount > 1 ? 's' : ''}
                    </p>
                  )}
                  <button
                    onClick={handleReschedule}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-amber-100 text-amber-800 text-sm font-semibold hover:bg-amber-200 transition-colors"
                  >
                    <RotateCcw size={14} /> Reschedule Inspection
                  </button>
                </div>
              )}

              {/* ── PASSED: success state ── */}
              {appointment.status === 'passed' && (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                  <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-800">Inspection passed!</p>
                    {appointment.passedAt && (
                      <p className="text-xs text-emerald-600">
                        {formatDate(appointment.passedAt.split('T')[0])}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ── PENDING or schedule form ── */}
              {(appointment.status === 'pending' || appointment.status === 'failed' || showScheduleForm) && appointment.status !== 'failed' && (
                <div className="space-y-3">
                  {/* Contact options */}
                  {(deptPhone || deptPortal) && !showScheduleForm && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2 font-medium">Schedule with your building department:</p>
                      <div className="flex gap-2 flex-wrap">
                        {deptPhone && (
                          <a
                            href={`tel:${deptPhone}`}
                            className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
                          >
                            <Phone size={13} /> {deptPhone}
                          </a>
                        )}
                        {deptPortal && (
                          <a
                            href={deptPortal}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2 bg-muted text-foreground rounded-lg text-xs font-semibold hover:bg-muted/80 transition-colors"
                          >
                            Schedule Online ↗
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* "Track in app" toggle */}
                  {!showScheduleForm && (
                    <button
                      onClick={() => setShowScheduleForm(true)}
                      className="w-full py-2 rounded-lg border border-dashed border-blue-300 text-blue-600 text-sm font-semibold hover:bg-blue-50 transition-colors"
                    >
                      + Track appointment date
                    </button>
                  )}

                  {/* Date picker form */}
                  <AnimatePresence>
                    {showScheduleForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 overflow-hidden"
                      >
                        <p className="text-xs font-semibold text-foreground">Track your appointment</p>

                        <div className="space-y-2">
                          <label className="text-xs text-muted-foreground">Date *</label>
                          <input
                            type="date"
                            min={todayISO()}
                            value={schedDate}
                            onChange={(e) => setSchedDate(e.target.value)}
                            className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs text-muted-foreground">Time window</label>
                          <div className="flex gap-2">
                            {(['morning', 'afternoon', 'anytime'] as InspectionWindow[]).map((w) => (
                              <button
                                key={w}
                                onClick={() => setSchedWindow(w)}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                                  schedWindow === w
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                              >
                                {w}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Confirmation # (optional)</label>
                          <input
                            type="text"
                            placeholder="e.g. 12345"
                            value={schedConfirmation}
                            onChange={(e) => setSchedConfirmation(e.target.value)}
                            className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={handleSchedule}
                            className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                          >
                            Save Appointment
                          </button>
                          <button
                            onClick={() => setShowScheduleForm(false)}
                            className="px-4 py-2 rounded-lg bg-muted text-muted-foreground text-sm hover:bg-muted/80 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
