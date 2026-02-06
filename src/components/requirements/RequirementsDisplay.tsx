import { useState } from 'react';
import { Check, Circle, AlertCircle, FileText, Drawing, ClipboardCheck, BadgeCheck, Shield, DollarSign } from 'lucide-react';
import { Requirement, RequirementCategory } from '@/types/permit';
import { categorizeRequirements, calculateProgress } from '@/services/requirements';
import Button from '@/components/shared/Button';

interface RequirementsDisplayProps {
  requirements: Requirement[];
  onStatusChange?: (id: string, status: Requirement['status']) => void;
  readOnly?: boolean;
}

const categoryIcons: Record<RequirementCategory, typeof FileText> = {
  document: FileText,
  drawing: Drawing,
  inspection: ClipboardCheck,
  license: BadgeCheck,
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

export default function RequirementsDisplay({ 
  requirements, 
  onStatusChange,
  readOnly = false 
}: RequirementsDisplayProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  const categorized = categorizeRequirements(requirements);
  const progress = calculateProgress(requirements);

  const handleToggleStatus = (req: Requirement) => {
    if (readOnly || !onStatusChange) return;
    
    const newStatus: Requirement['status'] = 
      req.status === 'completed' ? 'pending' : 'completed';
    onStatusChange(req.id, newStatus);
  };

  const renderCategory = (category: RequirementCategory, items: Requirement[]) => {
    if (items.length === 0) return null;
    
    const Icon = categoryIcons[category];
    const isExpanded = expandedCategory === category;
    const completedCount = items.filter(r => r.status === 'completed').length;
    
    return (
      <div key={category} className="border rounded-xl overflow-hidden mb-4">
        <button
          onClick={() => setExpandedCategory(isExpanded ? null : category)}
          className="w-full p-4 flex items-center justify-between bg-muted/50 hover:bg-muted transition-colors"
        >
          <div className="flex items-center gap-3">
            <Icon size={20} className="text-primary" />
            <span className="font-medium">{categoryLabels[category]}</span>
            <span className="text-sm text-muted-foreground">
              ({completedCount}/{items.length})
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            {isExpanded ? 'Collapse' : 'Expand'}
          </div>
        </button>
        
        {isExpanded && (
          <div className="p-4 space-y-3">
            {items.map((req) => (
              <div
                key={req.id}
                className={`p-3 rounded-lg border ${
                  req.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-card'
                }`}
              >
                <div className="flex items-start gap-3">
                  {!readOnly && onStatusChange ? (
                    <button
                      onClick={() => handleToggleStatus(req)}
                      className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        req.status === 'completed'
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-muted-foreground hover:border-primary'
                      }`}
                    >
                      {req.status === 'completed' && <Check size={12} />}
                    </button>
                  ) : (
                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ${
                      req.status === 'completed' ? 'bg-green-500 text-white' : 'bg-muted'
                    }`}>
                      {req.status === 'completed' ? <Check size={12} /> : <Circle size={12} />}
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{req.title}</span>
                      {req.isRequired && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-medium">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{req.description}</p>
                    
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-muted-foreground">
                        AI Confidence: {Math.round(req.confidence * 100)}%
                      </span>
                      {req.notes && (
                        <span className="text-xs text-blue-600">Notes added</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Progress Header */}
      <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">Overall Progress</span>
          <span className="text-2xl font-bold text-primary">{progress}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {requirements.filter(r => r.status === 'completed').length} of {requirements.length} requirements completed
        </p>
      </div>

      {/* Requirements by Category */}
      <div className="space-y-2">
        {renderCategory('document', categorized.documents)}
        {renderCategory('drawing', categorized.drawings)}
        {renderCategory('inspection', categorized.inspections)}
        {renderCategory('license', categorized.licenses)}
        {renderCategory('insurance', categorized.insurance)}
        {renderCategory('fee', categorized.fees)}
      </div>

      {requirements.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
          <p>No requirements found for this job.</p>
        </div>
      )}
    </div>
  );
}
