import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Image as ImageIcon, ScanLine, CheckCircle2, AlertTriangle,
  RefreshCw, ChevronDown, ChevronUp, Sparkles, ArrowRight, X,
} from 'lucide-react';
import { analyzePhoto } from '@/services/photoScopeAnalyzer';
import type { PhotoScopeResult, DetectedJobInfo } from '@/types/photoScope';

function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 80 ? 'bg-emerald-100 text-emerald-700' :
    pct >= 55 ? 'bg-amber-100 text-amber-700' :
                'bg-slate-100 text-slate-600';
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
      {pct}% match
    </span>
  );
}

function AlternativeRow({ info, onSelect }: { info: DetectedJobInfo; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-slate-200 hover:border-violet-300 hover:bg-violet-50/40 transition-colors text-left"
    >
      <span className="text-sm font-medium text-slate-700">{info.jobTypeLabel}</span>
      <div className="flex items-center gap-2 flex-shrink-0">
        <ConfidenceBadge value={info.confidence} />
        <span className="text-xs text-violet-600 font-semibold">Select →</span>
      </div>
    </button>
  );
}

function ResultCard({
  result, onConfirm, onRetake,
}: {
  result: PhotoScopeResult;
  onConfirm: (jobTypeId: string, scopeOfWork: string, shortDescription: string) => void;
  onRetake: () => void;
}) {
  const [showScope, setShowScope] = useState(true);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [selected, setSelected] = useState<DetectedJobInfo>(result.primary);

  const handleConfirm = () => {
    onConfirm(selected.jobTypeId, result.scopeOfWork, result.shortDescription);
  };

  const handleSelectAlternative = (info: DetectedJobInfo) => {
    setSelected(info);
    setShowAlternatives(false);
  };

  const isLowConfidence = selected.confidence < 0.55;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      <div className="rounded-2xl overflow-hidden border bg-white shadow-sm">
        {result.thumbnailUrl && (
          <div className="relative">
            <img src={result.thumbnailUrl} alt="Project photo" className="w-full h-44 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
              <div>
                <p className="text-white text-xs font-semibold opacity-80 mb-0.5">AI detected:</p>
                <h3 className="text-white text-xl font-bold">{selected.jobTypeLabel}</h3>
              </div>
              <ConfidenceBadge value={selected.confidence} />
            </div>
            <button onClick={onRetake} className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors">
              <X size={14} />
            </button>
          </div>
        )}
        {!result.thumbnailUrl && (
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-600 to-teal-600 text-white">
            <div>
              <p className="text-sm opacity-80">AI detected:</p>
              <h3 className="text-xl font-bold">{selected.jobTypeLabel}</h3>
            </div>
            <ConfidenceBadge value={selected.confidence} />
          </div>
        )}
        <div className="p-4 space-y-3">
          <p className="text-sm text-slate-600 flex items-start gap-2">
            <Sparkles size={14} className="text-violet-500 flex-shrink-0 mt-0.5" />
            {selected.reasoning}
          </p>
          {isLowConfidence && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
              <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">Low confidence — double-check the detected job type below before continuing.</p>
            </div>
          )}
          <div className="rounded-xl border border-teal-200 overflow-hidden">
            <button onClick={() => setShowScope(v => !v)} className="w-full flex items-center justify-between px-3 py-2.5 bg-teal-50 hover:bg-teal-100/60 transition-colors">
              <span className="text-xs font-bold text-teal-800 uppercase tracking-wide">Generated Scope of Work</span>
              {showScope ? <ChevronUp size={14} className="text-teal-600" /> : <ChevronDown size={14} className="text-teal-600" />}
            </button>
            <AnimatePresence>
              {showScope && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-3 pb-3 pt-2">
                  <p className="text-sm text-slate-700 leading-relaxed">{result.scopeOfWork}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {result.notes && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-50 border border-blue-200">
              <AlertTriangle size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">{result.notes}</p>
            </div>
          )}
          {result.alternatives.length > 0 && (
            <div>
              <button onClick={() => setShowAlternatives(v => !v)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors">
                {showAlternatives ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                Not quite right? See other possibilities
              </button>
              <AnimatePresence>
                {showAlternatives && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-2 space-y-1.5">
                    {result.alternatives.map(alt => (
                      <AlternativeRow key={alt.jobTypeId} info={alt} onSelect={() => handleSelectAlternative(alt)} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
      <button onClick={handleConfirm} className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-teal-600 text-white font-bold text-base shadow-lg hover:opacity-90 transition-opacity active:scale-[0.98]">
        <CheckCircle2 size={20} />
        Use "{selected.jobTypeLabel}" — Continue
        <ArrowRight size={18} />
      </button>
      <p className="text-center text-xs text-slate-400">The scope and job type will be saved with your permit job</p>
    </motion.div>
  );
}

type CaptureState = 'idle' | 'analyzing' | 'result' | 'error';

interface PhotoScopeCaptureProps {
  jurisdiction?: string;
  onConfirm: (jobTypeId: string, scopeOfWork: string, shortDescription: string) => void;
  onCancel: () => void;
}

export default function PhotoScopeCapture({ jurisdiction, onConfirm, onCancel }: PhotoScopeCaptureProps) {
  const [state, setState] = useState<CaptureState>('idle');
  const [result, setResult] = useState<PhotoScopeResult | null>(null);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setState('analyzing');
    setResult(null);
    try {
      const res = await analyzePhoto({ file, jurisdiction });
      setResult(res);
      setState('result');
    } catch {
      setState('error');
    }
  }, [jurisdiction]);

  const handleRetake = () => { setState('idle'); setResult(null); };

  if (state === 'idle') {
    return (
      <div className="space-y-4">
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden border-2 border-dashed border-violet-300 bg-gradient-to-br from-violet-50 to-teal-50">
          <div className="flex flex-col items-center justify-center gap-4 py-10 px-6 text-center">
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-teal-500 flex items-center justify-center shadow-lg">
              <Camera size={38} className="text-white" />
            </motion.div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Take a photo to get started</h3>
              <p className="text-sm text-slate-500 mt-1">Point your camera at the project area — AI will identify the job type and write a scope of work for you</p>
            </div>
            <div className="flex gap-3 w-full max-w-xs">
              <button onClick={() => cameraInputRef.current?.click()}
                className="flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-violet-600 text-white font-semibold text-sm shadow hover:bg-violet-700 transition-colors">
                <Camera size={20} />Open Camera
              </button>
              <button onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 border-violet-200 bg-white text-violet-700 font-semibold text-sm hover:bg-violet-50 transition-colors">
                <ImageIcon size={20} />Choose Photo
              </button>
            </div>
          </div>
        </motion.div>
        <button onClick={onCancel} className="w-full flex items-center justify-center gap-1.5 py-2.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          ← Or select job type manually
        </button>
      </div>
    );
  }

  if (state === 'analyzing') {
    return (
      <div className="rounded-2xl border bg-gradient-to-br from-violet-50 to-teal-50 p-8 text-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }} className="inline-block mb-4">
          <ScanLine size={36} className="text-violet-500" />
        </motion.div>
        <p className="font-bold text-slate-700">Analysing your photo…</p>
        <p className="text-sm text-slate-500 mt-1 max-w-[240px] mx-auto">{fileName}</p>
        <p className="text-xs text-slate-400 mt-3">Identifying job type &amp; generating scope of work</p>
        <div className="flex justify-center gap-1.5 mt-4">
          {[0, 0.25, 0.5].map((delay, i) => (
            <motion.div key={i} className="w-2 h-2 rounded-full bg-violet-400"
              animate={{ y: [0, -8, 0] }} transition={{ duration: 0.7, delay, repeat: Infinity }} />
          ))}
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center space-y-3">
        <AlertTriangle size={28} className="text-red-400 mx-auto" />
        <p className="font-semibold text-red-700">Photo could not be analysed</p>
        <p className="text-sm text-red-500">The AI couldn't read the image. Try a clearer photo or select your job type manually.</p>
        <div className="flex gap-2 justify-center">
          <button onClick={handleRetake} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50">
            <RefreshCw size={14} /> Try again
          </button>
          <button onClick={onCancel} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border text-slate-600 text-sm font-semibold hover:bg-slate-50">
            Select manually
          </button>
        </div>
      </div>
    );
  }

  if (state === 'result' && result) {
    return <ResultCard result={result} onConfirm={onConfirm} onRetake={handleRetake} />;
  }

  return null;
}
