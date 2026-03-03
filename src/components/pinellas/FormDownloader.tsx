import { useState } from 'react';
import { FileText, Download, ExternalLink, Eye, CheckCircle, AlertCircle, X } from 'lucide-react';
import Button from '@/components/shared/Button';
import { getFormsForJobType, getPrimaryApplicationForm, getFormSupportContact, isExpressEligible } from '@/data/pinellas/formLibrary';

interface FormDownloaderProps {
  jobType: string;
  contractorProfile?: {
    businessName?: string;
    licenseNumber?: string;
    phone?: string;
    email?: string;
  };
}

export default function FormDownloader({ jobType, contractorProfile }: FormDownloaderProps) {
  const [previewForm, setPreviewForm] = useState<string | null>(null);
  const [downloadedForms, setDownloadedForms] = useState<Set<string>>(new Set());

  const forms = getFormsForJobType(jobType);
  const primaryForm = getPrimaryApplicationForm(jobType);
  const isExpress = isExpressEligible(jobType);
  const contact = getFormSupportContact();

  const handleDownload = (formId: string, downloadUrl: string) => {
    // In a real implementation, this would either:
    // 1. Open the official URL in a new tab
    // 2. Download a pre-filled PDF if we have PDF processing
    window.open(downloadUrl, '_blank');
    setDownloadedForms(prev => new Set(prev).add(formId));
  };

  const handlePreview = (formId: string) => {
    setPreviewForm(formId);
  };

  return (
    <div className="space-y-4">
      {/* Express Notice */}
      {isExpress && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
          <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-800">Express Permit Available</p>
            <p className="text-xs text-green-700">
              This job type qualifies for online express permitting. No forms to download - apply entirely online.
            </p>
          </div>
        </div>
      )}

      {/* Primary Form */}
      {primaryForm && (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
            <div className="flex items-center gap-2">
              <FileText size={20} />
              <h3 className="font-semibold">Primary Application</h3>
            </div>
            <p className="text-blue-100 text-sm mt-0.5">{primaryForm.formName}</p>
          </div>

          <div className="p-4 space-y-4">
            <p className="text-sm text-muted-foreground">{primaryForm.description}</p>

            {/* Form Preview Placeholder */}
            <div className="bg-muted rounded-lg p-4 text-center">
              <div className="w-16 h-20 bg-white rounded shadow mx-auto mb-2 flex items-center justify-center">
                <FileText size={24} className="text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {primaryForm.fileFormat === 'online' 
                  ? 'Online application - no download needed' 
                  : `${primaryForm.pages || '?'} page PDF`}
              </p>
            </div>

            {/* Pre-fill Preview */}
            {contractorProfile?.businessName && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-medium text-blue-700 mb-2">Will pre-fill with your info:</p>
                <div className="text-xs text-blue-600 space-y-1">
                  <p>• Company: {contractorProfile.businessName}</p>
                  {contractorProfile.licenseNumber && <p>• License: {contractorProfile.licenseNumber}</p>}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="space-y-2">
              <p className="text-sm font-medium">How to complete:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {primaryForm.instructions.slice(0, 3).map((instruction, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle size={12} className="mt-1 flex-shrink-0" />
                    {instruction}
                  </li>
                ))}
              </ul>
            </div>

            {/* Common Mistakes */}
            {primaryForm.commonMistakes.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-amber-800">Common mistakes to avoid:</p>
                    <p className="text-xs text-amber-700 mt-1">
                      {primaryForm.commonMistakes[0]}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={() => handleDownload(primaryForm.id, primaryForm.downloadUrl)}
                className="flex-1"
              >
                <Download size={16} />
                {primaryForm.fileFormat === 'online' ? 'Apply Online' : 'Download Form'}
              </Button>
              {primaryForm.officialUrl && (
                <Button 
                  variant="outline" 
                  onClick={() => window.open(primaryForm.officialUrl, '_blank')}
                >
                  <ExternalLink size={16} />
                </Button>
              )}
            </div>

            {downloadedForms.has(primaryForm.id) && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle size={12} />
                Form opened
              </p>
            )}
          </div>
        </div>
      )}

      {/* Additional Forms */}
      {forms.filter(f => f.id !== primaryForm?.id).length > 0 && (
        <div>
          <h4 className="font-medium text-sm mb-3">Additional Forms You May Need</h4>
          <div className="space-y-2">
            {forms.filter(f => f.id !== primaryForm?.id).map(form => (
              <div 
                key={form.id} 
                className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{form.formName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{form.description}</p>
                    
                    {form.notarizationRequired && (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600 mt-1">
                        <AlertCircle size={10} />
                        Notarization required
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-1 ml-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handlePreview(form.id)}
                    >
                      <Eye size={14} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDownload(form.id, form.downloadUrl)}
                    >
                      <Download size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Support Contact */}
      <div className="bg-muted rounded-lg p-3">
        <p className="text-xs text-muted-foreground mb-2">Questions about forms?</p>
        <div className="text-sm space-y-1">
          <p className="font-medium">{contact.phone}</p>
          <p className="text-xs text-muted-foreground">{contact.hours}</p>
          <p className="text-xs text-muted-foreground">{contact.email}</p>
        </div>
      </div>

      {/* Preview Modal (simplified) */}
      {previewForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Form Preview</h3>
              <button onClick={() => setPreviewForm(null)}>
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              PDF preview would load here. In production, this would show the actual form pages using PDF.js
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPreviewForm(null)}>Close</Button>
              <Button onClick={() => {
                const form = forms.find(f => f.id === previewForm);
                if (form) handleDownload(form.id, form.downloadUrl);
                setPreviewForm(null);
              }}>
                <Download size={14} />
                Download
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
