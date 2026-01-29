import { Check, Pencil } from "lucide-react";

interface ConfirmFieldProps {
  label: string;
  value: string;
  isConfirmed: boolean;
  onConfirm: () => void;
  onEdit: () => void;
}

export default function ConfirmField({
  label,
  value,
  isConfirmed,
  onConfirm,
  onEdit,
}: ConfirmFieldProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <label className="text-sm font-medium text-muted-foreground">{label}</label>
          <p className="text-foreground mt-1 break-words">{value}</p>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          {isConfirmed ? (
            <div className="flex items-center gap-1 text-success text-sm font-medium">
              <Check size={16} />
              Confirmed
            </div>
          ) : (
            <>
              <button
                onClick={onConfirm}
                className="px-3 py-1.5 bg-success text-success-foreground text-sm font-medium rounded-lg flex items-center gap-1 hover:bg-success/90 transition-colors"
              >
                <Check size={14} />
                Yes, this is correct
              </button>
              <button
                onClick={onEdit}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                aria-label="Edit"
              >
                <Pencil size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
