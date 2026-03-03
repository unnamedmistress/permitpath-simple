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
import RequireAuth from "@/components/shared/RequireAuth";
import BottomNav from "@/components/layout/BottomNav";
import NotFound from "@/pages/NotFound";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

// Lazy load pages for code splitting
const HomePage = lazy(() => import("@/pages/HomePage"));
const NewJobPage = lazy(() => import("@/pages/NewJobPage"));
const WizardPage = lazy(() => import("@/pages/WizardPage"));
const AiPermitAssistantPage = lazy(() => import("@/pages/AiPermitAssistantPage"));
const MyJobsPage = lazy(() => import("@/pages/MyJobsPage"));
const HelpPage = lazy(() => import("@/pages/HelpPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const LegalPage = lazy(() => import("@/pages/LegalPage"));
const PreviewPage = lazy(() => import("@/pages/PreviewPage"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
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

// Protected route layout (now public - no auth required)
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

// Public wizard page (no auth required for initial wizard)
function WizardLayout() {
  return (
    <LazyPage>
      <WizardPage />
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
                {/* Skip to main content link for accessibility */}
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
                      
                      {/* Protected routes */}
                      <Route element={<ProtectedLayout />}>
                        <Route path="/" element={<LazyPage><HomePage /></LazyPage>} />
                        <Route path="/new" element={<LazyPage><NewJobPage /></LazyPage>} />
                        <Route path="/ai-assistant" element={<LazyPage><AiPermitAssistantPage /></LazyPage>} />
                        <Route path="/jobs" element={<LazyPage><MyJobsPage /></LazyPage>} />
                        <Route path="/help" element={<LazyPage><HelpPage /></LazyPage>} />
                        <Route path="/settings" element={<LazyPage><SettingsPage /></LazyPage>} />
                        <Route path="/legal" element={<LazyPage><LegalPage /></LazyPage>} />
                        <Route path="/preview/:jobId" element={<LazyPage><PreviewPage /></LazyPage>} />
                      </Route>
                      
                      {/* Public wizard (no auth required) */}
                      <Route path="/wizard/:jobId" element={<WizardLayout />} />
                      <Route path="/wizard" element={<Navigate to="/new" replace />} />
                      
                      {/* 404 */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AnimatePresence>
                </main>
                <Analytics />
              </BrowserRouter>
            </TooltipProvider>
          </PhotoProvider>
        </AppProvider>
      </SupabaseAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
