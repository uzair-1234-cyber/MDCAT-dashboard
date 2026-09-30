// Ensure window.fetch has both getter and setter to prevent "Cannot set property fetch of #<Window> which has only a getter"
try {
  if (typeof window !== 'undefined' && window.fetch) {
    const origFetch = window.fetch.bind(window);
    let activeFetch = origFetch;
    try {
      Object.defineProperty(window, 'fetch', {
        configurable: true,
        enumerable: true,
        get: () => activeFetch,
        set: (fn: typeof fetch) => {
          activeFetch = fn;
        },
      });
    } catch {
      // Ignore if already configured
    }
  }
} catch {
  // Ignore fallback
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
