import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  Droplets, 
  Zap, 
  Wind, 
  Paintbrush, 
  SquareStack,
  Fence,
  Layers,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface JobType {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const JOB_TYPES: JobType[] = [
  {
    id: 'ROOF_REPLACEMENT',
    label: 'Roof',
    description: 'Replacement or repair',
    icon: <Home className="w-8 h-8" />,
    color: 'bg-amber-500',
  },
  {
    id: 'BATHROOM_REMODEL',
    label: 'Bathroom',
    description: 'Remodel or addition',
    icon: <Droplets className="w-8 h-8" />,
    color: 'bg-cyan-500',
  },
  {
    id: 'WATER_HEATER',
    label: 'Water Heater',
    description: 'Replace or install',
    icon: <Zap className="w-8 h-8" />,
    color: 'bg-red-500',
  },
  {
    id: 'AC_HVAC',
    label: 'AC / HVAC',
    description: 'Replace or repair',
    icon: <Wind className="w-8 h-8" />,
    color: 'bg-blue-500',
  },
  {
    id: 'WINDOW_DOOR',
    label: 'Windows & Doors',
    description: 'Replace or install',
    icon: <SquareStack className="w-8 h-8" />,
    color: 'bg-emerald-500',
  },
  {
    id: 'INTERIOR_PAINT',
    label: 'Interior Paint',
    description: 'Painting project',
    icon: <Paintbrush className="w-8 h-8" />,
    color: 'bg-purple-500',
  },
  {
    id: 'DECK_PATIO',
    label: 'Deck or Patio',
    description: 'Build or repair',
    icon: <Layers className="w-8 h-8" />,
    color: 'bg-orange-500',
  },
  {
    id: 'FENCE',
    label: 'Fence',
    description: 'Install or repair',
    icon: <Fence className="w-8 h-8" />,
    color: 'bg-stone-500',
  },
];

interface JobTypeGridProps {
  onSelect: (jobType: JobType) => void;
  selectedId?: string;
}

export default function JobTypeGrid({ onSelect, selectedId }: JobTypeGridProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {JOB_TYPES.map((jobType, index) => {
          const isSelected = selectedId === jobType.id;
          const isHovered = hoveredId === jobType.id;

          return (
            <motion.button
              key={jobType.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect(jobType)}
              onMouseEnter={() => setHoveredId(jobType.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={cn(
                'relative flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl border-2 transition-all duration-200',
                'focus:outline-none focus:ring-4 focus:ring-primary/30',
                isSelected 
                  ? 'border-primary bg-primary/5 shadow-lg scale-105' 
                  : isHovered
                    ? 'border-primary/50 bg-muted/50 shadow-md'
                    : 'border-border bg-card hover:border-primary/30 hover:shadow-sm'
              )}
              aria-pressed={isSelected}
              aria-label={`${jobType.label} - ${jobType.description}`}
            >
              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-primary-foreground" />
                </motion.div>
              )}

              {/* Icon container */}
              <div 
                className={cn(
                  'w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center mb-3 transition-transform duration-200',
                  jobType.color,
                  isSelected ? 'scale-110' : '',
                  'text-white shadow-lg'
                )}
              >
                {jobType.icon}
              </div>

              {/* Label */}
              <h3 className="font-semibold text-sm sm:text-base text-foreground text-center">
                {jobType.label}
              </h3>
              
              {/* Description */}
              <p className="text-xs text-muted-foreground text-center mt-1">
                {jobType.description}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
