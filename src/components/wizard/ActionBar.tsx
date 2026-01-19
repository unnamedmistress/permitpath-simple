import { Camera, Eye } from "lucide-react";

interface ActionBarProps {
  onAddPhoto: () => void;
  onPreview: () => void;
  canPreview: boolean;
}

export default function ActionBar({ onAddPhoto, onPreview, canPreview }: ActionBarProps) {
  return (
    <div className="flex gap-3 px-4 py-3">
      <button
        onClick={onAddPhoto}
        className="btn-photo"
      >
        <Camera size={22} />
        <span>📷 Add Photo</span>
      </button>
      
      <button
        onClick={onPreview}
        disabled={!canPreview}
        className={`btn-preview ${!canPreview ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <Eye size={22} />
        <span>👁 Preview Package</span>
      </button>
    </div>
  );
}
