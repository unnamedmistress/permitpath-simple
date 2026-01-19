import { AlertCircle, XCircle, RefreshCcw } from "lucide-react";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  variant?: "error" | "warning";
}

export default function ErrorMessage({ 
  message, 
  onRetry,
  variant = "error" 
}: ErrorMessageProps) {
  const Icon = variant === "error" ? XCircle : AlertCircle;
  const bgColor = variant === "error" ? "bg-destructive/10" : "bg-warning/10";
  const textColor = variant === "error" ? "text-destructive" : "text-warning";
  const borderColor = variant === "error" ? "border-destructive/20" : "border-warning/20";

  return (
    <div className={`${bgColor} ${borderColor} border rounded-lg p-4 flex items-start gap-3`}>
      <Icon size={20} className={`${textColor} flex-shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        <p className={`${textColor} text-sm font-medium`}>{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className={`${textColor} text-sm mt-2 flex items-center gap-1 hover:underline`}
          >
            <RefreshCcw size={14} />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
