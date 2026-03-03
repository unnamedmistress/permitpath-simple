import { useState, useEffect } from 'react';
import { X, ArrowRight, CheckCircle, FileText, Send, Check } from 'lucide-react';
import Button from './Button';

const WELCOME_STEPS = [
  {
    title: "Welcome to PermitPath",
    subtitle: "The easiest way to get your construction permits",
    description: "No more guessing what documents you need. We guide you through every step.",
    icon: CheckCircle,
    color: "text-green-500"
  },
  {
    title: "1. Tell Us About Your Job",
    subtitle: "Takes 2 minutes",
    description: "Pick your job type and location. We'll figure out exactly what the county needs from you.",
    icon: FileText,
    color: "text-blue-500"
  },
  {
    title: "2. We Build Your Checklist",
    subtitle: "Personalized for your project",
    description: "Get a custom checklist of every document, license, and form required for your specific job.",
    icon: Check,
    color: "text-purple-500"
  },
  {
    title: "3. Submit to the County",
    subtitle: "With confidence",
    description: "Upload your documents, download filled forms, and submit knowing everything is right.",
    icon: Send,
    color: "text-orange-500"
  }
];

const STORAGE_KEY = 'permitpath:welcomeSeen';

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user has seen welcome before
    try {
      const hasSeen = localStorage.getItem(STORAGE_KEY);
      if (!hasSeen) {
        setIsOpen(true);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Ignore storage errors
    }
  };

  const handleNext = () => {
    if (currentStep < WELCOME_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  if (!isOpen) return null;

  const step = WELCOME_STEPS[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === WELCOME_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 animate-in fade-in duration-200"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
        >
          <X size={20} className="text-gray-500" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Step indicator */}
          <div className="flex justify-center gap-2 mb-6">
            {WELCOME_STEPS.map((_, index) => (
              <div 
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep ? 'w-8 bg-primary' : 
                  index < currentStep ? 'w-2 bg-primary/50' : 'w-2 bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Icon */}
          <div className={`w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-6`}>
            <Icon size={40} className={step.color} />
          </div>

          {/* Text */}
          <h2 className="text-2xl font-bold text-center mb-2">{step.title}</h2>
          <p className="text-sm text-primary font-medium text-center mb-4">{step.subtitle}</p>
          <p className="text-muted-foreground text-center">{step.description}</p>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 flex items-center justify-between">
          <button 
            onClick={handleClose}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip tour
          </button>
          
          <Button onClick={handleNext}>
            {isLastStep ? 'Get Started' : 'Next'}
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
