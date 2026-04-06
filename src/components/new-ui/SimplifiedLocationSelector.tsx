// ─────────────────────────────────────────────────────────────────────────────
// SimplifiedLocationSelector — multi-county jurisdiction picker
// Updated Week 8 to include Hillsborough County
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Check, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Location {
  id: string;
  label: string;
  description: string;
  county: 'Pinellas' | 'Hillsborough';
}

const PINELLAS_LOCATIONS: Location[] = [
  { id: 'PINELLAS_COUNTY',  label: 'Pinellas County',    description: 'Unincorporated areas',     county: 'Pinellas' },
  { id: 'ST_PETERSBURG',    label: 'St. Petersburg',      description: 'City Building Dept',       county: 'Pinellas' },
  { id: 'CLEARWATER',       label: 'Clearwater',          description: 'City Building Services',   county: 'Pinellas' },
  { id: 'LARGO',            label: 'Largo',               description: 'City Building Division',   county: 'Pinellas' },
  { id: 'DUNEDIN',          label: 'Dunedin',             description: 'City Building Dept',       county: 'Pinellas' },
  { id: 'TARPON_SPRINGS',   label: 'Tarpon Springs',      description: 'City Building Dept',       county: 'Pinellas' },
  { id: 'SEMINOLE',         label: 'Seminole',            description: 'City permits',             county: 'Pinellas' },
  { id: 'PINELLAS_PARK',    label: 'Pinellas Park',       description: 'Development Services',     county: 'Pinellas' },
  { id: 'GULFPORT',         label: 'Gulfport',            description: 'City permits',             county: 'Pinellas' },
  { id: 'ST_PETE_BEACH',    label: 'St. Pete Beach',      description: 'City permits',             county: 'Pinellas' },
  { id: 'PALM_HARBOR',      label: 'Palm Harbor',         description: 'County jurisdiction',      county: 'Pinellas' },
];

const HILLSBOROUGH_LOCATIONS: Location[] = [
  { id: 'HILLSBOROUGH_COUNTY', label: 'Hillsborough County',  description: 'Unincorporated areas',      county: 'Hillsborough' },
  { id: 'TAMPA',               label: 'City of Tampa',         description: 'Construction Services',     county: 'Hillsborough' },
  { id: 'TEMPLE_TERRACE',      label: 'Temple Terrace',        description: 'Building & Inspections',    county: 'Hillsborough' },
  { id: 'PLANT_CITY',          label: 'Plant City',            description: 'City Building Dept',        county: 'Hillsborough' },
  { id: 'BRANDON',             label: 'Brandon',               description: 'County jurisdiction',       county: 'Hillsborough' },
  { id: 'RIVERVIEW',           label: 'Riverview',             description: 'County jurisdiction',       county: 'Hillsborough' },
  { id: 'VALRICO',             label: 'Valrico',               description: 'County jurisdiction',       county: 'Hillsborough' },
];

type County = 'Pinellas' | 'Hillsborough';

interface SimplifiedLocationSelectorProps {
  onSelect: (location: Location) => void;
  selectedId?: string;
}

export default function SimplifiedLocationSelector({
  onSelect,
  selectedId,
}: SimplifiedLocationSelectorProps) {
  // Determine starting county from existing selection
  const existingLoc =
    [...PINELLAS_LOCATIONS, ...HILLSBOROUGH_LOCATIONS].find((l) => l.id === selectedId);
  const [county, setCounty] = useState<County>(
    existingLoc?.county ?? 'Pinellas'
  );

  const locations = county === 'Pinellas' ? PINELLAS_LOCATIONS : HILLSBOROUGH_LOCATIONS;

  function handleCountySwitch(c: County) {
    setCounty(c);
    // Auto-select county default when switching
    const defaults: Record<County, string> = {
      Pinellas: 'PINELLAS_COUNTY',
      Hillsborough: 'HILLSBOROUGH_COUNTY',
    };
    const def = locations.find((l) => l.id === defaults[c]) ?? (c === 'Pinellas' ? PINELLAS_LOCATIONS[0] : HILLSBOROUGH_LOCATIONS[0]);
    onSelect(c === 'Pinellas' ? PINELLAS_LOCATIONS.find((l) => l.id === defaults[c]) ?? PINELLAS_LOCATIONS[0] : HILLSBOROUGH_LOCATIONS.find((l) => l.id === defaults[c]) ?? HILLSBOROUGH_LOCATIONS[0]);
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-3">
      {/* County toggle tabs */}
      <div className="flex gap-2 p-1 rounded-2xl bg-muted">
        {(['Pinellas', 'Hillsborough'] as County[]).map((c) => (
          <button
            key={c}
            onClick={() => handleCountySwitch(c)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition-all',
              county === c
                ? 'bg-white text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <MapPin className="h-3.5 w-3.5" />
            {c} County
            {c === 'Hillsborough' && (
              <span className="rounded-full bg-teal-500 px-1.5 py-0.5 text-[9px] font-bold text-white leading-tight">
                NEW
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Location list */}
      {locations.map((location, index) => {
        const isSelected = selectedId === location.id;
        return (
          <motion.button
            key={location.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(location)}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left',
              'focus:outline-none focus:ring-4 focus:ring-primary/30',
              isSelected
                ? 'border-primary bg-primary/10 shadow-lg'
                : 'border-border bg-card hover:border-primary/30 hover:bg-muted/50'
            )}
            aria-pressed={isSelected}
          >
            {/* Icon */}
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200',
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {location.id.includes('COUNTY') || location.id === 'PALM_HARBOR'
                ? <MapPin className="w-5 h-5" />
                : <Building2 className="w-5 h-5" />
              }
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm">{location.label}</h3>
              <p className="text-xs text-muted-foreground">{location.description}</p>
            </div>

            {/* Check */}
            <div
              className={cn(
                'w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                isSelected
                  ? 'border-primary bg-primary'
                  : 'border-muted-foreground/30'
              )}
            >
              {isSelected && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Check className="w-4 h-4 text-primary-foreground" />
                </motion.div>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
