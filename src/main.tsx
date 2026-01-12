import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

async function enableMocking() {
  // Only enable MSW in development
  if (import.meta.env.MODE !== 'development') {
    return;
  }

  try {
    const { worker } = await import('./api/browser');

    // Start the worker with onUnhandledRequest set to bypass
    // so non-API requests (assets, etc.) pass through
    await worker.start({
      onUnhandledRequest: 'bypass',
    });
    console.log('MSW: Mock Service Worker started successfully');
  } catch (error) {
    console.error('MSW: Failed to start Mock Service Worker', error);
    console.warn('MSW: API requests may fail. Make sure mockServiceWorker.js exists in the public folder.');
  }
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
