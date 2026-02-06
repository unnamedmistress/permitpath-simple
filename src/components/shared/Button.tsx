import { ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "photo" | "preview";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  icon?: ReactNode;
  "aria-label"?: string;
}

export default function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  className = "",
  type = "button",
  icon,
  "aria-label": ariaLabel,
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none";
  
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:ring-secondary",
    outline: "border-2 border-primary text-primary bg-transparent hover:bg-primary/5 focus-visible:ring-primary",
    ghost: "text-foreground hover:bg-muted focus-visible:ring-primary",
    photo: "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary",
    preview: "bg-accent text-accent-foreground hover:bg-accent/90 focus-visible:ring-accent",
  };

  const sizes = {
    sm: "text-sm px-3 py-2",
    md: "text-base px-4 py-3",
    lg: "text-lg px-6 py-4",
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Add haptic feedback (safely)
    try {
      navigator.vibrate?.(10);
    } catch {
      // Ignore if not supported
    }
    onClick?.();
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      aria-label={ariaLabel}
      aria-busy={loading}
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" aria-hidden="true" />
      ) : icon ? (
        <span aria-hidden="true">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
