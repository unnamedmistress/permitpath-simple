// ─────────────────────────────────────────────────────────────────────────────
// Contractor Pro Accounts — service layer
// localStorage-backed, Supabase/Stripe-ready
// Week 7 | PermitPath 90-day sprint
// ─────────────────────────────────────────────────────────────────────────────

import type {
  ContractorProfile,
  ContractorSubscription,
  ContractorLead,
  ContractorStats,
  ContractorRole,
} from '@/types/contractor';

const KEYS = {
  PROFILE: 'permitpath:contractor:profile',
  SUBSCRIPTION: 'permitpath:contractor:subscription',
  LEADS: 'permitpath:contractor:leads',
} as const;

// ─── Stripe config ────────────────────────────────────────────────────────────
// Replace VITE_STRIPE_PRO_PRICE_ID in .env with your actual Stripe Price ID
// e.g. price_1234abcd...
export const STRIPE_PRO_PRICE_ID =
  import.meta.env.VITE_STRIPE_PRO_PRICE_ID ?? 'price_placeholder_pro_monthly';
export const PRO_MONTHLY_PRICE_CENTS = 2900; // $29/mo

// ─── Profile ──────────────────────────────────────────────────────────────────

export function getContractorProfile(): ContractorProfile | null {
  try {
    const raw = localStorage.getItem(KEYS.PROFILE);
    return raw ? (JSON.parse(raw) as ContractorProfile) : null;
  } catch {
    return null;
  }
}

export function saveContractorProfile(
  data: Omit<ContractorProfile, 'id' | 'createdAt' | 'updatedAt'>
): ContractorProfile {
  const existing = getContractorProfile();
  const now = new Date().toISOString();
  const profile: ContractorProfile = {
    ...data,
    id: existing?.id ?? crypto.randomUUID(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  return profile;
}

export function clearContractorProfile(): void {
  localStorage.removeItem(KEYS.PROFILE);
}

// ─── Subscription ─────────────────────────────────────────────────────────────

export function getSubscription(): ContractorSubscription | null {
  try {
    const raw = localStorage.getItem(KEYS.SUBSCRIPTION);
    return raw ? (JSON.parse(raw) as ContractorSubscription) : null;
  } catch {
    return null;
  }
}

export function isProSubscriber(): boolean {
  const sub = getSubscription();
  if (!sub) return false;
  return sub.status === 'active' || sub.status === 'trialing';
}

/** Called after Stripe webhook confirms payment — or in demo mode */
export function activateProSubscription(opts: {
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  trialDays?: number;
}): ContractorSubscription {
  const profile = getContractorProfile();
  const now = new Date();
  const trialEnd = opts.trialDays
    ? new Date(now.getTime() + opts.trialDays * 86400_000).toISOString()
    : undefined;
  const periodEnd = new Date(
    now.getTime() + 30 * 86400_000
  ).toISOString();

  const sub: ContractorSubscription = {
    contractorId: profile?.id ?? 'local',
    status: opts.trialDays ? 'trialing' : 'active',
    stripeCustomerId: opts.stripeCustomerId,
    stripeSubscriptionId: opts.stripeSubscriptionId,
    currentPeriodStart: now.toISOString(),
    currentPeriodEnd: periodEnd,
    trialEnd,
    cancelAtPeriodEnd: false,
    planId: 'pro_monthly',
    planPrice: 2900,
  };
  localStorage.setItem(KEYS.SUBSCRIPTION, JSON.stringify(sub));
  return sub;
}

export function cancelSubscription(): void {
  const sub = getSubscription();
  if (!sub) return;
  const updated: ContractorSubscription = {
    ...sub,
    status: 'canceled',
    cancelAtPeriodEnd: true,
  };
  localStorage.setItem(KEYS.SUBSCRIPTION, JSON.stringify(updated));
}

// ─── Leads ────────────────────────────────────────────────────────────────────

export function getLeads(): ContractorLead[] {
  try {
    const raw = localStorage.getItem(KEYS.LEADS);
    return raw ? (JSON.parse(raw) as ContractorLead[]) : seedDemoLeads();
  } catch {
    return [];
  }
}

export function markLeadViewed(leadId: string): void {
  const leads = getLeads();
  const updated = leads.map((l) =>
    l.id === leadId && l.status === 'new' ? { ...l, status: 'viewed' as const } : l
  );
  localStorage.setItem(KEYS.LEADS, JSON.stringify(updated));
}

export function updateLeadStatus(
  leadId: string,
  status: ContractorLead['status']
): void {
  const leads = getLeads();
  const updated = leads.map((l) => (l.id === leadId ? { ...l, status } : l));
  localStorage.setItem(KEYS.LEADS, JSON.stringify(updated));
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export function getContractorStats(): ContractorStats {
  const leads = getLeads();
  const total = leads.length;
  const newLeads = leads.filter((l) => l.status === 'new').length;
  const active = leads.filter((l) =>
    ['viewed', 'contacted'].includes(l.status)
  ).length;
  const won = leads.filter((l) => l.status === 'won').length;
  const conversionRate = total > 0 ? won / total : 0;
  const estimatedRevenue = leads
    .filter((l) => l.status === 'won')
    .reduce((sum, l) => sum + (l.estimatedValue ?? 0), 0);

  return { totalLeads: total, newLeads, activeJobs: active, wonJobs: won, conversionRate, estimatedRevenue };
}

// ─── Demo seed data ───────────────────────────────────────────────────────────

function seedDemoLeads(): ContractorLead[] {
  const JOB_TYPES: { type: string; label: string; value: number }[] = [
    { type: 'electrical_panel_upgrade', label: 'Electrical Panel Upgrade', value: 3500 },
    { type: 'bathroom_remodel', label: 'Bathroom Remodel', value: 8000 },
    { type: 'roof_replacement', label: 'Roof Replacement', value: 12000 },
    { type: 'hvac_replacement', label: 'HVAC Replacement', value: 6500 },
    { type: 'kitchen_remodel', label: 'Kitchen Remodel', value: 15000 },
    { type: 'water_heater', label: 'Water Heater Replacement', value: 1800 },
  ];

  const ADDRESSES = [
    '1204 Bayshore Blvd, St. Petersburg, FL 33701',
    '857 Gulf Blvd, Clearwater, FL 33767',
    '3310 Central Ave, St. Petersburg, FL 33713',
    '501 Drew St, Clearwater, FL 33755',
    '1880 Park St N, St. Petersburg, FL 33710',
  ];

  const STATUSES: ContractorLead['status'][] = [
    'new', 'new', 'viewed', 'contacted', 'won',
  ];

  const now = Date.now();
  const leads: ContractorLead[] = JOB_TYPES.slice(0, 5).map((jt, i) => ({
    id: crypto.randomUUID(),
    jobId: crypto.randomUUID(),
    address: ADDRESSES[i],
    jobType: jt.type,
    jobTypeLabel: jt.label,
    jurisdiction: 'PINELLAS_COUNTY',
    createdAt: new Date(now - i * 86400_000 * (i + 1)).toISOString(),
    status: STATUSES[i],
    estimatedValue: jt.value,
  }));

  localStorage.setItem(KEYS.LEADS, JSON.stringify(leads));
  return leads;
}

// ─── Stripe Checkout redirect ─────────────────────────────────────────────────
// In production this calls your Firebase Function or Supabase Edge Function
// which creates a Stripe Checkout Session and returns the URL.

export async function startStripeCheckout(email: string): Promise<void> {
  // TODO: replace with real Firebase Function call
  // const res = await fetch('/api/stripe/create-checkout', {
  //   method: 'POST',
  //   body: JSON.stringify({ email, priceId: STRIPE_PRO_PRICE_ID }),
  // });
  // const { url } = await res.json();
  // window.location.href = url;

  // Demo mode — activate immediately with 14-day trial
  console.log('[PermitPath] Demo Stripe checkout for:', email);
  activateProSubscription({ trialDays: 14 });
}

export function getContractorRoleFromJobType(jobType: string): ContractorRole {
  const map: Record<string, ContractorRole> = {
    electrical_panel_upgrade: 'electrical',
    ev_charger_installation: 'electrical',
    bathroom_remodel: 'plumbing',
    water_heater: 'plumbing',
    hvac_replacement: 'hvac',
    roof_replacement: 'roofing',
    kitchen_remodel: 'general_contractor',
    home_addition: 'general_contractor',
    window_door_replacement: 'general_contractor',
    flooring: 'flooring',
  };
  return map[jobType] ?? 'general_contractor';
}
