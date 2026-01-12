import { setupServer } from 'msw/node';
import { handlers } from '../api/handlers';

// Create MSW server with our handlers
export const server = setupServer(...handlers);
