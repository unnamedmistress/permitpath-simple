import { X, Loader2, AlertCircle } from "lucide-react";
import { Photo } from "@/types";

interface PhotoGalleryProps {
  photos: Photo[];
  onPhotoClick?: (photo: Photo) => void;
  onDeletePhoto?: (photoId: string) => void;
}

export default function PhotoGallery({ photos, onPhotoClick, onDeletePhoto }: PhotoGalleryProps) {
  if (photos.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2 px-3 py-2 overflow-x-auto scrollbar-hide">
      {photos.map((photo) => (
        <div key={photo.id} className="relative flex-shrink-0">
          <button
            onClick={() => onPhotoClick?.(photo)}
            className="block"
            disabled={photo.status !== "COMPLETE"}
          >
            <img
              src={photo.thumbnailUrl || photo.url}
              alt="Job photo"
              className="photo-thumb"
            />
          </button>
          
          {/* Status overlay */}
          {photo.status === "UPLOADING" && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <Loader2 size={14} className="animate-spin text-white" />
            </div>
          )}
          
          {photo.status === "PROCESSING" && (
            <div className="absolute inset-0 bg-primary/30 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          
          {photo.status === "ERROR" && (
            <div className="absolute inset-0 bg-destructive/50 rounded-lg flex items-center justify-center">
              <AlertCircle size={14} className="text-white" />
            </div>
          )}
          
          {/* Delete button */}
          {onDeletePhoto && photo.status === "COMPLETE" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeletePhoto(photo.id);
              }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-md hover:bg-destructive/90 transition-colors"
            >
              <X size={10} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}