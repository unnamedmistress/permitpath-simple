// Simple debug component to check auth state
import { useAuth } from "@/context/AuthContext";

export default function DebugAuth() {
  const { user, loading, ready } = useAuth();
  
  return (
    <div style={{ padding: 20, background: '#f0f0f0' }}>
      <h3>Auth Debug</h3>
      <pre>{JSON.stringify({ user: !!user, loading, ready }, null, 2)}</pre>
    </div>
  );
}