'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, CheckCircle2, AlertCircle, FileText, Clock, DollarSign, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Prediction } from '@/services/predictionEngine';
import type { JobType } from '@/types/permit';

interface AIPredictionsPanelProps {
  predictions: Prediction[];
  onSelect: (prediction: Prediction) => void;
  onRegenerate?: () => void;
  isLoading?: boolean;
  className?: string;
}

export default function AIPredictionsPanel({
  predictions,
  onSelect,
  onRegenerate,
  isLoading = false,
  className = '',
}: AIPredictionsPanelProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const handleSelect = (prediction: Prediction, index: number) => {
    setSelectedIndex(index);
    onSelect(prediction);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (confidence >= 75) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-amber-600 bg-amber-50 border-amber-200';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 90) return 'High Confidence';
    if (confidence >= 75) return 'Good Match';
    return 'Possible Match';
  };

  if (isLoading) {
    return (
      <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Brain size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">AI Analysis</h3>
            <p className="text-sm text-slate-500">Analyzing your project...</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-50 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (predictions.length === 0) {
    return (
      <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
        <div className="text-center py-6">
          <AlertCircle size={40} className="text-amber-500 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-900 mb-1">No Predictions Available</h3>
          <p className="text-sm text-slate-500">
            Tell us more about your project for AI recommendations
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">AI Predictions</h3>
            <p className="text-sm text-slate-500">
              {predictions.length} permit type{predictions.length !== 1 ? 's' : ''} identified
            </p>
          </div>
        </div>
        
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Regenerate predictions"
          >
            <RefreshCw size={18} />
          </button>
        )}
      </div>

      {/* Predictions List */}
      <div className="space-y-3">
        <AnimatePresence>
          {predictions.map((prediction, index) => {
            const isExpanded = expandedIndex === index;
            const isSelected = selectedIndex === index;
            
            return (
              <motion.div
                key={`${prediction.permitType}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  rounded-xl border-2 transition-all cursor-pointer overflow-hidden
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50/50 shadow-md' 
                    : 'border-slate-200 hover:border-blue-300 hover:shadow-sm'
                  }
                `}
              >
                {/* Main Card */}
                <div
                  onClick={() => setExpandedIndex(isExpanded ? null : index)}
                  className="p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm
                        ${getConfidenceColor(prediction.confidence)}
                      `}>
                        {prediction.confidence}%
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">
                          {formatJobType(prediction.permitType)}
                        </h4>
                        <span className={`
                          inline-flex items-center gap-1 text-xs font-medium
                          ${prediction.confidence >= 90 ? 'text-emerald-600' : 
                            prediction.confidence >= 75 ? 'text-blue-600' : 'text-amber-600'}
                        `}>
                          {getConfidenceLabel(prediction.confidence)}
                        </span>
                      </div>
                    </div>
                    
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-slate-400"
                    >
                      <ArrowRight size={18} className="rotate-90" />
                    </motion.div>
                  </div>

                  {/* Quick Stats Row */}
                  <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <Clock size={14} className="text-slate-400" />
                      {prediction.estimatedDays} days
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign size={14} className="text-slate-400" />
                      {prediction.estimatedCost}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText size={14} className="text-slate-400" />
                      {prediction.requiredDocs.length} docs
                    </span>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-slate-200"
                    >
                      <div className="p-4 bg-slate-50/50">
                        {/* Rationale */}
                        <p className="text-sm text-slate-600 mb-4">
                          {prediction.rationale}
                        </p>

                        {/* Required Documents */}
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                            Required Documents
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {prediction.requiredDocs.map((doc) => (
                              <span
                                key={doc}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded-md text-xs text-slate-600"
                              >
                                <CheckCircle2 size={12} className="text-emerald-500" />
                                {doc}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Select Button */}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(prediction, index);
                          }}
                          className="w-full"
                          variant={isSelected ? 'secondary' : 'default'}
                        >
                          {isSelected ? (
                            <>
                              <CheckCircle2 size={16} className="mr-2" />
                              Selected
                            </>
                          ) : (
                            <>
                              Select This Permit Type
                              <ArrowRight size={16} className="ml-2" />
                            </>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer Note */}
      <p className="text-xs text-slate-400 mt-4 text-center">
        AI predictions are based on similar projects in {predictions[0]?.jurisdiction.replace(/_/g, ' ') || 'your area'}
      </p>
    </div>
  );
}

function formatJobType(type: JobType): string {
  return type
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase());
}
