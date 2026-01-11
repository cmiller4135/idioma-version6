/**
 * Centralized Error Logging Utility
 *
 * Provides consistent error logging across the application.
 * Can be extended to send errors to external monitoring services.
 */

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

interface LoggedError {
  message: string;
  severity: ErrorSeverity;
  timestamp: Date;
  context?: ErrorContext;
  stack?: string;
}

/**
 * Extracts error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'An unknown error occurred';
}

/**
 * Extracts stack trace from error if available
 */
function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.stack;
  }
  return undefined;
}

/**
 * Formats error for console output
 */
function formatError(loggedError: LoggedError): string {
  const parts = [
    `[${loggedError.severity.toUpperCase()}]`,
    loggedError.context?.component ? `[${loggedError.context.component}]` : '',
    loggedError.context?.action ? `(${loggedError.context.action})` : '',
    loggedError.message
  ];

  return parts.filter(Boolean).join(' ');
}

/**
 * Main error logging function
 */
export function logError(
  error: unknown,
  context?: ErrorContext,
  severity: ErrorSeverity = 'error'
): void {
  const loggedError: LoggedError = {
    message: getErrorMessage(error),
    severity,
    timestamp: new Date(),
    context,
    stack: getErrorStack(error)
  };

  const formattedMessage = formatError(loggedError);

  // Log to console based on severity
  switch (severity) {
    case 'info':
      console.info(formattedMessage, context?.metadata || '');
      break;
    case 'warning':
      console.warn(formattedMessage, context?.metadata || '');
      break;
    case 'critical':
    case 'error':
    default:
      console.error(formattedMessage, error);
      break;
  }

  // Future: Send to external monitoring service
  // sendToMonitoringService(loggedError);
}

/**
 * Log info-level message
 */
export function logInfo(message: string, context?: ErrorContext): void {
  logError(message, context, 'info');
}

/**
 * Log warning-level message
 */
export function logWarning(message: string, context?: ErrorContext): void {
  logError(message, context, 'warning');
}

/**
 * Create a scoped logger for a specific component
 */
export function createLogger(component: string) {
  return {
    info: (message: string, metadata?: Record<string, unknown>) =>
      logInfo(message, { component, metadata }),

    warn: (message: string, metadata?: Record<string, unknown>) =>
      logWarning(message, { component, metadata }),

    error: (error: unknown, action?: string, metadata?: Record<string, unknown>) =>
      logError(error, { component, action, metadata }),

    critical: (error: unknown, action?: string, metadata?: Record<string, unknown>) =>
      logError(error, { component, action, metadata }, 'critical')
  };
}
