import { ChangeEvent } from 'react';
import { Camera, X } from 'lucide-react';
import Button from '@/components/shared/Button';

export interface SelectedPhoto {
  id: string;
  file: File;
  previewUrl: string;
}

interface PhotoUploadTrayProps {
  photos: SelectedPhoto[];
  onAddPhotos: (files: FileList) => void;
  onRemovePhoto: (photoId: string) => void;
}

export default function PhotoUploadTray({ photos, onAddPhotos, onRemovePhoto }: PhotoUploadTrayProps) {
  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    onAddPhotos(event.target.files);
    event.target.value = '';
  };

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Job Photos</h2>
        <span className="text-xs text-muted-foreground">{photos.length}/5</span>
      </div>

      <label className="inline-flex">
        <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
        <Button variant="outline" size="sm" disabled={photos.length >= 5}>
          <Camera size={16} />
          Add job photos (up to 5)
        </Button>
      </label>

      {photos.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="relative rounded-lg overflow-hidden border">
              <img src={photo.previewUrl} alt="Job upload" className="h-24 w-full object-cover" />
              <button
                type="button"
                onClick={() => onRemovePhoto(photo.id)}
                className="absolute top-1 right-1 rounded-full bg-black/70 p-1 text-white"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
