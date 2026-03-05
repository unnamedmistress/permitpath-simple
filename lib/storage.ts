import { ChatMessage, HistoricalPermit, Permit, Prediction } from '@/types';
import { seedHistoricalPermits, seedMessages, seedPermits, seedPredictions } from '@/lib/mock-data';

const KEY = 'permitflow-demo-session-v1';

export interface DemoState {
  permits: Permit[];
  predictions: Prediction[];
  historical: HistoricalPermit[];
  chat: ChatMessage[];
}

export function getSeedState(): DemoState {
  return {
    permits: seedPermits,
    predictions: seedPredictions,
    historical: seedHistoricalPermits,
    chat: seedMessages,
  };
}

export function loadDemoState(): DemoState {
  const seed = getSeedState();

  // Intentionally reset every page load for sandbox behavior.
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(KEY, JSON.stringify(seed));
  }

  return seed;
}

export function saveDemoState(state: DemoState): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(KEY, JSON.stringify(state));
}

export function resetDemoState(): DemoState {
  const seed = getSeedState();
  saveDemoState(seed);
  return seed;
}
