import { useRef, useState } from "react";
import { Camera, X, Loader2 } from "lucide-react";

interface PhotoUploadProps {
  onPhotoSelected: (file: File) => void;
  isUploading?: boolean;
}

export default function PhotoUpload({ onPhotoSelected, isUploading = false }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      onPhotoSelected(file);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
      />
      
      {preview ? (
        <div className="relative w-20 h-20">
          <img
            src={preview}
            alt="Upload preview"
            className="photo-thumb"
          />
          {isUploading ? (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-white" />
            </div>
          ) : (
            <button
              onClick={clearPreview}
              className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={handleClick}
          disabled={isUploading}
          className="w-20 h-20 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <Camera size={24} />
          <span className="text-xs">Add</span>
        </button>
      )}
    </div>
  );
}
