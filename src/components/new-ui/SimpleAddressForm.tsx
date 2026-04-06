import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Building, Warehouse, Check, ArrowRight, MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/shared/Button';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';

const CITY_TO_JURISDICTION: Record<string, string> = {
  'saint petersburg': 'ST_PETERSBURG',
  'st. petersburg': 'ST_PETERSBURG',
  'st petersburg': 'ST_PETERSBURG',
  'clearwater': 'CLEARWATER',
  'largo': 'LARGO',
  'dunedin': 'DUNEDIN',
  'tarpon springs': 'TARPON_SPRINGS',
  'seminole': 'SEMINOLE',
  'pinellas park': 'PINELLAS_PARK',
  'gulfport': 'GULFPORT',
  'st. pete beach': 'ST_PETE_BEACH',
  'saint pete beach': 'ST_PETE_BEACH',
  'st pete beach': 'ST_PETE_BEACH',
  'south pasadena': 'PINELLAS_COUNTY',
  'treasure island': 'PINELLAS_COUNTY',
  'madeira beach': 'PINELLAS_COUNTY',
  'indian rocks beach': 'PINELLAS_COUNTY',
  'belleair': 'PINELLAS_COUNTY',
  'safety harbor': 'PINELLAS_COUNTY',
  'oldsmar': 'PINELLAS_COUNTY',
  'kenneth city': 'PINELLAS_COUNTY',
  'palm harbor': 'PALM_HARBOR',
  'tampa': 'HILLSBOROUGH_COUNTY',
  'brandon': 'HILLSBOROUGH_COUNTY',
  'riverview': 'HILLSBOROUGH_COUNTY',
  'plant city': 'PLANT_CITY',
  'temple terrace': 'TEMPLE_TERRACE',
};

function cityToJurisdiction(city: string): string {
  return CITY_TO_JURISDICTION[city.toLowerCase().trim()] ?? 'PINELLAS_COUNTY';
}

export interface PropertyType {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const PROPERTY_TYPES: PropertyType[] = [
  {
    id: 'SINGLE_FAMILY',
    label: 'Single-Family Home',
    icon: <Home className="w-6 h-6" />,
  },
  {
    id: 'CONDO_TOWNHOUSE',
    label: 'Condo / Townhouse',
    icon: <Building className="w-6 h-6" />,
  },
  {
    id: 'COMMERCIAL',
    label: 'Commercial',
    icon: <Warehouse className="w-6 h-6" />,
  },
];

interface SimpleAddressFormProps {
  onSubmit: (data: { address: string; propertyType: string; jurisdiction: string; latitude?: number; longitude?: number; addressComponents?: { street: string; city: string; state: string; zip: string } }) => void;
  initialAddress?: string;
}

export default function SimpleAddressForm({ onSubmit, initialAddress = '' }: SimpleAddressFormProps) {
  const [step, setStep] = useState<'address' | 'property'>('address');
  const [address, setAddress] = useState(initialAddress);
  const [selectedPropertyType, setSelectedPropertyType] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [placeData, setPlaceData] = useState<{
    jurisdiction: string;
    latitude?: number;
    longitude?: number;
    addressComponents?: { street: string; city: string; state: string; zip: string };
  }>({ jurisdiction: 'PINELLAS_COUNTY' });

  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const { isLoaded: mapsLoaded, loadError: mapsError } = useGoogleMaps();

  // Initialize Google Places Autocomplete
  const initAutocomplete = useCallback(() => {
    if (!mapsLoaded || !inputRef.current || autocompleteRef.current) return;

    try {
      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' },
        fields: ['formatted_address', 'geometry', 'address_components'],
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.formatted_address) return;

        setAddress(place.formatted_address);

        // Extract lat/lng
        const lat = place.geometry?.location?.lat();
        const lng = place.geometry?.location?.lng();

        // Extract address components
        const components = place.address_components || [];
        const getComponent = (type: string) =>
          components.find((c: google.maps.places.PlaceResult['address_components'] extends (infer U)[] ? U : never) =>
            (c as { types: string[] }).types.includes(type)
          );

        const streetNumber = (getComponent('street_number') as { long_name?: string } | undefined)?.long_name || '';
        const route = (getComponent('route') as { long_name?: string } | undefined)?.long_name || '';
        const city = (getComponent('locality') as { long_name?: string } | undefined)?.long_name ||
                     (getComponent('sublocality') as { long_name?: string } | undefined)?.long_name || '';
        const state = (getComponent('administrative_area_level_1') as { short_name?: string } | undefined)?.short_name || '';
        const zip = (getComponent('postal_code') as { long_name?: string } | undefined)?.long_name || '';

        setPlaceData({
          jurisdiction: cityToJurisdiction(city),
          latitude: lat,
          longitude: lng,
          addressComponents: {
            street: `${streetNumber} ${route}`.trim(),
            city,
            state,
            zip,
          },
        });
      });

      autocompleteRef.current = autocomplete;
    } catch (err) {
      console.warn('Failed to initialize autocomplete:', err);
    }
  }, [mapsLoaded]);

  useEffect(() => {
    initAutocomplete();
    return () => {
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, [initAutocomplete]);

  const handleAddressSubmit = () => {
    if (!address.trim()) return;
    setIsAnimating(true);
    setTimeout(() => {
      setStep('property');
      setIsAnimating(false);
    }, 300);
  };

  const handlePropertySelect = (propertyTypeId: string) => {
    setSelectedPropertyType(propertyTypeId);
    // Auto-submit after brief delay for visual feedback
    setTimeout(() => {
      onSubmit({
        address,
        propertyType: propertyTypeId,
        ...placeData,
      });
    }, 400);
  };

  const handleBack = () => {
    setStep('address');
    setSelectedPropertyType(null);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {step === 'address' ? (
          <motion.div
            key="address-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Address Input */}
            <div className="space-y-2">
              <label htmlFor="address" className="block text-sm font-medium text-foreground">
                Property Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  ref={inputRef}
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onKeyDown={(e) => {
                    // Don't submit on Enter if autocomplete dropdown is open
                    if (e.key === 'Enter') {
                      // Small delay to let autocomplete selection happen first
                      setTimeout(() => handleAddressSubmit(), 100);
                    }
                  }}
                  placeholder="123 Main St, St. Petersburg, FL"
                  className={cn(
                    'w-full pl-10 pr-4 py-3 rounded-xl border-2 bg-card',
                    'focus:outline-none focus:ring-4 focus:ring-primary/30 focus:border-primary',
                    'placeholder:text-muted-foreground/60',
                    'transition-all duration-200'
                  )}
                  autoFocus
                />
                {mapsLoaded && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-2 h-2 rounded-full bg-green-500" title="Address autocomplete active" />
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {mapsLoaded
                  ? 'Start typing for address suggestions'
                  : 'Enter the full address where work will be done'}
              </p>
            </div>

            {/* Continue Button */}
            <Button
              onClick={handleAddressSubmit}
              disabled={!address.trim() || isAnimating}
              className="w-full"
              size="lg"
              icon={<ArrowRight className="w-5 h-5" />}
            >
              Continue
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="property-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Back button */}
            <button
              onClick={handleBack}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              ← Back to address
            </button>

            {/* Property Type Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground">
                What type of property is this?
              </label>

              <div className="space-y-2">
                {PROPERTY_TYPES.map((propertyType, index) => {
                  const isSelected = selectedPropertyType === propertyType.id;

                  return (
                    <motion.button
                      key={propertyType.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handlePropertySelect(propertyType.id)}
                      disabled={!!selectedPropertyType}
                      className={cn(
                        'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left',
                        'focus:outline-none focus:ring-4 focus:ring-primary/30',
                        isSelected
                          ? 'border-primary bg-primary/10 shadow-lg'
                          : 'border-border bg-card hover:border-primary/30'
                      )}
                    >
                      {/* Icon */}
                      <div
                        className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {propertyType.icon}
                      </div>

                      {/* Label */}
                      <span className="font-semibold text-foreground flex-1">
                        {propertyType.label}
                      </span>

                      {/* Selection indicator */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"
                        >
                          <Check className="w-5 h-5 text-primary-foreground" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Show selected address */}
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Selected Address</p>
              <p className="text-sm font-medium text-foreground">{address}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
