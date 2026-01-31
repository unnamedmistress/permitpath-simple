import { useState, useCallback } from "react";
import { Message } from "@/types";
import { db, isFirebaseReady } from "@/config/firebase";
import { useAuth } from "@/context/AuthContext";
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";

// In-memory storage
let memoryMessages: Record<string, Message[]> = {};

export function useMessages(jobId: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const useFirestore = isFirebaseReady() && !!db && !!user;

  const fetchMessages = useCallback(async (): Promise<Message[]> => {
    setIsLoading(true);
    try {
      if (useFirestore && db && user) {
        const messagesQuery = query(
          collection(db, "messages"),
          where("jobId", "==", jobId),
          where("userId", "==", user.uid),
          orderBy("timestamp", "asc")
        );
        const snapshot = await getDocs(messagesQuery);
        const fetched = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            jobId: data.jobId,
            role: data.role,
            content: data.content,
            timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(),
          } as Message;
        });
        setMessages(fetched);
        return fetched;
      }

      const existing = memoryMessages[jobId] || [];
      setMessages(existing);
      return existing;
    } catch (error) {
      console.error("Failed to fetch messages", error);
      const existing = memoryMessages[jobId] || [];
      setMessages(existing);
      return existing;
    } finally {
      setIsLoading(false);
    }
  }, [jobId, useFirestore, user]);

  const addMessage = useCallback(
    async (content: string, role: "user" | "assistant"): Promise<Message> => {
      const newMessage: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        jobId,
        role,
        content,
        timestamp: new Date(),
      };

      if (useFirestore && db && user) {
        const docRef = await addDoc(collection(db, "messages"), {
          jobId,
          userId: user.uid,
          role,
          content,
          timestamp: serverTimestamp(),
        });
        const saved: Message = { ...newMessage, id: docRef.id };
        setMessages((prev) => [...prev, saved]);
        return saved;
      }

      const updated = [...(memoryMessages[jobId] || []), newMessage];
      memoryMessages[jobId] = updated;
      setMessages(updated);

      return newMessage;
    },
    [jobId, useFirestore, user]
  );

  const clearMessages = useCallback(async (): Promise<void> => {
    if (useFirestore && db && user) {
      const messagesQuery = query(
        collection(db, "messages"),
        where("jobId", "==", jobId),
        where("userId", "==", user.uid)
      );
      const snapshot = await getDocs(messagesQuery);
      await Promise.all(snapshot.docs.map((docSnap) => deleteDoc(doc(db, "messages", docSnap.id))));
    }

    memoryMessages[jobId] = [];
    setMessages([]);
  }, [jobId, useFirestore, user]);

  return {
    messages,
    isLoading,
    fetchMessages,
    addMessage,
    clearMessages,
  };
}
