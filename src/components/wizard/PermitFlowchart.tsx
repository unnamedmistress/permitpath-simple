import { useState, useEffect, useCallback } from "react";
import { ExternalLink, Info, X, ChevronDown, ChevronUp } from "lucide-react";
import { FlowchartNode, JobType, LegalSource } from "@/types";
import { getFlowchartForJobType, generateMermaidFromFlowchart } from "@/data/permitFlowcharts";

interface PermitFlowchartProps {
  jobType: JobType;
  currentStepId?: string;
  completedStepIds?: string[];
  onNodeClick?: (node: FlowchartNode) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface LegalSourcePanelProps {
  source: LegalSource;
  onClose: () => void;
}

function LegalSourcePanel({ source, onClose }: LegalSourcePanelProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-card border-t-2 border-primary rounded-t-2xl shadow-2xl p-4 animate-in slide-in-from-bottom duration-300 max-h-[50vh] overflow-y-auto">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 pr-4">
          <h3 className="font-semibold text-foreground text-lg">{source.label}</h3>
          {source.lastUpdated && (
            <p className="text-xs text-muted-foreground mt-1">Last updated: {source.lastUpdated}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <X size={20} className="text-muted-foreground" />
        </button>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">{source.description}</p>
      
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
      >
        <ExternalLink size={18} />
        View Official Source
      </a>
    </div>
  );
}

export default function PermitFlowchart({
  jobType,
  currentStepId,
  completedStepIds = [],
  onNodeClick,
  isCollapsed = false,
  onToggleCollapse
}: PermitFlowchartProps) {
  const [selectedSource, setSelectedSource] = useState<LegalSource | null>(null);
  const [flowchart, setFlowchart] = useState(() => getFlowchartForJobType(jobType));
  
  useEffect(() => {
    setFlowchart(getFlowchartForJobType(jobType));
  }, [jobType]);
  
  // Update node statuses based on completed steps
  const nodesWithStatus = flowchart.nodes.map(node => ({
    ...node,
    status: completedStepIds.includes(node.id) 
      ? "complete" as const
      : node.id === currentStepId 
        ? "current" as const 
        : "pending" as const
  }));
  
  const handleNodeClick = useCallback((node: FlowchartNode) => {
    if (node.legalSource) {
      setSelectedSource(node.legalSource);
    }
    onNodeClick?.(node);
  }, [onNodeClick]);
  
  const getNodeClasses = (node: FlowchartNode) => {
    const base = "relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer";
    
    const statusClasses = {
      complete: "bg-green-500/20 text-green-700 border-2 border-green-500",
      current: "bg-primary/20 text-primary border-2 border-primary animate-pulse",
      pending: "bg-muted text-muted-foreground border border-border hover:border-primary/50",
      skipped: "bg-muted/50 text-muted-foreground/50 border border-border/50"
    };
    
    return `${base} ${statusClasses[node.status]}`;
  };
  
  const getNodeIcon = (node: FlowchartNode) => {
    switch (node.type) {
      case "start":
        return "🚀";
      case "end":
        return node.label.includes("No Permit") ? "✅" : "🏁";
      case "decision":
        return "❓";
      case "inspection":
        return "🔍";
      default:
        return "📋";
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggleCollapse}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <h3 className="font-semibold text-foreground text-sm">{flowchart.title}</h3>
        </div>
        {isCollapsed ? (
          <ChevronDown size={20} className="text-muted-foreground" />
        ) : (
          <ChevronUp size={20} className="text-muted-foreground" />
        )}
      </button>
      
      {/* Flowchart Content */}
      {!isCollapsed && (
        <div className="p-4 space-y-2 max-h-[300px] overflow-y-auto">
          {nodesWithStatus.map((node, index) => (
            <div key={node.id} className="relative">
              {/* Connection line */}
              {index > 0 && (
                <div className="absolute left-5 -top-1 w-0.5 h-2 bg-border" />
              )}
              
              <div
                onClick={() => handleNodeClick(node)}
                className={getNodeClasses(node)}
              >
                <span>{getNodeIcon(node)}</span>
                <span className="flex-1">{node.label}</span>
                
                {node.legalSource && (
                  <Info size={16} className="text-primary opacity-70 hover:opacity-100" />
                )}
                
                {node.pinellasSpecific && (
                  <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                    Pinellas
                  </span>
                )}
                
                {node.status === "complete" && (
                  <span className="text-green-600">✓</span>
                )}
              </div>
              
              {/* Show decision branches */}
              {node.type === "decision" && typeof node.nextNodes === "object" && (
                <div className="ml-8 mt-1 flex flex-wrap gap-1">
                  {Object.keys(node.nextNodes).map(condition => (
                    <span
                      key={condition}
                      className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground"
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Progress indicator */}
      {!isCollapsed && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${(completedStepIds.length / flowchart.nodes.length) * 100}%` }}
              />
            </div>
            <span>{completedStepIds.length}/{flowchart.nodes.length}</span>
          </div>
        </div>
      )}
      
      {/* Legal Source Panel */}
      {selectedSource && (
        <LegalSourcePanel
          source={selectedSource}
          onClose={() => setSelectedSource(null)}
        />
      )}
    </div>
  );
}
