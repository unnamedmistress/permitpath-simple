// Simplified wizard flow - removes redundant Step 2 grid
import React from 'react';
import { useNavigate } from 'react-router-dom';
import JobTiles from './JobTiles';
import FormRouter from './FormRouter';

export default function WizardFlow() {
  const [selectedJob, setSelectedJob] = React.useState(null);
  const navigate = useNavigate();

  // Handle job selection - navigate directly to form
  const handleJobSelect = (jobType) => {
    setSelectedJob(jobType);
    navigate(`/form/${jobType}`);
  };

  return selectedJob ? 
    <FormRouter jobType={selectedJob} /> : 
    <JobTiles onSelect={handleJobSelect} />;
}