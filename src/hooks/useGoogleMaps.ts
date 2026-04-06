import { useState, useEffect, useCallback } from "react";

let cachedApiKey: string | null = null;
let scriptLoaded = false;
let scriptLoading = false;
const loadCallbacks: Array<() => void> = [];

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(scriptLoaded);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(cachedApiKey);

  useEffect(() => {
    if (scriptLoaded) { setIsLoaded(true); return; }

    const initGoogleMaps = async () => {
      try {
        if (!cachedApiKey) {
          const envKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
          if (!envKey) {
            console.warn("VITE_GOOGLE_PLACES_API_KEY not set");
            setLoadError("Missing Google Maps API key");
            return;
          }
          cachedApiKey = envKey;
          setApiKey(envKey);
        }

        if (scriptLoading) {
          loadCallbacks.push(() => setIsLoaded(true));
          return;
        }

        scriptLoading = true;
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${cachedApiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          scriptLoaded = true;
          scriptLoading = false;
          setIsLoaded(true);
          loadCallbacks.forEach((cb) => cb());
          loadCallbacks.length = 0;
        };
        script.onerror = () => {
          scriptLoading = false;
          setLoadError("Failed to load Google Maps");
        };
        document.head.appendChild(script);
      } catch (err) {
        setLoadError("Failed to initialize Google Maps");
      }
    };

    initGoogleMaps();
  }, []);

  return { isLoaded, loadError, apiKey };
}
