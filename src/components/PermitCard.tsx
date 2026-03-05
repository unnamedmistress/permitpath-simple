'use client';

import { motion } from 'framer-motion';
import { Clock3, FileBadge2 } from 'lucide-react';

import { Permit } from '@/types';

interface Props {
  permit: Permit;
  onAdvance: (id: string) => void;
  onEdit: (permit: Permit) => void;
  onDelete: (id: string) => void;
}

const statusClass: Record<string, string> = {
  DRAFT: 'bg-slate-200 text-slate-800',
  SUBMITTED: 'bg-blue-100 text-blue-800',
  REVIEWING: 'bg-amber-100 text-amber-800',
  REVISIONS: 'bg-red-100 text-red-800',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-100 text-red-900',
};

export default function PermitCard({ permit, onAdvance, onEdit, onDelete }: Props) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{permit.title}</h3>
          <p className="text-sm text-slate-600">{permit.description}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass[permit.status]}`}>{permit.status}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
        <span className="inline-flex items-center gap-1">
          <FileBadge2 size={16} />
          {permit.type}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock3 size={16} />
          ETA {permit.estimatedDays}d
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white" onClick={() => onAdvance(permit.id)}>
          Advance Stage
        </button>
        <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-800" onClick={() => onEdit(permit)}>
          Edit
        </button>
        <button className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700" onClick={() => onDelete(permit.id)}>
          Delete
        </button>
      </div>
    </motion.article>
  );
}
