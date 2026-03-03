import { useRef, useState, useCallback } from 'react';
import { Camera, X, Check, RefreshCw, Crop, Upload } from 'lucide-react';
import Button from './Button';

interface DocumentScannerProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
}

export default function DocumentScanner({ onCapture, onCancel }: DocumentScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      // Fall back to file input
      alert('Camera access not available. Please use the upload button instead.');
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Apply auto-enhance (brightness/contrast)
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Simple auto-contrast
    for (let i = 0; i < data.length; i += 4) {
      // Increase contrast slightly
      const factor = 1.2;
      data[i] = ((data[i] - 128) * factor) + 128;     // Red
      data[i + 1] = ((data[i + 1] - 128) * factor) + 128; // Green
      data[i + 2] = ((data[i + 2] - 128) * factor) + 128; // Blue
    }
    
    context.putImageData(imageData, 0, 0);

    // Convert to image
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageDataUrl);
    stopCamera();
  }, [stopCamera]);

  // Retake photo
  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  // Confirm and send
  const confirmPhoto = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  }, [capturedImage, onCapture]);

  // Start camera on mount
  useState(() => {
    startCamera();
    return () => stopCamera();
  });

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/80">
        <button onClick={onCancel} className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20">
          <X size={24} />
        </button>
        <span className="text-white font-medium">Document Scanner</span>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Camera preview or captured image */}
      <div className="flex-1 relative flex items-center justify-center bg-black">
        {!capturedImage ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Scanner overlay frame */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-[80%] aspect-[3/4] max-w-md">
                {/* Corner markers */}
                <div className="absolute top-0 left-0 w-12 h-12 border-l-4 border-t-4 border-white rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-12 h-12 border-r-4 border-t-4 border-white rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-12 h-12 border-l-4 border-b-4 border-white rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-12 h-12 border-r-4 border-b-4 border-white rounded-br-lg" />
                
                {/* Instructions */}
                <div className="absolute -top-12 left-0 right-0 text-center">
                  <p className="text-white text-sm bg-black/50 px-3 py-1 rounded-full inline-block">
                    Line up document in the frame
                  </p>
                </div>
              </div>
            </div>

            {/* Hidden canvas for processing */}
            <canvas ref={canvasRef} className="hidden" />
          </>
        ) : (
          <img 
            src={capturedImage} 
            alt="Captured document" 
            className="max-w-full max-h-full object-contain"
          />
        )}
      </div>

      {/* Controls */}
      <div className="p-6 bg-black/80">
        {!capturedImage ? (
          <div className="flex items-center justify-center">
            <button
              onClick={capturePhoto}
              className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-white" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={retakePhoto}
              className="flex flex-col items-center gap-2 p-4 text-white"
            >
              <RefreshCw size={24} />
              <span className="text-sm">Retake</span>
            </button>
            <button
              onClick={confirmPhoto}
              className="flex flex-col items-center gap-2 p-4 text-white"
            >
              <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center">
                <Check size={28} className="text-white" />
              </div>
              <span className="text-sm">Use Photo</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
