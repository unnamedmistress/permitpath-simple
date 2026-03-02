import { useState, useMemo } from 'react';
import { Check, ChevronDown, Search, Home, Zap, Droplets, Wind, Layers, Hammer, Shield, Construction } from 'lucide-react';
import { JobType } from '@/types/permit';

interface JobTypeOption {
  value: JobType;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: string;
}

const JOB_TYPE_OPTIONS: JobTypeOption[] = [
  // Roofing
  { value: 'RE_ROOFING', label: 'Roof Replacement', description: 'Full roof replacement', icon: <Home size={18} />, category: 'Roofing' },
  { value: 'ROOF_REPAIR', label: 'Roof Repair', description: 'Patch or repair existing roof', icon: <Home size={18} />, category: 'Roofing' },
  
  // HVAC
  { value: 'AC_HVAC_CHANGEOUT', label: 'AC/HVAC Replacement', description: 'Replace AC unit', icon: <Wind size={18} />, category: 'HVAC' },
  
  // Plumbing
  { value: 'WATER_HEATER', label: 'Water Heater', description: 'Install new water heater', icon: <Droplets size={18} />, category: 'Plumbing' },
  { value: 'PLUMBING_MAIN_LINE', label: 'Plumbing Main Line', description: 'Replace main water/sewer line', icon: <Droplets size={18} />, category: 'Plumbing' },
  { value: 'SMALL_BATH_REMODEL', label: 'Bathroom Remodel', description: 'Renovate bathroom', icon: <Droplets size={18} />, category: 'Plumbing' },
  
  // Electrical
  { value: 'ELECTRICAL_PANEL', label: 'Electrical Panel', description: 'Upgrade or replace panel', icon: <Zap size={18} />, category: 'Electrical' },
  { value: 'ELECTRICAL_REWIRING', label: 'Electrical Rewiring', description: 'Rewire circuits', icon: <Zap size={18} />, category: 'Electrical' },
  { value: 'EV_CHARGER', label: 'EV Charger', description: 'Install EV charging station', icon: <Zap size={18} />, category: 'Electrical' },
  { value: 'GENERATOR_INSTALL', label: 'Generator', description: 'Install standby generator', icon: <Zap size={18} />, category: 'Electrical' },
  
  // Exterior
  { value: 'WINDOW_DOOR_REPLACEMENT', label: 'Window/Door', description: 'Replace windows or doors', icon: <Layers size={18} />, category: 'Exterior' },
  { value: 'SIDING_EXTERIOR', label: 'Siding/Exterior', description: 'Replace siding', icon: <Layers size={18} />, category: 'Exterior' },
  { value: 'DECK_INSTALLATION', label: 'Deck Installation', description: 'Build new deck', icon: <Construction size={18} />, category: 'Exterior' },
  { value: 'FENCE_INSTALLATION', label: 'Fence', description: 'Install fence', icon: <Construction size={18} />, category: 'Exterior' },
  
  // Remodeling
  { value: 'KITCHEN_REMODEL', label: 'Kitchen Remodel', description: 'Renovate kitchen', icon: <Hammer size={18} />, category: 'Remodeling' },
  { value: 'ROOM_ADDITION', label: 'Room Addition', description: 'Add square footage', icon: <Hammer size={18} />, category: 'Remodeling' },
  
  // Safety
  { value: 'POOL_BARRIER', label: 'Pool Barrier', description: 'Install pool safety fence', icon: <Shield size={18} />, category: 'Safety' },
  
  // Structural
  { value: 'FOUNDATION_REPAIR', label: 'Foundation Repair', description: 'Structural foundation work', icon: <Construction size={18} />, category: 'Structural' },
];

const CATEGORIES = ['Roofing', 'HVAC', 'Plumbing', 'Electrical', 'Exterior', 'Remodeling', 'Safety', 'Structural'];

interface JobTypeDropdownProps {
  value: JobType | undefined;
  onChange: (jobType: JobType) => void;
}

export default function JobTypeDropdown({ value, onChange }: JobTypeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const selectedJob = useMemo(() => 
    JOB_TYPE_OPTIONS.find(j => j.value === value),
    [value]
  );

  const filteredJobs = useMemo(() => {
    let jobs = JOB_TYPE_OPTIONS;
    
    if (selectedCategory) {
      jobs = jobs.filter(j => j.category === selectedCategory);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      jobs = jobs.filter(j => 
        j.label.toLowerCase().includes(term) || 
        j.description.toLowerCase().includes(term) ||
        j.category.toLowerCase().includes(term)
      );
    }
    
    return jobs;
  }, [searchTerm, selectedCategory]);

  const groupedJobs = useMemo(() => {
    const grouped: Record<string, typeof JOB_TYPE_OPTIONS> = {};
    filteredJobs.forEach(job => {
      if (!grouped[job.category]) {
        grouped[job.category] = [];
      }
      grouped[job.category].push(job);
    });
    return grouped;
  }, [filteredJobs]);

  const handleSelect = (jobType: JobType) => {
    onChange(jobType);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative w-full">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
          value 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50 bg-background'
        }`}
      >
        <div className="flex items-center gap-3">
          {selectedJob ? (
            <>
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {selectedJob.icon}
              </div>
              <div>
                <div className="font-medium text-foreground">{selectedJob.label}</div>
                <div className="text-sm text-muted-foreground">{selectedJob.description}</div>
              </div>
            </>
          ) : (
            <div className="text-muted-foreground">Select a job type...</div>
          )}
        </div>
        <ChevronDown 
          size={20} 
          className={`text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Panel */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-xl shadow-xl z-50 max-h-[400px] overflow-hidden flex flex-col">
            {/* Search & Filter Header */}
            <div className="p-3 border-b space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search job types..."
                  className="w-full pl-9 pr-4 py-2 rounded-lg border bg-background text-sm"
                  autoFocus
                />
              </div>
              
              {/* Category Pills */}
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-2 py-1 text-xs rounded-full transition-colors ${
                    !selectedCategory 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  All
                </button>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                    className={`px-2 py-1 text-xs rounded-full transition-colors ${
                      selectedCategory === cat 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Job List */}
            <div className="flex-1 overflow-y-auto p-2">
              {Object.entries(groupedJobs).map(([category, jobs]) => (
                <div key={category} className="mb-4">
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {category}
                  </div>
                  <div className="space-y-1">
                    {jobs.map((job) => (
                      <button
                        key={job.value}
                        onClick={() => handleSelect(job.value)}
                        className={`w-full p-3 rounded-lg flex items-center gap-3 transition-all text-left ${
                          value === job.value
                            ? 'bg-primary/10 border border-primary/30'
                            : 'hover:bg-muted border border-transparent'
                        }`}
                      >
                        <div className={`p-1.5 rounded-md ${
                          value === job.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}>
                          {job.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium truncate ${
                            value === job.value ? 'text-primary' : ''
                          }`}>
                            {job.label}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {job.description}
                          </div>
                        </div>
                        {value === job.value && (
                          <Check size={16} className="text-primary flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              
              {Object.keys(groupedJobs).length === 0 && (
                <div className="p-4 text-center text-muted-foreground">
                  No job types found matching &quot;{searchTerm}&quot;
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
