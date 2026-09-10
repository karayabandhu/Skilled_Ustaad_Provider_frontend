/**
 * Production-ready Logging Utility
 * Centralizes all application logs, error tracking, and performance monitoring.
 * In a real production environment, this would integrate with Sentry, LogRocket, or Datadog.
 */

const IS_PROD = import.meta.env.PROD;

class Logger {
  constructor() {
    this.logs = [];
    this.maxLogs = 100;
  }

  /**
   * Scrub sensitive information from logs
   */
  async scrub(data) {
    try {
      const { scrubData } = await import("./security");
      return scrubData(data);
    } catch (e) {
      return data; // Fallback if security module not yet available
    }
  }

  async log(level, message, context = {}) {
    const timestamp = new Date().toISOString();
    const scrubbedContext = await this.scrub(context);

    const logEntry = {
      timestamp,
      level,
      message,
      context: scrubbedContext,
    };

    // Store in-memory for session debugging
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) this.logs.shift();

    if (!IS_PROD) {
      const colors = {
        info: "color: #3b82f6",
        warn: "color: #f59e0b",
        error: "color: #ef4444",
        debug: "color: #10b981",
      };
      // console.log(`%c[${level.toUpperCase()}] %c${message}`, colors[level], "color: inherit", scrubbedContext);
    } else {
      // In production, send to remote logging service
      // Example: Sentry.captureMessage(message, { level, extra: scrubbedContext });
      if (level === "error") {
        console.error(`[FATAL] ${message}`, scrubbedContext);
      }
    }
  }

  info(msg, ctx) { this.log("info", msg, ctx); }
  warn(msg, ctx) { this.log("warn", msg, ctx); }
  error(msg, ctx) { this.log("error", msg, ctx); }
  debug(msg, ctx) { this.log("debug", msg, ctx); }

  /**
   * Track performance metrics (Web Vitals etc)
   */
  trackMetric(name, value, rating) {
    this.info(`Metric: ${name}`, { value, rating });
  }
}

export const logger = new Logger();
export default logger;
