import { HistoricalPermit, Permit } from '@/types';

export interface SimilarityResult {
  record: HistoricalPermit;
  score: number;
}

function normalize(value: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(1, Math.max(0, value / max));
}

export function similarityScore(permit: Permit, historical: HistoricalPermit): number {
  let score = 0;

  if (permit.type === historical.permitType) score += 0.45;
  if (permit.jurisdiction === historical.location) score += 0.2;

  const permitSf = permit.squareFootage ?? 0;
  const histSf = historical.squareFootage ?? 0;
  const sfDelta = Math.abs(permitSf - histSf);
  score += 0.2 * (1 - normalize(sfDelta, 500));

  const durationDelta = Math.abs((permit.estimatedDays ?? 0) - historical.daysToApproval);
  score += 0.15 * (1 - normalize(durationDelta, 30));

  return Math.max(0, Math.min(1, score));
}

export function findSimilarPermits(permit: Permit, historical: HistoricalPermit[], topK = 20): SimilarityResult[] {
  return historical
    .map((record) => ({ record, score: similarityScore(permit, record) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
