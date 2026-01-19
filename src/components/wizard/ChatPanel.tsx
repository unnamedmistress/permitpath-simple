import { useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Message, QuickReply } from "@/types";
import QuickReplies from "./QuickReplies";

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  onQuickReply?: (reply: QuickReply) => void;
  quickReplies?: QuickReply[];
  isLoading?: boolean;
}

export default function ChatPanel({ 
  messages, 
  onSendMessage, 
  onQuickReply,
  quickReplies = [],
  isLoading = false 
}: ChatPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, quickReplies]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = inputRef.current;
    if (input && input.value.trim() && !isLoading) {
      onSendMessage(input.value.trim());
      input.value = "";
    }
  };

  const handleQuickReplySelect = (reply: QuickReply) => {
    if (onQuickReply) {
      onQuickReply(reply);
    }
  };

  // Format message content with markdown-like styling
  const formatMessage = (content: string) => {
    const paragraphs = content.split('\n\n');
    
    return paragraphs.map((paragraph, i) => {
      const parts = paragraph.split(/(\*\*[^*]+\*\*)/g);
      
      return (
        <p key={i} className={i > 0 ? "mt-1.5" : ""}>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>;
            }
            return part.split('\n').map((line, k) => (
              <span key={`${j}-${k}`}>
                {k > 0 && <br />}
                {line}
              </span>
            ));
          })}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-card md:rounded-xl md:border md:border-border overflow-hidden">
      {/* Compact header - hidden on mobile since we have tabs */}
      <div className="hidden md:block px-3 py-2 border-b border-border bg-muted/30">
        <h2 className="text-sm font-semibold text-foreground">AI Assistant</h2>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-6">
            <p className="text-xs">Getting ready...</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                }`}
              >
                <div className="text-xs leading-relaxed">
                  {formatMessage(message.content)}
                </div>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-md px-3 py-2">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies - horizontal scroll */}
      {quickReplies.length > 0 && !isLoading && (
        <QuickReplies 
          replies={quickReplies} 
          onSelect={handleQuickReplySelect}
          disabled={isLoading}
        />
      )}
      
      {/* Compact input form */}
      <form onSubmit={handleSubmit} className="p-2 border-t border-border bg-background">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 rounded-full bg-muted border-none text-xs 
                       focus:outline-none focus:ring-2 focus:ring-primary/50
                       placeholder:text-muted-foreground"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-8 h-8 flex items-center justify-center rounded-full 
                       bg-primary text-primary-foreground
                       hover:bg-primary/90 active:bg-primary/80
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}