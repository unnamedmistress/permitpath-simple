import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Send, Bot, User, Paperclip, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { JobType, Jurisdiction, Requirement } from '@/types/permit';
import ChatPanel, { ChatMessage } from '@/components/ai-chat/ChatPanel';
import PhotoUploadTray, { SelectedPhoto } from '@/components/ai-chat/PhotoUploadTray';
import AnalysisResultCards, { PermitAssistantAnalysis } from '@/components/ai-chat/AnalysisResultCards';

const JURISDICTIONS: Array<{ value: Jurisdiction; label: string }> = [
  { value: 'PINELLAS_COUNTY', label: 'Pinellas County (Unincorporated)' },
  { value: 'ST_PETERSBURG', label: 'City of St. Petersburg' },
  { value: 'CLEARWATER', label: 'City of Clearwater' },
  { value: 'LARGO', label: 'City of Largo' },
  { value: 'PALM_HARBOR', label: 'Palm Harbor' }
];

interface UploadRef {
  imageRef: string;
  uploadUrl: string;
  headers?: Record<string, string>;
}

function inferJobType(permitTypes: string[]): JobType {
  const haystack = permitTypes.join(' ').toLowerCase();
  if (haystack.includes('roof')) return 'RE_ROOFING';
  if (haystack.includes('panel')) return 'ELECTRICAL_PANEL';
  if (haystack.includes('rewire')) return 'ELECTRICAL_REWIRING';
  if (haystack.includes('water heater')) return 'WATER_HEATER';
  if (haystack.includes('plumbing')) return 'PLUMBING_MAIN_LINE';
  if (haystack.includes('window') || haystack.includes('door')) return 'WINDOW_DOOR_REPLACEMENT';
  return 'RE_ROOFING';
}

function analysisToRequirements(result: PermitAssistantAnalysis): Requirement[] {
  return result.nextSteps.slice(0, 5).map((step, index) => ({
    id: `ai-req-${Date.now()}-${index}`,
    jobId: '',
    category: 'document',
    title: step,
    description: step,
    isRequired: true,
    confidence: result.confidence,
    status: 'pending',
    actionType: 'Do this step now',
    plainLanguageWhy: 'This step helps move your permit forward.',
    acceptedFormats: ['PDF', 'JPG', 'PNG'],
    allowsMultipleUploads: true
  }));
}

// Message bubble component
function MessageBubble({ message, isUser }: { message: string; isUser: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-blueprint' : 'bg-sky'
      }`}>
        {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-blueprint" />}
      </div>
      <div className={`max-w-[80%] p-4 rounded-2xl ${
        isUser 
          ? 'bg-blueprint text-white rounded-tr-sm' 
          : 'bg-white border border-lightGray rounded-tl-sm'
      }`}>
        <p className="text-sm leading-relaxed">{message}</p>
      </div>
    </motion.div>
  );
}

export default function AiPermitAssistantPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Tell me your job. Add photos if you have them.'
    }
  ]);
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [address, setAddress] = useState('');
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>('PINELLAS_COUNTY');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PermitAssistantAnalysis | null>(null);
  const [inputMessage, setInputMessage] = useState('');

  const photoCountLabel = useMemo(() => `${photos.length} photo${photos.length === 1 ? '' : 's'} ready`, [photos.length]);

  const addPhotos = (files: FileList) => {
    const availableSlots = 5 - photos.length;
    const selected = Array.from(files).slice(0, availableSlots);
    const next = selected.map((file) => ({
      id: `photo-${Date.now()}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file)
    }));
    setPhotos((prev) => [...prev, ...next]);
  };

  const removePhoto = (photoId: string) => {
    setPhotos((prev) => {
      const toRemove = prev.find((photo) => photo.id === photoId);
      if (toRemove) URL.revokeObjectURL(toRemove.previewUrl);
      return prev.filter((photo) => photo.id !== photoId);
    });
  };

  const uploadPhotos = async (): Promise<string[]> => {
    if (photos.length === 0) return [];

    const requestPayload = {
      files: photos.map((photo) => ({
        filename: photo.file.name,
        contentType: photo.file.type || 'image/jpeg',
        size: photo.file.size
      }))
    };

    const uploadResponse = await fetch('/api/permit-assistant/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload)
    });

    if (!uploadResponse.ok) {
      throw new Error('Could not prepare uploads');
    }

    const uploadData = await uploadResponse.json();
    const uploads: UploadRef[] = uploadData.uploads || [];

    await Promise.all(
      uploads.map(async (upload, index) => {
        const file = photos[index]?.file;
        if (!file) return;
        await fetch(upload.uploadUrl, {
          method: 'PUT',
          headers: upload.headers,
          body: file
        });
      })
    );

    return uploads.map((upload) => upload.imageRef);
  };

  const handleSend = async (message: string) => {
    if (!message.trim()) return;
    
    setMessages((prev) => [...prev, { id: `user-${Date.now()}`, role: 'user', content: message }]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      const imageRefs = await uploadPhotos();
      const response = await fetch('/api/permit-assistant/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: message,
          jurisdiction,
          address,
          imageRefs
        })
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      const analysis: PermitAssistantAnalysis = {
        permitTypes: data.permitTypes || ['General building permit'],
        applicationLinks: data.applicationLinks || [],
        estimatedCostRange: data.estimatedCostRange || '$150-$800',
        estimatedTimeline: data.estimatedTimeline || '1-4 weeks',
        nextSteps: data.nextSteps || ['Call the county permit desk'],
        confidence: data.confidence || 0.6,
        disclaimer: data.disclaimer || 'This is guidance. County rules can change.'
      };
      setResult(analysis);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: 'I made a draft permit plan. Review the cards below.'
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: 'I could not finish the review. Try again in a moment.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsePlan = () => {
    if (!result) return;
    navigate('/new', {
      state: {
        prefill: {
          jobType: inferJobType(result.permitTypes),
          jurisdiction,
          address,
          description: messages.filter((m) => m.role === 'user').at(-1)?.content || '',
          requirements: analysisToRequirements(result)
        }
      }
    });
  };

  return (
    <PageWrapper hasBottomNav={false}>
      <div className="container max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header with AI Banner */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blueprint to-blueprint-800">
          <img 
            src="/images/ai-banner.svg" 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
          <div className="relative px-6 py-8 sm:py-12">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Bot size={24} className="text-white" />
              </div>
              <span className="px-3 py-1 bg-safetyOrange text-white text-xs font-semibold rounded-full">
                AI Powered
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">AI Permit Assistant</h1>
            <p className="text-white/80 mt-2 max-w-lg">
              Share your job details and photos. Our AI will analyze your project and create a personalized permit plan.
            </p>
          </div>
        </div>

        {/* Location Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white rounded-xl border border-lightGray">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Job address</label>
            <Input
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="123 Main St, St Petersburg, FL 33710"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Permit office area</label>
            <select
              value={jurisdiction}
              onChange={(event) => setJurisdiction(event.target.value as Jurisdiction)}
              className="w-full h-10 px-3 rounded-md border border-lightGray bg-white text-charcoal focus:border-blueprint focus:ring-2 focus:ring-blueprint/20"
            >
              {JURISDICTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Photo Upload */}
        <PhotoUploadTray photos={photos} onAddPhotos={addPhotos} onRemovePhoto={removePhoto} />
        <p className="text-xs text-steel">{photoCountLabel}</p>

        {/* Chat Messages */}
        <div className="bg-white rounded-xl border border-lightGray min-h-[300px] max-h-[500px] overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((msg, index) => (
              <MessageBubble 
                key={msg.id} 
                message={msg.content} 
                isUser={msg.role === 'user'} 
              />
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-sky flex items-center justify-center">
                <Bot size={16} className="text-blueprint" />
              </div>
              <div className="p-4 bg-sky rounded-2xl rounded-tl-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-steel rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-steel rounded-full animate-bounce delay-100" />
                  <span className="w-2 h-2 bg-steel rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Analysis Results */}
        {result && (
          <AnalysisResultCards
            result={result}
            onUsePlan={handleUsePlan}
            onFollowUp={() => setMessages((prev) => [...prev, { id: `hint-${Date.now()}`, role: 'assistant', content: 'Ask what part you want me to explain.' }])}
            onStartOver={() => {
              setResult(null);
              setMessages([{ id: 'welcome-reset', role: 'assistant', content: 'Tell me your next job. I am ready.' }]);
              setPhotos([]);
            }}
          />
        )}

        {/* Chat Input */}
        <div className="flex gap-2 p-2 bg-white rounded-xl border border-lightGray">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend(inputMessage)}
            placeholder="Type your message..."
            className="flex-1 border-0 focus-visible:ring-0"
          />
          <Button
            onClick={() => handleSend(inputMessage)}
            disabled={isLoading || !inputMessage.trim()}
            className="bg-blueprint hover:bg-blueprint-700"
          >
            <Send size={18} />
          </Button>
        </div>

        {/* Go to Wizard Button */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => navigate('/new')} className="w-full sm:w-auto">
            Go to wizard
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}
