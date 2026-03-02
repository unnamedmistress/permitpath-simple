export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LogContext = Record<string, unknown>;

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

const DEFAULT_LEVEL: LogLevel = import.meta.env.DEV ? 'debug' : 'info';
const configuredLevel = (import.meta.env.VITE_LOG_LEVEL as LogLevel | undefined) ?? DEFAULT_LEVEL;

function shouldLog(level: LogLevel): boolean {
  const configuredPriority = LOG_LEVEL_PRIORITY[configuredLevel] ?? LOG_LEVEL_PRIORITY.info;
  return LOG_LEVEL_PRIORITY[level] >= configuredPriority;
}

function emit(level: LogLevel, message: string, context?: LogContext): void {
  if (!shouldLog(level)) {
    return;
  }

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(context ? { context } : {})
  };

  const writer: (...data: unknown[]) => void =
    level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;

  writer(entry);
}

export const logger = {
  debug: (message: string, context?: LogContext): void => emit('debug', message, context),
  info: (message: string, context?: LogContext): void => emit('info', message, context),
  warn: (message: string, context?: LogContext): void => emit('warn', message, context),
  error: (message: string, context?: LogContext): void => emit('error', message, context)
};
