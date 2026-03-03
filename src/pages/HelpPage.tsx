import { useNavigate } from "react-router-dom";
import { MessageCircle, Phone, Mail, BookOpen, Video, ChevronRight, Clock, Info, HelpCircle, FileText, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PINELLAS_COUNTY_BUILDING } from "@/data/jurisdictionData";

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

const supportCards = [
  {
    icon: MessageCircle,
    title: "Chat with AI",
    description: "Get instant answers to your permit questions",
    color: "bg-purple-500",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-700",
    action: (navigate: any) => navigate("/ai-assistant")
  },
  {
    icon: Phone,
    title: "Call County",
    description: PINELLAS_COUNTY_BUILDING.phone,
    color: "bg-forest",
    bgColor: "bg-forest/10",
    borderColor: "border-forest/20",
    textColor: "text-forest",
    action: () => window.location.href = `tel:${PINELLAS_COUNTY_BUILDING.phone.replace(/\D/g, "")}`
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "support@permitpath.com",
    color: "bg-blueprint",
    bgColor: "bg-sky",
    borderColor: "border-lightGray",
    textColor: "text-blueprint",
    action: () => {
      const subject = encodeURIComponent("PermitPath Support Request");
      const body = encodeURIComponent("Hi PermitPath Support,\n\nI need help with:\n\n");
      window.location.href = `mailto:support@permitpath.com?subject=${subject}&body=${body}`;
    }
  },
  {
    icon: ExternalLink,
    title: "County Website",
    description: "Visit official county portal",
    color: "bg-safetyOrange",
    bgColor: "bg-safetyOrange/10",
    borderColor: "border-safetyOrange/20",
    textColor: "text-safetyOrange",
    action: () => window.open("https://www.pinellas.gov/", "_blank")
  }
];

export default function HelpPage() {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      {/* Header */}
      <div className="px-4 sm:px-0 mb-6">
        <h1 className="text-2xl font-bold text-charcoal">Help & Support</h1>
        <p className="text-steel mt-1">Get help with your permits and questions</p>
      </div>

      {/* Support Cards Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 gap-3 mb-6 px-4 sm:px-0"
      >
        {supportCards.map((card, index) => (
          <motion.button
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => card.action(navigate)}
            className={`p-4 rounded-xl border ${card.borderColor} ${card.bgColor} text-left hover:shadow-md transition-all group`}
          >
            <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <card.icon size={20} className="text-white" />
            </div>
            <p className={`font-semibold text-sm ${card.textColor}`}>{card.title}</p>
            <p className="text-xs text-steel mt-1">{card.description}</p>
          </motion.button>
        ))}
      </motion.div>

      {/* County Hours */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-4 rounded-xl bg-sky border border-lightGray mb-6 mx-4 sm:mx-0"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blueprint/10 flex items-center justify-center flex-shrink-0">
            <Clock size={20} className="text-blueprint" />
          </div>
          <div>
            <p className="font-medium text-charcoal">County Office Hours</p>
            <p className="text-sm text-steel">{PINELLAS_COUNTY_BUILDING.hours}</p>
            <p className="text-xs text-steel mt-1">Closed on weekends and holidays</p>
          </div>
        </div>
      </motion.div>

      {/* FAQ Accordion */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6 mx-4 sm:mx-0"
      >
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle size={20} className="text-blueprint" />
          <h2 className="font-semibold text-charcoal">Common Questions</h2>
        </div>
        <Accordion type="single" collapsible className="bg-white rounded-xl border border-lightGray overflow-hidden">
          {faqItems.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-b border-lightGray last:border-b-0">
              <AccordionTrigger className="px-4 py-4 text-left text-sm font-medium text-charcoal hover:no-underline hover:bg-sky/50 transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <p className="text-sm text-charcoal mb-2 font-medium">
                  {faq.shortAnswer}
                </p>
                <p className="text-xs text-steel">
                  {faq.fullContext}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        {/* Need More Help Button */}
        <button
          onClick={() => navigate("/ai-assistant")}
          className="w-full mt-3 p-4 rounded-xl bg-blueprint/5 border border-blueprint/20 hover:bg-blueprint/10 transition-colors flex items-center justify-center gap-2"
        >
          <MessageCircle size={18} className="text-blueprint" />
          <span className="text-sm font-medium text-blueprint">Need more help? Chat with AI</span>
        </button>
      </motion.section>

      {/* Video Tutorials */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-6 mx-4 sm:mx-0"
      >
        <div className="flex items-center gap-2 mb-4">
          <Video size={20} className="text-crimson" />
          <h2 className="font-semibold text-charcoal">Video Tutorials</h2>
        </div>
        <div className="space-y-2">
          {videoGuides.map((video, index) => (
            <motion.button
              key={video.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="w-full text-left p-3 rounded-xl bg-white border border-lightGray hover:shadow-md transition-all flex items-center gap-3 group"
            >
              <div className="w-12 h-12 rounded-lg bg-crimson/10 flex items-center justify-center flex-shrink-0 group-hover:bg-crimson/20 transition-colors">
                <Video size={20} className="text-crimson" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-charcoal">{video.title}</p>
                <p className="text-xs text-steel">{video.duration}</p>
              </div>
              <ChevronRight size={16} className="text-steel group-hover:translate-x-1 transition-transform" />
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* Documentation Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-24 mx-4 sm:mx-0"
      >
        <div className="flex items-center gap-2 mb-4">
          <FileText size={20} className="text-forest" />
          <h2 className="font-semibold text-charcoal">Documentation</h2>
        </div>
        <div className="space-y-2">
          {[
            { title: "Permit Application Guide", description: "Step-by-step application process" },
            { title: "Required Documents Checklist", description: "What you'll need for each permit type" },
            { title: "Inspection Guidelines", description: "What inspectors look for" },
          ].map((doc, index) => (
            <button
              key={doc.title}
              className="w-full text-left p-3 rounded-xl bg-white border border-lightGray hover:shadow-md transition-all flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-lg bg-forest/10 flex items-center justify-center flex-shrink-0">
                <FileText size={18} className="text-forest" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-charcoal">{doc.title}</p>
                <p className="text-xs text-steel">{doc.description}</p>
              </div>
              <ExternalLink size={14} className="text-steel" />
            </button>
          ))}
        </div>
      </motion.section>
    </PageWrapper>
  );
}
