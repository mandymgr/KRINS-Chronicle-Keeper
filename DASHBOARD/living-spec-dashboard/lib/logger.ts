import { env } from './env';

export interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment = env.NODE_ENV === 'development';

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  info(message: string, context?: LogContext): void {
    console.log(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, error?: Error | LogContext, context?: LogContext): void {
    let errorContext = context;
    
    if (error instanceof Error) {
      errorContext = {
        ...context,
        error: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      };
    } else if (error && typeof error === 'object') {
      errorContext = { ...context, ...error };
    }

    console.error(this.formatMessage('error', message, errorContext));
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  // Integration-specific logging helpers
  github(message: string, context?: LogContext): void {
    this.info(`[GitHub] ${message}`, context);
  }

  jira(message: string, context?: LogContext): void {
    this.info(`[Jira] ${message}`, context);
  }

  cache(message: string, context?: LogContext): void {
    this.debug(`[Cache] ${message}`, context);
  }

  rateLimit(message: string, context?: LogContext): void {
    this.debug(`[RateLimit] ${message}`, context);
  }
}

export const logger = new Logger();