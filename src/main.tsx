import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

async function enableMocking() {
  // Only enable MSW in development
  if (import.meta.env.MODE !== 'development') {
    return;
  }

  const { worker } = await import('./api/browser');

  // Start the worker with onUnhandledRequest set to bypass
  // so non-API requests (assets, etc.) pass through
  return worker.start({
    onUnhandledRequest: 'bypass',
  });
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
