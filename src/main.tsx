import React, { Component, ReactNode, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { LogoMoodProvider } from './components/MedicalLogo.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('RootErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6 text-center font-['Plus_Jakarta_Sans',sans-serif]">
          <div className="max-w-md w-full bg-slate-800/90 border border-slate-700/80 p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-xl font-bold ring-2 ring-rose-500/30">
              !
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Application Initialization Notice</h2>
              <p className="text-xs text-rose-300 font-mono mt-2 bg-slate-950/60 p-3 rounded-lg border border-slate-800 break-words text-left">
                {this.state.error?.message || 'Rendering error occurred.'}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-cyan-600/30 cursor-pointer"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <RootErrorBoundary>
        <LogoMoodProvider>
          <App />
        </LogoMoodProvider>
      </RootErrorBoundary>
    </StrictMode>
  );
}
