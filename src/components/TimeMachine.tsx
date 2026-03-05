'use client';

import { HistoricalPermit, Permit } from '@/types';
import { findSimilarPermits } from '@/lib/similarity';

interface Props {
  permit?: Permit;
  historical: HistoricalPermit[];
}

export default function TimeMachine({ permit, historical }: Props) {
  if (!permit) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Time Machine Analytics</h3>
        <p className="mt-2 text-sm text-slate-600">Create or select a permit to see historical comparison insights.</p>
      </section>
    );
  }

  const similar = findSimilarPermits(permit, historical, 12);
  const averageDays =
    similar.length > 0 ? Math.round(similar.reduce((sum, item) => sum + item.record.daysToApproval, 0) / similar.length) : 0;
  const fasterThan =
    similar.length > 0
      ? Math.round((similar.filter((item) => item.record.daysToApproval >= permit.estimatedDays).length / similar.length) * 100)
      : 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Time Machine: {permit.title}</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <article className="rounded-xl border border-slate-200 p-3">
          <p className="text-sm text-slate-500">Comparable Permits</p>
          <p className="text-2xl font-bold text-slate-900">{similar.length}</p>
        </article>
        <article className="rounded-xl border border-slate-200 p-3">
          <p className="text-sm text-slate-500">Avg Approval Days</p>
          <p className="text-2xl font-bold text-slate-900">{averageDays}</p>
        </article>
        <article className="rounded-xl border border-slate-200 p-3">
          <p className="text-sm text-slate-500">Faster Than</p>
          <p className="text-2xl font-bold text-emerald-700">{fasterThan}%</p>
        </article>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-600">
              <th className="py-2">Type</th>
              <th className="py-2">Location</th>
              <th className="py-2">Days</th>
              <th className="py-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {similar.slice(0, 8).map((item) => (
              <tr key={item.record.id} className="border-b border-slate-100">
                <td className="py-2">{item.record.permitType}</td>
                <td className="py-2">{item.record.location}</td>
                <td className="py-2">{item.record.daysToApproval}</td>
                <td className="py-2">{Math.round(item.score * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
