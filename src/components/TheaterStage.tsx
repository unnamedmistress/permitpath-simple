'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

import { Permit } from '@/types';
import { statusPipeline } from '@/lib/status-pipeline';

export default function TheaterStage({ permit }: { permit: Permit }) {
  const activeIndex = statusPipeline.indexOf(permit.status);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Permit Theater: {permit.title}</h3>
      <p className="mt-1 text-sm text-slate-600">Pipeline view: DRAFT to APPROVED</p>

      <div className="mt-5 grid gap-3 md:grid-cols-5">
        {statusPipeline.map((stage, index) => {
          const complete = index <= activeIndex;
          return (
            <motion.div
              key={stage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className={`rounded-xl border p-3 text-center ${complete ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}
            >
              <div className="mb-1 flex justify-center">
                {complete ? <CheckCircle2 size={18} className="text-emerald-600" /> : <span className="h-[18px] w-[18px] rounded-full border border-slate-400" />}
              </div>
              <p className="text-xs font-semibold text-slate-700">{stage}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
