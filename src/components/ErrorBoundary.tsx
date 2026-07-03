import { Component, type ErrorInfo, type ReactNode } from 'react';

const PIXEL = "'Press Start 2P', monospace";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/** catches render-time crashes so a bug in one page can't blank the whole app */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uncaught render error:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, background: '#ece4d3', fontFamily: PIXEL, color: '#34302a', padding: 40, textAlign: 'center' }}>
          <span style={{ fontSize: 13 }}>Something went wrong.</span>
          <span style={{ fontSize: 9, color: '#857c6b', maxWidth: 480, lineHeight: 1.8 }}>{this.state.error.message}</span>
          <button
            type="button"
            onClick={() => { this.setState({ error: null }); window.location.href = '/'; }}
            style={{ fontFamily: PIXEL, fontSize: 10, padding: '12px 18px', background: '#e6dcc6', border: '2px solid #34302a', color: '#34302a', cursor: 'pointer', boxShadow: '3px 3px 0 rgba(52,48,42,.25)' }}
          >
            back to home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
