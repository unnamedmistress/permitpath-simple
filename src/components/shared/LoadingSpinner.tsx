import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export default function LoadingSpinner({ size = "md", text }: LoadingSpinnerProps) {
  const sizes = {
    sm: 16,
    md: 24,
    lg: 40,
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 
        size={sizes[size]} 
        className="animate-spin text-primary"
      />
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  );
}
