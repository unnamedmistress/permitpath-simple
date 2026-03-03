import { ReactNode } from "react";
import { AlertTriangle, X } from "lucide-react";
import Button from "./Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  icon?: ReactNode;
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  icon,
  isLoading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      iconBg: "bg-destructive/10",
      iconColor: "text-destructive",
      confirmVariant: "primary" as const, // Will style as destructive via className
    },
    warning: {
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
      confirmVariant: "primary" as const,
    },
    default: {
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      confirmVariant: "primary" as const,
    },
  };

  const styles = variantStyles[variant];
  const defaultIcon = variant === "danger" || variant === "warning" 
    ? <AlertTriangle size={24} className={styles.iconColor} />
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative bg-card rounded-2xl shadow-xl max-w-sm w-full mx-2 p-4 sm:p-5 space-y-3 sm:space-y-4 animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 p-2 min-h-[44px] min-w-[44px] rounded-lg hover:bg-muted transition-colors flex items-center justify-center"
          aria-label="Close dialog"
        >
          <X size={18} className="text-muted-foreground" />
        </button>

        {/* Icon */}
        {(icon || defaultIcon) && (
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${styles.iconBg} flex items-center justify-center mx-auto`}>
            {icon || defaultIcon}
          </div>
        )}

        {/* Content */}
        <div className="text-center space-y-2">
          <h2 id="confirm-dialog-title" className="text-base sm:text-lg font-semibold text-foreground">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
          <Button
            onClick={onClose}
            variant="outline"
            size="md"
            className="w-full sm:flex-1"
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            variant={styles.confirmVariant}
            size="md"
            className={`w-full sm:flex-1 ${variant === "danger" ? "bg-destructive hover:bg-destructive/90" : ""}`}
            loading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
