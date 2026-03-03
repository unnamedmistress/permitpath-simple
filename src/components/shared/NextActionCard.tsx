import { ArrowRight, Upload, FileCheck, ExternalLink, AlertCircle } from 'lucide-react';
import Button from './Button';
import { Requirement } from '@/types/permit';

interface NextActionCardProps {
  requirements: Requirement[];
  onAction: (action: string, requirementId?: string) => void;
}

export default function NextActionCard({ requirements, onAction }: NextActionCardProps) {
  // Find the next logical action
  const getNextAction = () => {
    // 1. Check for incomplete required documents
    const incompleteRequired = requirements.filter(r => 
      r.isRequired && r.status !== 'completed'
    );

    if (incompleteRequired.length > 0) {
      // Prioritize by category
      const priority = ['license', 'insurance', 'document', 'drawing', 'fee'];
      const nextReq = incompleteRequired.sort((a, b) => {
        const aIndex = priority.indexOf(a.category);
        const bIndex = priority.indexOf(b.category);
        return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
      })[0];

      return {
        type: 'upload' as const,
        title: `Upload: ${nextReq.title}`,
        description: nextReq.description,
        requirementId: nextReq.id,
        icon: Upload,
        actionText: 'Upload Now',
        urgency: nextReq.category === 'license' || nextReq.category === 'insurance' ? 'high' : 'normal'
      };
    }

    // 2. Check for optional items that might help
    const optionalIncomplete = requirements.filter(r => 
      !r.isRequired && r.status !== 'completed'
    );

    if (optionalIncomplete.length > 0) {
      return {
        type: 'optional' as const,
        title: 'Optional: Add more details',
        description: `${optionalIncomplete.length} optional item${optionalIncomplete.length > 1 ? 's' : ''} could strengthen your application`,
        icon: FileCheck,
        actionText: 'Review Optional',
        urgency: 'low' as const
      };
    }

    // 3. All done - ready to submit
    return {
      type: 'submit' as const,
      title: 'Ready to Submit!',
      description: 'You have everything needed. Submit your permit to the county now.',
      icon: ExternalLink,
      actionText: 'Submit to County',
      urgency: 'normal' as const
    };
  };

  const action = getNextAction();
  const Icon = action.icon;

  const urgencyStyles = {
    high: 'bg-red-50 border-red-200',
    normal: 'bg-blue-50 border-blue-200',
    low: 'bg-gray-50 border-gray-200'
  };

  const urgencyTextStyles = {
    high: 'text-red-800',
    normal: 'text-blue-800',
    low: 'text-gray-700'
  };

  return (
    <div className={`rounded-xl border p-4 ${urgencyStyles[action.urgency]}`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0`}>
          <Icon size={20} className={action.urgency === 'high' ? 'text-red-500' : 'text-blue-500'} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold ${urgencyTextStyles[action.urgency]}`}>
            {action.urgency === 'high' && (
              <span className="inline-flex items-center gap-1.5 mr-2">
                <AlertCircle size={14} />
                Priority
              </span>
            )}
            {action.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
          
          <Button 
            size="sm" 
            className="mt-3"
            onClick={() => onAction(action.type, action.requirementId)}
          >
            {action.actionText}
            <ArrowRight size={16} className="ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
