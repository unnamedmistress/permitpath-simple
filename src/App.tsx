import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { motion, AnimatePresence } from "framer-motion";
import { SupabaseAuthProvider, useSupabaseAuth } from "@/context/SupabaseAuthContext";
import { AppProvider } from "@/context/AppContext";
import { PhotoProvider } from "@/context/PhotoContext";
import BottomNav from "@/components/layout/BottomNav";
import NotFound from "@/pages/NotFound";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ConciergeChatWidget from "@/components/ConciergeChatWidget";

// Simplified pages
const HomePageSimple = lazy(() => import("@/pages/HomePageSimple"));
const QuickStartPage = lazy(() => import("@/pages/QuickStartPage"));
const WizardPageSimple = lazy(() => import("@/pages/WizardPageSimple"));
const AiPermitAssistantPage = lazy(() => import("@/pages/AiPermitAssistantPage"));
const MyJobsPage = lazy(() => import("@/pages/MyJobsPage"));
const HelpPage = lazy(() => import("@/pages/HelpPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const LegalPage = lazy(() => import("@/pages/LegalPage"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));

// NEW: Ultra-simplified wizard flow
const SimplifiedJobTypePage = lazy(() => import("@/pages/SimplifiedJobTypePage"));
const SimplifiedLocationPage = lazy(() => import("@/pages/SimplifiedLocationPage"));
const SimplifiedDetailsPage = lazy(() => import("@/pages/SimplifiedDetailsPage"));
const SimplifiedWizardPage = lazy(() => import("@/pages/SimplifiedWizardPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

// Page transition wrapper
function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

// Lazy load wrapper with suspense
function LazyPage({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner text="Loading..." />
      </div>
    }>
      <PageTransition>{children}</PageTransition>
    </Suspense>
  );
}

// Protected route layout (public for now - no auth required for core flow)
function ProtectedLayout() {
  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  );
}

// Auth redirect - if already logged in, go to home
function AuthRedirect() {
  const { isAuthenticated, loading } = useSupabaseAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner text="Checking auth..." />
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <LazyPage>
      <AuthPage />
    </LazyPage>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseAuthProvider>
        <AppProvider>
          <PhotoProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <a 
                  href="#main-content" 
                  className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
                >
                  Skip to main content
                </a>
                <main id="main-content">
                  <AnimatePresence mode="wait">
                    <Routes>
                      {/* Public routes */}
                      <Route path="/auth" element={<AuthRedirect />} />
                      <Route path="/auth/callback" element={<AuthRedirect />} />
                      
                      {/* Main app routes with bottom nav */}
                      <Route element={<ProtectedLayout />}>
                        {/* Simplified Home - One Question Start */}
                        <Route path="/" element={<LazyPage><HomePageSimple /></LazyPage>} />
                        
                        {/* Quick Start - Single Screen Wizard */}
                        <Route path="/quick-start" element={<LazyPage><QuickStartPage /></LazyPage>} />
                        
                        {/* AI Assistant */}
                        <Route path="/ai-assistant" element={<LazyPage><AiPermitAssistantPage /></LazyPage>} />
                        
                        {/* My Jobs */}
                        <Route path="/jobs" element={<LazyPage><MyJobsPage /></LazyPage>} />
                        
                        {/* Help */}
                        <Route path="/help" element={<LazyPage><HelpPage /></LazyPage>} />
                        
                        {/* Settings */}
                        <Route path="/settings" element={<LazyPage><SettingsPage /></LazyPage>} />
                        
                        {/* Legal */}
                        <Route path="/legal" element={<LazyPage><LegalPage /></LazyPage>} />
                      </Route>
                      
                      {/* Checklist/Wizard - Full screen (no nav) */}
                      <Route path="/wizard/:jobId" element={<LazyPage><WizardPageSimple /></LazyPage>} />
                      
                      {/* NEW: Ultra-simplified wizard flow */}
                      <Route path="/simple/job-type" element={<LazyPage><SimplifiedJobTypePage /></LazyPage>} />
                      <Route path="/simple/location/:jobId" element={<LazyPage><SimplifiedLocationPage /></LazyPage>} />
                      <Route path="/simple/details/:jobId" element={<LazyPage><SimplifiedDetailsPage /></LazyPage>} />
                      <Route path="/simple/wizard/:jobId" element={<LazyPage><SimplifiedWizardPage /></LazyPage>} />
                      
                      {/* Legacy route redirects */}
                      <Route path="/wizard" element={<Navigate to="/quick-start" replace />} />
                      <Route path="/new" element={<Navigate to="/quick-start" replace />} />
                      
                      {/* 404 */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AnimatePresence>
                </main>
                <Analytics />
                <ConciergeChatWidget />
              </BrowserRouter>
            </TooltipProvider>
          </PhotoProvider>
        </AppProvider>
      </SupabaseAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
