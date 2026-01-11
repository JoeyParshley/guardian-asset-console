import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/**
 * MSW browser worker for development
 * Intercepts fetch requests and returns mock responses
 */
export const worker = setupWorker(...handlers);
