import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, DollarSign, Clock, FileText, MessageCircle, Download, Phone, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/button';
import { ActionCard, SummaryCard } from '@/components/new-ui/ActionCard';
import { useJob } from '@/hooks/useJobs';
import { useDocumentUpload } from '@/services/storage';
import type { Job, Requirement } from '@/types/permit';
import { calculateProgress } from '@/services/requirements';

export default function WizardPageSimple() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { job, loading, refresh } = useJob(jobId || '');
  const { upload } = useDocumentUpload();
  
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  // Calculate stats
  const progress = job ? calculateProgress(job.requirements) : 0;
  const completedCount = job?.requirements.filter(r => r.status === 'completed').length || 0;
  const totalCount = job?.requirements.length || 0;
  const requiredCount = job?.requirements.filter(r => r.isRequired).length || 0;
  const requiredCompleted = job?.requirements.filter(r => r.isRequired && r.status === 'completed').length || 0;

  const handleUpload = useCallback(async (requirementId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !jobId) return;

      setUploadingId(requirementId);
      
      try {
        const result = await upload(jobId, file, requirementId);
        if (result.success) {
          toast.success('Document uploaded successfully');
          refresh();
        } else {
          toast.error(result.error || 'Upload failed');
        }
      } catch (error) {
        toast.error('Upload failed');
      } finally {
        setUploadingId(null);
      }
    };
    
    input.click();
  }, [jobId, upload, refresh]);

  const handleAction = useCallback((requirementId: string) => {
    const req = job?.requirements.find(r => r.id === requirementId);
    if (req?.sourceUrl) {
      window.open(req.sourceUrl, '_blank');
    } else {
      toast.info('Coming soon: Direct form integration');
    }
  }, [job]);

  const handleBack = () => {
    navigate('/');
  };

  const handleExport = () => {
    toast.info('Export feature coming soon');
  };

  if (loading) {
    return (
      <PageWrapper className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading your checklist...</p>
        </div>
      </PageWrapper>
    );
  }

  if (!job) {
    return (
      <PageWrapper className="pt-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText size={32} className="text-gray-400" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Job not found</h1>
        <p className="text-gray-500 mb-6">This checklist may have expired</p>
        <Button onClick={() => navigate('/')}>Start New Checklist</Button>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b border-gray-100 -mx-4 px-4 py-3 mb-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="text-center">
            <h1 className="font-semibold text-gray-900">My Permit Checklist</h1>
            <p className="text-xs text-gray-500">{completedCount}/{totalCount} completed</p>
          </div>
          
          <button
            onClick={handleExport}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600"
          >
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        {progress === 100 && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-xs font-medium text-green-600 mt-2 flex items-center justify-center gap-1"
          >
            <CheckCircle2 size={14} />
            Ready to submit!
          </motion.p>
        )}
      </div>

      {/* Summary Cards */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="grid grid-cols-3 gap-3">
          <SummaryCard
            label="Cost"
            value={job.estimatedCost || '~$88'}
            icon={DollarSign}
            color="bg-green-500"
          />
          <SummaryCard
            label="Timeline"
            value={job.estimatedTimeline || '~4 Days'}
            icon={Clock}
            color="bg-blue-500"
          />
          <SummaryCard
            label="Docs"
            value={`${completedCount}/${totalCount}`}
            icon={FileText}
            color="bg-purple-500"
          />
        </div>
      </div>

      {/* Checklist */}
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Start Here</h2>
          <span className="text-xs text-gray-500">
            {requiredCompleted}/{requiredCount} required done
          </span>
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {job.requirements.map((req, index) => (
              <ActionCard
                key={req.id}
                requirement={req}
                index={index}
                onUpload={handleUpload}
                onAction={handleAction}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Empty state */}
        {job.requirements.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500">No requirements found</p>
            <p className="text-sm text-gray-400 mt-1">
              Try refreshing or contact support
            </p>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => toast.info('Quote feature coming soon')}
          >
            Generate Quote
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              const dept = job.jurisdiction === 'ST_PETERSBURG' ? '(727) 893-7221' :
                          job.jurisdiction === 'CLEARWATER' ? '(727) 562-4567' :
                          job.jurisdiction === 'LARGO' ? '(727) 587-6710' :
                          '(727) 464-3888';
              window.open(`tel:${dept}`);
            }}
          >
            <Phone size={16} className="mr-2" />
            Need Help?
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}
