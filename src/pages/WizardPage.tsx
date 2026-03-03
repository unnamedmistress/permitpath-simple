import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, FileText, CheckCircle, Clock, AlertCircle, ExternalLink, Phone, Printer, Video, MessageCircle, Users, Check, ChevronRight, Download, Camera, MapPin } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import Button from '@/components/shared/Button';
import RequirementsDisplay from '@/components/requirements/RequirementsDisplay';
import CostCalculator from '@/components/pinellas/CostCalculator';
import FormDownloader from '@/components/pinellas/FormDownloader';
import TimelineViewer from '@/components/pinellas/TimelineViewer';
import NextActionCard from '@/components/shared/NextActionCard';
import ProgressCelebration from '@/components/shared/ProgressCelebration';
import { getJobFromMemory } from './NewJobPage';
import { Job, Requirement } from '@/types/permit';
import { calculateProgress, categorizeRequirements } from '@/services/requirements';
import {
  CLEARWATER_BUILDING_DEPT,
  LARGO_BUILDING_DEPT,
  PINELLAS_COUNTY_BUILDING,
  ST_PETE_BUILDING_DEPT,
  formatPhoneLink
} from '@/data/jurisdictionData';

const jurisdictionDepartmentMap = {
  PINELLAS_COUNTY: PINELLAS_COUNTY_BUILDING,
  ST_PETERSBURG: ST_PETE_BUILDING_DEPT,
  CLEARWATER: CLEARWATER_BUILDING_DEPT,
  LARGO: LARGO_BUILDING_DEPT,
  PALM_HARBOR: PINELLAS_COUNTY_BUILDING
} as const;

// Improved Permit Journey Timeline
const permitJourneyStages = [
  { 
    id: 'checklist',
    title: 'Create job', 
    description: 'You just did this!',
    duration: '',
    icon: Check,
    status: 'complete' as const
  },
  { 
    id: 'documents',
    title: 'Get your documents', 
    description: 'Gather your paperwork',
    duration: '1-3 days',
    icon: FileText,
    status: 'current' as const
  },
  { 
    id: 'submit',
    title: 'Submit to city', 
    description: 'We will show you how',
    duration: '30 min',
    icon: ExternalLink,
    status: 'upcoming' as const
  },
  { 
    id: 'review',
    title: 'Wait for approval', 
    description: 'City checks your work',
    duration: '2-4 weeks',
    icon: Clock,
    status: 'upcoming' as const
  },
  { 
    id: 'approved',
    title: 'You are approved!', 
    description: 'Start your project',
    duration: '',
    icon: CheckCircle,
    status: 'upcoming' as const
  }
];

// Common questions for the help section
const commonQuestions = [
  'What if I am working with a general contractor?',
  'Do I need to do an inspection?',
  'What if the city rejects my application?'
];

// Generate PDF content for checklist
function generateChecklistPDF(job: Job): string {
  const department = jurisdictionDepartmentMap[job.jurisdiction] || PINELLAS_COUNTY_BUILDING;
  const categorized = categorizeRequirements(job.requirements);
  
  const completedCount = job.requirements.filter(r => r.status === 'completed').length;
  const requiredCount = job.requirements.filter(r => r.isRequired).length;
  
  let pdfContent = `
    <html>
    <head>
      <title>Permit Checklist - ${job.jobType.replace(/_/g, ' ')}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
        h1 { color: #1a365d; border-bottom: 3px solid #3182ce; padding-bottom: 10px; }
        h2 { color: #2d3748; margin-top: 30px; }
        .header-info { background: #ebf8ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .job-info { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
        .checklist { margin: 20px 0; }
        .checklist-item { display: flex; align-items: flex-start; gap: 10px; padding: 12px; margin: 8px 0; border: 1px solid #e2e8f0; border-radius: 6px; }
        .checkbox { width: 20px; height: 20px; border: 2px solid #3182ce; border-radius: 4px; flex-shrink: 0; margin-top: 2px; }
        .checkbox.checked { background: #3182ce; }
        .required { background: #fed7d7; }
        .completed { background: #c6f6d5; }
        .category-header { background: #e2e8f0; padding: 10px 15px; margin-top: 20px; font-weight: bold; color: #2d3748; border-radius: 6px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; font-size: 14px; color: #4a5568; }
        .contact-box { background: #f7fafc; padding: 15px; border-radius: 6px; margin-top: 20px; }
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>🔨 PERMIT CHECKLIST</h1>
      
      <div class="header-info">
        <h2>${job.jobType.replace(/_/g, ' ')}</h2>
        <div class="job-info">
          <div><strong>Job #:</strong> ${job.id}</div>
          <div><strong>Date:</strong> ${job.createdAt.toLocaleDateString()}</div>
        </div>
        <div class="info-row">
          <span><strong>Property:</strong></span>
          <span>${job.address}</span>
        </div>
        <div class="info-row">
          <span><strong>Jurisdiction:</strong></span>
          <span>${job.jurisdiction.replace(/_/g, ' ')}</span>
        </div>
        <div class="info-row">
          <span><strong>Progress:</strong></span>
          <span>${completedCount} of ${job.requirements.length} complete (${requiredCount} required)</span>
        </div>
      </div>

      <h2>📋 Your Checklist</h2>
      <p>Check off items as you complete them. Required items are marked.</p>
  `;

  // Add requirements by category
  const categories = [
    { key: 'documents', label: '📄 Documents', items: categorized.documents },
    { key: 'licenses', label: '🏆 Licenses', items: categorized.licenses },
    { key: 'insurance', label: '🛡️ Insurance', items: categorized.insurance },
    { key: 'drawings', label: '📐 Drawings', items: categorized.drawings },
    { key: 'inspections', label: '🔍 Inspections', items: categorized.inspections },
    { key: 'fees', label: '💰 Fees', items: categorized.fees },
  ];

  categories.forEach(cat => {
    if (cat.items.length > 0) {
      pdfContent += `<div class="category-header">${cat.label} (${cat.items.length})</div>`;
      cat.items.forEach(req => {
        const isCompleted = req.status === 'completed';
        const className = `checklist-item ${req.isRequired ? 'required' : ''} ${isCompleted ? 'completed' : ''}`;
        pdfContent += `
          <div class="${className}">
            <div class="checkbox ${isCompleted ? 'checked' : ''}"></div>
            <div style="flex: 1;">
              <strong>${req.title}</strong>
              ${req.isRequired ? ' <span style="color: #c53030;">(REQUIRED)</span>' : ''}
              <br><span style="color: #4a5568; font-size: 14px;">${req.description}</span>
              ${req.plainLanguageWhy ? `<br><span style="color: #718096; font-size: 12px; font-style: italic;">Why: ${req.plainLanguageWhy}</span>` : ''}
            </div>
          </div>
        `;
      });
    }
  });

  pdfContent += `
      <div class="footer">
        <h2>📞 Next Steps</h2>
        <ol>
          <li>Gather all required documents</li>
          <li>Submit your application to the city</li>
          <li>Wait for approval (typically 2-4 weeks)</li>
          <li>Schedule inspections as needed</li>
        </ol>
        
        <div class="contact-box">
          <h3>🏢 ${department.name}</h3>
          <p><strong>Phone:</strong> ${department.phone}</p>
          <p><strong>Hours:</strong> ${department.hours}</p>
          ${department.website ? `<p><strong>Website:</strong> ${department.website}</p>` : ''}
          <p><strong>Address:</strong><br>${department.address?.replace(/\n/g, '<br>') || 'Contact for address'}</p>
        </div>
        
        <p style="margin-top: 30px; text-align: center; color: #718096; font-size: 12px;">
          Generated by PermitPath • ${new Date().toLocaleDateString()}<br>
          Questions? Call (727) 464-3199
        </p>
      </div>
      
      <script>
        // Auto-print on load for better UX
        window.onload = function() {
          setTimeout(() => window.print(), 500);
        };
      </script>
    </body>
    </html>
  `;

  return pdfContent;
}

export default function WizardPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [previousProgress, setPreviousProgress] = useState<number>(0);

  useEffect(() => {
    if (!jobId) {
      navigate('/new');
      return;
    }

    const foundJob = getJobFromMemory(jobId);
    if (foundJob) {
      setJob(foundJob);
    } else {
      toast.error('Job not found');
      navigate('/new');
    }
    setLoading(false);
  }, [jobId, navigate]);

  const handleRequirementStatusChange = (reqId: string, status: Requirement['status']) => {
    if (!job) return;

    // Store current progress before update
    setPreviousProgress(calculateProgress(job.requirements));

    const updatedRequirements = job.requirements.map((r) => (r.id === reqId ? { ...r, status } : r));
    const updatedJob = { ...job, requirements: updatedRequirements };
    setJob(updatedJob);
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCapturedPhotos([...capturedPhotos, url]);
      toast.success('Photo added!', { description: 'We will review this with your permit.' });
    }
  };

  const handlePrintChecklist = () => {
    if (!job) return;
    
    const pdfContent = generateChecklistPDF(job);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(pdfContent);
      printWindow.document.close();
    }
  };

  const getStatusIcon = (status: Job['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'submitted':
      case 'under_review':
        return <Clock className="text-blue-500" size={20} />;
      case 'rejected':
        return <AlertCircle className="text-red-500" size={20} />;
      default:
        return <FileText className="text-muted-foreground" size={20} />;
    }
  };

  const getStatusLabel = (status: Job['status']) => {
    const labels: Record<Job['status'], string> = {
      draft: 'Draft',
      requirements_pending: 'Requirements Pending',
      documents_pending: 'Documents Pending',
      ready_to_submit: 'Ready to Submit',
      submitted: 'Submitted',
      under_review: 'Under Review',
      approved: 'Approved',
      rejected: 'Rejected',
      closed: 'Closed'
    };
    return labels[status];
  };

  // Personalized guidance based on job state
  const getPersonalizedGuidance = () => {
    if (!job) return null;
    
    const progress = calculateProgress(job.requirements);
    const hasLicense = job.requirements.some(r => 
      r.category === 'license' && r.status === 'completed'
    );
    const hasInsurance = job.requirements.some(r => 
      r.category === 'insurance' && r.status === 'completed'
    );
    
    // Guidance for missing license
    if (!hasLicense && job.requirements.some(r => r.category === 'license')) {
      return {
        type: 'warning',
        title: 'You will need a contractor license',
        message: 'Florida requires a contractor license for this work. If you do not have one yet, it takes 2-4 weeks to get. Want instructions?',
        action: 'Learn how to get licensed',
        actionLink: 'https://www.myfloridalicense.com/wl11.asp'
      };
    }
    
    // Guidance for missing insurance
    if (!hasInsurance && job.requirements.some(r => r.category === 'insurance')) {
      return {
        type: 'info',
        title: 'Need insurance certificate?',
        message: 'Call your insurance agent and ask for a Certificate of Liability. Most jobs need $1M coverage.',
        action: 'Get template message',
        actionFn: () => {
          const template = `Hi, I need a Certificate of Liability Insurance for a ${job.jobType.replace(/_/g, ' ')} permit. The county needs this to approve my permit. Can you email me a PDF?`;
          navigator.clipboard.writeText(template);
          toast.success('Template copied!', { description: 'Paste this into a text or email to your agent.' });
        }
      };
    }
    
    // Progress-based encouragement
    if (progress === 0) {
      return {
        type: 'info',
        title: 'Just getting started?',
        message: 'Start with the documents you already have. Tap each item to see what you need.',
        action: null
      };
    }
    
    if (progress > 0 && progress < 50) {
      return {
        type: 'encouragement',
        title: 'Great start!',
        message: `You are ${progress}% done. Keep going - you are making good progress!`,
        action: null
      };
    }
    
    if (progress >= 50 && progress < 100) {
      return {
        type: 'encouragement',
        title: 'Almost there!',
        message: `You are ${progress}% done. Just a few more items to go!`,
        action: null
      };
    }
    
    return null;
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </PageWrapper>
    );
  }

  if (!job) return null;

  const progress = calculateProgress(job.requirements);
  const department = jurisdictionDepartmentMap[job.jurisdiction] || PINELLAS_COUNTY_BUILDING;
  const remainingRequired = job.requirements.filter((r) => r.status !== 'completed' && r.isRequired).length;
  const guidance = getPersonalizedGuidance();
  
  // Determine current stage based on progress
  const getCurrentStageIndex = () => {
    if (progress === 100) return 4;
    if (progress > 0) return 1;
    return 0;
  };
  
  const currentStageIndex = getCurrentStageIndex();

  return (
    <PageWrapper hasBottomNav={false}>
      <header className="border-b bg-card">
        <div className="container max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft size={18} className="mr-2" />
              Back
            </Button>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold truncate">{job.jobType.replace(/_/g, ' ')}</h1>
              <p className="text-sm text-muted-foreground truncate">{job.address}</p>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted shrink-0">
              {getStatusIcon(job.status)}
              <span className="text-sm font-medium hidden sm:inline">{getStatusLabel(job.status)}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Personalized Guidance Banner */}
            {guidance && (
              <div className={`p-4 rounded-xl border ${
                guidance.type === 'warning' ? 'bg-amber-50 border-amber-200' :
                guidance.type === 'encouragement' ? 'bg-green-50 border-green-200' :
                'bg-blue-50 border-blue-200'
              }`}>
                <h3 className={`font-semibold mb-1 ${
                  guidance.type === 'warning' ? 'text-amber-900' :
                  guidance.type === 'encouragement' ? 'text-green-900' :
                  'text-blue-900'
                }`}>
                  {guidance.title}
                </h3>
                <p className={`text-sm ${
                  guidance.type === 'warning' ? 'text-amber-800' :
                  guidance.type === 'encouragement' ? 'text-green-800' :
                  'text-blue-800'
                }`}>
                  {guidance.message}
                </p>
                {(guidance.action || guidance.actionLink) && (
                  <div className="mt-3">
                    {guidance.actionLink ? (
                      <a 
                        href={guidance.actionLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium underline"
                      >
                        {guidance.action}
                        <ExternalLink size={14} />
                      </a>
                    ) : guidance.actionFn ? (
                      <button 
                        onClick={guidance.actionFn}
                        className="inline-flex items-center gap-1.5 text-sm font-medium underline"
                      >
                        {guidance.action}
                      </button>
                    ) : null}
                  </div>
                )}
              </div>
            )}

            {/* Progress Celebration */}
            <ProgressCelebration progress={progress} />

            {/* Next Action Card */}
            <NextActionCard 
              requirements={job.requirements}
              onAction={(action, requirementId) => {
                if (action === 'upload' && requirementId) {
                  // Scroll to the requirement
                  const element = document.getElementById(`req-${requirementId}`);
                  element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else if (action === 'submit') {
                  window.open(department.onlinePortal || department.website, '_blank');
                }
              }}
            />

            {/* Photo Capture Section */}
            <div className="p-4 rounded-xl border bg-card">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Camera size={18} className="text-primary" />
                Job Site Photos
              </h3>
              
              {capturedPhotos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {capturedPhotos.map((photo, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                      <img src={photo} alt={`Job photo ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  id="job-photo-capture"
                  className="hidden"
                  onChange={handlePhotoCapture}
                />
                <label 
                  htmlFor="job-photo-capture"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white cursor-pointer hover:bg-primary/90 transition-colors text-sm"
                >
                  <Camera size={16} />
                  {capturedPhotos.length === 0 ? 'Take a photo' : 'Add another photo'}
                </label>
                <p className="text-xs text-muted-foreground">
                  Show us what needs fixing
                </p>
              </div>
            </div>

            {/* Requirements Checklist */}
            <div className="p-4 sm:p-6 rounded-xl border bg-card">
              <h2 className="text-lg font-semibold mb-4">Your Permit Checklist</h2>
              <RequirementsDisplay 
                requirements={job.requirements} 
                onStatusChange={handleRequirementStatusChange}
                onDocumentUpload={(reqId, file) => {
                  // Create document object
                  const newDoc = {
                    id: `doc-${Date.now()}`,
                    jobId: job.id,
                    name: file.name,
                    type: file.type,
                    url: URL.createObjectURL(file),
                    requirementId: reqId,
                    uploadedAt: new Date(),
                    status: 'uploaded' as const
                  };
                  
                  // Update job with new document and mark requirement as completed
                  const updatedJob = {
                    ...job,
                    documents: [...job.documents, newDoc],
                    requirements: job.requirements.map(r => 
                      r.id === reqId ? { ...r, status: 'completed' as const } : r
                    ),
                    updatedAt: new Date()
                  };
                  setJob(updatedJob);
                  toast.success(`${file.name} uploaded!`);
                }}
                jobType={job.jobType.replace(/_/g, ' ')}
              />
            </div>

            {/* Permit Journey Timeline */}
            <div className="p-4 sm:p-6 rounded-xl border bg-card">
              <h2 className="text-lg font-semibold mb-4">What Happens Next</h2>
              
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-muted" />
                
                <div className="space-y-0">
                  {permitJourneyStages.map((stage, index) => {
                    const isComplete = index < currentStageIndex;
                    const isCurrent = index === currentStageIndex;
                    const Icon = stage.icon;
                    
                    return (
                      <div key={stage.id} className="relative flex gap-4 pb-6 last:pb-0">
                        {/* Status dot */}
                        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          isComplete ? 'bg-green-500 text-white' : 
                          isCurrent ? 'bg-primary text-white ring-4 ring-primary/20' : 
                          'bg-muted text-muted-foreground'
                        }`}>
                          <Icon size={16} />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 pt-0.5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className={`font-semibold ${isCurrent ? 'text-primary' : ''}`}>
                                {stage.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {stage.description}
                              </p>
                            </div>
                            {stage.duration && (
                              <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground shrink-0">
                                {stage.duration}
                              </span>
                            )}
                          </div>
                          
                          {/* Action buttons for current stage */}
                          {isCurrent && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {stage.id === 'documents' && (
                                <>
                                  <Button variant="outline" size="sm">
                                    <Video size={14} className="mr-1.5" />
                                    Watch tutorial
                                  </Button>
                                  <Button variant="outline" size="sm" onClick={handlePrintChecklist}>
                                    <Printer size={14} className="mr-1.5" />
                                    Print checklist
                                  </Button>
                                </>
                              )}
                              {stage.id === 'submit' && (
                                <Button variant="default" size="sm">
                                  <ExternalLink size={14} className="mr-1.5" />
                                  Open city website
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Success / Next Steps Banner */}
            {progress === 100 ? (
              <div className="p-6 rounded-xl border border-green-200 bg-green-50">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                    <CheckCircle className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-green-900">All done! Ready to submit</h3>
                    <p className="text-green-700 mt-1">
                      You have everything you need. Submit your permit application to the city now.
                    </p>
                    <div className="flex flex-wrap gap-3 mt-4">
                      <Button 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          if (department.onlinePortal || department.website) {
                            window.open(department.onlinePortal || department.website, '_blank', 'noopener,noreferrer');
                          }
                        }}
                      >
                        <ExternalLink size={16} className="mr-2" />
                        Submit to City
                      </Button>
                      <Button variant="outline" onClick={handlePrintChecklist}>
                        <Printer size={16} className="mr-2" />
                        Print for Records
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-xl border bg-card">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <Clock className="text-amber-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">Keep Going!</h3>
                    <p className="text-muted-foreground mt-1">
                      You are {progress}% done. {remainingRequired} required {remainingRequired === 1 ? 'item' : 'items'} left to complete.
                    </p>
                    <div className="flex flex-wrap gap-3 mt-4">
                      <Button variant="outline" size="sm" onClick={handlePrintChecklist}>
                        <Printer size={16} className="mr-1.5" />
                        Print checklist
                      </Button>
                      <Button variant="outline" size="sm" onClick={handlePrintChecklist}>
                        <Download size={16} className="mr-1.5" />
                        Save as PDF
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Details Card */}
            <div className="p-4 rounded-xl border bg-card">
              <h3 className="font-semibold mb-3">Job Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium text-right">{job.jobType.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium text-right">{job.jurisdiction.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Started</span>
                  <span className="font-medium">{job.createdAt.toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Documents Card */}
            <div className="p-4 rounded-xl border bg-card">
              <h3 className="font-semibold mb-3">Your Documents</h3>
              {job.documents.length === 0 ? (
                <div className="text-center py-4 bg-muted rounded-lg">
                  <FileText size={24} className="mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">No documents yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tap checklist items to upload
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {job.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted">
                      <FileText size={16} className="text-primary" />
                      <span className="truncate">{doc.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Need Help Section - Improved */}
            <div className="p-4 rounded-xl border bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-1">Need Help?</h3>
              <p className="text-sm text-blue-700 mb-4">Pick how you want help</p>
              
              <div className="space-y-2">
                <a 
                  href={formatPhoneLink(department.phone)}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white border border-blue-200 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <Phone size={18} className="text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">Call the County</p>
                    <p className="text-xs text-muted-foreground">{department.phone}</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </a>
                
                <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-white border border-blue-200 hover:border-blue-300 hover:shadow-sm transition-all text-left">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                    <MessageCircle size={18} className="text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">Chat with AI</p>
                    <p className="text-xs text-muted-foreground">Ask anything about your permit</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>
                
                <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-white border border-blue-200 hover:border-blue-300 hover:shadow-sm transition-all text-left">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <Users size={18} className="text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">Hire a Pro</p>
                    <p className="text-xs text-muted-foreground">Pre-vetted permit specialists</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>
              </div>
              
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-xs text-blue-600 font-medium mb-2">County Hours: {department.hours}</p>
              </div>
            </div>

            {/* Cost Calculator - NEW */}
            <CostCalculator 
              jobType={job.jobType} 
              jurisdiction={job.jurisdiction}
            />

            {/* Form Downloader - NEW */}
            <FormDownloader 
              jobType={job.jobType}
              contractorProfile={{
                businessName: 'Your Company', // Would come from user profile
                licenseNumber: 'FL-12345',
              }}
            />

            {/* Timeline Viewer - NEW */}
            <TimelineViewer 
              jobType={job.jobType}
              isExpress={['RE_ROOFING', 'WINDOW_DOOR_REPLACEMENT', 'WATER_HEATER', 'AC_HVAC_CHANGEOUT'].includes(job.jobType)}
            />

            {/* Common Questions */}
            <div className="p-4 rounded-xl border bg-card">
              <h3 className="font-semibold mb-3">Common Questions</h3>
              <div className="space-y-2">
                {commonQuestions.map((question) => (
                  <button
                    key={question}
                    onClick={() => setExpandedQuestion(expandedQuestion === question ? null : question)}
                    className="w-full text-left"
                  >
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                      <span className="text-sm">{question}</span>
                      <ChevronRight 
                        size={16} 
                        className={`text-muted-foreground transition-transform ${expandedQuestion === question ? 'rotate-90' : ''}`} 
                      />
                    </div>
                    {expandedQuestion === question && (
                      <div className="p-3 text-sm text-muted-foreground bg-muted/50 rounded-b-lg -mt-2 pt-4">
                        Contact the county building department for specific guidance on this question.
                        Every situation is different and they can give you the most accurate answer.
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
