import React, { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { AppState, AppAction, UserRole } from "@/types";
import { getSessionId } from "@/utils/sessionId";

const storedRole = (typeof window !== "undefined"
  ? (localStorage.getItem("permitpath_user_role") as UserRole)
  : null);

const initialState: AppState = {
  currentJobId: null,
  sessionId: "",
  demoMode: false,
  isLoading: false,
  userRole: storedRole || null,
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_CURRENT_JOB":
      return { ...state, currentJobId: action.payload };
    case "SET_DEMO_MODE":
      return { ...state, demoMode: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_USER_ROLE":
      if (action.payload) {
        localStorage.setItem("permitpath_user_role", action.payload);
      } else {
        localStorage.removeItem("permitpath_user_role");
      }
      return { ...state, userRole: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const sessionId = getSessionId();
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}

export function useAppState() {
  const { state } = useAppContext();
  return state;
}

export function useAppDispatch() {
  const { dispatch } = useAppContext();
  return dispatch;
}
