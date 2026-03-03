import { useState, useMemo } from 'react';
import { Clock, Calendar, AlertTriangle, CheckCircle, Phone, ExternalLink, Download, ChevronRight } from 'lucide-react';
import Button from '@/components/shared/Button';
import { 
  generateTimeline, 
  getInspectionsForJobType,
  generateCalendarEvents,
  PINELLAS_CONTACT,
  getRecommendedBookingDate 
} from '@/data/pinellas/timelineData';

interface TimelineViewerProps {
  jobType: string;
  isExpress?: boolean;
  startDate?: Date;
}

export default function TimelineViewer({ 
  jobType, 
  isExpress: propIsExpress, 
  startDate = new Date() 
}: TimelineViewerProps) {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [showCalendarExport, setShowCalendarExport] = useState(false);

  // Determine if express (from prop or eligibility)
  const isExpress = propIsExpress ?? (jobType.includes('EXPRESS') || 
    ['RE_ROOFING', 'WINDOW_DOOR_REPLACEMENT', 'WATER_HEATER', 'AC_HVAC_CHANGEOUT'].includes(jobType));

  const timeline = useMemo(() => 
    generateTimeline(jobType, isExpress, startDate),
    [jobType, isExpress, startDate]
  );

  const inspections = useMemo(() => 
    getInspectionsForJobType(jobType),
    [jobType]
  );

  const handleExportCalendar = () => {
    const icsContent = generateCalendarEvents(timeline);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `permit-timeline-${jobType.toLowerCase()}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowCalendarExport(true);
    setTimeout(() => setShowCalendarExport(false), 3000);
  };

  // Calculate progress through stages
  const getStageStatus = (stageIndex: number) => {
    // In real app, this would check actual permit status
    if (stageIndex === 0) return 'current';
    return 'pending';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-4 text-white">
        <div className="flex items-center gap-2">
          <Clock size={20} />
          <h3 className="font-semibold">Your Permit Timeline</h3>
        </div>
        <p className="text-purple-100 text-sm mt-1">
          {jobType.replace(/_/g, ' ')} • Complete process
        </p>
      </div>

      {/* Timeline Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-green-700">{timeline.totalDaysEstimate.min}</div>
          <div className="text-xs text-green-600">Fastest</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-blue-700">{timeline.totalDaysEstimate.typical}</div>
          <div className="text-xs text-blue-600">Typical</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-amber-700">{timeline.totalDaysEstimate.max}+</div>
          <div className="text-xs text-amber-600">Worst Case</div>
        </div>
      </div>

      {/* Work Start Date */}
      <div className="bg-muted rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle size={16} className="text-green-500" />
          <span className="font-medium text-sm">You can start work:</span>
        </div>
        <div className="text-lg font-bold">
          {timeline.workCanStartDate.typical.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          })}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          (Typical scenario - {timeline.totalDaysEstimate.typical} days from today)
        </p>
      </div>

      {/* Timeline Stages */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Process Steps</h4>
        
        <div className="space-y-2">
          {timeline.stages.map((stage, index) => {
            const status = getStageStatus(index);
            const isSelected = selectedStage === stage.id;
            
            return (
              <div 
                key={stage.id}
                className={`border rounded-lg overflow-hidden transition-all ${
                  status === 'current' ? 'border-blue-300 bg-blue-50/30' : ''
                } ${isSelected ? 'ring-2 ring-primary' : ''}`}
              >
                <button
                  onClick={() => setSelectedStage(isSelected ? null : stage.id)}
                  className="w-full p-3 flex items-center gap-3 text-left"
                >
                  {/* Status Indicator */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    status === 'current' ? 'bg-blue-500 text-white' :
                    status === 'complete' ? 'bg-green-500 text-white' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {status === 'current' ? (
                      <Clock size={14} />
                    ) : status === 'complete' ? (
                      <CheckCircle size={14} />
                    ) : (
                      <span className="text-xs">{index + 1}</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{stage.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {stage.estimatedDays.typical === 0 ? 'Same day' : 
                        `${stage.estimatedDays.typical} day${stage.estimatedDays.typical > 1 ? 's' : ''}`}
                    </p>
                  </div>

                  {/* Action indicator */}
                  {stage.requiresAction && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                      Action needed
                    </span>
                  )}

                  <ChevronRight size={16} className={`transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                </button>

                {/* Expanded Details */}
                {isSelected && (
                  <div className="px-3 pb-3 pt-0 border-t">
                    <p className="text-sm text-muted-foreground mt-2">{stage.description}</p>
                    
                    {stage.requiresAction && stage.actionName && (
                      <div className="mt-3">
                        <Button 
                          size="sm"
                          onClick={() => {
                            if (stage.actionUrl) {
                              window.open(stage.actionUrl, '_blank');
                            }
                          }}
                        >
                          <ExternalLink size={14} />
                          {stage.actionName}
                        </Button>
                      </div>
                    )}

                    {stage.canFail && (
                      <div className="mt-2 flex items-start gap-2 text-xs text-amber-600">
                        <AlertTriangle size={12} className="mt-0.5" />
                        <span>
                          Can be delayed by {stage.failureDelayDays} days if issues found
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Inspections Section */}
      {inspections.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Required Inspections</h4>
          
          {inspections.map(inspection => {
            const recommendedDate = getRecommendedBookingDate(inspection, timeline.workCanStartDate.typical);
            
            return (
              <div key={inspection.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{inspection.name}</p>
                    <p className="text-xs text-muted-foreground">{inspection.description}</p>
                  </div>
                  <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded">
                    Book {inspection.typicalLeadTimeDays} days ahead
                  </span>
                </div>

                {/* Schedule Action */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(inspection.schedulingUrl, '_blank')}
                  >
                    <Calendar size={14} />
                    Schedule Online
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => window.location.href = `tel:${inspection.phoneScheduling}`}
                  >
                    <Phone size={14} />
                    Call
                  </Button>
                </div>

                {/* Common failures warning */}
                {inspection.commonFailures.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded p-2">
                    <p className="text-xs text-amber-700 font-medium">Common reasons for failure:</p>
                    <p className="text-xs text-amber-600 mt-1">
                      {inspection.commonFailures[0]}
                      {inspection.commonFailures.length > 1 && ' + more...'}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Risks */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm">What Could Delay Your Permit</h4>
        <div className="space-y-1">
          {timeline.risks.map((risk, i) => (
            <div 
              key={i} 
              className={`flex items-start gap-2 p-2 rounded text-sm ${
                risk.probability === 'high' ? 'bg-red-50 text-red-700' :
                risk.probability === 'medium' ? 'bg-amber-50 text-amber-700' :
                'bg-muted/50 text-muted-foreground'
              }`}
            >
              <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
              <div>
                <p>{risk.scenario}</p>
                <p className="text-xs opacity-75">+{risk.delayDays} days • {risk.probability} chance</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export Calendar */}
      <Button 
        variant="outline" 
        onClick={handleExportCalendar}
        className="w-full"
      >
        <Download size={16} />
        Export to Calendar (.ics)
      </Button>

      {showCalendarExport && (
        <p className="text-xs text-green-600 flex items-center gap-1">
          <CheckCircle size={12} />
          Calendar file downloaded
        </p>
      )}

      {/* Contact */}
      <div className="bg-muted rounded-lg p-3">
        <p className="text-xs text-muted-foreground mb-2">Questions about timeline?</p>
        <div className="text-sm space-y-1">
          <p className="font-medium">{PINELLAS_CONTACT.phone}</p>
          <p className="text-xs text-muted-foreground">{PINELLAS_CONTACT.hours}</p>
          <a 
            href={PINELLAS_CONTACT.dashboardUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            Current review times dashboard
            <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </div>
  );
}
