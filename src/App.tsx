import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { AppProvider } from "./context/AppContext";
import { PhotoProvider } from "./context/PhotoContext";
import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/shared/ErrorBoundary";
import OfflineIndicator from "./components/shared/OfflineIndicator";
import RequireAuth from "./components/shared/RequireAuth";
import HomePage from "./pages/HomePage";
import NewJobPage from "./pages/NewJobPage";
import WizardPage from "./pages/WizardPage";
import DetailsPage from "./pages/DetailsPage";
import PreviewPage from "./pages/PreviewPage";
import DemoPage from "./pages/DemoPage";
import SettingsPage from "./pages/SettingsPage";
import AuthPage from "./pages/SimpleAuthPage";
import LegalPage from "./pages/LegalPage";
import BottomNav from "./components/layout/BottomNav";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <PhotoProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <OfflineIndicator />
              <BrowserRouter>
                {/* Skip to main content link for accessibility */}
                <a 
                  href="#main-content" 
                  className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
                >
                  Skip to main content
                </a>
                <main id="main-content">
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <RequireAuth>
                          <HomePage />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/new"
                      element={
                        <RequireAuth>
                          <NewJobPage />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/wizard/:jobId"
                      element={
                        <RequireAuth>
                          <WizardPage />
                        </RequireAuth>
                      }
                    />
                    <Route path="/wizard" element={<Navigate to="/new" replace />} />
                    <Route
                      path="/details/:jobId"
                      element={
                        <RequireAuth>
                          <DetailsPage />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/preview/:jobId"
                      element={
                        <RequireAuth>
                          <PreviewPage />
                        </RequireAuth>
                      }
                    />
                    <Route path="/demo" element={<DemoPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/legal" element={<LegalPage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <BottomNav />
              </BrowserRouter>
              <Analytics />
            </TooltipProvider>
          </PhotoProvider>
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
