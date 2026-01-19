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
    <header className="compact-header">
      <div className="flex items-center justify-between mb-1.5">
        <button
          onClick={handleBack}
          className="p-1.5 -ml-1.5 rounded-lg hover:bg-muted transition-colors tap-target flex items-center justify-center"
          aria-label="Go back"
        >
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        
        <h1 className="text-sm font-semibold text-foreground flex-1 text-center truncate px-2">
          {title}
        </h1>
        
        {showMenu ? (
          <button
            className="p-1.5 -mr-1.5 rounded-lg hover:bg-muted transition-colors tap-target flex items-center justify-center"
            aria-label="More options"
          >
            <MoreVertical size={20} className="text-foreground" />
          </button>
        ) : (
          <div className="w-8" /> // Spacer for alignment
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