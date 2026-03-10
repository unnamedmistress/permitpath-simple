import React from 'react';
import { useCurrentJob } from '../hooks/useJobs';

export function NextActionBanner() {
  const { nextAction } = useCurrentJob();
  
  return (
    <div className="bg-blue-50 p-4 mb-4 rounded-lg border border-blue-200">
      <h3 className="font-medium text-blue-800">Next Action</h3>
      <p className="text-blue-600">{nextAction?.title || 'All steps completed!'}</p>
      {nextAction?.description && (
        <p className="text-sm text-blue-500 mt-1">{nextAction.description}</p>
      )}
    </div>
  );
}