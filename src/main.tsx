import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { validateEnv } from "./config/env";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element with id 'root' was not found.");
}

const root = createRoot(rootElement);

try {
  validateEnv();

  root.render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown startup error.";

  root.render(
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Configuration Error</h1>
      <p>{message}</p>
      <p>Set VITE_OPENAI_API_KEY and VITE_FIREBASE_API_KEY in your .env file.</p>
    </div>
  );
}
