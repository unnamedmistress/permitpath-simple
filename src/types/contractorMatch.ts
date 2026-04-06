// ─────────────────────────────────────────────────────────────────────────────
// Contractor Matching — type definitions
// Week 9 | PermitPath 90-day sprint
// ─────────────────────────────────────────────────────────────────────────────

import type { Jurisdiction } from '@/types/permit';
import type { ContractorRole } from '@/types/contractor';

export interface MatchedContractor {
  id: string;
  companyName: string;
  contactName: string;
  role: ContractorRole;
  roleLabel: string;
  phone: string;
  email: string;
  licenseNumber?: string;
  licenseVerified: boolean;
  insuranceVerified: boolean;
  serviceAreas: string[];
  rating: number;          // 1–5
  reviewCount: number;
  jobsCompleted: number;
  responseTimeHours: number;
  isPro: boolean;          // PermitPath Pro subscriber
  profilePhoto?: string;   // initials fallback if absent
  specialties: string[];   // e.g. ['hurricane straps', 'impact windows']
  yearsExperience: number;
  availableNow: boolean;
  estimatedStartDays: number; // how many days until they can start
}

export interface ContractorMatchRequest {
  jobType: string;
  jurisdiction: Jurisdiction;
  estimatedValue?: number;
}

export interface ContractorMatchResult {
  matches: MatchedContractor[];
  totalFound: number;
  jobType: string;
  jurisdiction: Jurisdiction;
  generatedAt: string;
}

export type ContactMethod = 'call' | 'email' | 'request';

export interface ContactEvent {
  contractorId: string;
  method: ContactMethod;
  jobId?: string;
  timestamp: string;
}
