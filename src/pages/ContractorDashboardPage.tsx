// ─────────────────────────────────────────────────────────────────────────────
// ContractorDashboardPage — Pro contractor home base
// Week 7 | PermitPath 90-day sprint
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  MapPin,
  Bell,
  TrendingUp,
  CheckCircle2,
  Clock,
  Phone,
  ChevronRight,
  Building2,
  DollarSign,
  Star,
  AlertCircle,
  User,
  Settings,
  ArrowLeft,
} from 'lucide-react';
import {
  getContractorProfile,
  getSubscription,
  isProSubscriber,
  getLeads,
  getContractorStats,
  updateLeadStatus,
  markLeadViewed,
} from '@/services/contractorService';
import type {
  ContractorProfile,
  ContractorSubscription,
  ContractorLead,
  ContractorStats,
} from '@/types/contractor';
import { CONTRACTOR_ROLE_LABELS } from '@/types/contractor';
import ContractorUpgradeModal from '@/components/contractor/ContractorUpgradeModal';
import ContractorOnboardingSheet from '@/components/contractor/ContractorOnboardingSheet';

// ─── Status config ─────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ContractorLead['status'],
  { label: string; color: string; dot: string }
> = {
  new: { label: 'New', color: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
  viewed: { label: 'Viewed', color: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  contacted: { label: 'Contacted', color: 'bg-purple-50 text-purple-700', dot: 'bg-purple-500' },
  won: { label: 'Won', color: 'bg-green-50 text-green-700', dot: 'bg-green-500' },
  lost: { label: 'Lost', color: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400' },
};

// ─── Stat card ──────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4 flex flex-col gap-2">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 leading-tight">
        {label}
        {sub && <span className="block text-gray-400">{sub}</span>}
      </div>
    </div>
  );
}

// ─── Lead card ──────────────────────────────────────────────────────────────

function LeadCard({
  lead,
  onStatusChange,
}: {
  lead: ContractorLead;
  onStatusChange: (id: string, s: ContractorLead['status']) => void;
}) {
  const cfg = STATUS_CONFIG[lead.status];
  const daysSince = Math.floor(
    (Date.now() - new Date(lead.createdAt).getTime()) / 86400_000
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="font-semibold text-gray-900 text-sm leading-tight">
              {lead.jobTypeLabel}
            </div>
            <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
              <MapPin className="h-3 w-3" />
              {lead.address}
            </div>
          </div>
          <span className={`flex-shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.color}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 mt-3">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {daysSince === 0 ? 'Today' : `${daysSince}d ago`}
          </span>
          {lead.estimatedValue && (
            <span className="flex items-center gap-1 font-medium text-green-600">
              <DollarSign className="h-3 w-3" />
              {lead.estimatedValue.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Action bar */}
      {lead.status !== 'won' && lead.status !== 'lost' && (
        <div className="border-t border-gray-50 grid grid-cols-3 divide-x divide-gray-50">
          {lead.status === 'new' && (
            <button
              onClick={() => onStatusChange(lead.id, 'viewed')}
              className="flex items-center justify-center gap-1.5 py-2.5 text-xs text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              View
            </button>
          )}
          <button
            onClick={() => onStatusChange(lead.id, 'contacted')}
            className="flex items-center justify-center gap-1.5 py-2.5 text-xs text-purple-600 hover:bg-purple-50 transition-colors col-span-1"
          >
            <Phone className="h-3.5 w-3.5" />
            Contacted
          </button>
          <button
            onClick={() => onStatusChange(lead.id, 'won')}
            className="flex items-center justify-center gap-1.5 py-2.5 text-xs text-green-600 hover:bg-green-50 transition-colors font-medium"
          >
            <Star className="h-3.5 w-3.5" />
            Won Job
          </button>
          <button
            onClick={() => onStatusChange(lead.id, 'lost')}
            className="flex items-center justify-center gap-1.5 py-2.5 text-xs text-gray-400 hover:bg-gray-50 transition-colors"
          >
            Lost
          </button>
        </div>
      )}
      {(lead.status === 'won' || lead.status === 'lost') && (
        <div className="border-t border-gray-50 px-4 py-2.5 text-center">
          <button
            onClick={() => onStatusChange(lead.id, 'new')}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Reset status
          </button>
        </div>
      )}
    </motion.div>
  );
}

// ─── Paywall screen ──────────────────────────────────────────────────────────

function PaywallScreen({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-violet-200">
        <Zap className="h-8 w-8 text-white fill-yellow-300" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Contractor Pro Dashboard
      </h2>
      <p className="text-sm text-gray-500 max-w-xs mb-6">
        Get permit leads delivered to you the moment homeowners start their application. $29/month, cancel anytime.
      </p>
      <button
        onClick={onUpgrade}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 hover:from-violet-700 hover:to-indigo-700 transition-all active:scale-95"
      >
        <Zap className="h-4 w-4 fill-yellow-300 text-yellow-300" />
        Unlock Pro — $29/mo
      </button>
      <p className="mt-3 text-xs text-gray-400">14-day free trial · No card required</p>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function ContractorDashboardPage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ContractorProfile | null>(null);
  const [subscription, setSubscription] = useState<ContractorSubscription | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [leads, setLeads] = useState<ContractorLead[]>([]);
  const [stats, setStats] = useState<ContractorStats | null>(null);
  const [activeFilter, setActiveFilter] = useState<ContractorLead['status'] | 'all'>('all');

  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const reload = useCallback(() => {
    const p = getContractorProfile();
    const sub = getSubscription();
    const pro = isProSubscriber();
    setProfile(p);
    setSubscription(sub);
    setIsPro(pro);
    if (pro) {
      setLeads(getLeads());
      setStats(getContractorStats());
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // Show onboarding if no profile yet and user is pro
  useEffect(() => {
    if (isPro && !profile) {
      setShowOnboarding(true);
    }
  }, [isPro, profile]);

  function handleStatusChange(id: string, status: ContractorLead['status']) {
    updateLeadStatus(id, status);
    if (status === 'viewed') markLeadViewed(id);
    setLeads(getLeads());
    setStats(getContractorStats());
  }

  function handleUpgradeSuccess() {
    setShowUpgrade(false);
    reload();
  }

  const filteredLeads =
    activeFilter === 'all'
      ? leads
      : leads.filter((l) => l.status === activeFilter);

  const FILTERS: { key: ContractorLead['status'] | 'all'; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'new', label: 'New' },
    { key: 'contacted', label: 'Contacted' },
    { key: 'won', label: 'Won' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full bg-white/20 p-2 hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-white" />
          </button>
          <div className="flex items-center gap-2">
            {isPro && (
              <button
                onClick={() => setShowOnboarding(true)}
                className="rounded-full bg-white/20 p-2 hover:bg-white/30 transition-colors"
              >
                <User className="h-4 w-4 text-white" />
              </button>
            )}
            <button
              onClick={() => navigate('/settings')}
              className="rounded-full bg-white/20 p-2 hover:bg-white/30 transition-colors"
            >
              <Settings className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white">
                {profile?.companyName ?? 'Contractor Dashboard'}
              </h1>
              {isPro && (
                <span className="rounded-full bg-yellow-400/20 border border-yellow-400/40 px-2 py-0.5 text-xs font-bold text-yellow-300">
                  PRO
                </span>
              )}
            </div>
            <p className="text-sm text-white/70">
              {profile
                ? CONTRACTOR_ROLE_LABELS[profile.role]
                : 'PermitPath for Contractors'}
            </p>
          </div>
        </div>

        {/* Trial banner */}
        {subscription?.status === 'trialing' && subscription.trialEnd && (
          <div className="mt-4 rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-300 flex-shrink-0" />
            <span className="text-xs text-white/90">
              Free trial ends{' '}
              {new Date(subscription.trialEnd).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
              . No card required yet.
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-4 pb-32">
        {!isPro ? (
          <PaywallScreen onUpgrade={() => setShowUpgrade(true)} />
        ) : (
          <>
            {/* Stats grid */}
            {stats && (
              <div className="grid grid-cols-2 gap-3 -mt-3 mb-5">
                <StatCard
                  icon={Bell}
                  label="Total Leads"
                  value={stats.totalLeads}
                  sub={`${stats.newLeads} new`}
                  color="bg-blue-50 text-blue-600"
                />
                <StatCard
                  icon={TrendingUp}
                  label="Active Jobs"
                  value={stats.activeJobs}
                  color="bg-purple-50 text-purple-600"
                />
                <StatCard
                  icon={CheckCircle2}
                  label="Won Jobs"
                  value={stats.wonJobs}
                  sub={`${Math.round(stats.conversionRate * 100)}% conversion`}
                  color="bg-green-50 text-green-600"
                />
                <StatCard
                  icon={DollarSign}
                  label="Est. Revenue"
                  value={`$${stats.estimatedRevenue.toLocaleString()}`}
                  sub="from won jobs"
                  color="bg-emerald-50 text-emerald-600"
                />
              </div>
            )}

            {/* Filter pills */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                    activeFilter === f.key
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-violet-200'
                  }`}
                >
                  {f.label}
                  {f.key !== 'all' && (
                    <span className="ml-1 opacity-70">
                      ({leads.filter((l) => l.status === f.key).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Leads list */}
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredLeads.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-2xl bg-white border border-gray-100 p-8 text-center"
                  >
                    <div className="text-gray-400 text-sm">No leads in this category yet</div>
                  </motion.div>
                ) : (
                  filteredLeads.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onStatusChange={handleStatusChange}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Upgrade nudge if on trial */}
            {subscription?.status === 'trialing' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 p-4 flex items-center gap-3"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-violet-900">Trial active</div>
                  <div className="text-xs text-violet-600 mt-0.5">
                    Add a card before trial ends to keep your leads coming.
                  </div>
                </div>
                <button
                  onClick={() => setShowUpgrade(true)}
                  className="flex-shrink-0 flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-bold text-white"
                >
                  Subscribe <ChevronRight className="h-3 w-3" />
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <ContractorUpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        onSuccess={handleUpgradeSuccess}
      />

      <ContractorOnboardingSheet
        open={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onSaved={() => {
          setShowOnboarding(false);
          reload();
        }}
        existingProfile={profile}
      />
    </div>
  );
}
