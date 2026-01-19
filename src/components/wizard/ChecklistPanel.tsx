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
    <div className="flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-foreground">Requirements</h2>
          <p className="text-xs text-muted-foreground">
            {completedCount} of {items.length} completed
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-bold text-primary">
            {Math.round((completedCount / items.length) * 100) || 0}%
          </span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
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
                <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center">
                  <Check size={12} className="text-success-foreground" />
                </div>
              ) : item.status === "ACTIVE" ? (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Circle size={8} className="text-primary-foreground fill-current" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-border" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-medium ${
                item.status === "COMPLETE" ? "text-muted-foreground" : "text-foreground"
              }`}>
                {item.title}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {item.description}
              </p>
              {item.value && (
                <p className="text-xs font-medium text-primary mt-1 truncate">
                  {item.value}
                </p>
              )}
            </div>
            
            <ChevronRight size={18} className="text-muted-foreground flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
