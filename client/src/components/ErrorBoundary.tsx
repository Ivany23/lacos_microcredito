import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary component that catches rendering errors
 * and prevents the entire app from crashing. Specifically handles
 * known third-party errors (e.g., Vercel Analytics / web-vitals
 * "startTime" / "reportAllChanges" errors) by silently recovering.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if this is a known third-party analytics error
    // (web-vitals / Vercel Speed Insights) — if so, don't show error UI
    if (isThirdPartyAnalyticsError(error)) {
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Silently ignore known third-party analytics errors
    if (isThirdPartyAnalyticsError(error)) {
      console.warn(
        "[ErrorBoundary] Suppressed third-party analytics error:",
        error.message
      );
      return;
    }

    // Log genuine application errors for debugging
    console.error("[ErrorBoundary] Uncaught error:", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f9fafb",
            fontFamily: "Inter, sans-serif",
          }}
        >
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              maxWidth: "480px",
            }}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 600,
                color: "#1f2937",
                marginBottom: "0.75rem",
              }}
            >
              Algo correu mal
            </h2>
            <p
              style={{
                color: "#6b7280",
                marginBottom: "1.5rem",
                lineHeight: 1.6,
              }}
            >
              Ocorreu um erro inesperado. Por favor, recarregue a página.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              style={{
                padding: "0.625rem 1.5rem",
                backgroundColor: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Checks if an error originates from third-party analytics/performance
 * monitoring scripts (e.g., web-vitals, Vercel Speed Insights, Sentry).
 * These errors are not actionable in the app and should be suppressed.
 */
function isThirdPartyAnalyticsError(error: Error): boolean {
  const message = error?.message || "";
  const stack = error?.stack || "";

  // Known web-vitals / Vercel Analytics error patterns
  const knownPatterns = [
    "Cannot read properties of undefined (reading 'startTime')",
    "Cannot read property 'startTime' of undefined",
    "reportAllChanges",
    "firstSessionEntry",
    "lastSessionEntry",
  ];

  return knownPatterns.some(
    (pattern) => message.includes(pattern) || stack.includes(pattern)
  );
}

export default ErrorBoundary;
