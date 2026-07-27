import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/** Keeps one view crashing (e.g. a bad saved phrase) from blanking the whole app. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('View crashed:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <p className="error-state">
          Something went wrong showing this screen. Try switching tabs and back.
        </p>
      );
    }
    return this.props.children;
  }
}
