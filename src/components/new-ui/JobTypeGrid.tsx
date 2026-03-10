import { useState } from 'react';
import { Home, Droplets, Zap, Wind, SquareStack, Wrench, Hammer, Fence, Bath, Plug, ShieldCheck, Sun } from 'lucide-react';
import type { JobType } from '@/types/permit';

interface JobTypeOption {
  type: JobType;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
}

const JOB_TYPES: JobTypeOption[] = [
  { type: 'RE_ROOFING', label: 'Roof', icon: Home, color: 'bg-orange-500', description: 'Replace or repair' },
  { type: 'SMALL_BATH_REMODEL', label: 'Bathroom', icon: Bath, color: 'bg-sky-500', description: 'Remodel or update' },
  { type: 'AC_HVAC_CHANGEOUT', label: 'AC / HVAC', icon: Wind, color: 'bg-green-500', description: 'System changeout' },
  { type: 'WATER_HEATER', label: 'Water Heater', icon: Droplets, color: 'bg-blue-500', description: 'Replace or install' },
  { type: 'ELECTRICAL_PANEL', label: 'Electric Panel', icon: Zap, color: 'bg-yellow-500', description: 'Upgrade or replace' },
  { type: 'EV_CHARGER', label: 'EV Charger', icon: Plug, color: 'bg-teal-500', description: 'Install charger' },
  { type: 'DECK_INSTALLATION', label: 'Deck / Patio', icon: SquareStack, color: 'bg-amber-600', description: 'New deck or patio' },
  { type: 'FENCE_INSTALLATION', label: 'Fence', icon: Fence, color: 'bg-emerald-600', description: 'New fence' },
  { type: 'PLUMBING_MAIN_LINE', label: 'Plumbing', icon: Wrench, color: 'bg-cyan-600', description: 'Main line / sewer' },
  { type: 'WINDOW_DOOR_REPLACEMENT', label: 'Windows / Doors', icon: ShieldCheck, color: 'bg-indigo-500', description: 'Replace or install' },
  { type: 'ROOM_ADDITION', label: 'Room Addition', icon: Hammer, color: 'bg-purple-500', description: 'Add living space' },
  { type: 'GENERATOR_INSTALL', label: 'Generator', icon: Sun, color: 'bg-rose-500', description: 'Standby or portable' },
];

interface JobTypeGridProps {
  onSelect: (jobType: JobType) => void;
  selectedType?: JobType;
}

// FIX: Removed framer-motion stagger animation that caused blank tiles on page load.
// Tiles now render immediately with CSS transitions only.
export function JobTypeGrid({ onSelect, selectedType }: JobTypeGridProps) {
  const [hoveredType, setHoveredType] = useState<JobType | null>(null);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {JOB_TYPES.map((job) => {
        const Icon = job.icon;
        const isSelected = selectedType === job.type;

        return (
          <button
            key={job.type}
            onClick={() => onSelect(job.type)}
            onMouseEnter={() => setHoveredType(job.type)}
            onMouseLeave={() => setHoveredType(null)}
            className={`
              relative p-4 rounded-xl text-left transition-all duration-150
              border-2 overflow-hidden active:scale-95
              ${isSelected
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
              }
            `}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 transition-colors duration-150 ${isSelected ? job.color : 'bg-gray-100'}`}>
              <Icon size={18} className={isSelected ? 'text-white' : 'text-gray-500'} />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm leading-tight">{job.label}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{job.description}</p>
            {isSelected && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Mobile: Row-based list view
export function JobTypeList({ onSelect, selectedType }: JobTypeGridProps) {
  return (
    <div className="space-y-2">
      {JOB_TYPES.map((job) => {
        const Icon = job.icon;
        const isSelected = selectedType === job.type;

        return (
          <button
            key={job.type}
            onClick={() => onSelect(job.type)}
            className={`
              w-full flex items-center gap-3 p-3 rounded-xl text-left
              border-2 transition-all duration-150 active:scale-[0.98]
              ${isSelected
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50'
              }
            `}
          >
            <div className={`w-10 h-10 rounded-lg ${isSelected ? job.color : 'bg-gray-100'} flex items-center justify-center flex-shrink-0`}>
              <Icon size={20} className={isSelected ? 'text-white' : 'text-gray-500'} />
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
          </button>
        );
      })}
    </div>
  );
}

export default JobTypeGrid;
