/**
 * Centralized API Configuration
 * 
 * In DEVELOPMENT: calls go directly to http://localhost:3000
 * In PRODUCTION: calls go to /api (Vercel proxies to the real backend)
 * 
 * This ensures the real backend URL (https://lacos-microcredito-api.vercel.app)
 * is NEVER visible in the browser's Network tab or source code.
 */

const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

/**
 * API base URL:
 * - Development: direct connection to local backend
 * - Production: relative path proxied by Vercel rewrites
 */
export const API_BASE_URL = isLocalhost
  ? "http://localhost:3000"
  : "/api";

/** Dev mode secret key — used to unlock debugging in production */
const DEV_MODE_SECRET = "lacos2024";

/**
 * Check if developer debug mode is active.
 * Activated via:
 *   - URL param: ?dev_debug=lacos2024
 *   - localStorage: localStorage.setItem('LACOS_DEV_MODE', 'true')
 */
export function isDevMode(): boolean {
  if (typeof window === "undefined") return false;

  // Always true in development
  if (isLocalhost) return true;

  // Check URL param (auto-saves to localStorage)
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("dev_debug") === DEV_MODE_SECRET) {
      localStorage.setItem("LACOS_DEV_MODE", "true");
      return true;
    }
  } catch {
    // URL parsing failed, continue
  }

  // Check localStorage
  try {
    return localStorage.getItem("LACOS_DEV_MODE") === "true";
  } catch {
    return false;
  }
}
