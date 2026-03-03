import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '@/components/layout/PageWrapper';
import Button from '@/components/shared/Button';
import ChatPanel, { ChatMessage } from '@/components/ai-chat/ChatPanel';
import PhotoUploadTray, { SelectedPhoto } from '@/components/ai-chat/PhotoUploadTray';
import AnalysisResultCards, { PermitAssistantAnalysis } from '@/components/ai-chat/AnalysisResultCards';
import { JobType, Jurisdiction, Requirement } from '@/types/permit';

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
    setMessages((prev) => [...prev, { id: `user-${Date.now()}`, role: 'user', content: message }]);
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
      <div className="container max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">AI Permit Assistant</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Share your job. Add photos. Get a simple permit plan.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1">Job address</label>
            <input
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="123 Main St, St Petersburg, FL 33710"
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1">Permit office area</label>
            <select
              value={jurisdiction}
              onChange={(event) => setJurisdiction(event.target.value as Jurisdiction)}
              className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
            >
              {JURISDICTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <PhotoUploadTray photos={photos} onAddPhotos={addPhotos} onRemovePhoto={removePhoto} />
        <p className="text-xs text-muted-foreground">{photoCountLabel}</p>

        <ChatPanel messages={messages} onSend={handleSend} isLoading={isLoading} />

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

        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => navigate('/new')} className="w-full sm:w-auto">
            Go to wizard
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
}
