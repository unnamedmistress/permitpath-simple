import { useState, useCallback } from "react";
import { QuickReply, ChecklistItem, Message } from "@/types";
import { getQuestionsForItem, getFirstIncompleteQuestions } from "@/data/checklistQuestions";

interface ConversationState {
  activeItemTitle: string | null;
  questionIndex: number;
  answers: Record<string, string>;
  quickReplies: QuickReply[];
  isComplete: boolean;
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
    isComplete: false
  });

  // Start the conversation with a welcome message
  const startConversation = useCallback(async () => {
    const firstIncomplete = getFirstIncompleteQuestions(jobType, jurisdiction, checklistItems);
    
    if (!firstIncomplete) {
      await onAddMessage(
        "🎉 Great news! All your checklist items are complete. Tap 'Preview Package' to see your permit documents!",
        "assistant"
      );
      setState(prev => ({ ...prev, quickReplies: [], isComplete: true }));
      return;
    }

    const { itemTitle, questions } = firstIncomplete;
    const firstQuestion = questions[0];

    const welcomeMessage = `Hey! I'll help you get this permit ready. Let's go through each requirement together — just tap your answers!\n\n**Ready to start with "${itemTitle}"?**`;
    
    await onAddMessage(welcomeMessage, "assistant");
    
    setState({
      activeItemTitle: null,
      questionIndex: 0,
      answers: {},
      quickReplies: [
        { label: "Yes, let's go! ✨", value: "start" },
        { label: "📷 Upload a photo first", value: "photo" }
      ],
      isComplete: false
    });
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
      isComplete: false
    });
  }, [jobType, jurisdiction, onAddMessage]);

  // Handle when user selects a quick reply
  const handleQuickReply = useCallback(async (reply: QuickReply) => {
    // Add user's selection as a message
    await onAddMessage(reply.label, "user");

    // Handle special values
    if (reply.value === "start") {
      const firstIncomplete = getFirstIncompleteQuestions(jobType, jurisdiction, checklistItems);
      if (firstIncomplete) {
        await startItemQuestions(firstIncomplete.itemTitle);
      }
      return;
    }

    if (reply.value === "photo" || reply.value === "take_photo") {
      await onAddMessage(
        "Great idea! Tap the '📷 Add Photo' button below to take or upload a photo. I'll analyze it and fill in the details for you.",
        "assistant"
      );
      setState(prev => ({ ...prev, quickReplies: [] }));
      return;
    }

    if (reply.value === "skip") {
      await moveToNextItem();
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

    // Move to next question or complete item
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
      // Complete this checklist item
      await completeCurrentItem(newAnswers);
    }
  }, [state, jobType, jurisdiction, checklistItems, onAddMessage, startItemQuestions]);

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
      await completeCurrentItem(state.answers);
    }
  }, [state, jobType, jurisdiction, onAddMessage]);

  // Complete the current checklist item
  const completeCurrentItem = useCallback(async (answers: Record<string, string>) => {
    if (!state.activeItemTitle) return;

    const currentItem = checklistItems.find(item => item.title === state.activeItemTitle);
    if (currentItem) {
      onCompleteItem(currentItem.id, answers);
    }

    await onAddMessage(
      `✅ **${state.activeItemTitle}** — Done! I've saved all that info.`,
      "assistant"
    );

    // Move to next incomplete item
    await moveToNextItem();
  }, [state.activeItemTitle, checklistItems, onCompleteItem, onAddMessage]);

  // Move to the next incomplete checklist item
  const moveToNextItem = useCallback(async () => {
    const nextIncomplete = getFirstIncompleteQuestions(
      jobType, 
      jurisdiction, 
      checklistItems.filter(item => item.title !== state.activeItemTitle)
    );

    if (nextIncomplete) {
      await onAddMessage(
        `Let's move on to **${nextIncomplete.itemTitle}**. Ready?`,
        "assistant"
      );
      
      setState({
        activeItemTitle: null,
        questionIndex: 0,
        answers: {},
        quickReplies: [
          { label: "Yes, continue! ✨", value: "continue_next" },
          { label: "Take a break", value: "pause" }
        ],
        isComplete: false
      });

      // Store the next item title for when they click continue
      setState(prev => ({ ...prev, activeItemTitle: nextIncomplete.itemTitle }));
    } else {
      await onAddMessage(
        "🎉 **All done!** You've completed all the requirements. Tap 'Preview Package' to see your permit documents!",
        "assistant"
      );
      
      setState({
        activeItemTitle: null,
        questionIndex: 0,
        answers: {},
        quickReplies: [],
        isComplete: true
      });
    }
  }, [jobType, jurisdiction, checklistItems, state.activeItemTitle, onAddMessage]);

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
        ]
      }));
      return;
    }

    await startItemQuestions(item.title);
  }, [startItemQuestions, onAddMessage]);

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
    startItemQuestions
  };
}
