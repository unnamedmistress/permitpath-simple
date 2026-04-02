import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft, ArrowRight, DollarSign, Clock, FileText, ExternalLink,
  CheckCircle2, AlertCircle, ChevronRight, Upload, HelpCircle,
  Phone, ClipboardList, Info, TriangleAlert, MapPin, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/button';
import { useJob } from '@/hooks/useJobs';
import { useDocumentUpload } from '@/services/storage';
import type { Requirement } from '@/types/permit';
import { calculateProgress } from '@/services/requirements';

// ─── Jurisdiction helpers ──────────────────────────────────────────────────
// All data verified from https://pinellas.gov/building-departments-in-pinellas-county/
// Portal URLs verified March 2026. Pinellas County BDRS portal: aca-prod.accela.com/pinellas
interface JurisdictionInfo {
  label: string;
  phone: string;
  portalUrl: string;
  portalLabel: string;
  address: string;
  hours: string;
  /** Phase 3: local rules specific to this jurisdiction. Each string is one bullet. */
  localRules?: string[];
  /** Phase 3: express permits available (flat fee, no plan review) */
  expressPermitsAvailable?: boolean;
}

const JURISDICTION_INFO: Record<string, JurisdictionInfo> = {
  PINELLAS_COUNTY: {
    label: 'Unincorporated Pinellas County',
    phone: '(727) 464-3888',
    portalUrl: 'https://aca-prod.accela.com/pinellas/Default.aspx',
    portalLabel: 'Pinellas County Access Portal',
    address: '440 Court Street, Clearwater, FL 33756',
    hours: 'Mon–Fri, 8am–4pm',
    expressPermitsAvailable: true,
    localRules: [
      'Express permits (roof, HVAC, water heater, windows) are issued same-day at the counter — no plan review required.',
      'Work over $500 requires a permit per Pinellas County Code General Permit Requirements.',
      'Permit fees are valuation-based starting at $100 for work up to $1,000.',
    ],
  },
  ST_PETERSBURG: {
    label: 'St. Petersburg',
    phone: '(727) 893-7231',
    portalUrl: 'https://www.stpete.org/business/building_permitting/building_permits.php',
    portalLabel: 'St. Pete Building Permits',
    address: 'One 4th Street N, St. Petersburg, FL 33701',
    hours: 'Mon–Fri, 8am–4pm',
    expressPermitsAvailable: true,
    localRules: [
      'Wednesday hours are shortened: 8am–12pm only — plan your visit accordingly.',
      'ePlan Help Desk available at (727) 893-7230 for online submission questions.',
      'Last customer taken 30 minutes before closing.',
    ],
  },
  CLEARWATER: {
    label: 'Clearwater',
    phone: '(727) 562-4567',
    portalUrl: 'https://aca-prod.accela.com/CLEARWATER/Default.aspx',
    portalLabel: 'Clearwater Permit Portal',
    address: '2741 State Road 580, Clearwater, FL 33761',
    hours: 'Mon–Fri, 8am–4:30pm (Wed closes 2:30pm)',
    expressPermitsAvailable: true,
    localRules: [
      'Wednesday closes at 2:30pm — earlier than most Pinellas cities.',
      'Online submissions via Clearwater Permit Portal are encouraged to avoid counter wait times.',
    ],
  },
  LARGO: {
    label: 'Largo',
    phone: '(727) 586-7488',
    portalUrl: 'https://www.largo.com/building_services/index.php',
    portalLabel: 'Largo Building Services',
    address: '201 Highland Ave, Largo, FL 33770',
    hours: 'Mon–Fri, 8am–4pm (Wed closes 3pm)',
    expressPermitsAvailable: true,
    localRules: [
      'Wednesday closes at 3pm — plan morning visits for mid-week submissions.',
    ],
  },
  DUNEDIN: {
    label: 'Dunedin',
    phone: '(727) 298-3210',
    portalUrl: 'https://www.dunedin.gov/City-Services/Business-Development/Building-Codes-Permits-Construction',
    portalLabel: 'Dunedin Building & Permits',
    address: '737 Louden Avenue, Dunedin, FL 34698',
    hours: 'Mon–Fri, 8am–4:30pm',
    expressPermitsAvailable: true,
  },
  TARPON_SPRINGS: {
    label: 'Tarpon Springs',
    phone: '(727) 942-5617',
    portalUrl: 'https://www.ctsfl.us/309/GoPost-Online-Permit-Application-Portal',
    portalLabel: 'Tarpon Springs GoPost Portal',
    address: '324 East Pine Street, Tarpon Springs, FL 34689',
    hours: 'Mon–Fri, 8am–4:30pm (Wed closes noon)',
    localRules: [
      'Wednesday closes at noon — avoid Wednesday for in-person submissions.',
      'Tarpon Springs uses the GoPost portal (not Accela) — bookmark the correct link.',
    ],
  },
  SEMINOLE: {
    label: 'Seminole',
    phone: '(727) 392-1966',
    portalUrl: 'https://myseminole.com/website/building.html',
    portalLabel: 'Seminole Building Dept',
    address: '9199 113th Street, Seminole, FL 33772',
    hours: 'Mon–Fri, 8am–3:30pm',
    localRules: [
      'Counter closes at 3:30pm daily — one of the earlier closing times in the county.',
    ],
  },
  PINELLAS_PARK: {
    label: 'Pinellas Park',
    phone: '(727) 369-5647',
    portalUrl: 'https://www.pinellas-park.com/1981/Applying-for-a-Permit',
    portalLabel: 'Pinellas Park Permits',
    address: '6051 78th Avenue N, Pinellas Park, FL 33781',
    hours: 'Mon–Fri, 8am–4:30pm',
    expressPermitsAvailable: true,
  },
  GULFPORT: {
    label: 'Gulfport',
    phone: '(727) 893-1024',
    portalUrl: 'https://mygulfport.us/community-development/',
    portalLabel: 'Gulfport Community Development',
    address: '5330 23rd Ave S, Gulfport, FL 33707',
    hours: 'Mon–Fri, 8am–4:30pm (Thu closes 3:30pm)',
    localRules: [
      'Thursday closes at 3:30pm — the unusual day off from standard hours.',
    ],
  },
  ST_PETE_BEACH: {
    label: 'St. Pete Beach',
    phone: '(727) 367-2735',
    portalUrl: 'https://www.stpetebeach.org/200/Building-Permitting',
    portalLabel: 'St. Pete Beach Building',
    address: '155 Corey Hall, St. Pete Beach, FL 33706',
    hours: 'Mon–Fri, 8am–4:30pm',
    localRules: [
      'Coastal/beach properties may require additional FEMA flood zone compliance documentation.',
      'Confirm flood zone designation at msc.fema.gov before submitting structural permit applications.',
    ],
  },
  TREASURE_ISLAND: {
    label: 'Treasure Island',
    phone: '(727) 547-4575',
    portalUrl: 'https://mytreasureisland.org/building_department/index.php',
    portalLabel: 'Treasure Island Building Dept',
    address: '10451 Gulf Blvd, Treasure Island, FL 33706',
    hours: 'Mon–Fri, 9am–4pm',
    localRules: [
      'Counter opens at 9am (later than most Pinellas offices) — plan accordingly.',
      'Coastal/barrier island properties require FEMA flood zone compliance documentation.',
    ],
  },
  MADEIRA_BEACH: {
    label: 'Madeira Beach',
    phone: '(727) 391-9951',
    portalUrl: 'https://madeirabeachfl.gov/building-department/',
    portalLabel: 'Madeira Beach Building Dept',
    address: '300 Municipal Drive, Madeira Beach, FL 33708',
    hours: 'Mon–Fri, 8:30am–4:30pm',
    localRules: [
      'Counter opens at 8:30am (30 min later than most Pinellas offices).',
      'Barrier island location: flood zone documentation typically required for structural work.',
    ],
  },
  INDIAN_SHORES: {
    label: 'Indian Shores',
    phone: '(727) 474-7786',
    portalUrl: 'https://myindianshores.com/2229/Building-Department',
    portalLabel: 'Indian Shores Building Dept',
    address: '19305 Gulf Blvd, Indian Shores, FL 33785',
    hours: 'Mon–Fri, 8am–4pm',
    localRules: [
      'Barrier island jurisdiction — coastal construction setback lines (CCSL) apply for exterior work near the beach.',
    ],
  },
  SOUTH_PASADENA: {
    label: 'South Pasadena',
    phone: '(727) 343-4192',
    portalUrl: 'https://mysouthpasadena.com/government/departments/community_improvement',
    portalLabel: 'South Pasadena Community Improvement',
    address: '6940 Hibiscus Avenue, South Pasadena, FL 33707',
    hours: 'Mon–Fri, 7:30am–12:30pm (public)',
  },
  BELLEAIR: {
    label: 'Belleair',
    phone: '(727) 588-1477',
    portalUrl: 'https://townofbelleair.com/401/Building',
    portalLabel: 'Belleair Building Dept',
    address: '901 Ponce de Leon Blvd, Belleair, FL 33756',
    hours: 'Mon–Fri, 8:30am–4:30pm',
    localRules: [
      'Counter opens at 8:30am — 30 minutes later than the county standard.',
    ],
  },
  PALM_HARBOR: {
    label: 'Palm Harbor (Unincorporated)',
    phone: '(727) 464-3888',
    portalUrl: 'https://aca-prod.accela.com/pinellas/Default.aspx',
    portalLabel: 'Pinellas County Access Portal',
    address: '440 Court Street, Clearwater, FL 33756',
    hours: 'Mon–Fri, 8am–4pm',
    expressPermitsAvailable: true,
    localRules: [
      'Palm Harbor is unincorporated — permits go through Pinellas County, not a city building dept.',
      'Express permits (roof, HVAC, water heater, windows) are issued same-day at the county counter.',
    ],
  },
};

function getJurisdictionInfo(jurisdiction: string) {
  return JURISDICTION_INFO[jurisdiction] || JURISDICTION_INFO.PINELLAS_COUNTY;
}

// ─── Category config ───────────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  document: { label: 'Document', color: 'text-blueprint', bg: 'bg-blueprint-50', icon: FileText },
  drawing: { label: 'Drawing', color: 'text-purple-600', bg: 'bg-purple-50', icon: ClipboardList },
  inspection: { label: 'Inspection', color: 'text-orange-600', bg: 'bg-orange-50', icon: CheckCircle2 },
  fee: { label: 'Fee', color: 'text-green-600', bg: 'bg-green-50', icon: DollarSign },
  license: { label: 'License', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: AlertCircle },
  insurance: { label: 'Insurance', color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle },
};

// ─── Requirement Card ──────────────────────────────────────────────────────
function RequirementCard({
  req,
  index,
  onUpload,
  onAction,
}: {
  req: Requirement;
  index: number;
  onUpload: (id: string) => void;
  onAction: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isCompleted = req.status === 'completed';
  const isInspection = req.category === 'inspection';
  const cfg = CATEGORY_CONFIG[req.category] || CATEGORY_CONFIG.document;
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`rounded-xl border transition-shadow ${
        isCompleted ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200 shadow-sm'
      }`}
    >
      <div className="p-4">
        {/* Header row */}
        <div className="flex gap-3">
          <div className={`w-10 h-10 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
            <Icon size={18} className={cfg.color} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className={`font-semibold text-sm leading-tight ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                {req.title}
              </h3>
              {isCompleted && (
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 size={12} className="text-white" />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{req.description}</p>
          </div>
        </div>

        {/* Why needed — always visible, blue info style */}
        {req.plainLanguageWhy && (
          <div className={`mt-3 flex gap-2 rounded-lg p-2.5 ${
            isCompleted
              ? 'bg-gray-50 border border-gray-100'
              : 'bg-blueprint-50 border border-blueprint-100'
          }`}>
            <Info size={14} className={`flex-shrink-0 mt-0.5 ${isCompleted ? 'text-gray-400' : 'text-blueprint'}`} />
            <p className={`text-xs leading-relaxed ${isCompleted ? 'text-gray-400' : 'text-blueprint-700'}`}>
              {req.plainLanguageWhy}
            </p>
          </div>
        )}

        {/* Action row */}
        {!isCompleted && (
          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {req.isRequired && (
                <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                  Required
                </span>
              )}
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.color} ${cfg.bg}`}>
                {cfg.label}
              </span>
            </div>

            <div className="flex gap-2">
              {/* Expand details */}
              <button
                onClick={() => setExpanded(v => !v)}
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-0.5"
              >
                <HelpCircle size={13} />
                <span>{expanded ? 'Less' : 'Details'}</span>
              </button>

              {/* Primary action */}
              {isInspection ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAction(req.id)}
                  className="gap-1 text-xs"
                >
                  Schedule
                  <ChevronRight size={12} />
                </Button>
              ) : req.sourceUrl ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(req.sourceUrl, '_blank')}
                  className="gap-1 text-xs"
                >
                  Get Form
                  <ExternalLink size={12} />
                </Button>
              ) : null}

              <Button
                size="sm"
                onClick={() => onUpload(req.id)}
                className="gap-1 text-xs"
              >
                <Upload size={12} />
                Upload
              </Button>
            </div>
          </div>
        )}

        {/* Expanded details */}
        <AnimatePresence>
          {expanded && !isCompleted && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-gray-100 space-y-1.5"
            >
              {req.minimumCriteria && (
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Must include:</span> {req.minimumCriteria}
                </p>
              )}
              {req.whoCanHelp && (
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Who can help:</span> {req.whoCanHelp}
                </p>
              )}
              {req.acceptedFormats && req.acceptedFormats.length > 0 && req.acceptedFormats[0] !== 'N/A' && (
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Accepted formats:</span> {req.acceptedFormats.join(', ')}
                </p>
              )}
              {req.goodUploadExample && (
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Good example:</span> {req.goodUploadExample}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Completed bottom bar */}
      {isCompleted && <div className="h-1 bg-green-500 rounded-b-xl" />}
    </motion.div>
  );
}

// ─── Summary stat card ─────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm flex items-center gap-2.5">
      <div className={`w-9 h-9 rounded-lg ${color} bg-opacity-10 flex items-center justify-center flex-shrink-0`}>
        <Icon size={16} className={color.replace('bg-', 'text-')} />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-semibold text-gray-900 text-sm leading-tight">{value}</p>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────
export default function WizardPageSimple() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { job, loading, refresh } = useJob(jobId || '');
  const { upload } = useDocumentUpload();
  const [activeTab, setActiveTab] = useState<'checklist' | 'info'>('checklist');

  const progress = job ? calculateProgress(job.requirements) : 0;
  const completedCount = job?.requirements.filter(r => r.status === 'completed').length || 0;
  const totalCount = job?.requirements.length || 0;
  const requiredCount = job?.requirements.filter(r => r.isRequired).length || 0;
  const requiredCompleted = job?.requirements.filter(r => r.isRequired && r.status === 'completed').length || 0;

  const handleUpload = useCallback(async (requirementId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !jobId) return;
      try {
        const result = await upload(jobId, file, requirementId);
        if (result.success) {
          toast.success('Document uploaded');
          refresh();
        } else {
          toast.error(result.error || 'Upload failed');
        }
      } catch {
        toast.error('Upload failed');
      }
    };
    input.click();
  }, [jobId, upload, refresh]);

  const handleAction = useCallback((requirementId: string) => {
    const req = job?.requirements.find(r => r.id === requirementId);
    if (req?.sourceUrl) {
      window.open(req.sourceUrl, '_blank');
    } else {
      toast.info('Contact the permit desk to schedule this inspection.');
    }
  }, [job]);

  if (loading) {
    return (
      <PageWrapper className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blueprint-200 border-t-blueprint rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Building your checklist...</p>
        </div>
      </PageWrapper>
    );
  }

  if (!job) {
    return (
      <PageWrapper className="pt-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText size={32} className="text-gray-400" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Checklist not found</h1>
        <p className="text-gray-500 mb-6">This checklist may have expired or been deleted.</p>
        <Button onClick={() => navigate('/')}>Start a New Checklist</Button>
      </PageWrapper>
    );
  }

  const jurisdictionInfo = getJurisdictionInfo(job.jurisdiction);
  const jobLabel = job.jobType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <PageWrapper className="pb-40">
      {/* Sticky header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b border-gray-100 -mx-4 px-4 py-3 mb-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="text-center">
            <h1 className="font-semibold text-gray-900 text-sm">{jobLabel} Permit</h1>
            <p className="text-xs text-gray-500">{completedCount} of {totalCount} items done</p>
          </div>
          <div className="w-9" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Progress bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-600">Your progress</span>
            <span className="text-xs font-semibold text-blueprint">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blueprint to-blueprint-700 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          {progress === 100 && (
            <motion.p
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-xs font-semibold text-green-600 mt-2 flex items-center justify-center gap-1"
            >
              <CheckCircle2 size={14} />
              All items complete — ready to submit!
            </motion.p>
          )}
        </div>

        {/* ── PERMIT DECISION BANNER — most important thing on the page ── */}
        {job.permitNotRequired ? (
          <div className="mb-5 rounded-2xl bg-green-500 p-5 text-white text-center shadow-md">
            <div className="text-4xl mb-1">✅</div>
            <h2 className="text-xl font-extrabold tracking-tight">No Permit Needed!</h2>
            <p className="text-sm text-green-100 mt-1 leading-relaxed">
              Based on your answers, this job does not require a permit in Pinellas County.
              You can start work right away.
            </p>
            <p className="text-xs text-green-200 mt-2">
              Not sure? Call <a href="tel:7274643888" className="underline font-semibold">(727) 464-3888</a> to confirm.
            </p>
          </div>
        ) : (
          <div className="mb-5 rounded-2xl bg-blueprint p-5 text-white text-center shadow-md">
            <div className="text-4xl mb-1">📋</div>
            <h2 className="text-xl font-extrabold tracking-tight">Yes — A Permit Is Required</h2>
            <p className="text-sm text-blueprint-100 mt-1 leading-relaxed">
              Here is your checklist. Complete each item below before submitting your permit.
            </p>
          </div>
        )}

        {/* Stats grid — 2×2 */}
        {!job.permitNotRequired && (
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          <StatCard label="Permit Fee" value={job.estimatedCost || 'Varies'} icon={DollarSign} color="bg-green-500" />
          <StatCard label="Timeline" value={(job.estimatedTimeline || '5-10 days').replace(' business', '')} icon={Clock} color="bg-blueprint-500" />
          <StatCard label="Required Items" value={`${requiredCompleted}/${requiredCount}`} icon={FileText} color="bg-purple-500" />
          <StatCard label="Skip Risk" value="Up to $10K fine" icon={TriangleAlert} color="bg-amber-500" />
        </div>
        )}

        {/* County portal CTA — only show when permit IS required */}
        {!job.permitNotRequired && (
        <div className="mb-5 rounded-xl border border-blueprint-200 bg-blueprint-50 p-4">
          {/* Top row: icon + title + button */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blueprint flex items-center justify-center flex-shrink-0">
              <ExternalLink size={16} className="text-white" />
            </div>
            <p className="text-sm font-semibold text-blueprint-900 flex-1 min-w-0">Submit Permit Online</p>
            <Button
              size="sm"
              className="bg-blueprint hover:bg-blueprint-700 text-white flex-shrink-0"
              onClick={() => window.open(jurisdictionInfo.portalUrl, '_blank')}
            >
              Open Portal
              <ExternalLink size={12} className="ml-1.5" />
            </Button>
          </div>
          {/* Contact info indented under icon */}
          <div className="ml-12 space-y-0.5">
            <p className="text-xs text-blueprint-700">
              {jurisdictionInfo.label} — {jurisdictionInfo.phone}
            </p>
            <p className="text-xs text-blueprint-600">{jurisdictionInfo.address}</p>
            <p className="text-xs text-blueprint-500">{jurisdictionInfo.hours}</p>
          </div>
        </div>
        )}

        {/* Tabs — only show when permit IS required */}
        {!job.permitNotRequired && (
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'checklist'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Checklist ({totalCount})
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'info'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Job Info
          </button>
        </div>
        )}

        {/* ── Phase 3: Local Rules Apply card ─────────────────────────── */}
        {!job.permitNotRequired && (jurisdictionInfo.localRules?.length || jurisdictionInfo.expressPermitsAvailable) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 rounded-xl border border-blueprint-200 bg-blueprint-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-blueprint-100">
              <div className="w-7 h-7 rounded-lg bg-blueprint flex items-center justify-center flex-shrink-0">
                <MapPin size={14} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-blueprint-900">Local Rules Apply</p>
                <p className="text-xs text-blueprint-600">{jurisdictionInfo.label}</p>
              </div>
              {jurisdictionInfo.expressPermitsAvailable && (
                <span className="inline-flex items-center gap-1 text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200">
                  <Zap size={10} />
                  Express permits
                </span>
              )}
            </div>

            {/* Rules list */}
            {jurisdictionInfo.localRules && jurisdictionInfo.localRules.length > 0 && (
              <ul className="px-4 py-3 space-y-2">
                {jurisdictionInfo.localRules.map((rule, i) => (
                  <li key={i} className="flex gap-2 text-xs text-blueprint-800 leading-relaxed">
                    <span className="text-blueprint mt-0.5 flex-shrink-0">•</span>
                    {rule}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}

        {/* Checklist tab — only when permit required */}
        {!job.permitNotRequired && activeTab === 'checklist' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900">What You Need</h2>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {requiredCompleted}/{requiredCount} required done
              </span>
            </div>

            {job.requirements.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <FileText size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No requirements found</p>
                <p className="text-sm text-gray-400 mt-1">Try starting a new checklist</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/')}>
                  Start Over
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {job.requirements.map((req, index) => (
                    <RequirementCard
                      key={req.id}
                      req={req}
                      index={index}
                      onUpload={handleUpload}
                      onAction={handleAction}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* Info tab — only when permit required */}
        {!job.permitNotRequired && activeTab === 'info' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 text-sm">Job Details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Job Type</p>
                  <p className="font-medium text-gray-900">{jobLabel}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Jurisdiction</p>
                  <p className="font-medium text-gray-900">{jurisdictionInfo.label}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Property Address</p>
                  <p className="font-medium text-gray-900">{job.address}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Est. Permit Fee</p>
                  <p className="font-medium text-gray-900">{job.estimatedCost || 'Varies'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Est. Timeline</p>
                  <p className="font-medium text-gray-900">{job.estimatedTimeline || '5-10 days'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 text-sm">Permit Office</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start justify-between">
                  <span className="text-gray-600">Address</span>
                  <span className="font-medium text-gray-900 text-right text-xs max-w-[60%]">{jurisdictionInfo.address}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Hours</span>
                  <span className="font-medium text-gray-900 text-xs">{jurisdictionInfo.hours}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Phone</span>
                  <a href={`tel:${jurisdictionInfo.phone}`} className="font-medium text-blueprint">
                    {jurisdictionInfo.phone}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Online Portal</span>
                  <button
                    onClick={() => window.open(jurisdictionInfo.portalUrl, '_blank')}
                    className="font-medium text-blueprint flex items-center gap-1"
                  >
                    {jurisdictionInfo.portalLabel}
                    <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
              <div className="flex gap-2">
                <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">Estimated Fees Are Approximate</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Permit fees are calculated by the county based on job valuation. The amounts shown are broad estimates only. Contact the permit office for exact fees before submitting.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom spacer — ensures last checklist card clears the fixed bar (bottom-14 = 56px + bar ~69px = 125px from viewport bottom) */}
      <div style={{ height: 100 }} aria-hidden="true" />

      {/* Fixed bottom bar */}
      <div className="fixed bottom-14 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-20">
        <div className="max-w-2xl mx-auto flex gap-2.5">
          {job.permitNotRequired ? (
            <>
              <Button
                variant="outline"
                className="flex-1 gap-1.5"
                onClick={() => window.open('tel:7274643888')}
              >
                <Phone size={15} />
                Call to Confirm
              </Button>
              <Button
                className="flex-1 gap-1.5 bg-green-600 hover:bg-green-700"
                onClick={() => navigate('/')}
              >
                Start New Job
                <ArrowRight size={15} />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="flex-1 gap-1.5"
                onClick={() => window.open(`tel:${jurisdictionInfo.phone}`)}
              >
                <Phone size={15} />
                Call Office
              </Button>
              <Button
                className="flex-1 gap-1.5 bg-blueprint hover:bg-blueprint-700"
                onClick={() => window.open(jurisdictionInfo.portalUrl, '_blank')}
              >
                Submit Permit
                <ExternalLink size={15} />
              </Button>
            </>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
