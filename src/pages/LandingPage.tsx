import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Hammer, Home, ArrowRight, Shield, FileText, MapPin } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import PageWrapper from "@/components/layout/PageWrapper";

export default function LandingPage() {
  const navigate = useNavigate();
  const { setUserRole } = useUserRole();

  const handleSelect = (role: "homeowner" | "contractor") => {
    setUserRole(role);
    navigate("/simple/job-type");
  };

  return (
    <PageWrapper>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky via-white to-white">
        {/* Hero */}
        <header className="px-4 pt-12 pb-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blueprint mb-4"
          >
            <Shield className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold text-charcoal"
          >
            PermitPath
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-2 text-steel text-lg max-w-md mx-auto"
          >
            Your AI-powered permit assistant for Florida
          </motion.p>
        </header>

        {/* Role Selection */}
        <div className="flex-1 px-4 pb-8">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-charcoal font-semibold text-lg mb-6"
          >
            I am a...
          </motion.p>

          <div className="max-w-lg mx-auto space-y-4">
            {/* Homeowner Card */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              onClick={() => handleSelect("homeowner")}
              className="w-full flex items-center gap-4 p-5 bg-white border-2 border-border rounded-2xl hover:border-blueprint hover:shadow-lg transition-all text-left group"
            >
              <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Home className="w-7 h-7 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-charcoal">Homeowner</h3>
                <p className="text-sm text-steel mt-0.5">
                  Step-by-step guidance, cost estimates, and a checklist to get your permit approved
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-steel group-hover:text-blueprint transition-colors" />
            </motion.button>

            {/* Contractor Card */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              onClick={() => handleSelect("contractor")}
              className="w-full flex items-center gap-4 p-5 bg-white border-2 border-border rounded-2xl hover:border-blueprint hover:shadow-lg transition-all text-left group"
            >
              <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Hammer className="w-7 h-7 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-charcoal">Contractor</h3>
                <p className="text-sm text-steel mt-0.5">
                  Building code citations, direct requirements, and professional-grade permit info
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-steel group-hover:text-blueprint transition-colors" />
            </motion.button>
          </div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="max-w-lg mx-auto mt-10 grid grid-cols-3 gap-3"
          >
            {[
              { icon: <FileText className="w-5 h-5" />, label: "Smart Checklists" },
              { icon: <MapPin className="w-5 h-5" />, label: "Address Lookup" },
              { icon: <Shield className="w-5 h-5" />, label: "Code Citations" },
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-sky/50 text-center">
                <span className="text-blueprint">{f.icon}</span>
                <span className="text-xs font-medium text-charcoal">{f.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
