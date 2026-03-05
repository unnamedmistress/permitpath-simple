'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';

import { Permit, PermitType } from '@/types';
import { makeId } from '@/lib/mock-data';

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(8),
  type: z.enum(['BUILDING', 'ELECTRICAL', 'PLUMBING', 'HVAC', 'FENCE', 'DECK', 'RENOVATION', 'ADDITION']),
  estimatedDays: z.number().int().min(1).max(120),
  jurisdiction: z.string().min(3),
});

interface FormInput {
  title: string;
  description: string;
  type: PermitType;
  estimatedDays: number;
  jurisdiction: string;
}

interface Props {
  initial?: Permit | null;
  onSave: (permit: Permit) => void;
  onCancel: () => void;
}

const permitTypes: PermitType[] = ['BUILDING', 'ELECTRICAL', 'PLUMBING', 'HVAC', 'FENCE', 'DECK', 'RENOVATION', 'ADDITION'];

export default function PermitForm({ initial, onSave, onCancel }: Props) {
  const [input, setInput] = useState<FormInput>({
    title: '',
    description: '',
    type: 'BUILDING',
    estimatedDays: 14,
    jurisdiction: 'seattle_wa',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!initial) return;
    setInput({
      title: initial.title,
      description: initial.description,
      type: initial.type,
      estimatedDays: initial.estimatedDays,
      jurisdiction: initial.jurisdiction,
    });
  }, [initial]);

  return (
    <form
      className="space-y-3 rounded-xl border border-slate-200 bg-white p-4"
      onSubmit={(event) => {
        event.preventDefault();
        const parsed = schema.safeParse(input);
        if (!parsed.success) {
          setError(parsed.error.issues[0]?.message ?? 'Validation error');
          return;
        }

        const now = new Date().toISOString();
        const permit: Permit = {
          id: initial?.id ?? makeId('permit'),
          title: parsed.data.title,
          description: parsed.data.description,
          type: parsed.data.type,
          status: initial?.status ?? 'DRAFT',
          estimatedDays: parsed.data.estimatedDays,
          jurisdiction: parsed.data.jurisdiction,
          createdAt: initial?.createdAt ?? now,
          updatedAt: now,
          estimatedCost: initial?.estimatedCost,
          squareFootage: initial?.squareFootage,
          submittedAt: initial?.submittedAt,
          approvedAt: initial?.approvedAt,
        };
        onSave(permit);
      }}
    >
      <h3 className="text-base font-semibold text-slate-900">{initial ? 'Edit Permit' : 'Create Permit'}</h3>
      <input
        className="w-full rounded-lg border border-slate-300 px-3 py-2"
        placeholder="Project title"
        value={input.title}
        onChange={(event) => setInput((prev) => ({ ...prev, title: event.target.value }))}
      />
      <textarea
        className="w-full rounded-lg border border-slate-300 px-3 py-2"
        rows={3}
        placeholder="Describe scope and work details"
        value={input.description}
        onChange={(event) => setInput((prev) => ({ ...prev, description: event.target.value }))}
      />
      <div className="grid gap-3 md:grid-cols-3">
        <select
          className="rounded-lg border border-slate-300 px-3 py-2"
          value={input.type}
          onChange={(event) => setInput((prev) => ({ ...prev, type: event.target.value as PermitType }))}
        >
          {permitTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <input
          className="rounded-lg border border-slate-300 px-3 py-2"
          type="number"
          value={input.estimatedDays}
          onChange={(event) => setInput((prev) => ({ ...prev, estimatedDays: Number(event.target.value) }))}
        />
        <input
          className="rounded-lg border border-slate-300 px-3 py-2"
          value={input.jurisdiction}
          onChange={(event) => setInput((prev) => ({ ...prev, jurisdiction: event.target.value }))}
        />
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <div className="flex gap-2">
        <button className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white" type="submit">
          Save
        </button>
        <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
