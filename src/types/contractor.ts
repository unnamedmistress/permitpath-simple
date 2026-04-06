// ─────────────────────────────────────────────────────────────────────────────
// Contractor Pro Accounts — type definitions
// Week 7 | PermitPath 90-day sprint
// ─────────────────────────────────────────────────────────────────────────────

export type ContractorRole =
  | 'general_contractor'
  | 'electrical'
  | 'plumbing'
  | 'hvac'
  | 'roofing'
  | 'framing'
  | 'flooring'
  | 'other';

export const CONTRACTOR_ROLE_LABELS: Record<ContractorRole, string> = {
  general_contractor: 'General Contractor',
  electrical: 'Electrician',
  plumbing: 'Plumber',
  hvac: 'HVAC Technician',
  roofing: 'Roofer',
  framing: 'Framing Contractor',
  flooring: 'Flooring Specialist',
  other: 'Other Trade',
};

export type SubscriptionStatus =
  | 'none'        // Never subscribed
  | 'trialing'    // In free trial (14 days)
  | 'active'      // Paid and current
  | 'past_due'    // Payment failed, grace period
  | 'canceled'    // Canceled but may have access until period end
  | 'expired';    // No longer has access

export interface ContractorProfile {
  id: string;
  userId: string;           // Firebase/Supabase user ID
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  role: ContractorRole;
  licenseNumber?: string;
  licenseExpiry?: string;   // ISO date
  insuranceCarrier?: string;
  coverageAmount?: number;
  serviceAreas: string[];   // e.g. ['Pinellas County', 'Hillsborough County']
  createdAt: string;        // ISO
  updatedAt: string;        // ISO
}

export interface ContractorSubscription {
  contractorId: string;
  status: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart?: string;  // ISO
  currentPeriodEnd?: string;    // ISO
  trialEnd?: string;            // ISO
  cancelAtPeriodEnd: boolean;
  planId: 'pro_monthly';
  planPrice: 2900;              // cents — $29/mo
}

export interface ContractorLead {
  id: string;
  jobId: string;
  homeownerId?: string;
  address: string;
  jobType: string;
  jobTypeLabel: string;
  jurisdiction: string;
  createdAt: string;
  status: 'new' | 'viewed' | 'contacted' | 'won' | 'lost';
  estimatedValue?: number;  // dollars
}

export interface ContractorStats {
  totalLeads: number;
  newLeads: number;
  activeJobs: number;
  wonJobs: number;
  conversionRate: number;   // 0–1
  estimatedRevenue: number; // dollars
}
