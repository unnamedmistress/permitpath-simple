import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import PageWrapper from "@/components/layout/PageWrapper";
import ProgressHeader from "@/components/layout/ProgressHeader";
import ChatPanel from "@/components/wizard/ChatPanel";
import ChecklistPanel from "@/components/wizard/ChecklistPanel";
import ActionBar from "@/components/wizard/ActionBar";
import PhotoGallery from "@/components/wizard/PhotoGallery";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { useJob } from "@/hooks/useJob";
import { useChecklist } from "@/hooks/useChecklist";
import { useMessages } from "@/hooks/useMessages";
import { useConversationFlow } from "@/hooks/useConversationFlow";
import { usePhotos } from "@/context/PhotoContext";
import { Photo, ChecklistItem, QuickReply } from "@/types";
import PhotoGuidelines from "@/components/permit/PhotoGuidelines";

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
  const { photos, addPhoto, updatePhoto, deletePhoto } = usePhotos(jobId || "");
  
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "checklist">("chat");
  const [photosExpanded, setPhotosExpanded] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [jobNotFound, setJobNotFound] = useState(false);

  // Handle completing a checklist item
  const handleCompleteItem = useCallback((itemId: string, data: Record<string, unknown>) => {
    updateItem(itemId, { status: "COMPLETE", ...data });
  }, [updateItem]);

  // Conversation flow hook
  const {
    quickReplies,
    isFlowComplete,
    handleQuickReply,
    handleChecklistItemClick,
    startConversation
  } = useConversationFlow({
    jobType: currentJob?.jobType || "ELECTRICAL_PANEL",
    jurisdiction: currentJob?.jurisdiction || "PINELLAS",
    checklistItems,
    onAddMessage: addMessage,
    onCompleteItem: handleCompleteItem
  });

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
      setInitialized(true);
    };
    
    init();
  }, [jobId]);

  // Start conversation flow after initialization
  useEffect(() => {
    if (initialized && currentJob && checklistItems.length > 0 && !conversationStarted && messages.length === 0) {
      setConversationStarted(true);
      startConversation();
    }
  }, [initialized, currentJob, checklistItems, conversationStarted, messages.length, startConversation]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!jobId) return;
    
    await addMessage(content, "user");
    setIsAiLoading(true);
    
    // Simulate AI response for free-form text (in production, this would call OpenAI)
    setTimeout(async () => {
      const responses = [
        "I see! Let me help you with that. Can you take a photo so I can give you more specific guidance?",
        "Good question! Based on what you've described, I'd recommend documenting that with a photo. Tap '📷 Add Photo' below.",
        "That's helpful context! Let's continue with the checklist — I'll use this information when we get to the relevant section.",
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      await addMessage(randomResponse, "assistant");
      setIsAiLoading(false);
    }, 1500);
  }, [jobId, addMessage]);

  const handleQuickReplySelect = useCallback(async (reply: QuickReply) => {
    setIsAiLoading(true);
    await handleQuickReply(reply);
    setIsAiLoading(false);
  }, [handleQuickReply]);

  const handleChecklistClick = useCallback(async (item: ChecklistItem) => {
    setIsAiLoading(true);
    await handleChecklistItemClick(item);
    setIsAiLoading(false);
    setActiveTab("chat"); // Switch to chat when clicking a checklist item
  }, [handleChecklistItemClick]);

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
    const url = URL.createObjectURL(file);
    const photoId = `photo-${Date.now()}`;
    
    const newPhoto: Photo = {
      id: photoId,
      jobId,
      url,
      uploadedAt: new Date(),
      status: "UPLOADING",
    };
    
    addPhoto(newPhoto);
    setUploadProgress(prev => ({ ...prev, [photoId]: 0 }));
    setPhotosExpanded(true); // Show photos when a new one is added
    
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
    
    // Update status to processing
    setTimeout(() => {
      updatePhoto(photoId, { status: "PROCESSING" });
      setUploadProgress(prev => ({ ...prev, [photoId]: 100 }));
    }, 1000);
    
    // Add a message about the photo
    await addMessage("📷 I've uploaded a photo", "user");
    setIsAiLoading(true);
    setActiveTab("chat"); // Switch to chat to see AI response
    
    // Simulate AI vision analysis
    setTimeout(async () => {
      clearInterval(progressInterval);
      
      // Update photo status
      updatePhoto(photoId, { status: "COMPLETE" });
      setUploadProgress(prev => {
        const next = { ...prev };
        delete next[photoId];
        return next;
      });
      
      await addMessage(
        "I can see the equipment in your photo! Here's what I found:\n\n" +
        "• **Type**: Electrical panel\n" +
        "• **Brand**: Looks like Square D\n" +
        "• **Size**: Appears to be 200A main breaker\n\n" +
        "Does this look right?",
        "assistant"
      );
      setIsAiLoading(false);
    }, 2000);
    
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
      
      {/* Mobile Tab Switcher */}
      <div className="px-3 py-2 bg-card border-b border-border md:hidden">
        <div className="tab-switcher">
          <button 
            className={`tab-button ${activeTab === "chat" ? "active" : ""}`}
            onClick={() => setActiveTab("chat")}
          >
            💬 Chat
          </button>
          <button 
            className={`tab-button ${activeTab === "checklist" ? "active" : ""}`}
            onClick={() => setActiveTab("checklist")}
          >
            ✓ Checklist ({checklistItems.filter(i => i.status === "COMPLETE").length}/{checklistItems.length})
          </button>
        </div>
      </div>
      
      {/* Main Content - Flex grow with overflow hidden */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {/* Mobile: Show active tab only */}
        <div className="h-full md:hidden">
          {activeTab === "chat" ? (
            <ChatPanel
              messages={messages}
              onSendMessage={handleSendMessage}
              onQuickReply={handleQuickReplySelect}
              quickReplies={quickReplies}
              isLoading={isAiLoading}
            />
          ) : (
            <ChecklistPanel
              items={checklistItems}
              onItemClick={handleChecklistClick}
            />
          )}
        </div>
        
        {/* Desktop: Show both panels side by side */}
        <div className="hidden md:flex h-full gap-3 p-3">
          <div className="flex-1 min-h-0">
            <ChatPanel
              messages={messages}
              onSendMessage={handleSendMessage}
              onQuickReply={handleQuickReplySelect}
              quickReplies={quickReplies}
              isLoading={isAiLoading}
            />
          </div>
          <div className="flex-1 min-h-0">
            <ChecklistPanel
              items={checklistItems}
              onItemClick={handleChecklistClick}
            />
          </div>
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