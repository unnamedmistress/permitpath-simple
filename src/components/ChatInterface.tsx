'use client';

import { useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';

import { ChatMessage } from '@/types';

interface Props {
  messages: ChatMessage[];
  isTyping: boolean;
  onSend: (text: string) => void;
  onClose: () => void;
}

export default function ChatInterface({ messages, isTyping, onSend, onClose }: Props) {
  const [value, setValue] = useState('');

  return (
    <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl">
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h3 className="inline-flex items-center gap-2 font-semibold text-slate-900">
          <MessageSquare size={18} /> Permit Concierge
        </h3>
        <button onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100">
          <X size={16} />
        </button>
      </header>

      <div className="max-h-80 space-y-2 overflow-y-auto px-4 py-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`rounded-xl px-3 py-2 text-sm ${
              message.role === 'user' ? 'ml-8 bg-blue-600 text-white' : 'mr-8 bg-slate-100 text-slate-800'
            }`}
          >
            <p>{message.content}</p>
          </div>
        ))}
        {isTyping ? <p className="text-xs text-slate-500">Assistant is typing...</p> : null}
      </div>

      <form
        className="flex items-center gap-2 border-t border-slate-200 px-3 py-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (!value.trim()) return;
          onSend(value.trim());
          setValue('');
        }}
      >
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Ask about permits, status, or documents"
        />
        <button className="rounded-lg bg-blue-600 p-2 text-white" type="submit" aria-label="Send message">
          <Send size={16} />
        </button>
      </form>
    </section>
  );
}
