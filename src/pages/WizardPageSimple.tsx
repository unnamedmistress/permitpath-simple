import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft, DollarSign, Clock, FileText, ExternalLink,
  CheckCircle2, AlertCircle, ChevronRight, Upload, HelpCircle,
  Phone, ClipboardList, Info
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
const JURISDICTION_INFO: Record<string, { label: string; phone: string; portalUrl: string; portalLabel: string; address: string; hours: string }> = {
  PINELLAS_COUNTY: {
    label: 'Unincorporated Pinellas County',
    phone: '(727) 464-3888',
    portalUrl: 'https://aca-prod.accela.com/pinellas/Default.aspx',
    portalLabel: 'Pinellas County Access Portal',
    address: '440 Court Street, Clearwater, FL 33756',
    hours: 'Mon–Fri, 8am–4pm',
  },
  ST_PETERSBURG: {
    label: 'St. Petersburg',
    phone: '(727) 893-7231',
    portalUrl: 'https://www.stpete.org/business/building_permitting/building_permits.php',
    portalLabel: 'St. Pete Building Permits',
    address: 'One 4th Street N, St. Petersburg, FL 33701',
    hours: 'Mon–Fri, 8am–4pm',
  },
  CLEARWATER: {
    label: 'Clearwater',
    phone: '(727) 562-4567',
    portalUrl: 'https://aca-prod.accela.com/CLEARWATER/Default.aspx',
    portalLabel: 'Clearwater Permit Portal',
    address: '2741 State Road 580, Clearwater, FL 33761',
    hours: 'Mon–Fri, 8am–4:30pm (Wed closes 2:30pm)',
  },
  LARGO: {
    label: 'Largo',
    phone: '(727) 586-7488',
    portalUrl: 'https://www.largo.com/building_services/index.php',
    portalLabel: 'Largo Building Services',
    address: '201 Highland Ave, Largo, FL 33770',
    hours: 'Mon–Fri, 8am–4pm (Wed closes 3pm)',
  },
  DUNEDIN: {
    label: 'Dunedin',
    phone: '(727) 298-3210',
    portalUrl: 'https://www.dunedin.gov/City-Services/Business-Development/Building-Codes-Permits-Construction',
    portalLabel: 'Dunedin Building & Permits',
    address: '737 Louden Avenue, Dunedin, FL 34698',
    hours: 'Mon–Fri, 8am–4:30pm',
  },
  TARPON_SPRINGS: {
    label: 'Tarpon Springs',
    phone: '(727) 942-5617',
    portalUrl: 'https://www.ctsfl.us/309/GoPost-Online-Permit-Application-Portal',
    portalLabel: 'Tarpon Springs GoPost Portal',
    address: '324 East Pine Street, Tarpon Springs, FL 34689',
    hours: 'Mon–Fri, 8am–4:30pm (Wed closes noon)',
  },
  SEMINOLE: {
    label: 'Seminole',
    phone: '(727) 392-1966',
    portalUrl: 'https://myseminole.com/website/building.html',
    portalLabel: 'Seminole Building Dept',
    address: '9199 113th Street, Seminole, FL 33772',
    hours: 'Mon–Fri, 8am–3:30pm',
  },
  PINELLAS_PARK: {
    label: 'Pinellas Park',
    phone: '(727) 369-5647',
    portalUrl: 'https://www.pinellas-park.com/1981/Applying-for-a-Permit',
    portalLabel: 'Pinellas Park Permits',
    address: '6051 78th Avenue N, Pinellas Park, FL 33781',
    hours: 'Mon–Fri, 8am–4:30pm',
  },
  GULFPORT: {
    label: 'Gulfport',
    phone: '(727) 893-1024',
    portalUrl: 'https://mygulfport.us/community-development/',
    portalLabel: 'Gulfport Community Development',
    address: '5330 23rd Ave S, Gulfport, FL 33707',
    hours: 'Mon–Fri, 8am–4:30pm (Thu closes 3:30pm)',
  },
  ST_PETE_BEACH: {
    label: 'St. Pete Beach',
    phone: '(727) 367-2735',
    portalUrl: 'https://www.stpetebeach.org/200/Building-Permitting',
    portalLabel: 'St. Pete Beach Building',
    address: '155 Corey Hall, St. Pete Beach, FL 33706',
    hours: 'Mon–Fri, 8am–4:30pm',
  },
  TREASURE_ISLAND: {
    label: 'Treasure Island',
    phone: '(727) 547-4575',
    portalUrl: 'https://mytreasureisland.org/building_department/index.php',
    portalLabel: 'Treasure Island Building Dept',
    address: '10451 Gulf Blvd, Treasure Island, FL 33706',
    hours: 'Mon–Fri, 9am–4pm',
  },
  MADEIRA_BEACH: {
    label: 'Madeira Beach',
    phone: '(727) 391-9951',
    portalUrl: 'https://madeirabeachfl.gov/building-department/',
    portalLabel: 'Madeira Beach Building Dept',
    address: '300 Municipal Drive, Madeira Beach, FL 33708',
    hours: 'Mon–Fri, 8:30am–4:30pm',
  },
  INDIAN_SHORES: {
    label: 'Indian Shores',
    phone: '(727) 474-7786',
    portalUrl: 'https://myindianshores.com/2229/Building-Department',
    portalLabel: 'Indian Shores Building Dept',
    address: '19305 Gulf Blvd, Indian Shores, FL 33785',
    hours: 'Mon–Fri, 8am–4pm',
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
  },
  PALM_HARBOR: {
    label: 'Palm Harbor (Unincorporated)',
    phone: '(727) 464-3888',
    portalUrl: 'https://aca-prod.accela.com/pinellas/Default.aspx',
    portalLabel: 'Pinellas County Access Portal',
    address: '440 Court Street, Clearwater, FL 33756',
    hours: 'Mon–Fri, 8am–4pm',
  },
};

function getJurisdictionInfo(jurisdiction: string) {
  return JURISDICTION_INFO[jurisdiction] || JURISDICTION_INFO.PINELLAS_COUNTY;
}

// ─── Category config ───────────────────────────────────────────────────────
const CATEGORY_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  document: { label: 'Document', color: 'text-blue-600', bg: 'bg-blue-50', icon: FileText },
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

        {/* Why needed — always visible, not hidden */}
        {req.plainLanguageWhy && !isCompleted && (
          <div className="mt-3 flex gap-2 bg-amber-50 border border-amber-100 rounded-lg p-2.5">
            <Info size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">{req.plainLanguageWhy}</p>
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
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
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
    <PageWrapper className="pb-32">
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
            <span className="text-xs font-semibold text-blue-600">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
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

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <StatCard label="Permit Fee" value={job.estimatedCost || 'Varies'} icon={DollarSign} color="bg-green-500" />
          <StatCard label="Timeline" value={job.estimatedTimeline || '5-10 days'} icon={Clock} color="bg-blue-500" />
          <StatCard label="Required" value={`${requiredCompleted}/${requiredCount}`} icon={FileText} color="bg-purple-500" />
        </div>

        {/* County portal CTA — always visible */}
        <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
              <ExternalLink size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-blue-900">Submit Your Permit Online</p>
              <p className="text-xs text-blue-700 mt-0.5">
                {jurisdictionInfo.label} — {jurisdictionInfo.phone}
              </p>
              <p className="text-xs text-blue-600 mt-0.5">
                {jurisdictionInfo.address}
              </p>
              <p className="text-xs text-blue-500 mt-0.5">
                {jurisdictionInfo.hours}
              </p>
            </div>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"
              onClick={() => window.open(jurisdictionInfo.portalUrl, '_blank')}
            >
              Open Portal
              <ExternalLink size={12} className="ml-1.5" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
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

        {/* Checklist tab */}
        {activeTab === 'checklist' && (
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

        {/* Info tab */}
        {activeTab === 'info' && (
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
                  <a href={`tel:${jurisdictionInfo.phone}`} className="font-medium text-blue-600">
                    {jurisdictionInfo.phone}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Online Portal</span>
                  <button
                    onClick={() => window.open(jurisdictionInfo.portalUrl, '_blank')}
                    className="font-medium text-blue-600 flex items-center gap-1"
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

      {/* Fixed bottom bar */}
      <div className="fixed bottom-14 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-20">
        <div className="max-w-2xl mx-auto flex gap-2.5">
          <Button
            variant="outline"
            className="flex-1 gap-1.5"
            onClick={() => window.open(`tel:${jurisdictionInfo.phone}`)}
          >
            <Phone size={15} />
            Call Office
          </Button>
          <Button
            className="flex-1 gap-1.5 bg-blue-600 hover:bg-blue-700"
            onClick={() => window.open(jurisdictionInfo.portalUrl, '_blank')}
          >
            Submit Permit
            <ExternalLink size={15} />
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}
