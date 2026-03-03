import { useState, useRef } from 'react';
import { Check, Circle, AlertCircle, FileText, PenTool, ClipboardCheck, Award, Shield, DollarSign, HelpCircle, Phone, FileEdit, Video, Copy, ChevronDown, ChevronUp, Camera, Upload } from 'lucide-react';
import { Requirement, RequirementCategory } from '@/types/permit';
import { categorizeRequirements, calculateProgress } from '@/services/requirements';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import Button from '@/components/shared/Button';
import HelpTooltip from '@/components/shared/HelpTooltip';
import DocumentScanner from '@/components/shared/DocumentScanner';

interface RequirementsDisplayProps {
  requirements: Requirement[];
  onStatusChange?: (id: string, status: Requirement['status']) => void;
  onDocumentUpload?: (reqId: string, file: File) => void;
  readOnly?: boolean;
  jobType?: string;
}

const categoryIcons: Record<RequirementCategory, typeof FileText> = {
  document: FileText,
  drawing: PenTool,
  inspection: ClipboardCheck,
  license: Award,
  insurance: Shield,
  fee: DollarSign
};

const categoryLabels: Record<RequirementCategory, string> = {
  document: 'Documents',
  drawing: 'Drawings',
  inspection: 'Inspections',
  license: 'Licenses',
  insurance: 'Insurance',
  fee: 'Fees'
};

// Requirement-specific help content
const requirementHelp: Record<string, {
  whatItIs: string;
  whatYouNeed: string;
  howToGet: string;
  proTip?: string;
  templateMessage?: string;
  commonMistakes?: string[];
  estimatedTime?: string;
}> = {
  'permit-application': {
    whatItIs: 'A form from the city saying what work you are doing',
    whatYouNeed: 'We will fill this out FOR you based on what you told us',
    howToGet: 'You review it, sign it, and we will show you how to submit',
    proTip: 'Most contractors do not fill this out themselves - we do it',
    estimatedTime: '15 minutes to review'
  },
  'contractor-license': {
    whatItIs: 'Proof that you are legally allowed to do this work in Florida',
    whatYouNeed: 'Your Florida license number (you should have this already)',
    howToGet: 'Check your wallet card or business paperwork',
    proTip: 'If you are working for someone else, THEY might provide this',
    estimatedTime: 'You already have it!'
  },
  'insurance-certificate': {
    whatItIs: 'Proof you have insurance if something goes wrong',
    whatYouNeed: 'A 1-page document from your insurance company',
    howToGet: 'Call your insurance agent and ask for a Certificate of Liability',
    proTip: 'Most jobs need $1M coverage - ask your agent if yours does',
    templateMessage: 'Hi, I need a Certificate of Liability Insurance for a [JOB TYPE] permit. The county needs this to approve my permit. Can you email me a PDF?',
    estimatedTime: '1-2 business days'
  },
  'site-plan': {
    whatItIs: 'A simple drawing showing where the work is on your property',
    whatYouNeed: 'A hand-drawn sketch or printed Google Maps with your house marked',
    howToGet: 'Print Google Maps, circle your property, mark where work goes',
    estimatedTime: '30 minutes'
  }
};

// Default help for any requirement
function getRequirementHelp(req: Requirement) {
  // Try to match by title keywords
  const title = req.title?.toLowerCase() || '';
  if (title.includes('permit') && title.includes('application')) return requirementHelp['permit-application'];
  if (title.includes('license') || title.includes('contractor')) return requirementHelp['contractor-license'];
  if (title.includes('insurance') || title.includes('certificate')) return requirementHelp['insurance-certificate'];
  if (title.includes('plan') || title.includes('site')) return requirementHelp['site-plan'];
  
  return {
    whatItIs: req.plainLanguageWhy || 'A document the county needs for your permit',
    whatYouNeed: req.minimumCriteria || 'Clear photo or scan of the document',
    howToGet: req.actionType || 'Follow the steps below',
    proTip: req.whoCanHelp ? `Who can help: ${req.whoCanHelp}` : undefined,
    estimatedTime: 'Depends on document'
  };
}

function getStatusBadge(status: Requirement['status']) {
  switch (status) {
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
          <Check size={12} /> Complete
        </span>
      );
    case 'in-progress':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
          <Circle size={12} /> Working on it
        </span>
      );
    case 'pending':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
          <AlertCircle size={12} /> Not started
        </span>
      );
  }
}

export default function RequirementsDisplay({ 
  requirements, 
  onStatusChange, 
  onDocumentUpload,
  readOnly = false, 
  jobType 
}: RequirementsDisplayProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedReq, setExpandedReq] = useState<string | null>(null);
  const [scanningForReq, setScanningForReq] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categorized = categorizeRequirements(requirements);
  const progress = calculateProgress(requirements);

  const handleToggleStatus = (req: Requirement) => {
    if (readOnly || !onStatusChange) return;

    const newStatus: Requirement['status'] = req.status === 'completed' ? 'pending' : 'completed';
    onStatusChange(req.id, newStatus);
  };

  const handleFileSelect = (reqId: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
      fileInputRef.current.dataset.reqId = reqId;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const reqId = fileInputRef.current?.dataset.reqId;
    if (file && reqId && onDocumentUpload) {
      onDocumentUpload(reqId, file);
      toast.success('Document uploaded!');
    }
  };

  const handleScanCapture = (imageData: string) => {
    if (scanningForReq && onDocumentUpload) {
      fetch(imageData)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'scanned-document.jpg', { type: 'image/jpeg' });
          onDocumentUpload(scanningForReq, file);
          toast.success('Document scanned and uploaded!');
          setScanningForReq(null);
        });
    }
  };

  const copyTemplate = (template: string) => {
    navigator.clipboard.writeText(template.replace('[JOB TYPE]', jobType || 'construction'));
    toast.success('Copied to clipboard!', { description: 'Paste this into a text or email' });
  };

  const renderHelpDialog = (req: Requirement) => {
    const help = getRequirementHelp(req);
    
    return (
      <Dialog>
        <DialogTrigger asChild>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
            <HelpCircle size={14} /> Get Help
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center gap-2">
              <HelpCircle className="text-primary" size={20} />
              Help: {req.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <FileText size={16} className="text-blue-600" /> What it is
              </h4>
              <p className="text-sm text-muted-foreground pl-6">{help.whatItIs}</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Award size={16} className="text-green-600" /> What you need
              </h4>
              <p className="text-sm text-muted-foreground pl-6">{help.whatYouNeed}</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <FileEdit size={16} className="text-purple-600" /> How to get it
              </h4>
              <p className="text-sm text-muted-foreground pl-6">{help.howToGet}</p>
              {help.estimatedTime && (
                <p className="text-xs text-muted-foreground pl-6 mt-1">
                  <span className="font-medium">Time:</span> {help.estimatedTime}
                </p>
              )}
            </div>
            
            {help.proTip && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                <h4 className="font-semibold text-sm text-amber-800 flex items-center gap-2">
                  💡 Pro Tip
                </h4>
                <p className="text-sm text-amber-700 mt-1">{help.proTip}</p>
              </div>
            )}
            
            {help.templateMessage && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Copy size={16} className="text-primary" /> Message Template
                </h4>
                <div className="bg-muted rounded-lg p-3 text-sm relative group">
                  <p className="pr-8">{help.templateMessage}</p>
                  <button 
                    onClick={() => copyTemplate(help.templateMessage!)}
                    className="absolute top-2 right-2 p-1.5 rounded bg-background hover:bg-primary hover:text-white transition-colors"
                    title="Copy to clipboard"
                  >
                    <Copy size={14} />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Tap the copy button, then paste in a text or email</p>
              </div>
            )}
            
            <div className="pt-4 border-t">
              <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                <Phone size={16} className="text-green-600" /> Need more help?
              </h4>
              <a 
                href="tel:727-464-3199" 
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                <Phone size={16} /> Call County: (727) 464-3199
              </a>
              <p className="text-xs text-muted-foreground mt-2">Hours: Monday-Friday 8am-5pm</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const renderCategory = (category: RequirementCategory, items: Requirement[]) => {
    if (items.length === 0) return null;

    const Icon = categoryIcons[category];
    const isExpanded = expandedCategory === category;
    const completedCount = items.filter((r) => r.status === 'completed').length;

    return (
      <div key={category} className="border rounded-xl overflow-hidden mb-4 bg-card">
        <button
          onClick={() => setExpandedCategory(isExpanded ? null : category)}
          className="w-full p-4 flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon size={20} className="text-primary" />
            </div>
            <div className="text-left">
              <span className="font-semibold block">{categoryLabels[category]}</span>
              <span className="text-xs text-muted-foreground">
                {completedCount} of {items.length} done
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {completedCount === items.length && items.length > 0 && (
              <span className="text-green-600">
                <Check size={20} />
              </span>
            )}
            {isExpanded ? <ChevronUp size={20} className="text-muted-foreground" /> : <ChevronDown size={20} className="text-muted-foreground" />}
          </div>
        </button>

        {isExpanded && (
          <div className="p-4 space-y-3">
            {items.map((req) => {
              const isReqExpanded = expandedReq === req.id;
              const help = getRequirementHelp(req);
              
              return (
                <div key={req.id} className={`rounded-xl border overflow-hidden transition-all ${req.status === 'completed' ? 'border-green-200 bg-green-50/50' : 'border-border bg-card'}`}>
                  {/* Header - Always visible */}
                  <div className="p-3">
                    <div className="flex items-start gap-3">
                      {!readOnly && onStatusChange ? (
                        <button
                          onClick={() => handleToggleStatus(req)}
                          className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                            req.status === 'completed'
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-muted-foreground hover:border-primary'
                          }`}
                        >
                          {req.status === 'completed' && <Check size={14} />}
                        </button>
                      ) : (
                        <div className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center ${req.status === 'completed' ? 'bg-green-500 text-white' : 'bg-muted'}`}>
                          {req.status === 'completed' ? <Check size={14} /> : <Circle size={14} />}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{req.title}</span>
                          {getStatusBadge(req.status)}
                          {req.isRequired && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-semibold uppercase tracking-wide">
                              Must Have
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{req.description}</p>
                        
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {renderHelpDialog(req)}
                          <button
                            onClick={() => setExpandedReq(isReqExpanded ? null : req.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/80 transition-colors"
                          >
                            {isReqExpanded ? 'Show less' : 'Show more'} {isReqExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                          
                          {/* Upload Actions */}
                          {onDocumentUpload && req.status !== 'completed' && (
                            <>
                              <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*,.pdf"
                                onChange={handleFileChange}
                              />
                              <button
                                onClick={() => handleFileSelect(req.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-xs font-medium hover:bg-blue-200 transition-colors"
                              >
                                <Upload size={14} /> Upload
                              </button>
                              <button
                                onClick={() => setScanningForReq(req.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-medium hover:bg-green-200 transition-colors"
                              >
                                <Camera size={14} /> Scan
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded details */}
                  {isReqExpanded && (
                    <div className="border-t bg-muted/30 p-3 space-y-3">
                      <div className="grid gap-3">
                        <div className="flex gap-3">
                          <FileText size={18} className="text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">What this is</p>
                            <p className="text-sm text-muted-foreground">{help.whatItIs}</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-3">
                          <Award size={18} className="text-green-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">What you need</p>
                            <p className="text-sm text-muted-foreground">{help.whatYouNeed}</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-3">
                          <FileEdit size={18} className="text-purple-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">How to do it</p>
                            <p className="text-sm text-muted-foreground">{help.howToGet}</p>
                            {help.estimatedTime && (
                              <p className="text-xs text-muted-foreground mt-1">
                                <span className="font-medium">Time needed:</span> {help.estimatedTime}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {req.acceptedFormats && req.acceptedFormats.length > 0 && (
                          <div className="flex gap-3">
                            <Copy size={18} className="text-orange-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium">File formats accepted</p>
                              <p className="text-sm text-muted-foreground">{req.acceptedFormats.join(', ')}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {help.proTip && (
                        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                          <p className="text-sm text-amber-800">
                            <span className="font-semibold">💡 Pro Tip:</span> {help.proTip}
                          </p>
                        </div>
                      )}
                      
                      {help.templateMessage && (
                        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                          <p className="text-sm font-medium text-blue-900 mb-2">📱 Message to send your agent:</p>
                          <div className="bg-white rounded-lg p-2.5 text-sm text-blue-800 relative">
                            {help.templateMessage}
                            <button 
                              onClick={() => copyTemplate(help.templateMessage!)}
                              className="absolute top-1.5 right-1.5 p-1 rounded hover:bg-blue-100 transition-colors"
                              title="Copy"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const requiredCount = requirements.filter((r) => r.isRequired).length;
  const optionalCount = requirements.length - requiredCount;
  const completedCount = requirements.filter((r) => r.status === 'completed').length;

  return (
    <div className="w-full">
      {/* Progress Header */}
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/20">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold">Your Progress</span>
          <span className="text-2xl font-bold text-primary">{progress}%</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-500" 
            style={{ width: `${progress}%` }} 
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {completedCount} of {requirements.length} items done
          {requiredCount > 0 && ` (${requiredCount} must-have)`}
        </p>
      </div>

      {/* Requirements Breakdown */}
      <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <AlertCircle size={18} /> What's Normal for This Job
        </h3>
        <ul className="space-y-1.5 text-sm text-blue-800">
          <li>• Most {jobType || 'these'} permits need: {requiredCount} required documents</li>
          <li>• Timeline: Usually takes 2-4 weeks from start to approval</li>
          <li>• Permit fee: ~$50-150 (varies by city)</li>
          <li>• Does NOT include the actual work cost</li>
        </ul>
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-3 text-xs">
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">
          <AlertCircle size={12} /> Not started
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">
          <Circle size={12} /> Working on it
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
          <Check size={12} /> Complete
        </span>
      </div>

      {/* Requirements by Category */}
      <div className="space-y-2">
        {renderCategory('document', categorized.documents)}
        {renderCategory('license', categorized.licenses)}
        {renderCategory('insurance', categorized.insurance)}
        {renderCategory('drawing', categorized.drawings)}
        {renderCategory('inspection', categorized.inspections)}
        {renderCategory('fee', categorized.fees)}
      </div>

      {requirements.length === 0 && (
        <div className="text-center py-12 text-muted-foreground bg-muted rounded-xl">
          <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
          <p className="font-medium">No requirements found</p>
          <p className="text-sm mt-1">Try selecting a different job type</p>
        </div>
      )}

      {/* Document Scanner Modal */}
      {scanningForReq && (
        <DocumentScanner
          onCapture={handleScanCapture}
          onCancel={() => setScanningForReq(null)}
        />
      )}
    </div>
  );
}
