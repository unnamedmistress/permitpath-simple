import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageWrapper from "@/components/layout/PageWrapper";
import ProgressHeader from "@/components/layout/ProgressHeader";
import ChatPanel from "@/components/wizard/ChatPanel";
import ChecklistPanel from "@/components/wizard/ChecklistPanel";
import ActionBar from "@/components/wizard/ActionBar";
import PhotoGallery from "@/components/wizard/PhotoGallery";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useJob } from "@/hooks/useJob";
import { useChecklist } from "@/hooks/useChecklist";
import { useMessages } from "@/hooks/useMessages";
import { Photo, ChecklistItem, Message } from "@/types";

// In-memory photo storage
let memoryPhotos: Record<string, Photo[]> = {};

export default function WizardPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { currentJob, getJob, isLoading: jobLoading } = useJob();
  const { items: checklistItems, fetchChecklist, initializeChecklist, updateItem, getProgress } = useChecklist(jobId || "");
  const { messages, fetchMessages, addMessage, isLoading: messagesLoading } = useMessages(jobId || "");
  
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize job data
  useEffect(() => {
    if (!jobId) return;
    
    const init = async () => {
      const job = await getJob(jobId);
      if (!job) {
        navigate("/");
        return;
      }
      
      let checklist = await fetchChecklist();
      if (checklist.length === 0) {
        checklist = await initializeChecklist(job.jobType, job.jurisdiction);
      }
      
      await fetchMessages();
      setPhotos(memoryPhotos[jobId] || []);
      
      // Add welcome message if no messages
      const existingMessages = await fetchMessages();
      if (existingMessages.length === 0) {
        await addMessage(
          `Welcome! I'll help you document this ${job.jobType.replace("_", " ").toLowerCase()} permit for ${job.jurisdiction === "PINELLAS" ? "Pinellas County" : "City of Tampa"}. Upload a photo or let me know what you need help with!`,
          "assistant"
        );
      }
      
      setInitialized(true);
    };
    
    init();
  }, [jobId]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!jobId) return;
    
    await addMessage(content, "user");
    setIsAiLoading(true);
    
    // Simulate AI response (in production, this would call OpenAI)
    setTimeout(async () => {
      const responses = [
        "I understand. Can you tell me more about the current panel specifications?",
        "That's helpful! Based on your description, you'll need to document the main disconnect location. Do you have a photo of that?",
        "Great question! For Pinellas County, you'll need to provide a load calculation per NEC Article 220. Would you like me to guide you through that?",
        "I can see from your photo that this is a 200A panel. Let me update the checklist with that information.",
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      await addMessage(randomResponse, "assistant");
      setIsAiLoading(false);
    }, 1500);
  }, [jobId, addMessage]);

  const handleAddPhoto = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !jobId) return;
    
    // Create a preview URL
    const url = URL.createObjectURL(file);
    
    const newPhoto: Photo = {
      id: `photo-${Date.now()}`,
      jobId,
      url,
      uploadedAt: new Date(),
      status: "PROCESSING",
    };
    
    setPhotos(prev => [...prev, newPhoto]);
    memoryPhotos[jobId] = [...(memoryPhotos[jobId] || []), newPhoto];
    
    // Add a message about the photo
    await addMessage("I've uploaded a photo of the equipment.", "user");
    setIsAiLoading(true);
    
    // Simulate AI vision analysis
    setTimeout(async () => {
      // Update photo status
      const updatedPhoto = { ...newPhoto, status: "COMPLETE" as const };
      setPhotos(prev => prev.map(p => p.id === newPhoto.id ? updatedPhoto : p));
      memoryPhotos[jobId] = (memoryPhotos[jobId] || []).map(p => p.id === newPhoto.id ? updatedPhoto : p);
      
      await addMessage(
        "I've analyzed your photo. I can see this appears to be electrical equipment. Can you confirm what specific component this shows?",
        "assistant"
      );
      setIsAiLoading(false);
    }, 2000);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    if (!jobId) return;
    setPhotos(prev => prev.filter(p => p.id !== photoId));
    memoryPhotos[jobId] = (memoryPhotos[jobId] || []).filter(p => p.id !== photoId);
  };

  const handleChecklistItemClick = (item: ChecklistItem) => {
    // Focus on this item in chat
    addMessage(`Let's work on: ${item.title}. ${item.description}`, "assistant");
  };

  const handlePreview = () => {
    navigate(`/preview/${jobId}`);
  };

  const canPreview = checklistItems.some(i => i.status === "COMPLETE");
  const progress = getProgress();

  if (!initialized || jobLoading) {
    return (
      <PageWrapper hasBottomNav={false}>
        <div className="flex items-center justify-center h-screen">
          <LoadingSpinner size="lg" text="Loading job..." />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper hasBottomNav={false} className="flex flex-col h-screen">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handlePhotoSelected}
        className="hidden"
      />
      
      {/* Progress Header - 10vh */}
      <ProgressHeader
        title={currentJob?.title || "Permit Documentation"}
        progress={progress}
        onBack={() => navigate("/")}
        showMenu
      />
      
      {/* Main Content - 65vh */}
      <div className="flex-1 h-[65vh] overflow-hidden">
        <div className="h-full flex flex-col md:flex-row gap-3 p-3">
          {/* Chat Panel */}
          <div className="flex-1 min-h-0 md:w-1/2">
            <ChatPanel
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isAiLoading}
            />
          </div>
          
          {/* Checklist Panel */}
          <div className="flex-1 min-h-0 md:w-1/2">
            <ChecklistPanel
              items={checklistItems}
              onItemClick={handleChecklistItemClick}
            />
          </div>
        </div>
      </div>
      
      {/* Bottom Section - 25vh */}
      <div className="h-[25vh] min-h-[150px] bg-card border-t border-border flex flex-col">
        {/* Action Bar */}
        <ActionBar
          onAddPhoto={handleAddPhoto}
          onPreview={handlePreview}
          canPreview={canPreview}
        />
        
        {/* Photo Gallery */}
        <div className="flex-1 overflow-hidden">
          <PhotoGallery
            photos={photos}
            onDeletePhoto={handleDeletePhoto}
          />
        </div>
      </div>
    </PageWrapper>
  );
}
