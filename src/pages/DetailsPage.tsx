import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/shared/Button";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useJob } from "@/hooks/useJob";
import { DetailedScope } from "@/types";

interface Question {
  id: keyof DetailedScope;
  question: string;
  intro?: string;
  type: "boolean" | "text" | "number";
  options?: { label: string; value: any; icon?: string }[];
  condition?: (scope: DetailedScope) => boolean;
}

const BATHROOM_QUESTIONS: Question[] = [
  {
    id: "movingPlumbingFixtures",
    intro: "Thanks for the info! Just a few clarifying questions to make sure I get this right...",
    question: "Will you be moving any plumbing fixtures to a new location?",
    type: "boolean",
    options: [
      { label: "Moving fixtures to new locations", value: true, icon: "🔧" },
      { label: "Replacing in same location only", value: false, icon: "✨" }
    ]
  },
  {
    id: "plumbingDetails",
    question: "Which fixtures are you moving?",
    type: "text",
    condition: (scope) => scope.movingPlumbingFixtures === true
  },
  {
    id: "addingWaterLines",
    question: "Will you be adding or extending water supply lines?",
    type: "boolean",
    options: [
      { label: "Yes, adding/extending lines", value: true },
      { label: "No, using existing connections", value: false }
    ]
  },
  {
    id: "changingDrainage",
    question: "Are you modifying the shower pan, drainage, or waste systems?",
    type: "boolean",
    options: [
      { label: "Yes, changing drainage", value: true },
      { label: "No, drainage stays the same", value: false }
    ]
  },
  {
    id: "addingCircuits",
    question: "Will you be adding NEW electrical circuits to the panel?",
    type: "boolean",
    options: [
      { label: "Yes, adding new circuits", value: true, icon: "⚡" },
      { label: "No, just replacing existing fixtures", value: false, icon: "💡" }
    ]
  },
  {
    id: "relocatingOutlets",
    question: "Are you relocating electrical outlets, switches, or light fixtures?",
    type: "boolean",
    options: [
      { label: "Yes, relocating electrical", value: true },
      { label: "No, same locations", value: false }
    ],
    condition: (scope) => scope.addingCircuits === false
  },
  {
    id: "removingWalls",
    question: "Will you be removing or altering any walls?",
    type: "boolean",
    options: [
      { label: "Yes, removing or changing walls", value: true, icon: "🏗️" },
      { label: "No, walls stay as-is", value: false, icon: "🎨" }
    ]
  },
  {
    id: "changingLayout",
    question: "Are you changing the bathroom layout or expanding the footprint?",
    type: "boolean",
    options: [
      { label: "Yes, changing layout", value: true },
      { label: "No, same layout", value: false }
    ]
  },
  {
    id: "estimatedValue",
    question: "What's your estimated project cost (including materials and labor)?",
    type: "number",
    options: [
      { label: "Under $500", value: 400 },
      { label: "$500 - $2,000", value: 1200 },
      { label: "$2,000 - $5,000", value: 3500 },
      { label: "$5,000 - $10,000", value: 7500 },
      { label: "$10,000+", value: 12000 }
    ]
  }
];

export default function DetailsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  
  const { currentJob, getJob, updateJob, isLoading: jobLoading } = useJob();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [scope, setScope] = useState<DetailedScope>({});
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    
    const init = async () => {
      const job = await getJob(jobId);
      if (!job) {
        toast.error("Job not found");
        navigate("/");
        return;
      }
      
      // Load existing scope if available
      if (job.detailedScope) {
        setScope(job.detailedScope);
      }
      
      setInitialized(true);
    };
    
    init();
  }, [jobId]);

  // Get filtered questions based on conditions
  const getVisibleQuestions = (): Question[] => {
    return BATHROOM_QUESTIONS.filter(q => {
      if (!q.condition) return true;
      return q.condition(scope);
    });
  };

  const visibleQuestions = getVisibleQuestions();
  const currentQuestion = visibleQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === visibleQuestions.length - 1;
  const progress = ((currentQuestionIndex + 1) / visibleQuestions.length) * 100;

  const handleAnswer = (value: any) => {
    const newScope = { ...scope, [currentQuestion.id]: value };
    setScope(newScope);
    
    // Auto-advance after short delay
    setTimeout(() => {
      if (isLastQuestion) {
        handleComplete(newScope);
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    }, 300);
  };

  const handleTextAnswer = (value: string) => {
    const newScope = { ...scope, [currentQuestion.id]: value };
    setScope(newScope);
  };

  const handleNext = () => {
    if (currentQuestion.type === "text" && !scope[currentQuestion.id]) {
      toast.error("Please provide an answer before continuing");
      return;
    }
    
    if (isLastQuestion) {
      handleComplete(scope);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      navigate(`/wizard/${jobId}`);
    }
  };

  const handleComplete = async (finalScope: DetailedScope) => {
    if (!currentJob || !jobId) return;
    
    // Determine if cosmetic only (no moving, no adding, no structural)
    const cosmeticOnly = !finalScope.movingPlumbingFixtures 
      && !finalScope.addingWaterLines 
      && !finalScope.changingDrainage
      && !finalScope.addingCircuits 
      && !finalScope.relocatingOutlets
      && !finalScope.removingWalls 
      && !finalScope.changingLayout;
    
    finalScope.cosmeticOnly = cosmeticOnly;
    
    // Update job with detailed scope
    await updateJob(jobId, {
      ...currentJob,
      detailedScope: finalScope,
      status: "READY_FOR_PREVIEW"
    });
    
    toast.success("Analysis complete!");
    navigate(`/preview/${jobId}`);
  };

  if (!initialized || jobLoading) {
    return (
      <PageWrapper hasBottomNav={false}>
        <div className="flex items-center justify-center h-screen">
          <LoadingSpinner size="lg" text="Loading questions..." />
        </div>
      </PageWrapper>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  return (
    <PageWrapper hasBottomNav={false}>
      {/* Header */}
      <header className="bg-card border-b border-border px-3 py-3 safe-area-inset-top sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBack}
            className="p-1.5 -ml-1 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold text-sm text-foreground">Project Details</h1>
            <p className="text-xs text-muted-foreground">
              Question {currentQuestionIndex + 1} of {visibleQuestions.length}
            </p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      {/* Content */}
      <div className="p-4 space-y-6 pb-24">
        {/* Intro message (first question only) */}
        {currentQuestionIndex === 0 && currentQuestion.intro && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <p className="text-sm text-foreground">{currentQuestion.intro}</p>
          </div>
        )}

        {/* Question */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {currentQuestion.question}
          </h2>

          {/* Boolean/Option Answers */}
          {currentQuestion.options && (
            <div className="space-y-2">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = scope[currentQuestion.id] === option.value;
                
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(option.value)}
                    className={`
                      w-full p-4 rounded-lg border-2 transition-all text-left
                      ${isSelected 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border bg-card hover:border-primary/50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {option.icon && (
                        <span className="text-2xl">{option.icon}</span>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm text-foreground">
                          {option.label}
                        </p>
                      </div>
                      {isSelected && (
                        <CheckCircle2 size={20} className="text-primary" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Text Answer */}
          {currentQuestion.type === "text" && !currentQuestion.options && (
            <div className="space-y-3">
              <textarea
                value={(scope[currentQuestion.id] as string) || ""}
                onChange={(e) => handleTextAnswer(e.target.value)}
                placeholder="Enter details here..."
                className="w-full p-3 border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                rows={4}
              />
              
              <Button
                onClick={handleNext}
                variant="primary"
                size="md"
                className="w-full"
                icon={isLastQuestion ? <CheckCircle2 size={16} /> : <ArrowRight size={16} />}
              >
                {isLastQuestion ? "Complete" : "Continue"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
