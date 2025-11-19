import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = { hasError: false };

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
            <h1 className="text-2xl font-serif font-bold text-red-600">Something went wrong.</h1>
            <p className="mt-2 text-brand-black/70">We're sorry for the inconvenience. Please try refreshing the page or go back home.</p>
            <div className="mt-6">
                <a href="#/" className="inline-flex items-center justify-center gap-2 font-semibold rounded-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold disabled:opacity-50 disabled:cursor-not-allowed bg-brand-black text-brand-white hover:bg-black/80 px-5 py-2.5 text-sm">
                    Go to Homepage
                </a>
            </div>
        </div>
      );
    }

    // FIX: In a React class component, props are accessed via `this.props`.
    return this.props.children;
  }
}

export default ErrorBoundary;