import { useNavigate } from "react-router-dom";
import { MessageCircle, Phone, Mail, BookOpen, Video, ChevronRight, Clock, Info } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import Button from "@/components/shared/Button";
import { PINELLAS_COUNTY_BUILDING } from "@/data/jurisdictionData";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  shortAnswer: string;
  fullContext: string;
}

const faqItems: FAQItem[] = [
  {
    question: "What permits do I need for a water heater?",
    shortAnswer: "Water heater replacements typically need a plumbing permit. If it's gas, you may also need an electrical permit for the ignition.",
    fullContext: "The specific permits depend on whether you're replacing an existing unit or installing a new one, and whether it's gas or electric. Our wizard will determine exactly what you need based on your situation."
  },
  {
    question: "How long does approval take?",
    shortAnswer: "Most permits are approved within 2-10 business days for simple jobs. Complex projects may take 2-4 weeks.",
    fullContext: "Pinellas County offers express permitting for common jobs like water heaters and AC replacements, which can be same-day. Roofing and structural work typically takes longer due to additional reviews."
  },
  {
    question: "What if the city rejects my application?",
    shortAnswer: "Don't worry! Rejections usually just mean missing documents. We'll help you gather what's needed and resubmit.",
    fullContext: "Most rejections are for missing information, not denied permits. The county will tell you exactly what's needed. Our checklist helps ensure you submit complete applications the first time."
  },
  {
    question: "How do I upload documents?",
    shortAnswer: "After you create your job, use the checklist to upload photos and documents directly from your phone.",
    fullContext: "You can take photos with your camera or upload from your gallery. Each checklist item has an upload button. Documents are stored securely and linked to your job."
  },
  {
    question: "Do I need an inspection?",
    shortAnswer: "Most permits require at least one inspection. Simple replacements may only need a final inspection.",
    fullContext: "Inspections ensure work meets safety codes. The number of inspections depends on the job type. Electrical and plumbing work typically need rough-in and final inspections. Our checklist shows you exactly which inspections apply."
  },
];

const videoGuides = [
  { title: "Getting Started with PermitPath", duration: "3 min" },
  { title: "How to Upload Documents", duration: "2 min" },
  { title: "Understanding Inspections", duration: "4 min" },
  { title: "Navigating the County Portal", duration: "5 min" },
];

export default function HelpPage() {
  const navigate = useNavigate();

  const handleCallSupport = () => {
    window.location.href = `tel:${PINELLAS_COUNTY_BUILDING.phone.replace(/\D/g, "")}`;
  };

  const handleEmailSupport = () => {
    const subject = encodeURIComponent("PermitPath Support Request");
    const body = encodeURIComponent("Hi PermitPath Support,\n\nI need help with:\n\n");
    window.location.href = `mailto:support@permitpath.com?subject=${subject}&body=${body}`;
  };

  return (
    <PageWrapper>
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 px-3 sm:px-0">Help & Support</h1>

      {/* Primary Support Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6 px-3 sm:px-0">
        <button
          onClick={() => navigate("/ai-assistant")}
          className="p-3 sm:p-4 rounded-xl border bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 text-left hover:shadow-md transition-shadow"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-500 flex items-center justify-center mb-2 sm:mb-3">
            <MessageCircle size={16} className="sm:w-5 sm:h-5 text-white" />
          </div>
          <p className="font-semibold text-xs sm:text-sm">Chat with AI</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Get instant answers</p>
        </button>

        <button
          onClick={handleCallSupport}
          className="p-3 sm:p-4 rounded-xl border bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-left hover:shadow-md transition-shadow"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-500 flex items-center justify-center mb-2 sm:mb-3">
            <Phone size={16} className="sm:w-5 sm:h-5 text-white" />
          </div>
          <p className="font-semibold text-xs sm:text-sm">Call County</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{PINELLAS_COUNTY_BUILDING.phone}</p>
        </button>
      </div>

      {/* County Hours */}
      <div className="p-3 rounded-lg bg-muted mb-4 sm:mb-6 flex items-center gap-3 mx-3 sm:mx-0">
        <Clock size={16} className="text-muted-foreground" />
        <p className="text-xs sm:text-sm text-muted-foreground">
          <span className="font-medium">County Hours:</span> {PINELLAS_COUNTY_BUILDING.hours}
        </p>
      </div>

      {/* FAQ Accordion */}
      <section className="mb-4 sm:mb-6 mx-3 sm:mx-0">
        <h2 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Common Questions</h2>
        <Accordion type="single" collapsible className="bg-card rounded-lg border">
          {faqItems.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-b last:border-b-0">
              <AccordionTrigger className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="px-3 sm:px-4 pb-3">
                <p className="text-xs sm:text-sm text-foreground mb-2">
                  {faq.shortAnswer}
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  {faq.fullContext}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        {/* Need More Help Button */}
        <button
          onClick={() => navigate("/ai-assistant")}
          className="w-full mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
        >
          <MessageCircle size={16} className="text-primary" />
          <span className="text-sm font-medium text-primary">Need more help? Chat with AI</span>
        </button>
      </section>

      {/* Video Guides */}
      <section className="mb-4 sm:mb-6 mx-3 sm:mx-0">
        <h2 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Video Tutorials</h2>
        <div className="space-y-1 sm:space-y-2">
          {videoGuides.map((video) => (
            <button
              key={video.title}
              className="w-full text-left p-2 sm:p-3 rounded-lg bg-card border hover:bg-muted/50 transition-colors flex items-center gap-2 sm:gap-3"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                <Video size={16} className="sm:w-5 sm:h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium">{video.title}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{video.duration}</p>
              </div>
              <ChevronRight size={14} className="sm:w-4 sm:h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </section>

      {/* Email Support */}
      <button
        onClick={handleEmailSupport}
        className="w-full p-3 sm:p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors flex items-center gap-2 sm:gap-3 mx-3 sm:mx-0 mb-24"
      >
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <Mail size={16} className="sm:w-5 sm:h-5 text-blue-600" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-medium text-xs sm:text-sm">Email Support</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">support@permitpath.com</p>
        </div>
        <ChevronRight size={14} className="sm:w-4 sm:h-4 text-muted-foreground" />
      </button>
    </PageWrapper>
  );
}
