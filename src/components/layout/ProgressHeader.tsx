import { ArrowLeft, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProgressHeaderProps {
  title: string;
  progress: number; // 0-100
  onBack?: () => void;
  showMenu?: boolean;
}

export default function ProgressHeader({
  title,
  progress,
  onBack,
  showMenu = false,
}: ProgressHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="h-[10vh] min-h-[70px] bg-card border-b border-border px-4 flex flex-col justify-center safe-area-inset-top">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={handleBack}
          className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={24} className="text-foreground" />
        </button>
        
        <h1 className="text-lg font-semibold text-foreground flex-1 text-center">
          {title}
        </h1>
        
        {showMenu ? (
          <button
            className="p-2 -mr-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="More options"
          >
            <MoreVertical size={24} className="text-foreground" />
          </button>
        ) : (
          <div className="w-10" /> // Spacer for alignment
        )}
      </div>
      
      <div className="progress-track">
        <div 
          className="progress-fill"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </header>
  );
}
