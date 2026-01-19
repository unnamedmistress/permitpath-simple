import { X, Loader2, AlertCircle } from "lucide-react";
import { Photo } from "@/types";

interface PhotoGalleryProps {
  photos: Photo[];
  onPhotoClick?: (photo: Photo) => void;
  onDeletePhoto?: (photoId: string) => void;
}

export default function PhotoGallery({ photos, onPhotoClick, onDeletePhoto }: PhotoGalleryProps) {
  if (photos.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm px-4">
        <p>No photos yet. Add your first photo!</p>
      </div>
    );
  }

  return (
    <div className="flex gap-3 px-4 overflow-x-auto py-2">
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
              <Loader2 size={20} className="animate-spin text-white" />
            </div>
          )}
          
          {photo.status === "PROCESSING" && (
            <div className="absolute inset-0 bg-primary/30 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          
          {photo.status === "ERROR" && (
            <div className="absolute inset-0 bg-destructive/50 rounded-lg flex items-center justify-center">
              <AlertCircle size={20} className="text-white" />
            </div>
          )}
          
          {/* Delete button */}
          {onDeletePhoto && photo.status === "COMPLETE" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeletePhoto(photo.id);
              }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-md hover:bg-destructive/90 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
