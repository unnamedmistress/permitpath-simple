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
import { useConversationFlow } from "@/hooks/useConversationFlow";
import { Photo, ChecklistItem, QuickReply, Message } from "@/types";

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
  const [conversationStarted, setConversationStarted] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "checklist">("chat");
  const [photosExpanded, setPhotosExpanded] = useState(false);

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
        navigate("/");
        return;
      }
      
      let checklist = await fetchChecklist();
      if (checklist.length === 0) {
        checklist = await initializeChecklist(job.jobType, job.jurisdiction);
      }
      
      await fetchMessages();
      setPhotos(memoryPhotos[jobId] || []);
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
    setPhotosExpanded(true); // Show photos when a new one is added
    
    // Add a message about the photo
    await addMessage("📷 I've uploaded a photo", "user");
    setIsAiLoading(true);
    setActiveTab("chat"); // Switch to chat to see AI response
    
    // Simulate AI vision analysis
    setTimeout(async () => {
      // Update photo status
      const updatedPhoto = { ...newPhoto, status: "COMPLETE" as const };
      setPhotos(prev => prev.map(p => p.id === newPhoto.id ? updatedPhoto : p));
      memoryPhotos[jobId] = (memoryPhotos[jobId] || []).map(p => p.id === newPhoto.id ? updatedPhoto : p);
      
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

  const handleDeletePhoto = (photoId: string) => {
    if (!jobId) return;
    setPhotos(prev => prev.filter(p => p.id !== photoId));
    memoryPhotos[jobId] = (memoryPhotos[jobId] || []).filter(p => p.id !== photoId);
  };

  const handlePreview = () => {
    navigate(`/preview/${jobId}`);
  };

  const canPreview = checklistItems.some(i => i.status === "COMPLETE");
  const progress = getProgress();

  if (!initialized || jobLoading) {
    return (
      <PageWrapper hasBottomNav={false}>
        <div className="flex items-center justify-center h-screen-safe">
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
              onDeletePhoto={handleDeletePhoto}
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
    </PageWrapper>
  );
}