import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckSquare, 
  Calendar, 
  DollarSign, 
  HelpCircle,
  Check,
  Upload,
  ExternalLink,
  FileText,
  Clock,
  Phone,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Requirement } from '@/types/permit';
import { calculateProgress, categorizeRequirements } from '@/services/requirements';

interface TabbedChecklistProps {
  job: {
    id: string;
    jobType: string;
    address: string;
    jurisdiction: string;
    requirements: Requirement[];
    estimatedCost?: number;
    estimatedDays?: number;
  };
  onRequirementAction: (action: 'upload' | 'apply', requirementId: string) => void;
  onDocumentUpload?: (requirementId: string, file: File) => void;
}

type TabId = 'checklist' | 'timeline' | 'cost' | 'help';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  { id: 'checklist', label: 'Checklist', icon: <CheckSquare className="w-4 h-4" /> },
  { id: 'timeline', label: 'Timeline', icon: <Calendar className="w-4 h-4" /> },
  { id: 'cost', label: 'Cost', icon: <DollarSign className="w-4 h-4" /> },
  { id: 'help', label: 'Help', icon: <HelpCircle className="w-4 h-4" /> },
];

export default function TabbedChecklist({ 
  job, 
  onRequirementAction,
  onDocumentUpload 
}: TabbedChecklistProps) {
  const [activeTab, setActiveTab] = useState<TabId>('checklist');
  const [expandedRequirement, setExpandedRequirement] = useState<string | null>(null);

  const progress = calculateProgress(job.requirements);
  const completedCount = job.requirements.filter(r => r.status === 'completed').length;
  const requiredCount = job.requirements.filter(r => r.isRequired).length;
  const remainingRequired = job.requirements.filter(r => r.isRequired && r.status !== 'completed').length;
  
  const categorized = categorizeRequirements(job.requirements);

  const handleRequirementClick = (reqId: string) => {
    setExpandedRequirement(expandedRequirement === reqId ? null : reqId);
  };

  const handleFileUpload = (reqId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onDocumentUpload) {
      onDocumentUpload(reqId, file);
    }
  };

  return (
    <div className="w-full bg-card rounded-xl border shadow-sm overflow-hidden">
      {/* Summary Header - Always visible */}
      <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-b">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {job.jobType.replace(/_/g, ' ')}
            </h2>
            <p className="text-sm text-muted-foreground">{job.address}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{progress}%</div>
            <p className="text-xs text-muted-foreground">Complete</p>
          </div>
        </div>

        {/* 3 Key Metrics */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-card rounded-lg p-3 text-center border">
            <div className="text-lg font-bold text-foreground">
              ~${job.estimatedCost || 88}
            </div>
            <p className="text-xs text-muted-foreground">Permit Fee</p>
          </div>
          <div className="bg-card rounded-lg p-3 text-center border">
            <div className="text-lg font-bold text-foreground">
              ~{job.estimatedDays || 4} Days
            </div>
            <p className="text-xs text-muted-foreground">Timeline</p>
          </div>
          <div className="bg-card rounded-lg p-3 text-center border">
            <div className="text-lg font-bold text-foreground">
              {remainingRequired}
            </div>
            <p className="text-xs text-muted-foreground">Items Left</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b bg-muted/30">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
              'focus:outline-none focus:bg-muted',
              activeTab === tab.id 
                ? 'text-primary border-b-2 border-primary bg-card' 
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4 min-h-[300px]">
        <AnimatePresence mode="wait">
          {/* CHECKLIST TAB */}
          {activeTab === 'checklist' && (
            <motion.div
              key="checklist"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {remainingRequired === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-900">All Done!</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Ready to submit your permit application
                  </p>
                  <button className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
                    Submit to City
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Complete these {remainingRequired} required items:
                  </p>
                  
                  {/* Requirements List */}
                  <div className="space-y-3">
                    {job.requirements
                      .filter(r => r.isRequired && r.status !== 'completed')
                      .map((req) => (
                        <div
                          key={req.id}
                          className={cn(
                            'border rounded-xl overflow-hidden transition-all',
                            expandedRequirement === req.id 
                              ? 'border-primary shadow-md' 
                              : 'border-border hover:border-primary/30'
                          )}
                        >
                          {/* Requirement Header */}
                          <button
                            onClick={() => handleRequirementClick(req.id)}
                            className="w-full flex items-center gap-3 p-4 text-left"
                          >
                            <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                              <div className="w-3 h-3 rounded-full bg-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-foreground">
                                {req.title}
                              </h4>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {req.description}
                              </p>
                            </div>
                            <ChevronRight 
                              className={cn(
                                'w-5 h-5 text-muted-foreground transition-transform',
                                expandedRequirement === req.id && 'rotate-90'
                              )} 
                            />
                          </button>

                          {/* Expanded Content */}
                          <AnimatePresence>
                            {expandedRequirement === req.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t bg-muted/30"
                              >
                                <div className="p-4 space-y-4">
                                  {req.plainLanguageWhy && (
                                    <p className="text-sm text-muted-foreground">
                                      <strong>Why:</strong> {req.plainLanguageWhy}
                                    </p>
                                  )}
                                  
                                  {req.whoCanHelp && (
                                    <p className="text-sm text-muted-foreground">
                                      <strong>Who can help:</strong> {req.whoCanHelp}
                                    </p>
                                  )}

                                  {/* Action Buttons */}
                                  <div className="flex flex-wrap gap-2">
                                    {req.actionType === 'upload' && (
                                      <>
                                        <label className="flex-1 min-w-[120px]">
                                          <input
                                            type="file"
                                            className="hidden"
                                            onChange={(e) => handleFileUpload(req.id, e)}
                                            accept={req.acceptedFormats?.join(',')}
                                          />
                                          <span className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium cursor-pointer hover:bg-primary/90 transition-colors">
                                            <Upload className="w-4 h-4" />
                                            Upload
                                          </span>
                                        </label>
                                        {req.sourceUrl && (
                                          <a
                                            href={req.sourceUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                                          >
                                            <ExternalLink className="w-4 h-4" />
                                            Get Form
                                          </a>
                                        )}
                                      </>
                                    )}
                                    {req.actionType === 'apply_online' && (
                                      <a
                                        href={req.sourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                                      >
                                        <ExternalLink className="w-4 h-4" />
                                        Apply Online
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* TIMELINE TAB */}
          {activeTab === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <h3 className="font-semibold text-foreground">Permit Process Timeline</h3>
              
              <div className="space-y-3">
                {[
                  { stage: 'Submit Application', time: 'Today', status: 'pending' },
                  { stage: 'City Review', time: '2-4 weeks', status: 'pending' },
                  { stage: 'Inspections', time: 'During construction', status: 'pending' },
                  { stage: 'Final Approval', time: 'After passing inspection', status: 'pending' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 rounded-lg border">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{item.stage}</h4>
                      <p className="text-sm text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-1">Inspections Required</h4>
                <p className="text-sm text-blue-700">
                  Most projects require rough and final inspections. The city will schedule these after you submit.
                </p>
              </div>
            </motion.div>
          )}

          {/* COST TAB */}
          {activeTab === 'cost' && (
            <motion.div
              key="cost"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <h3 className="font-semibold text-foreground">Estimated Costs</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 rounded-lg border">
                  <span className="text-foreground">Permit Fee</span>
                  <span className="font-semibold">~${job.estimatedCost || 88}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg border">
                  <span className="text-foreground">Plan Review (if required)</span>
                  <span className="font-semibold">~$50-150</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg border">
                  <span className="text-foreground">Inspection Fees</span>
                  <span className="font-semibold">Included</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-primary/5 border-primary/20 border font-semibold">
                  <span className="text-foreground">Total Estimate</span>
                  <span className="text-primary">~${(job.estimatedCost || 88) + 100}</span>
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> These are estimates. Final fees depend on project valuation and jurisdiction.
                </p>
              </div>
            </motion.div>
          )}

          {/* HELP TAB */}
          {activeTab === 'help' && (
            <motion.div
              key="help"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <h3 className="font-semibold text-foreground">Need Help?</h3>
              
              <div className="space-y-3">
                <a
                  href="tel:+17274643199"
                  className="flex items-center gap-3 p-4 rounded-lg border hover:border-primary/50 hover:bg-muted/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">Call the County</h4>
                    <p className="text-sm text-muted-foreground">(727) 464-3199</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </a>

                <button className="w-full flex items-center gap-3 p-4 rounded-lg border hover:border-primary/50 hover:bg-muted/50 transition-colors text-left">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">Download Forms</h4>
                    <p className="text-sm text-muted-foreground">PDF applications & checklists</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>

                <button className="w-full flex items-center gap-3 p-4 rounded-lg border hover:border-primary/50 hover:bg-muted/50 transition-colors text-left">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">Chat with AI</h4>
                    <p className="text-sm text-muted-foreground">Ask questions about your permit</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Office Hours</h4>
                <p className="text-sm text-muted-foreground">
                  Monday - Friday<br />
                  8:00 AM - 5:00 PM
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
