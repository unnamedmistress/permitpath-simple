import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import PageWrapper from "@/components/layout/PageWrapper";
import ProgressHeader from "@/components/layout/ProgressHeader";
import ChatPanel from "@/components/wizard/ChatPanel";
// ChecklistPanel removed (chat-only UI)
import ActionBar from "@/components/wizard/ActionBar";
import PhotoGallery from "@/components/wizard/PhotoGallery";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { useJob } from "@/hooks/useJob";
import { useChecklist } from "@/hooks/useChecklist";
import { useMessages } from "@/hooks/useMessages";
import { usePhotos } from "@/context/PhotoContext";
import { Photo } from "@/types";
import PhotoGuidelines from "@/components/permit/PhotoGuidelines";
import { getAiAssistantResponse } from "@/lib/aiAssistant";
import { db, storage, isFirebaseReady } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import { addDoc, collection, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

// Photo validation constants
const MAX_PHOTO_SIZE_MB = 10;
const MAX_PHOTO_SIZE_BYTES = MAX_PHOTO_SIZE_MB * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export default function WizardPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { currentJob, getJob, isLoading: jobLoading } = useJob();
  const { items: checklistItems, fetchChecklist, initializeChecklist, updateItem, getProgress } = useChecklist(jobId || "");
  const { messages, fetchMessages, addMessage } = useMessages(jobId || "");
  const { photos, loadPhotos, addPhoto, updatePhoto, deletePhoto } = usePhotos(jobId || "");
  const { user } = useAuth();
  const useFirebase = isFirebaseReady() && !!db && !!storage && !!user;
  
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const startConversationRef = useRef(false);
  // chat-only UI (no tabs)
  const [photosExpanded, setPhotosExpanded] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [jobNotFound, setJobNotFound] = useState(false);

  const sendAiReply = useCallback(
    async (prompt: string) => {
      setIsAiLoading(true);
      const aiResponse = await getAiAssistantResponse({
        jobType: currentJob?.jobType || "ELECTRICAL_PANEL",
        jurisdiction: currentJob?.jurisdiction || "PINELLAS",
        checklistItems,
        userPrompt: prompt,
      });
      if (aiResponse) {
        await addMessage(aiResponse, "assistant");
      }
      setIsAiLoading(false);
    },
    [addMessage, currentJob, checklistItems]
  );

  // Initialize job data
  useEffect(() => {
    if (!jobId) return;
    
    const init = async () => {
      const job = await getJob(jobId);
      if (!job) {
        setJobNotFound(true);
        toast.error("Job not found", {
          description: "This job may have been deleted or the link is invalid.",
        });
        return;
      }
      
      let checklist = await fetchChecklist();
      if (checklist.length === 0) {
        checklist = await initializeChecklist(job.jobType, job.jurisdiction);
      }
      
      await fetchMessages();
      setMessagesLoaded(true);
      await loadPhotos();
      setInitialized(true);
    };
    
    init();
  }, [jobId, loadPhotos, fetchMessages, getJob, fetchChecklist, initializeChecklist]);

  // Send AI greeting after initialization
  useEffect(() => {
    if (
      initialized &&
      messagesLoaded &&
      currentJob &&
      checklistItems.length > 0 &&
      messages.length === 0 &&
      !startConversationRef.current
    ) {
      startConversationRef.current = true;
      sendAiReply("Start the job by welcoming the user and asking what they want to document first.");
    }
  }, [initialized, messagesLoaded, currentJob, checklistItems, messages.length, sendAiReply]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!jobId) return;
    
    await addMessage(content, "user");
    setIsAiLoading(true);

    const fallbackResponses = [
      "I see! Let me help you with that. Can you take a photo so I can give you more specific guidance?",
      "Good question! Based on what you've described, I'd recommend documenting that with a photo. Tap '📷 Add Photo' below.",
      "That's helpful context! Let's continue with the checklist — I'll use this information when we get to the relevant section.",
    ];

    const aiResponse = await getAiAssistantResponse({
      jobType: currentJob?.jobType || "ELECTRICAL_PANEL",
      jurisdiction: currentJob?.jurisdiction || "PINELLAS",
      checklistItems,
      userPrompt: content,
    });

    const reply = aiResponse || fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    await addMessage(reply, "assistant");
    setIsAiLoading(false);
  }, [jobId, addMessage, currentJob, checklistItems]);

  // Checklist click removed for chat-only UI

  const handleAddPhoto = () => {
    // Add haptic feedback
    navigator.vibrate?.(10);
    fileInputRef.current?.click();
  };

  const validatePhoto = (file: File): string | null => {
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      return "Please select a valid image file (JPEG, PNG, or WebP)";
    }
    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      return `Photo must be smaller than ${MAX_PHOTO_SIZE_MB}MB`;
    }
    return null;
  };

  const handlePhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !jobId) return;
    
    // Validate the photo
    const validationError = validatePhoto(file);
    if (validationError) {
      toast.error("Invalid photo", { description: validationError });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }
    
    // Create a preview URL
    const localUrl = URL.createObjectURL(file);
    const photoId = `photo-${Date.now()}`;
    
    const newPhoto: Photo = {
      id: photoId,
      jobId,
      url: localUrl,
      uploadedAt: new Date(),
      status: "UPLOADING",
    };
    
    addPhoto(newPhoto);
    setUploadProgress(prev => ({ ...prev, [photoId]: 0 }));
    setPhotosExpanded(true); // Show photos when a new one is added

    // Upload to Firebase Storage if configured
    if (useFirebase && user && storage && db) {
      const storagePath = `users/${user.uid}/jobs/${jobId}/${photoId}`;
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(prev => ({ ...prev, [photoId]: progress }));
        },
        async () => {
          updatePhoto(photoId, { status: "ERROR" });
          toast.error("Photo upload failed", { description: "Please try again." });
          setIsAiLoading(false);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          const photoDoc = await addDoc(collection(db, "photos"), {
            jobId,
            userId: user.uid,
            url: downloadUrl,
            storagePath,
            status: "COMPLETE",
            uploadedAt: serverTimestamp(),
          });

          deletePhoto(photoId);
          addPhoto({
            id: photoDoc.id,
            jobId,
            url: downloadUrl,
            storagePath,
            uploadedAt: new Date(),
            status: "COMPLETE",
            userId: user.uid,
          });

          setUploadProgress(prev => {
            const next = { ...prev };
            delete next[photoId];
            return next;
          });
        }
      );
    } else {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[photoId] || 0;
          if (current >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return { ...prev, [photoId]: current + 10 };
        });
      }, 100);

      setTimeout(() => {
        updatePhoto(photoId, { status: "PROCESSING" });
        setUploadProgress(prev => ({ ...prev, [photoId]: 100 }));
      }, 1000);

      setTimeout(async () => {
        clearInterval(progressInterval);
        updatePhoto(photoId, { status: "COMPLETE" });
        setUploadProgress(prev => {
          const next = { ...prev };
          delete next[photoId];
          return next;
        });
      }, 2000);
    }
    
    // Add a message about the photo
    await addMessage("📷 I've uploaded a photo", "user");
    setIsAiLoading(true);

    const aiResponse = await getAiAssistantResponse({
      jobType: currentJob?.jobType || "ELECTRICAL_PANEL",
      jurisdiction: currentJob?.jurisdiction || "PINELLAS",
      checklistItems,
      userPrompt: "A new job photo was uploaded. Ask for any missing details.",
    });

    await addMessage(
      aiResponse ||
        "I can see the equipment in your photo! If anything looks off, let me know or upload another angle.",
      "assistant"
    );
    setIsAiLoading(false);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeletePhotoClick = (photoId: string) => {
    // Add haptic feedback
    navigator.vibrate?.(10);
    setPhotoToDelete(photoId);
  };

  const handleConfirmDeletePhoto = () => {
    if (photoToDelete) {
      const photo = photos.find((item) => item.id === photoToDelete);
      if (useFirebase && photo?.storagePath && db) {
        deleteDoc(doc(db, "photos", photoToDelete));
        if (storage) {
          deleteObject(ref(storage, photo.storagePath));
        }
      }
      deletePhoto(photoToDelete);
      toast.success("Photo deleted");
      setPhotoToDelete(null);
    }
  };

  const handlePreview = () => {
    // For bathroom remodels, go to details page first for permit determination
    // For other job types, go directly to preview
    if (currentJob?.jobType === "SMALL_BATH_REMODEL") {
      navigate(`/details/${jobId}`);
    } else {
      navigate(`/preview/${jobId}`);
    }
  };

  const canPreview = checklistItems.some(i => i.status === "COMPLETE");
  const progress = getProgress();

  // Job not found state
  if (jobNotFound) {
    return (
      <PageWrapper hasBottomNav={false}>
        <div className="flex flex-col items-center justify-center h-screen-safe px-4">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
              <span className="text-3xl">🔍</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">Job Not Found</h1>
            <p className="text-sm text-muted-foreground">
              This job may have been deleted or the link is invalid.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!jobId) {
    return (
      <PageWrapper hasBottomNav={false}>
        <div className="flex items-center justify-center h-screen-safe" aria-busy="true">
          <LoadingSpinner size="lg" text="Loading job..." />
        </div>
      </PageWrapper>
    );
  }

  if (!initialized || jobLoading) {
    return (
      <PageWrapper hasBottomNav={false}>
        <div className="flex items-center justify-center h-screen-safe" aria-busy="true">
          <LoadingSpinner size="lg" text="Loading job..." />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper hasBottomNav={false} className="flex flex-col h-screen-safe">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handlePhotoSelected}
        className="hidden"
      />
      
      {/* Compact Progress Header */}
      <ProgressHeader
        title={currentJob?.title || "Permit Documentation"}
        progress={progress}
        onBack={() => navigate("/")}
        showMenu
      />
      
      {/* Main Content - Chat only */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full p-3">
          <ChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isAiLoading}
          />
        </div>
      </div>
      
      {/* Bottom Section - Compact with collapsible photos */}
      <div className="bg-card border-t border-border flex flex-col">
        {/* Collapsible Photo Gallery */}
        {photos.length > 0 && (
          <div className={`overflow-hidden transition-all duration-300 ${photosExpanded ? "max-h-24" : "max-h-0"}`}>
            <PhotoGallery
              photos={photos}
              onDeletePhoto={handleDeletePhotoClick}
              uploadProgress={uploadProgress}
            />
          </div>
        )}
        
        {/* Action Bar with photo count */}
        <ActionBar
          onAddPhoto={handleAddPhoto}
          onPreview={handlePreview}
          canPreview={canPreview}
          photoCount={photos.length}
          photosExpanded={photosExpanded}
          onTogglePhotos={() => setPhotosExpanded(!photosExpanded)}
        />
      </div>

      {/* Photo Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!photoToDelete}
        onClose={() => setPhotoToDelete(null)}
        onConfirm={handleConfirmDeletePhoto}
        title="Delete Photo?"
        description="This photo will be permanently removed from this job."
        confirmLabel="Delete"
        cancelLabel="Keep"
        variant="danger"
      />
    </PageWrapper>
  );
}