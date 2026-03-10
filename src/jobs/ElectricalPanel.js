// Fixed Electrical Panel component with error boundary
import React from 'react';
import ErrorBoundary from '../components/ErrorBoundary';
import JobFormBase from './JobFormBase';

export default function ElectricalPanelForm() {
  return (
    <ErrorBoundary fallback="Oops! Please try another job type">
      <JobFormBase
        title="Electrical Panel"
        questions={[
          {
            id: 'panel-type',
            label: 'What type of panel?',
            options: ['Upgrade', 'Replacement', 'New Installation']
          }
        ]}
      />
    </ErrorBoundary>
  );
}