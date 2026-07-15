import { Component } from "react";

/**
 * Global error boundary. Catches render-time errors in the React tree
 * so a single crashing page does not blank out the whole app.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.assign("/");
  };

  render() {
    if (this.state.hasError) {
      const message =
        this.props.fallbackMessage ||
        "An unexpected error occurred. Please try reloading the page.";

      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center bg-slate-950 text-white">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="text-white/70 max-w-md">{message}</p>
          {import.meta.env.DEV && this.state.error?.message ? (
            <pre className="max-w-xl overflow-auto rounded-md bg-white/10 p-3 text-left text-xs text-red-300">
              {this.state.error.message}
            </pre>
          ) : null}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleGoHome}
              className="px-5 py-2.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              Go Home
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              className="px-5 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
