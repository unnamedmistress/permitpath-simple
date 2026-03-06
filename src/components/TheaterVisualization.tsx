'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';
import { JobStatus } from '@/types/permit';

interface TheaterStageProps {
  currentStatus: JobStatus;
  className?: string;
}

interface Stage {
  id: JobStatus;
  label: string;
  description: string;
  icon: React.ElementType;
}

const STAGES: Stage[] = [
  { 
    id: 'draft', 
    label: 'Draft', 
    description: 'Getting started',
    icon: Circle 
  },
  { 
    id: 'requirements_pending', 
    label: 'Requirements', 
    description: 'Checklist created',
    icon: AlertCircle 
  },
  { 
    id: 'documents_pending', 
    label: 'Documents', 
    description: 'Uploading docs',
    icon: Clock 
  },
  { 
    id: 'ready_to_submit', 
    label: 'Ready', 
    description: 'Ready to submit',
    icon: CheckCircle2 
  },
  { 
    id: 'submitted', 
    label: 'Submitted', 
    description: 'Under review',
    icon: Clock 
  },
  { 
    id: 'approved', 
    label: 'Approved', 
    description: 'Permit issued',
    icon: CheckCircle2 
  },
];

// Animation variants for the ring
const ringVariants = {
  initial: { 
    pathLength: 0, 
    opacity: 0 
  },
  animate: (progress: number) => ({
    pathLength: progress,
    opacity: 1,
    transition: {
      pathLength: { 
        duration: 1.5, 
        ease: [0.22, 1, 0.36, 1],
        delay: 0.2 
      },
      opacity: { duration: 0.3 }
    }
  })
};

// Stage animation
const stageVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: (index: number) => ({
    scale: 1,
    opacity: 1,
    transition: {
      delay: index * 0.1,
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  })
};

export default function TheaterVisualization({ currentStatus, className = '' }: TheaterStageProps) {
  const currentIndex = STAGES.findIndex(s => s.id === currentStatus);
  const progress = Math.max(0.05, (currentIndex + 1) / STAGES.length);
  
  // Calculate ring dimensions
  const size = 180;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Permit Theater</h3>
          <p className="text-sm text-slate-500">Track your progress through the permit journey</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-600">{Math.round(progress * 100)}%</p>
          <p className="text-xs text-slate-400">Complete</p>
        </div>
      </div>

      {/* Animated Progress Ring */}
      <div className="flex justify-center mb-6">
        <div className="relative" style={{ width: size, height: size }}>
          {/* Background ring */}
          <svg 
            className="absolute inset-0 -rotate-90"
            width={size} 
            height={size}
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth={strokeWidth}
            />
            {/* Animated progress ring */}
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="url(#gradient)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              variants={ringVariants}
              initial="initial"
              animate="animate"
              custom={progress}
            />
            {/* Gradient definition */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center mx-auto mb-1"
              >
                {STAGES[currentIndex]?.icon && (
                  <STAGES[currentIndex].icon size={28} className="text-white" />
                )}
              </motion.div>
              <p className="text-sm font-semibold text-slate-800">{STAGES[currentIndex]?.label}</p>
              <p className="text-xs text-slate-500">{STAGES[currentIndex]?.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stage Pipeline */}
      <div className="relative">
        {/* Connection line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-slate-200 -z-10" />
        
        <div className="grid grid-cols-6 gap-1">
          {STAGES.map((stage, index) => {
            const isComplete = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isPending = index > currentIndex;

            return (
              <motion.div
                key={stage.id}
                variants={stageVariants}
                initial="initial"
                animate="animate"
                custom={index}
                className="flex flex-col items-center"
              >
                {/* Stage dot */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center mb-2
                    transition-colors duration-300
                    ${isComplete 
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                      : isCurrent 
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-100'
                        : 'bg-slate-100 text-slate-400'
                    }
                  `}
                >
                  {isComplete ? (
                    <CheckCircle2 size={20} />
                  ) : (
                    <stage.icon size={20} />
                  )}
                </motion.div>
                
                {/* Stage label */}
                <p className={`
                  text-[10px] font-medium text-center leading-tight
                  ${isComplete || isCurrent ? 'text-slate-700' : 'text-slate-400'}
                `}>
                  {stage.label}
                </p>
                
                {/* Pulse animation for current stage */}
                {isCurrent && (
                  <motion.div
                    className="absolute w-12 h-12 rounded-full bg-blue-500/20"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Current stage details */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-6 p-4 bg-slate-50 rounded-xl"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 font-semibold text-sm">{currentIndex + 1}</span>
          </div>
          <div>
            <h4 className="font-medium text-slate-900">
              {STAGES[currentIndex]?.label} Phase
            </h4>
            <p className="text-sm text-slate-600 mt-1">
              {getStageGuidance(currentStatus)}
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function getStageGuidance(status: JobStatus): string {
  const guidance: Record<JobStatus, string> = {
    draft: 'Start by selecting your project type and providing basic details.',
    requirements_pending: 'Review the generated checklist and understand what documents you need.',
    documents_pending: 'Upload required documents like permits, plans, and contractor information.',
    ready_to_submit: 'All requirements met! You can now submit your permit application.',
    submitted: 'Your application is under review. Typical review time is 5-10 business days.',
    under_review: 'The building department is reviewing your application.',
    approved: 'Congratulations! Your permit has been approved. You can start work.',
    rejected: 'Your application needs revisions. Review the comments and resubmit.',
    closed: 'This permit is now closed.',
  };
  return guidance[status] || 'Continue working on your permit application.';
}
