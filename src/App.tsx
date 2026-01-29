import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import HomePage from "./pages/HomePage";
import NewJobPage from "./pages/NewJobPage";
import WizardPage from "./pages/WizardPage";
import PreviewPage from "./pages/PreviewPage";
import DemoPage from "./pages/DemoPage";
import SettingsPage from "./pages/SettingsPage";
import BottomNav from "./components/layout/BottomNav";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/new" element={<NewJobPage />} />
            <Route path="/wizard/:jobId" element={<WizardPage />} />
            <Route path="/preview/:jobId" element={<PreviewPage />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNav />
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
