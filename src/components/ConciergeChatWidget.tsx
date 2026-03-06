'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Minimize2, Maximize2, Bot, User, Sparkles, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { generatePrediction, detectIntent } from '@/services/predictionEngine';
import type { JobType, Jurisdiction } from '@/types/permit';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  prediction?: {
    jobType: JobType;
    confidence: number;
  };
}

interface ConciergeChatProps {
  jobType?: JobType;
  jurisdiction?: Jurisdiction;
  className?: string;
}

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: "Hi! I'm your Permit Concierge. I can help you:\n\n• Predict what permits you need\n• Answer questions about requirements\n• Guide you through the process\n\nWhat project are you working on?",
  timestamp: new Date(),
  suggestions: ['Roof replacement', 'New water heater', 'Electrical panel upgrade'],
};

const QUICK_REPLIES = [
  { label: 'How long will this take?', value: 'timeline' },
  { label: 'What documents do I need?', value: 'documents' },
  { label: 'How much does it cost?', value: 'cost' },
  { label: 'Do I need a contractor?', value: 'contractor' },
];

export default function ConciergeChatWidget({ jobType, jurisdiction, className = '' }: ConciergeChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
      setUnreadCount(0);
    }
  }, [isOpen, messages, scrollToBottom]);

  // Handle sending a message
  const handleSend = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI processing
    setTimeout(() => {
      const response = generateResponse(text, jobType, jurisdiction);
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
      
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    }, 800 + Math.random() * 600);
  }, [isOpen, jobType, jurisdiction]);

  // Generate contextual response
  const generateResponse = (userText: string, currentJobType?: JobType, currentJurisdiction?: Jurisdiction): Message => {
    const normalizedText = userText.toLowerCase();
    
    // Check for intent detection
    if (!currentJobType) {
      const detected = detectIntent(userText);
      
      if (detected.primaryIntent && detected.confidence >= 60) {
        return {
          id: Date.now().toString(),
          role: 'assistant',
          content: `It sounds like you're working on a **${formatJobType(detected.primaryIntent)}** project. I'm ${detected.confidence}% confident about this.\n\nWould you like me to generate a permit checklist for this?`,
          timestamp: new Date(),
          suggestions: ['Yes, generate checklist', 'No, let me clarify', 'Tell me more'],
          prediction: {
            jobType: detected.primaryIntent,
            confidence: detected.confidence,
          },
        };
      }
    }

    // Quick reply handlers
    if (normalizedText.includes('timeline') || normalizedText.includes('how long') || normalizedText.includes('time')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: currentJobType 
          ? `For **${formatJobType(currentJobType)}** in Pinellas County, typical timelines are:\n\n• Simple permits: 3-5 days\n• Standard permits: 1-2 weeks\n• Complex permits: 3-6 weeks\n\nYour specific timeline depends on completeness of documents and current department workload.`
          : 'Permit timelines vary by project type:\n\n• Roof/water heater: 3-5 days\n• Electrical/HVAC: 5-10 days\n• Remodels: 2-4 weeks\n• Additions: 4-8 weeks\n\nWhat type of project are you working on?',
        timestamp: new Date(),
        suggestions: QUICK_REPLIES.map(q => q.label),
      };
    }

    if (normalizedText.includes('cost') || normalizedText.includes('price') || normalizedText.includes('fee')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: currentJobType
          ? `Permit fees for **${formatJobType(currentJobType)}** typically range from $50-300 depending on project value and jurisdiction within Pinellas County.\n\nYou can get an exact estimate after completing your checklist.`
          : 'Permit fees vary by project type:\n\n• Simple permits (roof, water heater): $50-150\n• Standard permits (electrical, HVAC): $100-300\n• Complex permits (remodels, additions): $300-800+\n\nTell me about your project for a more specific estimate.',
        timestamp: new Date(),
        suggestions: QUICK_REPLIES.map(q => q.label),
      };
    }

    if (normalizedText.includes('document') || normalizedText.includes('need') || normalizedText.includes('require')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: currentJobType
          ? `For **${formatJobType(currentJobType)}**, you'll typically need:\n\n• Permit application\n• Contractor license (if applicable)\n• Project specifications\n• Site plans (for larger projects)\n\nI can generate a complete checklist tailored to your specific project.`
          : 'Required documents vary by project, but generally include:\n\n• Completed permit application\n• Proof of ownership or authorization\n• Contractor license & insurance (if applicable)\n• Project plans or specifications\n• Site survey (for larger projects)\n\nWhat type of project are you working on? I can give you a specific list.',
        timestamp: new Date(),
        suggestions: ['Generate my checklist', 'What if I DIY?', QUICK_REPLIES[0].label],
      };
    }

    if (normalizedText.includes('contractor') || normalizedText.includes('pro') || normalizedText.includes('professional')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Whether you need a contractor depends on the project:\n\n**Homeowner can typically DIY:**\n• Painting, flooring, minor repairs\n• Some jurisdictions allow electrical/plumbing\n\n**Requires licensed contractor:**\n• Roof work, electrical panels\n• HVAC, major plumbing\n• Structural changes\n\nCheck your local requirements - some work legally requires a licensed professional.',
        timestamp: new Date(),
        suggestions: QUICK_REPLIES.map(q => q.label),
      };
    }

    // Default helpful response
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'I can help you figure out what permits you need and guide you through the process.\n\nTell me more about your project - what type of work are you planning?',
      timestamp: new Date(),
      suggestions: ['Roofing', 'Water heater', 'Kitchen remodel', 'Electrical work'],
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-20 right-4 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center transition-colors"
          >
            <MessageSquare size={24} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? 'auto' : '500px',
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-4 z-50 w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Permit Concierge</h3>
                  <p className="text-xs text-blue-100">AI Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div className="h-80 overflow-y-auto p-4 space-y-4 bg-slate-50">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                        ${message.role === 'user' ? 'bg-blue-600' : 'bg-slate-200'}
                      `}>
                        {message.role === 'user' ? (
                          <User size={14} className="text-white" />
                        ) : (
                          <Bot size={14} className="text-slate-600" />
                        )}
                      </div>
                      <div className={`max-w-[75%] ${message.role === 'user' ? 'text-right' : ''}`}>
                        <div className={`
                          inline-block px-3 py-2 rounded-2xl text-sm text-left
                          ${message.role === 'user' 
                            ? 'bg-blue-600 text-white rounded-br-md' 
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-md shadow-sm'}
                        `}>
                          {message.content.split('\n').map((line, i) => (
                            <p key={i} className={line.startsWith('•') ? 'ml-2' : ''}>
                              {line.startsWith('**') && line.endsWith('**') ? (
                                <strong>{line.replace(/\*\*/g, '')}</strong>
                              ) : (
                                line
                              )}
                            </p>
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        
                        {/* Suggestion chips */}
                        {message.suggestions && (
                          <div className="flex flex-wrap gap-1.5 mt-2 justify-start">
                            {message.suggestions.map((suggestion) => (
                              <button
                                key={suggestion}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="px-2.5 py-1 bg-white border border-slate-200 rounded-full text-xs text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                        <Bot size={14} className="text-slate-600" />
                      </div>
                      <div className="bg-white border border-slate-200 px-3 py-2 rounded-2xl rounded-bl-md shadow-sm">
                        <div className="flex gap-1">
                          <motion.div
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                            className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                          />
                          <motion.div
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                            className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                          />
                          <motion.div
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                            className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Replies */}
                <div className="px-4 py-2 border-t border-slate-100 bg-white">
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {QUICK_REPLIES.map((reply) => (
                      <button
                        key={reply.value}
                        onClick={() => handleSuggestionClick(reply.label)}
                        className="flex-shrink-0 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-xs text-slate-600 transition-colors whitespace-nowrap"
                      >
                        {reply.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend(input);
                  }}
                  className="p-3 border-t border-slate-200 bg-white flex gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message and press Enter..."
                    className="flex-1 px-3 py-2 bg-slate-100 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={isTyping}
                    className="w-9 h-9 rounded-xl"
                  >
                    <Send size={16} />
                  </Button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function formatJobType(type: JobType): string {
  return type
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase());
}
