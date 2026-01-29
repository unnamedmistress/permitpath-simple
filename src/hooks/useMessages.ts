import { useState, useCallback } from "react";
import { Message } from "@/types";

// In-memory storage
let memoryMessages: Record<string, Message[]> = {};

export function useMessages(jobId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMessages = useCallback(async (): Promise<Message[]> => {
    setIsLoading(true);
    try {
      const existing = memoryMessages[jobId] || [];
      setMessages(existing);
      return existing;
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  const addMessage = useCallback(
    async (content: string, role: "user" | "assistant"): Promise<Message> => {
      const newMessage: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        jobId,
        role,
        content,
        timestamp: new Date(),
      };

      const updated = [...(memoryMessages[jobId] || []), newMessage];
      memoryMessages[jobId] = updated;
      setMessages(updated);

      return newMessage;
    },
    [jobId]
  );

  const clearMessages = useCallback(async (): Promise<void> => {
    memoryMessages[jobId] = [];
    setMessages([]);
  }, [jobId]);

  return {
    messages,
    isLoading,
    fetchMessages,
    addMessage,
    clearMessages,
  };
}
