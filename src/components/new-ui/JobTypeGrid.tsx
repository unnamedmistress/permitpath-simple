import { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Droplets, Zap, Sun, SquareStack, Wrench, Hammer, Fence } from 'lucide-react';
import type { JobType } from '@/types/permit';

interface JobTypeOption {
  type: JobType;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
}

const JOB_TYPES: JobTypeOption[] = [
  { 
    type: 'RE_ROOFING', 
    label: 'Roof', 
    icon: Home, 
    color: 'bg-orange-500', 
    description: 'Replacement or repair' 
  },
  { 
    type: 'WATER_HEATER', 
    label: 'Water Heater', 
    icon: Droplets, 
    color: 'bg-blue-500', 
    description: 'Replace or install' 
  },
  { 
    type: 'ELECTRICAL_PANEL', 
    label: 'Electrical Panel', 
    icon: Zap, 
    color: 'bg-yellow-500', 
    description: 'Upgrade or replace' 
  },
  { 
    type: 'AC_HVAC_CHANGEOUT', 
    label: 'AC / HVAC', 
    icon: Sun, 
    color: 'bg-green-500', 
    description: 'System changeout' 
  },
  { 
    type: 'DECK_INSTALLATION', 
    label: 'Deck', 
    icon: SquareStack, 
    color: 'bg-amber-600', 
    description: 'New deck or patio' 
  },
  { 
    type: 'PLUMBING_MAIN_LINE', 
    label: 'Plumbing', 
    icon: Wrench, 
    color: 'bg-cyan-600', 
    description: 'Main line work' 
  },
  { 
    type: 'ROOM_ADDITION', 
    label: 'Room Addition', 
    icon: Hammer, 
    color: 'bg-purple-500', 
    description: 'Add space' 
  },
  { 
    type: 'FENCE_INSTALLATION', 
    label: 'Fence', 
    icon: Fence, 
    color: 'bg-emerald-600', 
    description: 'New fence' 
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
};

interface JobTypeGridProps {
  onSelect: (jobType: JobType) => void;
  selectedType?: JobType;
}

export function JobTypeGrid({ onSelect, selectedType }: JobTypeGridProps) {
  const [hoveredType, setHoveredType] = useState<JobType | null>(null);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 md:grid-cols-4 gap-3"
    >
      {JOB_TYPES.map((job) => {
        const Icon = job.icon;
        const isSelected = selectedType === job.type;
        const isHovered = hoveredType === job.type;

        return (
          <motion.button
            key={job.type}
            variants={itemVariants}
            onClick={() => onSelect(job.type)}
            onMouseEnter={() => setHoveredType(job.type)}
            onMouseLeave={() => setHoveredType(null)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`
              relative p-4 rounded-xl text-left transition-all duration-200
              border-2 overflow-visible
              ${isSelected 
                ? 'border-blue-500 bg-blue-50 shadow-md' 
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }
            `}
          >
            {/* Icon background */}
            <div
              className={`
                absolute top-2 right-2 w-8 h-8 rounded-lg flex items-center justify-center
                transition-all duration-200
                ${isSelected ? job.color.replace('bg-', 'bg-opacity-20 bg-') : 'bg-gray-100'}
              `}
            >
              <Icon 
                size={16} 
                className={isSelected ? 'text-white' : 'text-gray-600'}
                style={{ color: isSelected ? undefined : 'currentColor' }}
              />
            </div>

            {/* Content */}
            <div className="relative z-10 pr-8">
              <h3 className="font-semibold text-gray-900 text-sm">
                {job.label}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {job.description}
              </p>
            </div>

            {/* Selection indicator */}
            {isSelected && (
              <motion.div
                layoutId="selection-indicator"
                className={`absolute bottom-2 right-2 w-5 h-5 rounded-full ${job.color} flex items-center justify-center`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.div>
            )}

            {/* Hover glow effect */}
            {isHovered && !isSelected && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent pointer-events-none"
              />
            )}
          </motion.button>
        );
      })}
    </motion.div>
  );
}

// Alternative: Row-based list view for mobile
export function JobTypeList({ onSelect, selectedType }: JobTypeGridProps) {
  return (
    <div className="space-y-2">
      {JOB_TYPES.map((job) => {
        const Icon = job.icon;
        const isSelected = selectedType === job.type;

        return (
          <motion.button
            key={job.type}
            onClick={() => onSelect(job.type)}
            whileTap={{ scale: 0.98 }}
            className={`
              w-full flex items-center gap-3 p-3 rounded-lg text-left
              border transition-all
              ${isSelected 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 bg-white hover:bg-gray-50'
              }
            `}
          >
            <div className={`w-10 h-10 rounded-lg ${job.color} flex items-center justify-center flex-shrink-0`}>
              <Icon size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 text-sm">
                {job.label}
              </h3>
              <p className="text-xs text-gray-500 truncate">
                {job.description}
              </p>
            </div>
            {isSelected && (
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

export default JobTypeGrid;
