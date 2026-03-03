import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useScroll } from "@/hooks/useScroll";
import { toast } from "sonner";
import { Plus, FileText, ChevronRight, Zap, Droplet, Bath, Sun, SquareStack, MapPin, Gift, CheckCircle, Shield, Clock, ArrowRight, Home, ClipboardCheck, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageWrapper from "@/components/layout/PageWrapper";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { useJobs } from "@/hooks/useJobs";
import { Job, JobType } from "@/types/permit";
import { formatJobTypeLabel } from "@/lib/utils";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import WelcomeModal from "@/components/shared/WelcomeModal";

const QUICK_JOB_CARDS = [
  { type: "RE_ROOFING" as JobType, label: "Roof", icon: SquareStack, color: "bg-orange-500", description: "New roof or repair" },
  { type: "WATER_HEATER" as JobType, label: "Water Heater", icon: Droplet, color: "bg-blue-500", description: "Replace or install" },
  { type: "ELECTRICAL_PANEL" as JobType, label: "Electrical", icon: Zap, color: "bg-yellow-500", description: "Panel upgrade" },
  { type: "AC_HVAC_CHANGEOUT" as JobType, label: "AC/HVAC", icon: Sun, color: "bg-green-500", description: "System changeout" },
];

const HOW_IT_WORKS = [
  { step: 1, icon: Home, title: "Tell us about your job", description: "Answer a few quick questions about your home project" },
  { step: 2, icon: ClipboardCheck, title: "Get your checklist", description: "Receive a personalized permit checklist for your project" },
  { step: 3, icon: Award, title: "Submit to county", description: "Complete the requirements and submit with confidence" },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.15 }
  }
};

// Hero SVG Illustration Component
function HeroIllustration() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background gradient */}
      <defs>
        <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="buildingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
        <linearGradient id="roofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      
      {/* House base */}
      <rect x="80" y="120" width="180" height="140" fill="url(#buildingGrad)" rx="4" />
      
      {/* Roof */}
      <path d="M60 130 L170 50 L280 130 Z" fill="url(#roofGrad)" />
      
      {/* Door */}
      <rect x="150" y="180" width="40" height="80" fill="#64748b" rx="2" />
      <circle cx="180" cy="220" r="3" fill="#fbbf24" />
      
      {/* Windows */}
      <rect x="100" y="150" width="30" height="30" fill="#94a3b8" rx="2" stroke="#64748b" strokeWidth="2" />
      <rect x="210" y="150" width="30" height="30" fill="#94a3b8" rx="2" stroke="#64748b" strokeWidth="2" />
      <rect x="100" y="210" width="30" height="30" fill="#94a3b8" rx="2" stroke="#64748b" strokeWidth="2" />
      <rect x="210" y="210" width="30" height="30" fill="#94a3b8" rx="2" stroke="#64748b" strokeWidth="2" />
      
      {/* Permit Document */}
      <g transform="translate(250, 160)">
        <rect x="0" y="0" width="70" height="90" fill="white" rx="4" filter="url(#shadow)" />
        <rect x="0" y="0" width="70" height="25" fill="#22c55e" rx="4" />
        <rect x="0" y="25" width="70" height="2" fill="#22c55e" />
        <text x="8" y="17" fill="white" fontSize="10" fontWeight="bold">APPROVED</text>
        <line x1="8" y1="38" x2="62" y2="38" stroke="#e2e8f0" strokeWidth="2" />
        <line x1="8" y1="48" x2="50" y2="48" stroke="#e2e8f0" strokeWidth="2" />
        <line x1="8" y1="58" x2="55" y2="58" stroke="#e2e8f0" strokeWidth="2" />
        <line x1="8" y1="68" x2="45" y2="68" stroke="#e2e8f0" strokeWidth="2" />
        <circle cx="55" cy="78" r="8" fill="#22c55e" />
        <path d="M51 78 L54 81 L59 75" stroke="white" strokeWidth="2" fill="none" />
      </g>
      
      {/* Checkmarks */}
      <g transform="translate(50, 180)">
        <circle cx="12" cy="12" r="12" fill="#22c55e" fillOpacity="0.2" />
        <circle cx="12" cy="12" r="8" fill="#22c55e" />
        <path d="M8 12 L11 15 L16 9" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.1" />
        </filter>
      </defs>
    </svg>
  );
}

// Trust Badge Component
function TrustBadge({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow-sm">
      <Icon size={14} className="text-primary flex-shrink-0" />
      <span className="text-xs font-medium text-slate-700">{label}</span>
    </div>
  );
}

// Skeleton loader for job cards
function JobCardSkeleton() {
  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border border-border animate-pulse">
      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
      <div className="h-3 bg-muted rounded w-1/2" />
    </div>
  );
}

// Empty state component
function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12 bg-gradient-to-b from-slate-50 to-slate-100 rounded-2xl border border-slate-200/60"
    >
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
      >
        <Home size={28} className="text-primary" />
      </motion.div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">No jobs yet</h3>
      <p className="text-sm text-slate-500 mb-5 max-w-xs mx-auto leading-relaxed">
        Start your first project and get your personalized permit checklist
      </p>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onCreate}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors"
      >
        <Plus size={18} />
        Start Your First Job
      </motion.button>
    </motion.div>
  );
}

// Sticky CTA Component
function StickyCTA() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    // Show sticky CTA after scrolling past hero (roughly 400px)
    setIsVisible(scrollY > 400);
  }, [scrollY]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-16 left-0 right-0 z-40 px-4 sm:px-6 pointer-events-none"
        >
          <div className="max-w-md mx-auto pointer-events-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/new")}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white font-bold rounded-xl shadow-2xl shadow-primary/40 hover:bg-primary/90 transition-colors"
            >
              <Plus size={20} />
              Start Your Project
              <ArrowRight size={18} />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { jobs, isLoading, deleteJob, fetchJobs } = useJobs();
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getStatusLabel = (status: Job["status"]) => {
    const labels: Record<string, string> = {
      approved: "Approved",
      ready_to_submit: "Ready",
      submitted: "Submitted",
      under_review: "In Review",
      requirements_pending: "Requirements Pending",
      documents_pending: "Documents Pending",
      draft: "Draft",
      rejected: "Needs Revision",
      closed: "Closed",
    };
    return labels[status] || status;
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
    try {
      setDeleteLoading(true);
      await deleteJob(jobToDelete.id);
      toast.success("Job deleted", {
        description: `"${formatJobTypeLabel(jobToDelete.jobType)}" has been removed.`,
      });
      setJobToDelete(null);
    } catch (error) {
      toast.error("Failed to delete job");
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusColorClass = (status: Job["status"]) => {
    return status === "approved" || status === "ready_to_submit" 
      ? 'bg-emerald-100 text-emerald-700' 
      : status === "rejected" 
        ? 'bg-red-100 text-red-700'
        : 'bg-amber-100 text-amber-700';
  };

  return (
    <PageWrapper>
      <WelcomeModal />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-blue-800" />
        
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rounded-full" />
        
        <div className="relative px-4 pt-10 pb-8 sm:pt-12 sm:pb-10">
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="max-w-xl mx-auto text-center"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} className="mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white/90 text-xs font-medium rounded-full border border-white/20">
                <Gift size={12} />
                100% Free for Homeowners
              </span>
            </motion.div>
            
            {/* Headline */}
            <motion.h1 
              variants={fadeInUp}
              className="text-3xl sm:text-4xl font-bold text-white leading-[1.1] mb-3"
            >
              Get Your Permit
              <br />
              <span className="text-blue-200">Without the Headache</span>
            </motion.h1>
            
            {/* Subheadline */}
            <motion.p 
              variants={fadeInUp}
              className="text-base sm:text-lg text-white/80 mb-6 max-w-sm mx-auto leading-relaxed"
            >
              Answer a few questions, get a custom checklist, and submit with confidence
            </motion.p>
            
            {/* CTA Button */}
            <motion.div variants={fadeInUp}>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/new")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary font-bold rounded-xl shadow-xl shadow-black/10 hover:bg-blue-50 transition-colors text-base"
              >
                Start New Project
                <ArrowRight size={18} />
              </motion.button>
            </motion.div>
            
            {/* Trust Badges */}
            <motion.div 
              variants={fadeInUp}
              className="mt-6 flex flex-wrap items-center justify-center gap-3"
            >
              <TrustBadge icon={Shield} label="Official County Data" />
              <TrustBadge icon={CheckCircle} label="Always Free" />
              <TrustBadge icon={Clock} label="Saves Hours" />
            </motion.div>
          </motion.div>
          
          {/* Hero Illustration */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 max-w-sm mx-auto"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-white/10 blur-3xl rounded-full" />
              <HeroIllustration />
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 py-10 bg-slate-50/50">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-4xl mx-auto"
        >
          <motion.div variants={fadeInUp} className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">How It Works</h2>
            <p className="text-slate-500 text-sm">Three simple steps to get your permit</p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {HOW_IT_WORKS.map((item, index) => (
              <motion.div
                key={item.step}
                variants={fadeInUp}
                className="relative"
              >
                {/* Connector line for desktop */}
                {index < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden sm:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
                )}
                
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-primary/20 transition-all group">
                  <div className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-3">
                    <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform">
                      <item.icon size={22} className="text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 sm:justify-center mb-1">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                          {item.step}
                        </span>
                        <h3 className="font-semibold text-slate-800 text-sm sm:text-base">{item.title}</h3>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Popular Jobs Section */}
      <section className="px-4 py-8">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
          className="max-w-4xl mx-auto"
        >
          <motion.div variants={fadeInUp} className="text-center mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-1">Popular Projects</h2>
            <p className="text-slate-500 text-xs sm:text-sm">Tap a project to get started</p>
          </motion.div>
          
          <motion.div 
            variants={fadeInUp}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
          >
            {QUICK_JOB_CARDS.map(({ type, label, icon: Icon, color, description }) => (
              <motion.button
                key={type}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/new?jobType=${type}`)}
                className="group relative bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-lg hover:border-primary/30 transition-all text-left overflow-hidden"
              >
                {/* Hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative">
                  <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center shadow-md mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-800 text-sm mb-0.5">{label}</h3>
                  <p className="text-[10px] sm:text-xs text-slate-400">{description}</p>
                </div>
                
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <ArrowRight size={12} className="text-primary" />
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Your Jobs Section */}
      <section className="px-4 py-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <motion.div variants={itemVariants} className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Your Projects</h2>
              <p className="text-xs text-slate-500">{jobs.length} {jobs.length === 1 ? 'project' : 'projects'}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/new")}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
            >
              <Plus size={16} />
              New
            </motion.button>
          </motion.div>

          {isLoading ? (
            <div className="space-y-3">
              <JobCardSkeleton />
              <JobCardSkeleton />
              <JobCardSkeleton />
            </div>
          ) : jobs.length === 0 ? (
            <EmptyState onCreate={() => navigate("/new")} />
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {jobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => navigate(`/wizard/${job.id}`)}
                    className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 cursor-pointer hover:shadow-md hover:border-primary/20 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-100 group-hover:border-primary/20 transition-colors">
                        <FileText size={20} className="text-slate-400 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-sm text-slate-800 truncate">
                            {formatJobTypeLabel(job.jobType)}
                          </h3>
                          <span className={`text-[10px] font-semibold px-2 py-1 rounded-full flex-shrink-0 ${getStatusColorClass(job.status)}`}>
                            {getStatusLabel(job.status)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-1">
                          {job.address || "No address set"}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-[10px] text-slate-400">
                            Started {formatDate(job.createdAt)}
                          </p>
                          <ChevronRight size={14} className="text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </section>

      <ConfirmDialog
        open={!!jobToDelete}
        onClose={() => setJobToDelete(null)}
        onConfirm={handleDeleteJob}
        title="Delete Job"
        description={`Are you sure you want to delete "${jobToDelete ? formatJobTypeLabel(jobToDelete.jobType) : ''}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        destructive
        loading={deleteLoading}
      />

      {/* Legal Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="px-4 py-8 mt-4 border-t border-slate-200 bg-slate-50/50"
      >
        <p className="text-xs text-slate-600 text-center leading-relaxed max-w-sm mx-auto">
          This tool provides general information only and does not constitute legal advice. Always consult your local building department.
        </p>
      </motion.footer>

      {/* Sticky CTA */}
      <StickyCTA />
    </PageWrapper>
  );
}
