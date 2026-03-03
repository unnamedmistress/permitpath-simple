import { useState, useEffect } from 'react';
import { X, ArrowRight, CheckCircle, FileText, Send, Check, Gift } from 'lucide-react';
import Button from './Button';

const WELCOME_STEPS = [
  {
    title: "Welcome to PermitPath",
    subtitle: "The easiest way to get your construction permits",
    description: "No more guessing what documents you need. We guide you through every step — completely FREE.",
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
  },
  {
    title: "PermitPath is FREE",
    subtitle: "Always will be",
    description: "We help you navigate the permit process at no cost. You only pay permit fees directly to your county when you apply.",
    icon: Gift,
    color: "text-green-600"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-2 sm:mx-4 max-h-[90vh] overflow-y-auto overflow-x-hidden animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 min-h-[44px] min-w-[44px] rounded-full hover:bg-gray-100 transition-colors z-10 flex items-center justify-center"
          aria-label="Close welcome modal"
        >
          <X size={20} className="text-gray-500" />
        </button>

        {/* Content */}
        <div className="p-5 sm:p-8">
          {/* Step indicator */}
          <div className="flex justify-center gap-2 mb-4 sm:mb-6">
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
          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4 sm:mb-6`}>
            <Icon size={32} className={`${step.color} sm:hidden`} />
            <Icon size={40} className={`${step.color} hidden sm:block`} />
          </div>

          {/* Text */}
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-2">{step.title}</h2>
          <p className="text-sm text-primary font-medium text-center mb-3 sm:mb-4">{step.subtitle}</p>
          <p className="text-muted-foreground text-center text-sm sm:text-base px-1">{step.description}</p>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-gray-50 flex items-center justify-between gap-3">
          <button
            onClick={handleClose}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-2 min-h-[44px]"
          >
            Skip tour
          </button>

          <div className="w-full sm:w-auto">
            <Button onClick={handleNext} className="w-full sm:w-auto">
              {isLastStep ? 'Get Started' : 'Next'}
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
