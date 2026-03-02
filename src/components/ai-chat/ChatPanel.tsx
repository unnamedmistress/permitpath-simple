import { FormEvent, useState } from 'react';
import { Send } from 'lucide-react';
import Button from '@/components/shared/Button';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  onSend: (message: string) => void;
}

export default function ChatPanel({ messages, isLoading = false, onSend }: ChatPanelProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput('');
  };

  return (
    <div className="rounded-xl border bg-card">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Permit Assistant Chat</h2>
      </div>

      <div className="max-h-[360px] overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-sm text-muted-foreground">Analyzing your job details...</div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={2}
            placeholder="Tell me the work in simple words."
            className="w-full rounded-xl border bg-background px-3 py-2 text-sm resize-none"
            disabled={isLoading}
          />
          <Button type="submit" disabled={!input.trim() || isLoading}>
            <Send size={16} />
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}
