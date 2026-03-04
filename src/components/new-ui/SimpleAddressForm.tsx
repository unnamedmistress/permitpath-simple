import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Building, Warehouse, Check, ArrowRight, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/shared/Button';

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
  onSubmit: (data: { address: string; propertyType: string }) => void;
  initialAddress?: string;
}

export default function SimpleAddressForm({ onSubmit, initialAddress = '' }: SimpleAddressFormProps) {
  const [step, setStep] = useState<'address' | 'property'>('address');
  const [address, setAddress] = useState(initialAddress);
  const [selectedPropertyType, setSelectedPropertyType] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

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
      onSubmit({ address, propertyType: propertyTypeId });
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
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddressSubmit()}
                  placeholder="123 Main St, St. Petersburg, FL"
                  className={cn(
                    'w-full pl-10 pr-4 py-3 rounded-xl border-2 bg-card',
                    'focus:outline-none focus:ring-4 focus:ring-primary/30 focus:border-primary',
                    'placeholder:text-muted-foreground/60',
                    'transition-all duration-200'
                  )}
                  autoFocus
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the full address where work will be done
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
