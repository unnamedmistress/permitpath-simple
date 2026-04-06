import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Home, Droplets, Zap, Wind, Paintbrush, SquareStack, Fence, Layers,
  Check, Plug, BatteryCharging, Wrench, CircuitBoard, Pipette,
  UtensilsCrossed, PanelTop, Waves, Building
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
  { id: 'ROOF_REPLACEMENT', label: 'Re-Roofing', description: 'Full replacement', icon: <Home className="w-7 h-7" />, color: 'bg-amber-500' },
  { id: 'ROOF_REPAIR', label: 'Roof Repair', description: 'Patch or fix', icon: <Home className="w-7 h-7" />, color: 'bg-amber-400' },
  { id: 'AC_HVAC', label: 'AC / HVAC', description: 'Replace or repair', icon: <Wind className="w-7 h-7" />, color: 'bg-blue-500' },
  { id: 'WATER_HEATER', label: 'Water Heater', description: 'Replace or install', icon: <Zap className="w-7 h-7" />, color: 'bg-red-500' },
  { id: 'ELECTRICAL_PANEL', label: 'Electrical Panel', description: 'Upgrade or replace', icon: <CircuitBoard className="w-7 h-7" />, color: 'bg-yellow-500' },
  { id: 'ELECTRICAL_REWIRING', label: 'Rewiring', description: 'Full or partial', icon: <Plug className="w-7 h-7" />, color: 'bg-yellow-400' },
  { id: 'EV_CHARGER', label: 'EV Charger', description: 'Level 2 install', icon: <BatteryCharging className="w-7 h-7" />, color: 'bg-green-500' },
  { id: 'GENERATOR_INSTALL', label: 'Generator', description: 'Standby install', icon: <Zap className="w-7 h-7" />, color: 'bg-green-400' },
  { id: 'PLUMBING_MAIN_LINE', label: 'Plumbing', description: 'Main line work', icon: <Pipette className="w-7 h-7" />, color: 'bg-cyan-500' },
  { id: 'BATHROOM_REMODEL', label: 'Bath Remodel', description: 'Remodel or addition', icon: <Droplets className="w-7 h-7" />, color: 'bg-cyan-400' },
  { id: 'KITCHEN_REMODEL', label: 'Kitchen', description: 'Full remodel', icon: <UtensilsCrossed className="w-7 h-7" />, color: 'bg-orange-500' },
  { id: 'WINDOW_DOOR', label: 'Windows & Doors', description: 'Replace or install', icon: <SquareStack className="w-7 h-7" />, color: 'bg-emerald-500' },
  { id: 'SIDING_EXTERIOR', label: 'Siding', description: 'Exterior work', icon: <PanelTop className="w-7 h-7" />, color: 'bg-stone-500' },
  { id: 'DECK_PATIO', label: 'Deck / Patio', description: 'Build or repair', icon: <Layers className="w-7 h-7" />, color: 'bg-orange-400' },
  { id: 'FENCE', label: 'Fence', description: 'Install or repair', icon: <Fence className="w-7 h-7" />, color: 'bg-stone-400' },
  { id: 'POOL_BARRIER', label: 'Pool Barrier', description: 'Safety fence/wall', icon: <Waves className="w-7 h-7" />, color: 'bg-blue-400' },
  { id: 'ROOM_ADDITION', label: 'Room Addition', description: 'New square footage', icon: <Building className="w-7 h-7" />, color: 'bg-purple-500' },
  { id: 'INTERIOR_PAINT', label: 'Interior Paint', description: 'No permit needed', icon: <Paintbrush className="w-7 h-7" />, color: 'bg-purple-400' },
];

interface JobTypeGridProps {
  onSelect: (jobType: JobType) => void;
  selectedId?: string;
}

export default function JobTypeGrid({ onSelect, selectedId }: JobTypeGridProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {JOB_TYPES.map((jobType, index) => {
          const isSelected = selectedId === jobType.id;
          const isHovered = hoveredId === jobType.id;
          return (
            <motion.button
              key={jobType.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => onSelect(jobType)}
              onMouseEnter={() => setHoveredId(jobType.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={cn(
                'relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border-2 transition-all duration-200',
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
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-primary-foreground" />
                </motion.div>
              )}
              <div className={cn(
                'w-11 h-11 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-2 transition-transform duration-200',
                jobType.color, isSelected ? 'scale-110' : '', 'text-white shadow-md'
              )}>
                {jobType.icon}
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-foreground text-center leading-tight">
                {jobType.label}
              </h3>
              <p className="text-[10px] text-muted-foreground text-center mt-0.5 hidden sm:block">
                {jobType.description}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
