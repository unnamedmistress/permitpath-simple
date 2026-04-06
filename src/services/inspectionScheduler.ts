/**
 * Inspection Scheduler Service — Week 10
 *
 * localStorage-backed CRUD for inspection appointments.
 * Seeds initial schedule from per-job-type phase templates.
 */

import type { JobType } from '@/types/permit';
import type {
  InspectionAppointment,
  InspectionSchedule,
  InspectionStats,
  InspectionStatus,
  InspectionWindow,
} from '@/types/inspection';

// ─── Storage key ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'permitpath:inspections';

// ─── Phase templates per job type ────────────────────────────────────────────
// name + timing only (detailed checkpoints live in InspectionCheckpoints.tsx)

type PhaseTemplate = { name: string; timing: string };

// Alias map: simplified-flow grid IDs to canonical JobType keys
const JOBTYPE_ALIAS: Record<string, string> = {
  ROOF_REPLACEMENT:  'RE_ROOFING',
  BATHROOM_REMODEL:  'SMALL_BATH_REMODEL',
  AC_HVAC:           'AC_HVAC_CHANGEOUT',
  WINDOW_DOOR:       'WINDOW_DOOR_REPLACEMENT',
  DECK_PATIO:        'DECK_INSTALLATION',
  FENCE:             'FENCE_INSTALLATION',
};

const PHASE_TEMPLATES: Record<JobType, PhaseTemplate[]> = {
  RE_ROOFING: [
    { name: 'Dry-In Inspection',  timing: 'Before covering deck with final roofing material' },
    { name: 'Final Inspection',   timing: 'After roof completion' },
  ],
  ROOF_REPAIR: [
    { name: 'Final Inspection',   timing: 'After repair completion' },
  ],
  AC_HVAC_CHANGEOUT: [
    { name: 'Final Inspection',   timing: 'After installation and startup' },
  ],
  WATER_HEATER: [
    { name: 'Final Inspection',   timing: 'After installation' },
  ],
  ELECTRICAL_PANEL: [
    { name: 'Rough Inspection',   timing: 'If walls are open, before covering' },
    { name: 'Final Inspection',   timing: 'Panel energized and complete' },
  ],
  ELECTRICAL_REWIRING: [
    { name: 'Rough Inspection',   timing: 'Before covering walls/ceilings' },
    { name: 'Final Inspection',   timing: 'All devices installed' },
  ],
  EV_CHARGER: [
    { name: 'Final Inspection',   timing: 'After installation' },
  ],
  GENERATOR_INSTALL: [
    { name: 'Electrical Rough',   timing: 'Before backfill' },
    { name: 'Gas Rough',          timing: 'Before backfill' },
    { name: 'Final Inspection',   timing: 'Generator set and operational' },
  ],
  PLUMBING_MAIN_LINE: [
    { name: 'Underground Rough',  timing: 'Before backfill' },
    { name: 'Final Inspection',   timing: 'After backfill and restoration' },
  ],
  SMALL_BATH_REMODEL: [
    { name: 'Plumbing Rough',     timing: 'Before covering walls' },
    { name: 'Electrical Rough',   timing: 'Before covering walls' },
    { name: 'Final Inspections',  timing: 'After all trades complete' },
  ],
  KITCHEN_REMODEL: [
    { name: 'Plumbing Rough',     timing: 'Before walls closed' },
    { name: 'Electrical Rough',   timing: 'Before walls closed' },
    { name: 'Final Inspections',  timing: 'All trades complete' },
  ],
  WINDOW_DOOR_REPLACEMENT: [
    { name: 'Final Inspection',   timing: 'After installation' },
  ],
  SIDING_EXTERIOR: [
    { name: 'Rough Inspection',   timing: 'After weather barrier, before siding' },
    { name: 'Final Inspection',   timing: 'Siding complete' },
  ],
  DECK_INSTALLATION: [
    { name: 'Footing Inspection', timing: 'Before pouring concrete' },
    { name: 'Framing Inspection', timing: 'Before decking' },
    { name: 'Final Inspection',   timing: 'Deck complete' },
  ],
  FENCE_INSTALLATION: [
    { name: 'Final Inspection',   timing: 'Fence complete' },
  ],
  POOL_BARRIER: [
    { name: 'Final Inspection',   timing: 'Barrier complete — CRITICAL SAFETY' },
  ],
  ROOM_ADDITION: [
    { name: 'Foundation Inspection', timing: 'Before pouring concrete' },
    { name: 'Framing Inspection',    timing: 'Before insulation' },
    { name: 'Rough Inspections',     timing: 'Each trade before drywall' },
    { name: 'Final Inspections',     timing: 'Each trade completion' },
  ],
  FOUNDATION_REPAIR: [
    { name: 'Pre-Repair Inspection', timing: 'After excavation' },
    { name: 'Progress Inspections',  timing: 'During critical phases' },
    { name: 'Final Inspection',      timing: 'Repair complete' },
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return `insp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function now(): string {
  return new Date().toISOString();
}

// ─── Storage read/write ───────────────────────────────────────────────────────

function readAll(): Record<string, InspectionSchedule> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, InspectionSchedule>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage quota exceeded — ignore
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Get or create the inspection schedule for a job.
 * First call seeds appointments from PHASE_TEMPLATES[jobType].
 */
export function getOrInitSchedule(jobId: string, jobType: JobType): InspectionSchedule {
  const all = readAll();
  if (all[jobId]) return all[jobId];

  const canonicalType = (JOBTYPE_ALIAS[jobType as string] ?? jobType) as JobType;
  const templates = PHASE_TEMPLATES[canonicalType] ?? [];
  const appointments: InspectionAppointment[] = templates.map((tpl, idx) => ({
    id: generateId(),
    jobId,
    phaseName: tpl.name,
    phaseIndex: idx,
    timing: tpl.timing,
    status: 'pending',
    rescheduleCount: 0,
    createdAt: now(),
    updatedAt: now(),
  }));

  const schedule: InspectionSchedule = {
    jobId,
    appointments,
    lastUpdated: now(),
  };

  all[jobId] = schedule;
  writeAll(all);
  return schedule;
}

/** Get an existing schedule (returns null if not yet initialized) */
export function getSchedule(jobId: string): InspectionSchedule | null {
  return readAll()[jobId] ?? null;
}

/** Mark an inspection as scheduled */
export function scheduleInspection(
  jobId: string,
  appointmentId: string,
  date: string,
  window?: InspectionWindow,
  confirmationNumber?: string
): InspectionSchedule | null {
  const all = readAll();
  const schedule = all[jobId];
  if (!schedule) return null;

  schedule.appointments = schedule.appointments.map((appt) => {
    if (appt.id !== appointmentId) return appt;
    return {
      ...appt,
      status: 'scheduled' as InspectionStatus,
      scheduledDate: date,
      scheduledWindow: window,
      confirmationNumber: confirmationNumber || appt.confirmationNumber,
      updatedAt: now(),
    };
  });
  schedule.lastUpdated = now();
  all[jobId] = schedule;
  writeAll(all);
  return schedule;
}

/** Mark an inspection as passed */
export function passInspection(
  jobId: string,
  appointmentId: string
): InspectionSchedule | null {
  const all = readAll();
  const schedule = all[jobId];
  if (!schedule) return null;

  schedule.appointments = schedule.appointments.map((appt) => {
    if (appt.id !== appointmentId) return appt;
    return {
      ...appt,
      status: 'passed' as InspectionStatus,
      passedAt: now(),
      updatedAt: now(),
    };
  });
  schedule.lastUpdated = now();
  all[jobId] = schedule;
  writeAll(all);
  return schedule;
}

/** Mark an inspection as failed with optional notes */
export function failInspection(
  jobId: string,
  appointmentId: string,
  notes?: string
): InspectionSchedule | null {
  const all = readAll();
  const schedule = all[jobId];
  if (!schedule) return null;

  schedule.appointments = schedule.appointments.map((appt) => {
    if (appt.id !== appointmentId) return appt;
    return {
      ...appt,
      status: 'failed' as InspectionStatus,
      failureNotes: notes,
      failedAt: now(),
      rescheduleCount: appt.rescheduleCount,
      // clear prior scheduled date so they pick a new one
      scheduledDate: undefined,
      scheduledWindow: undefined,
      updatedAt: now(),
    };
  });
  schedule.lastUpdated = now();
  all[jobId] = schedule;
  writeAll(all);
  return schedule;
}

/** Reschedule a failed inspection (resets to pending so user picks new date) */
export function rescheduleInspection(
  jobId: string,
  appointmentId: string
): InspectionSchedule | null {
  const all = readAll();
  const schedule = all[jobId];
  if (!schedule) return null;

  schedule.appointments = schedule.appointments.map((appt) => {
    if (appt.id !== appointmentId) return appt;
    return {
      ...appt,
      status: 'pending' as InspectionStatus,
      scheduledDate: undefined,
      scheduledWindow: undefined,
      confirmationNumber: undefined,
      failureNotes: undefined,
      rescheduleCount: appt.rescheduleCount + 1,
      updatedAt: now(),
    };
  });
  schedule.lastUpdated = now();
  all[jobId] = schedule;
  writeAll(all);
  return schedule;
}

/** Aggregate stats for progress display */
export function getInspectionStats(schedule: InspectionSchedule): InspectionStats {
  const counts = { total: 0, passed: 0, scheduled: 0, pending: 0, failed: 0 };
  for (const appt of schedule.appointments) {
    counts.total++;
    if (appt.status === 'passed') counts.passed++;
    else if (appt.status === 'scheduled') counts.scheduled++;
    else if (appt.status === 'failed') counts.failed++;
    else counts.pending++;
  }
  return counts;
}

/** Return today's ISO date string YYYY-MM-DD */
export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/** Format ISO date as readable, e.g. "Mon, Apr 7" */
export function formatDate(isoDate: string): string {
  const d = new Date(isoDate + 'T12:00:00'); // noon avoids TZ drift
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
