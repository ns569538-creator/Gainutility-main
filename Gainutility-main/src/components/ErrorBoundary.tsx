import React, { Component, type ErrorInfo, type ReactNode } from "react";

/**
 * Blank-screen guard for the SPA. Catches errors thrown during render of a
 * lazy tool/page chunk (or any child render error) and shows a small recovery
 * UI instead of unmounting the whole app. The fallback never exposes stack
 * traces or error internals; details go only to the browser console.
 */

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Bump this (e.g. the current URL path) to auto-recover when the user navigates. */
  resetKey?: string;
  /** Short noun used in the message, e.g. "tool" or "app". */
  label?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  resetKey?: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error } as any;
  }

  static getDerivedStateFromProps(
    props: ErrorBoundaryProps,
    state: ErrorBoundaryState
  ): Partial<ErrorBoundaryState> | null {
    if (state.hasError && props.resetKey !== state.resetKey) {
      return { hasError: false, resetKey: props.resetKey };
    }
    return null;
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[ErrorBoundary] Caught render error:", error, info);
  }

  private reload = (): void => {
    window.location.reload();
  };

  private goHome = (): void => {
    window.location.assign("/");
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-24 text-center px-4">
          <p className="font-sans font-bold text-text-main">
            Something went wrong while loading this {this.props.label ?? "page"}.
          </p>
          <p className="text-sm text-text-muted max-w-sm">
            This is usually a temporary glitch. Try reloading, or head back to the homepage to keep using the tools.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-1">
            <button
              onClick={this.reload}
              className="px-4 py-2 bg-brand-primary text-[#FAF8F1] rounded-lg font-bold hover:bg-brand-primary-hover cursor-pointer"
            >
              Reload
            </button>
            <button
              onClick={this.goHome}
              className="px-4 py-2 border border-border-light bg-surface-base text-text-main rounded-lg font-bold hover:bg-surface-muted cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}