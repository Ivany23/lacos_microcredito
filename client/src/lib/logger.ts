/**
 * Smart Logger for Laços Software
 * 
 * - In DEVELOPMENT: shows all logs normally
 * - In PRODUCTION: only console.error and console.warn are emitted
 * - In DEV MODE (secret): shows all logs like development
 * - Sanitizes sensitive data (JWT tokens, passwords) automatically
 */
import { isDevMode } from "./api.config";

/** Regex patterns for sensitive data that should be redacted in logs */
const SENSITIVE_PATTERNS = [
  /Bearer\s+[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+/g, // JWT tokens
  /"password"\s*:\s*"[^"]+"/g, // password fields in JSON
  /"senha"\s*:\s*"[^"]+"/g, // senha fields in JSON
  /"access_token"\s*:\s*"[^"]+"/g, // access tokens
];

/**
 * Sanitize a value by redacting sensitive patterns
 */
function sanitize(value: unknown): unknown {
  if (typeof value === "string") {
    let sanitized = value;
    for (const pattern of SENSITIVE_PATTERNS) {
      sanitized = sanitized.replace(pattern, (match) => {
        if (match.startsWith("Bearer")) return "Bearer [REDACTED]";
        if (match.includes("password")) return '"password": "[REDACTED]"';
        if (match.includes("senha")) return '"senha": "[REDACTED]"';
        if (match.includes("access_token")) return '"access_token": "[REDACTED]"';
        return "[REDACTED]";
      });
    }
    return sanitized;
  }

  if (typeof value === "object" && value !== null) {
    try {
      const str = JSON.stringify(value);
      const sanitizedStr = sanitize(str) as string;
      return JSON.parse(sanitizedStr);
    } catch {
      return value;
    }
  }

  return value;
}

/**
 * Logger with environment-aware output levels
 */
export const logger = {
  /**
   * Debug-level log. Only shown in development or dev mode.
   * Stripped from production builds by esbuild (console.log removal).
   */
  debug(...args: unknown[]): void {
    if (isDevMode()) {
      console.log("[DEBUG]", ...args.map(sanitize));
    }
  },

  /**
   * Info-level log. Only shown in development or dev mode.
   * Stripped from production builds by esbuild (console.info removal).
   */
  info(...args: unknown[]): void {
    if (isDevMode()) {
      console.info("[INFO]", ...args.map(sanitize));
    }
  },

  /**
   * Warning-level log. Always shown (preserved in production).
   * Use for non-critical issues that devs should know about.
   */
  warn(...args: unknown[]): void {
    console.warn("[WARN]", ...args.map(sanitize));
  },

  /**
   * Error-level log. Always shown (preserved in production).
   * Use for errors that need attention.
   */
  error(...args: unknown[]): void {
    console.error("[ERROR]", ...args.map(sanitize));
  },
};
