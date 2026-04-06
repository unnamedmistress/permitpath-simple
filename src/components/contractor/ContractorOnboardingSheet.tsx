// ─────────────────────────────────────────────────────────────────────────────
// ContractorOnboardingSheet — profile setup for new Pro contractors
// Week 7 | PermitPath 90-day sprint
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Loader2, ChevronRight } from 'lucide-react';
import { saveContractorProfile } from '@/services/contractorService';
import type { ContractorProfile, ContractorRole } from '@/types/contractor';
import { CONTRACTOR_ROLE_LABELS } from '@/types/contractor';
import { toast } from 'sonner';

interface ContractorOnboardingSheetProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  existingProfile?: ContractorProfile | null;
}

const ROLES = Object.entries(CONTRACTOR_ROLE_LABELS) as [ContractorRole, string][];

const SERVICE_AREA_OPTIONS = [
  'Pinellas County',
  'Hillsborough County',
  'Pasco County',
  'Manatee County',
];

export default function ContractorOnboardingSheet({
  open,
  onClose,
  onSaved,
  existingProfile,
}: ContractorOnboardingSheetProps) {
  const [companyName, setCompanyName] = useState(existingProfile?.companyName ?? '');
  const [contactName, setContactName] = useState(existingProfile?.contactName ?? '');
  const [phone, setPhone] = useState(existingProfile?.phone ?? '');
  const [email, setEmail] = useState(existingProfile?.email ?? '');
  const [role, setRole] = useState<ContractorRole>(existingProfile?.role ?? 'general_contractor');
  const [licenseNumber, setLicenseNumber] = useState(existingProfile?.licenseNumber ?? '');
  const [serviceAreas, setServiceAreas] = useState<string[]>(
    existingProfile?.serviceAreas ?? ['Pinellas County']
  );
  const [saving, setSaving] = useState(false);

  function toggleArea(area: string) {
    setServiceAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  }

  async function handleSave() {
    if (!companyName.trim() || !contactName.trim() || !phone.trim() || !email.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (serviceAreas.length === 0) {
      toast.error('Select at least one service area');
      return;
    }
    setSaving(true);
    try {
      // Simulate brief async (future: Supabase upsert)
      await new Promise((r) => setTimeout(r, 400));
      saveContractorProfile({
        userId: 'local',
        companyName: companyName.trim(),
        contactName: contactName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        role,
        licenseNumber: licenseNumber.trim() || undefined,
        serviceAreas,
      });
      toast.success('Profile saved!');
      onSaved();
    } catch {
      toast.error('Could not save profile');
    } finally {
      setSaving(false);
    }
  }

  const isEditing = !!existingProfile;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="ob-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="ob-sheet"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white shadow-2xl max-h-[94vh] overflow-y-auto"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-violet-600" />
                </div>
                <h2 className="font-bold text-gray-900 text-base">
                  {isEditing ? 'Edit Profile' : 'Set Up Your Profile'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-full bg-gray-100 p-1.5 hover:bg-gray-200 transition-colors"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <div className="px-5 pt-4 pb-10 space-y-4">
              {/* Company */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                  Company Name *
                </label>
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="ABC Contracting LLC"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                />
              </div>

              {/* Contact + phone row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                    Contact Name *
                  </label>
                  <input
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Jane Smith"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                    Phone *
                  </label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(727) 555-0100"
                    type="tel"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                  Business Email *
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@yourcompany.com"
                  type="email"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                />
              </div>

              {/* License */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                  License Number <span className="text-gray-400 normal-case">(optional)</span>
                </label>
                <input
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="CGC1234567"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                />
              </div>

              {/* Trade type */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">
                  Trade Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setRole(key)}
                      className={`rounded-xl px-3 py-2 text-xs font-medium text-left transition-all border ${
                        role === key
                          ? 'bg-violet-50 border-violet-300 text-violet-700'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-violet-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Service areas */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">
                  Service Areas
                </label>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_AREA_OPTIONS.map((area) => (
                    <button
                      key={area}
                      onClick={() => toggleArea(area)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all border ${
                        serviceAreas.includes(area)
                          ? 'bg-violet-600 border-violet-600 text-white'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-violet-300'
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save button */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-200 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-60 transition-all active:scale-[0.98] mt-2"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Complete Setup'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
