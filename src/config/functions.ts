import { ENV } from "./env";

export const FUNCTIONS_BASE_URL =
  import.meta.env.VITE_FUNCTIONS_BASE_URL ||
  (ENV.FIREBASE_PROJECT_ID
    ? `https://us-central1-${ENV.FIREBASE_PROJECT_ID}.cloudfunctions.net`
    : "");

export const isFunctionsConfigured = (): boolean => {
  return !!FUNCTIONS_BASE_URL;
};
