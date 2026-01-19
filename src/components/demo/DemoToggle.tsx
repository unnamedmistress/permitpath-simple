import { useAppContext } from "@/context/AppContext";
import { Beaker } from "lucide-react";

export default function DemoToggle() {
  const { state, dispatch } = useAppContext();

  const toggleDemo = () => {
    dispatch({ type: "SET_DEMO_MODE", payload: !state.demoMode });
  };

  return (
    <button
      onClick={toggleDemo}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
        state.demoMode
          ? "bg-accent text-accent-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      }`}
    >
      <Beaker size={18} />
      <span>Demo Mode</span>
      <span className={`w-8 h-5 rounded-full relative transition-colors ${
        state.demoMode ? "bg-primary" : "bg-border"
      }`}>
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
          state.demoMode ? "translate-x-3.5" : "translate-x-0.5"
        }`} />
      </span>
    </button>
  );
}
