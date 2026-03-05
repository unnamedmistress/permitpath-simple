'use client';

import { motion } from 'framer-motion';
import { Brain, ListChecks } from 'lucide-react';

import { Prediction } from '@/types';

export default function PredictionCard({ prediction }: { prediction: Prediction }) {
  const confidenceClass =
    prediction.confidence >= 90 ? 'text-emerald-700' : prediction.confidence >= 75 ? 'text-amber-700' : 'text-blue-700';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-slate-800">
          <Brain size={18} />
          <strong>{prediction.permitType}</strong>
        </div>
        <span className={`text-xl font-bold ${confidenceClass}`}>{prediction.confidence}%</span>
      </div>
      <p className="mt-2 text-sm text-slate-600">{prediction.rationale}</p>
      <div className="mt-3">
        <p className="inline-flex items-center gap-1 text-sm font-medium text-slate-700">
          <ListChecks size={16} /> Checklist
        </p>
        <ul className="mt-1 list-disc pl-5 text-sm text-slate-600">
          {prediction.requiredDocs.map((doc) => (
            <li key={doc}>{doc}</li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
