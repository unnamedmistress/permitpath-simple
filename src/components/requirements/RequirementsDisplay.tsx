import { useState } from 'react';
import { Check, Circle, AlertCircle, FileText, PenTool, ClipboardCheck, Award, Shield, DollarSign } from 'lucide-react';
import { Requirement, RequirementCategory } from '@/types/permit';
import { categorizeRequirements, calculateProgress } from '@/services/requirements';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface RequirementsDisplayProps {
  requirements: Requirement[];
  onStatusChange?: (id: string, status: Requirement['status']) => void;
  readOnly?: boolean;
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

const categoryGuidance: Record<
  RequirementCategory,
  {
    help: string;
    acceptedFormats: string;
    multipleUploads: string;
    goodUploadExample: string;
  }
> = {
  document: {
    help: 'Forms and written records the county asks for.',
    acceptedFormats: 'PDF, JPG, PNG',
    multipleUploads: 'Yes, if the county asks for extra pages.',
    goodUploadExample: 'Signed permit form with full address and contractor name'
  },
  drawing: {
    help: 'Simple plans that show size, layout, and materials.',
    acceptedFormats: 'PDF, JPG, PNG',
    multipleUploads: 'Yes, front view, side view, and detail pages are common.',
    goodUploadExample: 'Labeled roof plan with dimensions and product notes'
  },
  inspection: {
    help: 'Checks done by the county during and after work.',
    acceptedFormats: 'PDF, JPG, PNG',
    multipleUploads: 'Yes, keep one file per inspection result.',
    goodUploadExample: 'Inspection pass slip or appointment confirmation page'
  },
  license: {
    help: 'Proof that the contractor is licensed for the work.',
    acceptedFormats: 'PDF, JPG, PNG',
    multipleUploads: 'Usually no, one active license is enough.',
    goodUploadExample: 'Clear image of active license showing expiration date'
  },
  insurance: {
    help: 'Proof of active job insurance coverage.',
    acceptedFormats: 'PDF, JPG, PNG',
    multipleUploads: 'Yes, upload each policy or endorsement page.',
    goodUploadExample: 'Certificate of insurance showing policy dates and limits'
  },
  fee: {
    help: 'Permit payment steps and receipts.',
    acceptedFormats: 'PDF, JPG, PNG',
    multipleUploads: 'Yes, upload receipt and any county invoice.',
    goodUploadExample: 'Permit fee receipt with permit number'
  }
};

export default function RequirementsDisplay({ requirements, onStatusChange, readOnly = false }: RequirementsDisplayProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const categorized = categorizeRequirements(requirements);
  const progress = calculateProgress(requirements);

  const handleToggleStatus = (req: Requirement) => {
    if (readOnly || !onStatusChange) return;

    const newStatus: Requirement['status'] = req.status === 'completed' ? 'pending' : 'completed';
    onStatusChange(req.id, newStatus);
  };

  const renderCategory = (category: RequirementCategory, items: Requirement[]) => {
    if (items.length === 0) return null;

    const Icon = categoryIcons[category];
    const isExpanded = expandedCategory === category;
    const completedCount = items.filter((r) => r.status === 'completed').length;
    const help = categoryGuidance[category];

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
          <div className="text-sm text-muted-foreground">{isExpanded ? 'Collapse' : 'Expand'}</div>
        </button>

        {isExpanded && (
          <div className="p-4 space-y-3">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
              <p className="font-medium text-primary">Category help</p>
              <p className="mt-1 text-muted-foreground">{help.help}</p>
              <p className="mt-2 text-muted-foreground">Accepted formats: {help.acceptedFormats}</p>
              <p className="text-muted-foreground">Multiple uploads: {help.multipleUploads}</p>
              <p className="text-muted-foreground">Good upload example: {help.goodUploadExample}</p>
            </div>

            {items.map((req) => (
              <div key={req.id} className={`p-3 rounded-lg border ${req.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-card'}`}>
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
                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ${req.status === 'completed' ? 'bg-green-500 text-white' : 'bg-muted'}`}>
                      {req.status === 'completed' ? <Check size={12} /> : <Circle size={12} />}
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{req.title}</span>
                      {req.isRequired && <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-medium">Required</span>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{req.description}</p>

                    <Accordion type="single" collapsible className="mt-2 rounded-lg border">
                      <AccordionItem value="meaning" className="border-b">
                        <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline">What this means</AccordionTrigger>
                        <AccordionContent className="px-3 pb-3 text-sm text-muted-foreground">
                          {req.plainLanguageWhy || 'The county needs this item before permit approval.'}
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="how">
                        <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline">How to do it</AccordionTrigger>
                        <AccordionContent className="px-3 pb-3 text-sm text-muted-foreground">
                          <p>{req.actionType || 'Fill out the form and upload clear files.'}</p>
                          <p className="mt-1">Minimum: {req.minimumCriteria || 'Name, address, and required signatures.'}</p>
                          <p className="mt-1">Formats: {(req.acceptedFormats || ['PDF', 'JPG', 'PNG']).join(', ')}</p>
                          <p className="mt-1">Multiple uploads: {req.allowsMultipleUploads ? 'Yes' : 'No'}</p>
                          {req.sourceUrl && (
                            <a className="mt-2 inline-block text-primary hover:underline" href={req.sourceUrl} target="_blank" rel="noreferrer">
                              Get form link
                            </a>
                          )}
                          {req.whoCanHelp && <p className="mt-1">Who can help: {req.whoCanHelp}</p>}
                          {req.goodUploadExample && <p className="mt-1">Good upload example: {req.goodUploadExample}</p>}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-muted-foreground">AI Confidence: {Math.round(req.confidence * 100)}%</span>
                      {req.notes && <span className="text-xs text-blue-600">Notes added</span>}
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
      <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">Overall Progress</span>
          <span className="text-2xl font-bold text-primary">{progress}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {requirements.filter((r) => r.status === 'completed').length} of {requirements.length} requirements completed
        </p>
      </div>

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
