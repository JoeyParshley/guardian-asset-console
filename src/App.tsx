import { useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSessionStore } from './store/useSessionStore';
import { getTheme } from './app/theme';
import { AppShell, type PageId } from './app/AppShell';
import AssetConsolePage from './pages/AssetConsolePage';
import AuditLogPage from './pages/AuditLogPage';

/**
 * React Query client configuration
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
    },
  },
});

/**
 * Main App Component
 *
 * This is the root component that:
 * 1. Wraps the app in MUI ThemeProvider with our custom theme
 * 2. Applies CssBaseline for consistent styling
 * 3. Provides React Query QueryClientProvider for data fetching
 * 4. Renders AppShell which provides layout and navigation
 * 5. Handles page routing between Assets and Audit Log
 */
function App() {
  // Get theme mode from session store
  const themeMode = useSessionStore((state) => state.themeMode);

  // Current page state
  const [currentPage, setCurrentPage] = useState<PageId>('assets');

  // Get the appropriate theme based on mode
  const theme = getTheme(themeMode);

  // Handle page change
  const handlePageChange = (page: PageId) => {
    setCurrentPage(page);
  };

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case 'assets':
        return <AssetConsolePage />;
      case 'audit':
        return <AuditLogPage />;
      default:
        return <AssetConsolePage />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        {/* CssBaseline normalizes CSS and applies base styles */}
        <CssBaseline />
        {/* AppShell provides the layout structure */}
        <AppShell currentPage={currentPage} onPageChange={handlePageChange}>
          {renderPage()}
        </AppShell>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
