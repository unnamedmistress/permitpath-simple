import { useState } from 'react';
import { Home, Droplets, Zap, Wind, SquareStack, Wrench, Hammer, Fence, Bath, Plug, ShieldCheck, Sun } from 'lucide-react';
import type { JobType } from '@/types/permit';

interface JobTypeOption {
  type: JobType;
  label: string;
  icon: React.ElementType;
  color: string;
  bgLight: string;
  borderColor: string;
  description: string;
}

const JOB_TYPES: JobTypeOption[] = [
  { type: 'RE_ROOFING',           label: 'Roof',           icon: Home,       color: 'bg-orange-500',  bgLight: 'hover:bg-orange-50',  borderColor: 'hover:border-orange-300',  description: 'Replace or repair' },
  { type: 'SMALL_BATH_REMODEL',   label: 'Bathroom',       icon: Bath,       color: 'bg-sky-500',     bgLight: 'hover:bg-sky-50',     borderColor: 'hover:border-sky-300',     description: 'Remodel or update' },
  { type: 'AC_HVAC_CHANGEOUT',    label: 'AC / HVAC',      icon: Wind,       color: 'bg-green-500',   bgLight: 'hover:bg-green-50',   borderColor: 'hover:border-green-300',   description: 'System changeout' },
  { type: 'WATER_HEATER',         label: 'Water Heater',   icon: Droplets,   color: 'bg-blue-500',    bgLight: 'hover:bg-blue-50',    borderColor: 'hover:border-blue-300',    description: 'Replace or install' },
  { type: 'ELECTRICAL_PANEL',     label: 'Electric Panel', icon: Zap,        color: 'bg-yellow-500',  bgLight: 'hover:bg-yellow-50',  borderColor: 'hover:border-yellow-300',  description: 'Upgrade or replace' },
  { type: 'EV_CHARGER',           label: 'EV Charger',     icon: Plug,       color: 'bg-teal-500',    bgLight: 'hover:bg-teal-50',    borderColor: 'hover:border-teal-300',    description: 'Install charger' },
  { type: 'DECK_INSTALLATION',    label: 'Deck / Patio',   icon: SquareStack,color: 'bg-amber-600',   bgLight: 'hover:bg-amber-50',   borderColor: 'hover:border-amber-300',   description: 'New deck or patio' },
  { type: 'FENCE_INSTALLATION',   label: 'Fence',          icon: Fence,      color: 'bg-emerald-600', bgLight: 'hover:bg-emerald-50', borderColor: 'hover:border-emerald-300', description: 'New fence' },
  { type: 'PLUMBING_MAIN_LINE',   label: 'Plumbing',       icon: Wrench,     color: 'bg-cyan-600',    bgLight: 'hover:bg-cyan-50',    borderColor: 'hover:border-cyan-300',    description: 'Main line / sewer' },
  { type: 'WINDOW_DOOR_REPLACEMENT',label: 'Windows / Doors',icon: ShieldCheck,color: 'bg-indigo-500', bgLight: 'hover:bg-indigo-50', borderColor: 'hover:border-indigo-300', description: 'Replace or install' },
  { type: 'ROOM_ADDITION',         label: 'Room Addition',  icon: Hammer,     color: 'bg-purple-500',  bgLight: 'hover:bg-purple-50',  borderColor: 'hover:border-purple-300',  description: 'Add living space' },
  { type: 'GENERATOR_INSTALL',     label: 'Generator',      icon: Sun,        color: 'bg-rose-500',    bgLight: 'hover:bg-rose-50',    borderColor: 'hover:border-rose-300',    description: 'Standby or portable' },
];

interface JobTypeGridProps {
  onSelect: (jobType: JobType) => void;
  selectedType?: JobType;
}

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
              relative p-4 rounded-xl text-left transition-all duration-200
              border-2 overflow-hidden active:scale-95 group
              ${isSelected
                ? `border-blue-500 bg-blue-50 shadow-lg shadow-blue-100`
                : `border-gray-200 bg-white ${job.bgLight} ${job.borderColor} hover:shadow-md`
              }
            `}
          >
            {/* Icon — always colored, gets brighter on select */}
            <div className={`
              w-10 h-10 rounded-xl flex items-center justify-center mb-3
              transition-all duration-200
              ${isSelected ? `${job.color} scale-110 shadow-md` : `${job.color} opacity-80`}
            `}>
              <Icon size={20} className="text-white" />
            </div>

            <h3 className="font-semibold text-gray-900 text-sm leading-tight">{job.label}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{job.description}</p>

            {isSelected && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shadow-sm">
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
              border-2 transition-all duration-200 active:scale-[0.98]
              ${isSelected
                ? 'border-blue-500 bg-blue-50 shadow-sm'
                : `border-gray-200 bg-white ${job.bgLight} ${job.borderColor} hover:shadow-sm`
              }
            `}
          >
            <div className={`
              w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
              transition-all duration-200
              ${isSelected ? `${job.color} shadow-sm` : `${job.color} opacity-80`}
            `}>
              <Icon size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 text-sm">{job.label}</h3>
              <p className="text-xs text-gray-500 truncate">{job.description}</p>
            </div>
            {isSelected && (
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 shadow-sm">
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

export default JobTypeGrid;
