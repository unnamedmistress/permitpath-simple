import { motion } from 'framer-motion';
import { FileText, CheckCircle2, Clock, AlertCircle, Upload, FileCheck, DollarSign, ExternalLink, ChevronRight, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Requirement } from '@/types/permit';

interface ActionCardProps {
  requirement: Requirement;
  index: number;
  onUpload?: (reqId: string) => void;
  onAction?: (reqId: string) => void;
}

const categoryIcons = {
  document: FileText,
  license: FileCheck,
  insurance: FileCheck,
  fee: DollarSign,
  inspection: Clock,
  drawing: FileText,
};

const categoryColors = {
  document: 'bg-blue-100 text-blue-600',
  license: 'bg-green-100 text-green-600',
  insurance: 'bg-purple-100 text-purple-600',
  fee: 'bg-amber-100 text-amber-600',
  inspection: 'bg-gray-100 text-gray-600',
  drawing: 'bg-indigo-100 text-indigo-600',
};

export function ActionCard({ requirement, index, onUpload, onAction }: ActionCardProps) {
  const Icon = categoryIcons[requirement.category] || FileText;
  const colorClass = categoryColors[requirement.category] || 'bg-gray-100 text-gray-600';
  
  const isCompleted = requirement.status === 'completed';
  const canUpload = requirement.actionType?.toLowerCase().includes('upload');
  const canAction = !isCompleted && requirement.actionType;
  
  const getButtonLabel = () => {
    if (isCompleted) return 'Done';
    if (canUpload) return 'Upload';
    if (requirement.actionType?.toLowerCase().includes('fill')) return 'Fill Out';
    if (requirement.actionType?.toLowerCase().includes('pay')) return 'Pay';
    if (requirement.actionType?.toLowerCase().includes('schedule')) return 'Schedule';
    return 'Action';
  };

  const handleClick = () => {
    if (isCompleted) return;
    if (canUpload) {
      onUpload?.(requirement.id);
    } else {
      onAction?.(requirement.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`
        relative overflow-hidden rounded-xl border transition-shadow
        ${isCompleted 
          ? 'bg-gray-50 border-gray-200' 
          : 'bg-white border-gray-200 shadow-sm hover:shadow-md'
        }
      `}
    >
      {/* Category badge */}
      {isCompleted && (
        <div className="absolute top-3 right-3">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
            <CheckCircle2 size={14} className="text-white" />
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Header with icon and title */}
        <div className="flex gap-3">
          <div className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center flex-shrink-0`}>
            <Icon size={20} />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-sm ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
              {requirement.title}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
              {requirement.description}
            </p>
          </div>
        </div>

        {/* Action section */}
        {!isCompleted && (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Required badge */}
              {requirement.isRequired && (
                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                  Required
                </span>
              )}
              
              {/* Formats hint */}
              {requirement.acceptedFormats && requirement.acceptedFormats.length > 0 && (
                <span className="text-xs text-gray-400">
                  {requirement.acceptedFormats.slice(0, 2).join(', ')}
                </span>
              )}
            </div>

            <Button
              size="sm"
              variant={canUpload ? "default" : "outline"}
              onClick={handleClick}
              className="gap-1.5"
            >
              {canUpload && <Upload size={14} />}
              {getButtonLabel()}
              <ChevronRight size={14} className="ml-0.5" />
            </Button>
          </div>
        )}

        {/* Why this is needed - collapsed by default, expandable */}
        {requirement.plainLanguageWhy && !isCompleted && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <details className="group">
              <summary className="flex items-center gap-1 text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                <HelpCircle size={12} />
                <span>Why is this needed?</span>
              </summary>
              <p className="mt-1.5 text-xs text-gray-500 pl-4">
                {requirement.plainLanguageWhy}
              </p>
              {requirement.whoCanHelp && (
                <p className="mt-1 text-xs text-gray-400 pl-4">
                  Who can help: {requirement.whoCanHelp}
                </p>
              )}
            </details>
          </div>
        )}
      </div>

      {/* Progress bar for completed items */}
      {isCompleted && (
        <div className="h-1 bg-green-500 absolute bottom-0 left-0 right-0" />
      )}
    </motion.div>
  );
}

// Compact version for cost/timeline summary
interface SummaryCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  color?: string;
}

export function SummaryCard({ label, value, icon: Icon, color = 'bg-blue-500' }: SummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg ${color} bg-opacity-10 flex items-center justify-center`}>
          <Icon size={16} className={color.replace('bg-', 'text-')} />
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="font-semibold text-gray-900 text-sm">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default ActionCard;
