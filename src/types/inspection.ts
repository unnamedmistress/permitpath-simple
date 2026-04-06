/**
 * Inspection Scheduling Types — Week 10
 *
 * Tracks each required inspection phase from "pending" through "passed",
 * letting homeowners schedule appointments and mark results.
 */

export type InspectionStatus =
  | 'pending'     // not yet scheduled
  | 'scheduled'   // appointment booked
  | 'passed'      // passed — all good
  | 'failed'      // failed — corrections needed, reschedule required
  | 'waived';     // inspector waived this phase

export type InspectionWindow = 'morning' | 'afternoon' | 'anytime';

/** One inspection appointment for a specific phase of a job */
export interface InspectionAppointment {
  id: string;
  jobId: string;
  /** Human-readable phase name, e.g. "Dry-In Inspection" */
  phaseName: string;
  /** 0-based order within the job type */
  phaseIndex: number;
  /** When to schedule, e.g. "Before covering deck with final roofing" */
  timing: string;
  status: InspectionStatus;
  /** ISO date YYYY-MM-DD */
  scheduledDate?: string;
  scheduledWindow?: InspectionWindow;
  confirmationNumber?: string;
  failureNotes?: string;
  rescheduleCount: number;
  passedAt?: string;   // ISO datetime
  failedAt?: string;   // ISO datetime
  createdAt: string;   // ISO datetime
  updatedAt: string;   // ISO datetime
}

/** Full schedule record for a job */
export interface InspectionSchedule {
  jobId: string;
  appointments: InspectionAppointment[];
  lastUpdated: string; // ISO datetime
}

/** Summary counts for the progress header */
export interface InspectionStats {
  total: number;
  passed: number;
  scheduled: number;
  pending: number;
  failed: number;
}
