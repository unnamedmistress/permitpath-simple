import { Permit, PermitStatus } from '@/types';

export const statusPipeline: PermitStatus[] = ['DRAFT', 'SUBMITTED', 'REVIEWING', 'REVISIONS', 'APPROVED'];

export function getNextStatus(current: PermitStatus): PermitStatus {
  const idx = statusPipeline.indexOf(current);
  if (idx < 0 || idx >= statusPipeline.length - 1) return current;
  return statusPipeline[idx + 1];
}

export function estimateEtaDays(status: PermitStatus): number {
  switch (status) {
    case 'DRAFT':
      return 20;
    case 'SUBMITTED':
      return 14;
    case 'REVIEWING':
      return 9;
    case 'REVISIONS':
      return 6;
    case 'APPROVED':
      return 0;
    case 'REJECTED':
      return 999;
    default:
      return 14;
  }
}

export function advancePermit(permit: Permit): Permit {
  const next = getNextStatus(permit.status);
  const now = new Date().toISOString();

  return {
    ...permit,
    status: next,
    submittedAt: permit.submittedAt ?? now,
    approvedAt: next === 'APPROVED' ? now : permit.approvedAt,
    updatedAt: now,
  };
}
