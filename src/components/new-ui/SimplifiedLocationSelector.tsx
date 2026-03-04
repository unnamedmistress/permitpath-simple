import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Check, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Location {
  id: string;
  label: string;
  description: string;
}

const LOCATIONS: Location[] = [
  {
    id: 'PINELLAS_COUNTY',
    label: 'Pinellas County',
    description: 'Unincorporated areas',
  },
  {
    id: 'ST_PETERSBURG',
    label: 'St. Petersburg',
    description: 'City permits',
  },
  {
    id: 'CLEARWATER',
    label: 'Clearwater',
    description: 'City permits',
  },
  {
    id: 'LARGO',
    label: 'Largo',
    description: 'City permits',
  },
  {
    id: 'PALM_HARBOR',
    label: 'Palm Harbor',
    description: 'County jurisdiction',
  },
];

interface SimplifiedLocationSelectorProps {
  onSelect: (location: Location) => void;
  selectedId?: string;
}

export default function SimplifiedLocationSelector({ 
  onSelect, 
  selectedId 
}: SimplifiedLocationSelectorProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="w-full max-w-md mx-auto space-y-3">
      {LOCATIONS.map((location, index) => {
        const isSelected = selectedId === location.id;
        const isHovered = hoveredId === location.id;

        return (
          <motion.button
            key={location.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            onClick={() => onSelect(location)}
            onMouseEnter={() => setHoveredId(location.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left',
              'focus:outline-none focus:ring-4 focus:ring-primary/30',
              isSelected 
                ? 'border-primary bg-primary/10 shadow-lg' 
                : isHovered
                  ? 'border-primary/50 bg-muted/50'
                  : 'border-border bg-card hover:border-primary/30'
            )}
            aria-pressed={isSelected}
          >
            {/* Icon */}
            <div 
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200',
                isSelected 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {location.id === 'PINELLAS_COUNTY' || location.id === 'PALM_HARBOR' 
                ? <MapPin className="w-6 h-6" />
                : <Building2 className="w-6 h-6" />
              }
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">
                {location.label}
              </h3>
              <p className="text-sm text-muted-foreground">
                {location.description}
              </p>
            </div>

            {/* Selection indicator */}
            <div 
              className={cn(
                'w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200',
                isSelected 
                  ? 'border-primary bg-primary' 
                  : 'border-muted-foreground/30'
              )}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <Check className="w-5 h-5 text-primary-foreground" />
                </motion.div>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
