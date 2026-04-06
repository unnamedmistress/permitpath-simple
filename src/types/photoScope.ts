/**
 * Photo-to-Scope Types
 *
 * A user snaps or uploads a photo of their home/project.
 * The AI identifies the job type and generates a scope-of-work
 * paragraph, pre-populating the wizard without any manual selection.
 */

import type { JobType } from '@/components/new-ui/SimplifiedJobTypeGrid';

// ─── Job detection result ─────────────────────────────────────────────────────

export interface DetectedJobInfo {
  /** Matches a JobType.id from SimplifiedJobTypeGrid */
  jobTypeId: string;
  /** Human label (mirrors JobType.label) */
  jobTypeLabel: string;
  /** AI confidence 0-1 */
  confidence: number;
  /** Why the AI thinks this is the job type (1 sentence) */
  reasoning: string;
}

// ─── Full photo analysis result ───────────────────────────────────────────────

export interface PhotoScopeResult {
  /** Client-generated ID */
  id: string;
  /** Primary detected job */
  primary: DetectedJobInfo;
  /** Alternative possibilities (max 2) */
  alternatives: DetectedJobInfo[];
  /**
   * AI-generated scope-of-work paragraph suitable for the permit description
   * field. Plain English, 2-3 sentences.
   */
  scopeOfWork: string;
  /**
   * Short description for the job card (≤ 80 chars)
   */
  shortDescription: string;
  /** Anything notable the AI spotted (permit risk, unusual feature, etc.) */
  notes?: string;
  /** Was the AI unavailable — used rule-based fallback? */
  fallback: boolean;
  /** ISO timestamp */
  analyzedAt: string;
  /** Thumbnail data-URL for display (reduced size) */
  thumbnailUrl?: string;
  /** Original file metadata */
  file: {
    name: string;
    type: string;
    sizeKb: number;
  };
}

// ─── Request ──────────────────────────────────────────────────────────────────

export interface PhotoScopeRequest {
  file: File;
  /** Optional jurisdiction hint (changes permit-specific advice in scope) */
  jurisdiction?: string;
}
