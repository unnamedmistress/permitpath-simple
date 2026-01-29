import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { PhotoProvider } from "./context/PhotoContext";
import ErrorBoundary from "./components/shared/ErrorBoundary";
import OfflineIndicator from "./components/shared/OfflineIndicator";
import HomePage from "./pages/HomePage";
import NewJobPage from "./pages/NewJobPage";
import WizardPage from "./pages/WizardPage";
import DetailsPage from "./pages/DetailsPage";
import PreviewPage from "./pages/PreviewPage";
import DemoPage from "./pages/DemoPage";
import SettingsPage from "./pages/SettingsPage";
import BottomNav from "./components/layout/BottomNav";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
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
                  <Route path="/" element={<HomePage />} />
                  <Route path="/new" element={<NewJobPage />} />
                  <Route path="/wizard/:jobId" element={<WizardPage />} />
                  <Route path="/details/:jobId" element={<DetailsPage />} />
                  <Route path="/preview/:jobId" element={<PreviewPage />} />
                  <Route path="/demo" element={<DemoPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <BottomNav />
            </BrowserRouter>
          </TooltipProvider>
        </PhotoProvider>
      </AppProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
