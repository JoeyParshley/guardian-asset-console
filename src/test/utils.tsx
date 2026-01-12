import { ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material';
import { getTheme } from '../app/theme';

// Create a fresh QueryClient for each test
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Don't retry failed queries in tests
        gcTime: 0, // Disable garbage collection time
      },
    },
  });
}

interface WrapperProps {
  children: React.ReactNode;
}

// Create wrapper with all providers
function createWrapper() {
  const queryClient = createTestQueryClient();
  const theme = getTheme('light');

  return function Wrapper({ children }: WrapperProps) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </QueryClientProvider>
    );
  };
}

// Custom render function that includes providers
function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: createWrapper(), ...options });
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };
