import { Check, Circle, ChevronRight } from "lucide-react";
import { ChecklistItem } from "@/types";

interface ChecklistPanelProps {
  items: ChecklistItem[];
  onItemClick: (item: ChecklistItem) => void;
}

export default function ChecklistPanel({ items, onItemClick }: ChecklistPanelProps) {
  const sortedItems = [...items].sort((a, b) => a.order - b.order);
  const completedCount = items.filter((i) => i.status === "COMPLETE").length;
  
  return (
    <div className="flex flex-col h-full bg-card md:rounded-xl md:border md:border-border overflow-hidden">
      {/* Compact header - hidden on mobile since we have tabs */}
      <div className="hidden md:flex px-3 py-2 border-b border-border items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Requirements</h2>
          <p className="text-xs text-muted-foreground">
            {completedCount} of {items.length} completed
          </p>
        </div>
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-xs font-bold text-primary">
            {Math.round((completedCount / items.length) * 100) || 0}%
          </span>
        </div>
      </div>
      
      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {sortedItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick(item)}
            className={`checklist-item w-full text-left ${
              item.status === "COMPLETE"
                ? "checklist-complete"
                : item.status === "ACTIVE"
                ? "checklist-active"
                : "checklist-pending"
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {item.status === "COMPLETE" ? (
                <div className="w-4 h-4 rounded-full bg-success flex items-center justify-center">
                  <Check size={10} className="text-success-foreground" />
                </div>
              ) : item.status === "ACTIVE" ? (
                <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <Circle size={6} className="text-primary-foreground fill-current" />
                </div>
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-border" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className={`text-xs font-medium leading-tight ${
                item.status === "COMPLETE" ? "text-muted-foreground" : "text-foreground"
              }`}>
                {item.title}
              </h4>
              <p className="text-[10px] text-muted-foreground line-clamp-1">
                {item.description}
              </p>
              {item.value && (
                <p className="text-[10px] font-medium text-primary mt-0.5 truncate">
                  {item.value}
                </p>
              )}
            </div>
            
            <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}