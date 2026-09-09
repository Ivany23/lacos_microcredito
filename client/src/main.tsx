import { createRoot } from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import { initDevToolsGuard } from "./lib/devtools-guard";
import "./index.css";

// Initialize DevTools protection (only active in production, disabled in dev mode)
initDevToolsGuard();


/**
 * Global error handler to suppress known third-party analytics errors
 * (e.g., Vercel Analytics / web-vitals "startTime" / "reportAllChanges").
 *
 * These errors originate from injected scripts outside our codebase
 * and are not actionable — they must be caught at the window level
 * before they propagate and crash the app.
 */
const SUPPRESSED_ERROR_PATTERNS = [
  "Cannot read properties of undefined (reading 'startTime')",
  "Cannot read property 'startTime' of undefined",
  "reportAllChanges",
];

function shouldSuppressError(message: string): boolean {
  return SUPPRESSED_ERROR_PATTERNS.some((pattern) =>
    message.includes(pattern)
  );
}

// Catch synchronous errors from injected scripts
window.addEventListener(
  "error",
  (event: ErrorEvent) => {
    if (shouldSuppressError(event.message || "")) {
      event.preventDefault();
      console.warn(
        "[Global] Suppressed third-party analytics error:",
        event.message
      );
      return true;
    }
  },
  true // Use capture phase to intercept before bubbling
);

// Catch unhandled promise rejections from injected scripts
window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
  const reason = event.reason;
  const message =
    reason instanceof Error
      ? reason.message
      : typeof reason === "string"
        ? reason
        : "";

  if (shouldSuppressError(message)) {
    event.preventDefault();
    console.warn(
      "[Global] Suppressed third-party analytics rejection:",
      message
    );
  }
});

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
