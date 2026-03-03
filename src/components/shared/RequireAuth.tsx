import { Navigate } from "react-router-dom";
import { useSupabaseAuth, isSupabaseConfigured } from "@/context/SupabaseAuthContext";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

interface RequireAuthProps {
  children: React.ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const { isAuthenticated, loading } = useSupabaseAuth();
  
  // If Supabase is not configured, allow access anyway (demo mode)
  if (!isSupabaseConfigured()) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner text="Checking authentication..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
