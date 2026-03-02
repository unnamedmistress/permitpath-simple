interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  onRetry?: (error: unknown, attempt: number, nextDelayMs: number) => void | Promise<void>;
}

const wait = (delayMs: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });

export async function retry<T>(operation: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelayMs = 500,
    maxDelayMs = 8000,
    backoffMultiplier = 2,
    shouldRetry = () => true,
    onRetry
  } = options;

  let delayMs = initialDelayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      const canRetry = attempt < maxAttempts && shouldRetry(error, attempt);
      if (!canRetry) {
        throw error;
      }

      if (onRetry) {
        await onRetry(error, attempt, delayMs);
      }

      await wait(delayMs);
      delayMs = Math.min(Math.floor(delayMs * backoffMultiplier), maxDelayMs);
    }
  }

  throw new Error('Retry attempts exhausted');
}
