import { ThemeProvider, CssBaseline } from '@mui/material';
import { useSessionStore } from './store/useSessionStore';
import { getTheme } from './app/theme';
import { AppShell } from './app/AppShell';

/**
 * Main App Component
 * 
 * This is the root component that:
 * 1. Wraps the app in MUI ThemeProvider with our custom theme
 * 2. Applies CssBaseline for consistent styling
 * 3. Renders AppShell which provides layout and navigation
 * 4. Will contain page routing in future phases
 */
function App() {
  // Get theme mode from session store
  const themeMode = useSessionStore((state) => state.themeMode);
  
  // Get the appropriate theme based on mode
  const theme = getTheme(themeMode);

  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline normalizes CSS and applies base styles */}
      <CssBaseline />
      {/* AppShell provides the layout structure */}
      <AppShell>
        {/* Placeholder content - will be replaced with pages in Phase 4 */}
        <div>
          <h1>Guardian Asset Console</h1>
          <p>Phase 3 Complete: App Shell + Theme</p>
          <p>Current Role: {useSessionStore((state) => state.role)}</p>
          <p>Current Theme: {themeMode}</p>
        </div>
      </AppShell>
    </ThemeProvider>
  );
}

export default App;
