import { useState, useCallback } from "react";
import { QuickReply, ChecklistItem, Message } from "@/types";
import { getQuestionsForItem, getFirstIncompleteQuestions } from "@/data/checklistQuestions";
import { formatPhotoRequirementsMessage, getPhotoRequirements } from "@/data/photoRequirements";

interface ConversationState {
  activeItemTitle: string | null;
  questionIndex: number;
  answers: Record<string, string>;
  quickReplies: QuickReply[];
  isComplete: boolean;
  pendingCompletion: {
    itemTitle: string;
    answers: Record<string, string>;
  } | null;
}

interface UseConversationFlowProps {
  jobType: string;
  jurisdiction: string;
  checklistItems: ChecklistItem[];
  onAddMessage: (content: string, role: "user" | "assistant") => Promise<Message>;
  onCompleteItem: (itemId: string, data: Record<string, unknown>) => void;
}

export function useConversationFlow({
  jobType,
  jurisdiction,
  checklistItems,
  onAddMessage,
  onCompleteItem
}: UseConversationFlowProps) {
  const [state, setState] = useState<ConversationState>({
    activeItemTitle: null,
    questionIndex: 0,
    answers: {},
    quickReplies: [],
    isComplete: false,
    pendingCompletion: null
  });

  // Start the conversation with a welcome message
  const startConversation = useCallback(async () => {
    // Check actual completion status first
    const incompleteItems = checklistItems.filter(item => item.status !== "COMPLETE");
    const completedCount = checklistItems.filter(item => item.status === "COMPLETE").length;
    
    if (incompleteItems.length === 0) {
      await onAddMessage(
        "🎉 Great news! All your checklist items are complete. Tap 'Preview Package' to see your permit documents!",
        "assistant"
      );
      setState(prev => ({ ...prev, quickReplies: [], isComplete: true }));
      return;
    }

    // Try to find an incomplete item with questions
    const firstIncompleteWithQuestions = getFirstIncompleteQuestions(jobType, jurisdiction, checklistItems);
    
    if (firstIncompleteWithQuestions) {
      const { itemTitle } = firstIncompleteWithQuestions;
      const welcomeMessage = `Hey! I'll help you get this permit ready. You have **${incompleteItems.length} items** to document.\n\nReady to start with "${itemTitle}"?`;
      
      await onAddMessage(welcomeMessage, "assistant");
      
      setState({
        activeItemTitle: null,
        questionIndex: 0,
        answers: {},
        quickReplies: [
          { label: "Yes, let's go! ✨", value: "start" },
          { label: "📷 Upload a photo first", value: "photo" }
        ],
        isComplete: false,
        pendingCompletion: null
      });
    } else {
      // No questions defined for this job type yet - provide photo-based workflow
      const firstIncompleteTitle = incompleteItems[0].title;
      await onAddMessage(
        `Hey! I'll help you document this permit. You have **${incompleteItems.length} requirements** to complete.\n\nLet's start by taking photos of what you have. Tap '📷 Add Photo' below to document **${firstIncompleteTitle}**.`,
        "assistant"
      );
      
      setState({
        activeItemTitle: null,
        questionIndex: 0,
        answers: {},
        quickReplies: [
          { label: "📷 Add Photo", value: "photo" },
          { label: "Tell me more", value: "explain" }
        ],
        isComplete: false,
        pendingCompletion: null
      });
    }
  }, [jobType, jurisdiction, checklistItems, onAddMessage]);

  // Start questions for a specific checklist item
  const startItemQuestions = useCallback(async (itemTitle: string) => {
    const questions = getQuestionsForItem(jobType, jurisdiction, itemTitle);
    
    if (questions.length === 0) {
      await onAddMessage(
        `I don't have specific questions for "${itemTitle}" yet. Would you like to upload a photo instead?`,
        "assistant"
      );
      setState(prev => ({
        ...prev,
        quickReplies: [
          { label: "📷 Add Photo", value: "photo" },
          { label: "Skip for now", value: "skip" }
        ]
      }));
      return;
    }

    const firstQuestion = questions[0];
    const message = firstQuestion.intro 
      ? `${firstQuestion.intro}\n\n${firstQuestion.question}`
      : firstQuestion.question;

    await onAddMessage(message, "assistant");
    
    setState({
      activeItemTitle: itemTitle,
      questionIndex: 0,
      answers: {},
      quickReplies: firstQuestion.options,
      isComplete: false,
      pendingCompletion: null
    });
  }, [jobType, jurisdiction, onAddMessage]);

  // Handle when user selects a quick reply
  const handleQuickReply = useCallback(async (reply: QuickReply) => {
    // Add user's selection as a message
    await onAddMessage(reply.label, "user");

    // Handle confirmation
    if (reply.value === "confirm_complete") {
      await completeCurrentItem();
      return;
    }

    if (reply.value === "edit_answers") {
      await onAddMessage(
        "No problem! What would you like to change? Just type the corrected information.",
        "assistant"
      );
      setState(prev => ({ ...prev, quickReplies: [], pendingCompletion: null }));
      return;
    }

    // Handle special values
    if (reply.value === "start") {
      const firstIncomplete = getFirstIncompleteQuestions(jobType, jurisdiction, checklistItems);
      if (firstIncomplete) {
        await startItemQuestions(firstIncomplete.itemTitle);
      }
      return;
    }

    if (reply.value === "photo" || reply.value === "take_photo") {
      // Get photo requirements if available
      const currentItemTitle = state.activeItemTitle;
      if (currentItemTitle) {
        const photoReqs = getPhotoRequirements(currentItemTitle);
        if (photoReqs.length > 0) {
          const photoMessage = formatPhotoRequirementsMessage(currentItemTitle);
          await onAddMessage(photoMessage, "assistant");
          setState(prev => ({ ...prev, quickReplies: [] }));
          return;
        }
      }
      
      // Fallback if no specific requirements
      await onAddMessage(
        "Great! Tap the '📷 Add Photo' button below to take or upload a photo. I'll analyze it and fill in the details for you.",
        "assistant"
      );
      setState(prev => ({ ...prev, quickReplies: [] }));
      return;
    }

    if (reply.value === "skip" || reply.value === "pause") {
      await onAddMessage(
        "No problem! You can come back anytime. Your progress is saved. When you're ready to continue, just tap on a checklist item.",
        "assistant"
      );
      setState(prev => ({ ...prev, quickReplies: [] }));
      return;
    }

    if (reply.value === "explain") {
      const incompleteItems = checklistItems.filter(item => item.status !== "COMPLETE");
      if (incompleteItems.length > 0) {
        await onAddMessage(
          `Here's what we need to document:\n\n${incompleteItems.map((item, i) => `${i + 1}. **${item.title}**\n   ${item.description}`).join('\n\n')}\n\nThe easiest way is to take photos as we go. Ready to start?`,
          "assistant"
        );
        setState(prev => ({
          ...prev,
          quickReplies: [
            { label: "Yes, let's do it! ✨", value: "start" },
            { label: "📷 Add Photo", value: "photo" }
          ]
        }));
      }
      return;
    }

    // Handle regular question answers
    if (!state.activeItemTitle) return;

    const questions = getQuestionsForItem(jobType, jurisdiction, state.activeItemTitle);
    const currentQuestion = questions[state.questionIndex];
    
    if (!currentQuestion) return;

    // Store the answer
    const newAnswers = { ...state.answers, [currentQuestion.field]: reply.value };

    // Check for follow-up message
    if (currentQuestion.followUp && currentQuestion.followUp[reply.value]) {
      await onAddMessage(currentQuestion.followUp[reply.value], "assistant");
      
      // If they need help (unknown, photo, etc.), offer photo option
      if (reply.value === "unknown" || reply.value === "photo" || reply.value === "explain") {
        setState(prev => ({
          ...prev,
          answers: newAnswers,
          quickReplies: [
            { label: "📷 Take Photo", value: "take_photo" },
            { label: "Continue anyway", value: "continue" }
          ]
        }));
        return;
      }
    }

    // Move to next question or show confirmation
    const nextIndex = state.questionIndex + 1;
    
    if (nextIndex < questions.length) {
      const nextQuestion = questions[nextIndex];
      const message = nextQuestion.intro 
        ? `${nextQuestion.intro}\n\n${nextQuestion.question}`
        : nextQuestion.question;
      
      await onAddMessage(message, "assistant");
      
      setState(prev => ({
        ...prev,
        questionIndex: nextIndex,
        answers: newAnswers,
        quickReplies: nextQuestion.options
      }));
    } else {
      // Show confirmation before completing
      await showCompletionConfirmation(newAnswers);
    }
  }, [state, jobType, jurisdiction, checklistItems, onAddMessage, startItemQuestions, showCompletionConfirmation]);

  // Handle "continue" after a follow-up
  const handleContinue = useCallback(async () => {
    if (!state.activeItemTitle) return;

    const questions = getQuestionsForItem(jobType, jurisdiction, state.activeItemTitle);
    const nextIndex = state.questionIndex + 1;
    
    if (nextIndex < questions.length) {
      const nextQuestion = questions[nextIndex];
      await onAddMessage(nextQuestion.question, "assistant");
      
      setState(prev => ({
        ...prev,
        questionIndex: nextIndex,
        quickReplies: nextQuestion.options
      }));
    } else {
      await showCompletionConfirmation(state.answers);
    }
  }, [state, jobType, jurisdiction, onAddMessage, showCompletionConfirmation]);

  // Show confirmation before completing item
  const showCompletionConfirmation = useCallback(async (answers: Record<string, string>) => {
    if (!state.activeItemTitle) return;

    // Format the captured information
    const formattedAnswers = Object.entries(answers)
      .map(([key, value]) => `• ${key}: ${value}`)
      .join('\n');

    await onAddMessage(
      `Perfect! I've captured this information:\n\n**${state.activeItemTitle}** ✅\n\n${formattedAnswers}\n\nIs this correct?`,
      "assistant"
    );

    setState(prev => ({
      ...prev,
      pendingCompletion: {
        itemTitle: state.activeItemTitle!,
        answers
      },
      quickReplies: [
        { label: "✅ Yes, that's right", value: "confirm_complete" },
        { label: "✏️ Edit something", value: "edit_answers" }
      ]
    }));
  }, [state.activeItemTitle, onAddMessage]);

  // Move to the next incomplete checklist item
  const moveToNextItemImpl = useCallback(async () => {
    // Check actual completion status
    const remainingIncomplete = checklistItems.filter(
      item => item.status !== "COMPLETE" && item.title !== state.activeItemTitle
    );

    if (remainingIncomplete.length === 0) {
      await onAddMessage(
        "🎉 **All done!** You've completed all the requirements. Tap 'Preview Package' to see your permit documents!",
        "assistant"
      );
      
      setState({
        activeItemTitle: null,
        questionIndex: 0,
        answers: {},
        quickReplies: [],
        isComplete: true,
        pendingCompletion: null
      });
      return;
    }

    // Try to find next item with questions
    const nextIncompleteWithQuestions = getFirstIncompleteQuestions(
      jobType, 
      jurisdiction, 
      remainingIncomplete
    );

    if (nextIncompleteWithQuestions) {
      await onAddMessage(
        `Great! **${remainingIncomplete.length} items** left. Let's move on to **${nextIncompleteWithQuestions.itemTitle}**. Ready?`,
        "assistant"
      );
      
      setState({
        activeItemTitle: nextIncompleteWithQuestions.itemTitle,
        questionIndex: 0,
        answers: {},
        quickReplies: [
          { label: "Yes, continue! ✨", value: "continue_next" },
          { label: "Take a break", value: "pause" }
        ],
        isComplete: false,
        pendingCompletion: null
      });
    } else {
      // No questions for remaining items - suggest photo approach
      const nextTitle = remainingIncomplete[0].title;
      await onAddMessage(
        `Good progress! **${remainingIncomplete.length} items** left.\n\nFor **${nextTitle}**, let's document it with photos. Tap '📷 Add Photo' below.`,
        "assistant"
      );
      
      setState({
        activeItemTitle: null,
        questionIndex: 0,
        answers: {},
        quickReplies: [
          { label: "📷 Add Photo", value: "photo" },
          { label: "Skip for now", value: "pause" }
        ],
        isComplete: false,
        pendingCompletion: null
      });
    }
  }, [jobType, jurisdiction, checklistItems, state.activeItemTitle, onAddMessage]);

  // Complete the current checklist item (after confirmation)
  const completeCurrentItem = useCallback(async () => {
    if (!state.pendingCompletion) return;

    const { itemTitle, answers } = state.pendingCompletion;
    const currentItem = checklistItems.find(item => item.title === itemTitle);
    
    if (currentItem) {
      onCompleteItem(currentItem.id, answers);
    }

    const completedCount = checklistItems.filter(i => i.status === "COMPLETE").length + 1;
    const totalCount = checklistItems.length;

    await onAddMessage(
      `✅ **${itemTitle}** — Complete! (${completedCount} of ${totalCount} done)\n\nI've saved all that info.`,
      "assistant"
    );

    // Clear pending completion
    setState(prev => ({ ...prev, pendingCompletion: null }));

    // Move to next incomplete item (inline to avoid circular dependency)
    const remainingIncomplete = checklistItems.filter(
      item => item.status !== "COMPLETE" && item.title !== itemTitle
    );

    if (remainingIncomplete.length === 0) {
      await onAddMessage(
        "🎉 **All done!** You've completed all the requirements. Tap 'Preview Package' to see your permit documents!",
        "assistant"
      );
      
      setState({
        activeItemTitle: null,
        questionIndex: 0,
        answers: {},
        quickReplies: [],
        isComplete: true,
        pendingCompletion: null
      });
      return;
    }

    // Try to find next item with questions
    const nextIncompleteWithQuestions = getFirstIncompleteQuestions(
      jobType, 
      jurisdiction, 
      remainingIncomplete
    );

    if (nextIncompleteWithQuestions) {
      await onAddMessage(
        `Great! **${remainingIncomplete.length} items** left. Let's move on to **${nextIncompleteWithQuestions.itemTitle}**. Ready?`,
        "assistant"
      );
      
      setState({
        activeItemTitle: nextIncompleteWithQuestions.itemTitle,
        questionIndex: 0,
        answers: {},
        quickReplies: [
          { label: "Yes, continue! ✨", value: "continue_next" },
          { label: "Take a break", value: "pause" }
        ],
        isComplete: false,
        pendingCompletion: null
      });
    } else {
      // No questions for remaining items - suggest photo approach
      const nextTitle = remainingIncomplete[0].title;
      await onAddMessage(
        `Good progress! **${remainingIncomplete.length} items** left.\n\nFor **${nextTitle}**, let's document it with photos. Tap '📷 Add Photo' below.`,
        "assistant"
      );
      
      setState({
        activeItemTitle: null,
        questionIndex: 0,
        answers: {},
        quickReplies: [
          { label: "📷 Add Photo", value: "photo" },
          { label: "Skip for now", value: "pause" }
        ],
        isComplete: false,
        pendingCompletion: null
      });
    }
  }, [state.pendingCompletion, checklistItems, onCompleteItem, onAddMessage, jobType, jurisdiction]);

  // Wrapper for external use
  const moveToNextItem = moveToNextItemImpl;

  // Handle clicking on a checklist item
  const handleChecklistItemClick = useCallback(async (item: ChecklistItem) => {
    if (item.status === "COMPLETE") {
      await onAddMessage(
        `✅ **${item.title}** is already complete! Want to review or change anything?`,
        "assistant"
      );
      setState(prev => ({
        ...prev,
        quickReplies: [
          { label: "Review answers", value: "review" },
          { label: "Make changes", value: "edit" },
          { label: "Continue", value: "continue_flow" }
        ],
        pendingCompletion: null
      }));
      return;
    }

    await startItemQuestions(item.title);
  }, [startItemQuestions, onAddMessage]);

  // Handle "Tell Me More" button click
  const handleTellMeMore = useCallback(async (item: ChecklistItem) => {
    // Create detailed explanation
    let explanation = `Great question! Let me explain **${item.title}** in detail.\n\n`;
    explanation += `📋 **What this is:**\n${item.description}\n\n`;
    
    // Check if we have photo requirements
    const photoReqs = getPhotoRequirements(item.title);
    if (photoReqs.length > 0) {
      explanation += `📸 **Photos needed:**\n`;
      photoReqs.forEach((req, i) => {
        explanation += `${i + 1}. ${req.name} - ${req.instructions}\n`;
      });
      explanation += `\n`;
    }
    
    // Check if we have questions for this item
    const questions = getQuestionsForItem(jobType, jurisdiction, item.title);
    if (questions.length > 0) {
      explanation += `💬 **What I'll ask about:**\n`;
      questions.forEach((q, i) => {
        explanation += `${i + 1}. ${q.question.split('\n')[0]}\n`;
      });
      explanation += `\n`;
    }
    
    explanation += `Ready to document this requirement?`;
    
    await onAddMessage(explanation, "assistant");
    
    setState(prev => ({
      ...prev,
      activeItemTitle: item.title,
      questionIndex: 0,
      answers: {},
      quickReplies: [
        { label: "Yes, let's do it! ✨", value: questions.length > 0 ? "start" : "photo" },
        { label: "📷 I'll take photos", value: "photo" },
        { label: "Skip for now", value: "pause" }
      ],
      pendingCompletion: null
    }));
  }, [jobType, jurisdiction, onAddMessage]);

  // Handle continuing to the next item after a pause
  const handleContinueNext = useCallback(async () => {
    if (state.activeItemTitle) {
      await startItemQuestions(state.activeItemTitle);
    }
  }, [state.activeItemTitle, startItemQuestions]);

  return {
    quickReplies: state.quickReplies,
    isFlowComplete: state.isComplete,
    activeItemTitle: state.activeItemTitle,
    startConversation,
    handleQuickReply: async (reply: QuickReply) => {
      if (reply.value === "continue_next") {
        await handleContinueNext();
      } else if (reply.value === "continue") {
        await handleContinue();
      } else if (reply.value === "continue_flow") {
        await moveToNextItem();
      } else {
        await handleQuickReply(reply);
      }
    },
    handleChecklistItemClick,
    handleTellMeMore,
    startItemQuestions
  };
}
