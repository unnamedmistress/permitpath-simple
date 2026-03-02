import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, FileText, CheckCircle, Clock, AlertCircle, ExternalLink, Phone, Printer, Video, MessageCircle, Users, Check, ChevronRight } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import Button from '@/components/shared/Button';
import RequirementsDisplay from '@/components/requirements/RequirementsDisplay';
import { getJobFromMemory } from './NewJobPage';
import { Job, Requirement } from '@/types/permit';
import { calculateProgress } from '@/services/requirements';
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

export default function WizardPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

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

    const updatedRequirements = job.requirements.map((r) => (r.id === reqId ? { ...r, status } : r));
    const updatedJob = { ...job, requirements: updatedRequirements };
    setJob(updatedJob);
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
            {/* Requirements Checklist */}
            <div className="p-4 sm:p-6 rounded-xl border bg-card">
              <h2 className="text-lg font-semibold mb-4">Your Permit Checklist</h2>
              <RequirementsDisplay 
                requirements={job.requirements} 
                onStatusChange={handleRequirementStatusChange}
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
                                  <Button variant="outline" size="sm" onClick={() => window.print()}>
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
                      <Button variant="outline" onClick={() => window.print()}>
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
                      <Button variant="outline" size="sm" onClick={() => window.print()}>
                        <Printer size={16} className="mr-1.5" />
                        Print checklist
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
