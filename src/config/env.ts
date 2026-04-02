// Environment configuration
// Users should set these in their .env file

export const ENV = {
  // Firebase Configuration
  FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY || "",
  FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID || "",

  // OpenAI Configuration
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || "",

  // Functions base URL (optional override)
  FUNCTIONS_BASE_URL: import.meta.env.VITE_FUNCTIONS_BASE_URL || "",
};

export const validateEnv = (): void => {
  const requiredEnvVars = [
    { key: "VITE_OPENAI_API_KEY", value: ENV.OPENAI_API_KEY },
    { key: "VITE_FIREBASE_API_KEY", value: ENV.FIREBASE_API_KEY },
  ];

  const missingEnvVars = requiredEnvVars
    .filter((entry) => !entry.value)
    .map((entry) => entry.key);

  if (missingEnvVars.length > 0) {
    console.warn(
      `Missing environment variables: ${missingEnvVars.join(", ")}. AI and save features will be limited.`
    );
  }
};

export const isFirebaseConfigured = (): boolean => {
  return !!(
    ENV.FIREBASE_API_KEY &&
    ENV.FIREBASE_PROJECT_ID &&
    ENV.FIREBASE_STORAGE_BUCKET
  );
};

export const isOpenAIConfigured = (): boolean => {
  return !!ENV.OPENAI_API_KEY;
};
