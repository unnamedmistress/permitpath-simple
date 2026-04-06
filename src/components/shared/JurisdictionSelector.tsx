// ─────────────────────────────────────────────────────────────────────────────
// JurisdictionSelector — county + municipality picker
// Week 8 | PermitPath 90-day sprint
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronDown, Check, Building2 } from 'lucide-react';
import type { Jurisdiction } from '@/types/permit';

// ─── Jurisdiction registry ────────────────────────────────────────────────────

interface JurEntry {
  id: Jurisdiction;
  label: string;
  county: 'Pinellas' | 'Hillsborough';
  portalUrl: string;
  phone: string;
}

const PINELLAS_JURISDICTIONS: JurEntry[] = [
  { id: 'PINELLAS_COUNTY',  label: 'Pinellas County (unincorporated)', county: 'Pinellas',      portalUrl: 'https://aca-prod.accela.com/pinellas/',   phone: '(727) 464-3207' },
  { id: 'ST_PETERSBURG',    label: 'St. Petersburg',                   county: 'Pinellas',      portalUrl: 'https://stpe-egov.aspgov.com/',          phone: '(727) 893-7231' },
  { id: 'CLEARWATER',       label: 'Clearwater',                       county: 'Pinellas',      portalUrl: 'https://www.myclearwater.com/',           phone: '(727) 562-4980' },
  { id: 'LARGO',            label: 'Largo',                            county: 'Pinellas',      portalUrl: 'https://www.largo.com/building/',         phone: '(727) 587-6750' },
  { id: 'DUNEDIN',          label: 'Dunedin',                          county: 'Pinellas',      portalUrl: 'https://www.dunedinfl.net/building/',     phone: '(727) 298-3021' },
  { id: 'TARPON_SPRINGS',   label: 'Tarpon Springs',                   county: 'Pinellas',      portalUrl: 'https://www.ctsfl.us/building-department', phone: '(727) 942-5635' },
  { id: 'SEMINOLE',         label: 'Seminole',                         county: 'Pinellas',      portalUrl: 'https://www.myseminole.com/',             phone: '(727) 391-0204' },
  { id: 'PINELLAS_PARK',    label: 'Pinellas Park',                    county: 'Pinellas',      portalUrl: 'https://www.pinellas-park.com/',          phone: '(727) 369-5764' },
  { id: 'GULFPORT',         label: 'Gulfport',                         county: 'Pinellas',      portalUrl: 'https://www.mygulfport.us/',              phone: '(727) 893-1059' },
  { id: 'ST_PETE_BEACH',    label: 'St. Pete Beach',                   county: 'Pinellas',      portalUrl: 'https://www.stpetebeach.org/',            phone: '(727) 363-9241' },
  { id: 'PALM_HARBOR',      label: 'Palm Harbor (unincorporated)',      county: 'Pinellas',      portalUrl: 'https://aca-prod.accela.com/pinellas/',   phone: '(727) 464-3207' },
];

const HILLSBOROUGH_JURISDICTIONS: JurEntry[] = [
  { id: 'HILLSBOROUGH_COUNTY', label: 'Hillsborough County (unincorporated)', county: 'Hillsborough', portalUrl: 'https://hc-aca.hillsboroughcounty.org/CitizenAccess/', phone: '(813) 272-5600' },
  { id: 'TAMPA',               label: 'City of Tampa',                        county: 'Hillsborough', portalUrl: 'https://permits.tampa.gov/CitizenAccess/',             phone: '(813) 274-3100' },
  { id: 'TEMPLE_TERRACE',      label: 'Temple Terrace',                       county: 'Hillsborough', portalUrl: 'https://www.templeterrace.com/',                       phone: '(813) 506-6450' },
  { id: 'PLANT_CITY',          label: 'Plant City',                           county: 'Hillsborough', portalUrl: 'https://www.plantcitygov.com/',                        phone: '(813) 659-4200' },
  { id: 'BRANDON',             label: 'Brandon',                              county: 'Hillsborough', portalUrl: 'https://hc-aca.hillsboroughcounty.org/CitizenAccess/', phone: '(813) 272-5600' },
  { id: 'RIVERVIEW',           label: 'Riverview',                            county: 'Hillsborough', portalUrl: 'https://hc-aca.hillsboroughcounty.org/CitizenAccess/', phone: '(813) 272-5600' },
  { id: 'VALRICO',             label: 'Valrico',                              county: 'Hillsborough', portalUrl: 'https://hc-aca.hillsboroughcounty.org/CitizenAccess/', phone: '(813) 272-5600' },
];

const ALL_JURISDICTIONS = [...PINELLAS_JURISDICTIONS, ...HILLSBOROUGH_JURISDICTIONS];

export function getJurisdictionMeta(id: Jurisdiction): JurEntry | undefined {
  return ALL_JURISDICTIONS.find((j) => j.id === id);
}

// ─── County tab pill ──────────────────────────────────────────────────────────

type County = 'Pinellas' | 'Hillsborough';

interface JurisdictionSelectorProps {
  value: Jurisdiction;
  onChange: (jur: Jurisdiction) => void;
  compact?: boolean;
  className?: string;
}

export default function JurisdictionSelector({
  value,
  onChange,
  compact = false,
  className = '',
}: JurisdictionSelectorProps) {
  const current = ALL_JURISDICTIONS.find((j) => j.id === value) ?? PINELLAS_JURISDICTIONS[0];
  const [county, setCounty] = useState<County>(current.county);
  const [open, setOpen] = useState(false);

  const list = county === 'Pinellas' ? PINELLAS_JURISDICTIONS : HILLSBOROUGH_JURISDICTIONS;

  function handleCountySwitch(c: County) {
    setCounty(c);
    // Auto-select the default for that county
    const defaults: Record<County, Jurisdiction> = {
      Pinellas: 'PINELLAS_COUNTY',
      Hillsborough: 'HILLSBOROUGH_COUNTY',
    };
    onChange(defaults[c]);
  }

  function handleSelect(id: Jurisdiction) {
    onChange(id);
    setOpen(false);
  }

  if (compact) {
    // Minimal inline badge used inside wizard header
    return (
      <button
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-1.5 rounded-full bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-medium text-teal-700 hover:bg-teal-100 transition-colors ${className}`}
      >
        <MapPin className="h-3 w-3" />
        {current.label}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-left shadow-sm hover:border-teal-300 hover:shadow-md transition-all"
      >
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
          <MapPin className="h-4 w-4 text-teal-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">
            Jurisdiction
          </div>
          <div className="text-sm font-semibold text-gray-900 truncate">{current.label}</div>
          <div className="text-xs text-gray-400">{current.county} County · {current.phone}</div>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="dropdown"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-2 z-30 rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden"
          >
            {/* County tabs */}
            <div className="flex p-2 gap-2 bg-gray-50 border-b border-gray-100">
              {(['Pinellas', 'Hillsborough'] as County[]).map((c) => (
                <button
                  key={c}
                  onClick={() => handleCountySwitch(c)}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-all ${
                    county === c
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <Building2 className="h-3 w-3" />
                  {c} County
                  {c === 'Hillsborough' && (
                    <span className="rounded-full bg-teal-500/20 px-1.5 py-0.5 text-[10px] font-bold text-teal-100">
                      NEW
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Jurisdiction list */}
            <div className="max-h-64 overflow-y-auto">
              {list.map((jur) => (
                <button
                  key={jur.id}
                  onClick={() => handleSelect(jur.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{jur.label}</div>
                    <div className="text-xs text-gray-400">{jur.phone}</div>
                  </div>
                  {value === jur.id && (
                    <Check className="h-4 w-4 text-teal-600 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* Footer tip */}
            <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Not sure? Enter your address above and we'll detect it automatically.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {open && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}
