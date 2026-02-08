import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { AppProvider } from "./context/AppContext";
import { PhotoProvider } from "./context/PhotoContext";
import HomePage from "./pages/HomePage";
import WizardPage from "./pages/WizardPage";
import DetailsPage from "./pages/DetailsPage";
import PreviewPage from "./pages/PreviewPage";
import SettingsPage from "./pages/SettingsPage";
import LegalPage from "./pages/LegalPage";
import BottomNav from "./components/layout/BottomNav";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/new" element={<Navigate to="/wizard" replace />} />
                <Route path="/wizard/:jobId" element={<WizardPage />} />
                <Route path="/wizard" element={<Navigate to="/new" replace />} />
                <Route path="/details/:jobId" element={<DetailsPage />} />
                <Route path="/preview/:jobId" element={<PreviewPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/legal" element={<LegalPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <BottomNav />
          </BrowserRouter>
          <Analytics />
        </TooltipProvider>
      </PhotoProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;