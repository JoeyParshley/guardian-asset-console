import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * MSW server for Node.js testing environment
 * Used with vitest to mock API requests in tests
 */
export const server = setupServer(...handlers);
