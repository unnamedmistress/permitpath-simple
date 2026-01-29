import { Camera, Eye, Image, ChevronUp, ChevronDown } from "lucide-react";

interface ActionBarProps {
  onAddPhoto: () => void;
  onPreview: () => void;
  canPreview: boolean;
  photoCount?: number;
  photosExpanded?: boolean;
  onTogglePhotos?: () => void;
}

export default function ActionBar({ 
  onAddPhoto, 
  onPreview, 
  canPreview,
  photoCount = 0,
  photosExpanded = false,
  onTogglePhotos
}: ActionBarProps) {
  return (
    <div className="flex gap-2 px-3 py-2 safe-area-inset-bottom">
      <button
        onClick={onAddPhoto}
        className="btn-photo tap-target"
      >
        <Camera size={16} />
        <span>Add Photo</span>
      </button>
      
      {photoCount > 0 && onTogglePhotos && (
        <button
          onClick={onTogglePhotos}
          className="flex items-center gap-1 px-2 py-1.5 bg-muted rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <Image size={14} />
          <span>{photoCount}</span>
          {photosExpanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
        </button>
      )}
      
      <button
        onClick={onPreview}
        disabled={!canPreview}
        className={`btn-preview tap-target ${!canPreview ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <Eye size={16} />
        <span>Preview</span>
      </button>
    </div>
  );
}