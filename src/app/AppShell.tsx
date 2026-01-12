/**
 * Main Layout with navigation, role selector and theme toggle
 */
import {
  AppBar,
  Toolbar,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HistoryIcon from '@mui/icons-material/History';
import { useSessionStore } from '../store/useSessionStore';
import type { Role } from '../domain/types';

export type PageId = 'assets' | 'audit';

interface AppShellProps {
  children: React.ReactNode;
  currentPage: PageId;
  onPageChange: (page: PageId) => void;
}

export function AppShell({ children, currentPage, onPageChange }: AppShellProps) {
  // Get state from store using selectors
  const role = useSessionStore((state) => state.role);
  const themeMode = useSessionStore((state) => state.themeMode);
  const setRole = useSessionStore((state) => state.setRole);
  const setThemeMode = useSessionStore((state) => state.setThemeMode);

  // Handle role change
  const handleRoleChange = (event: { target: { value: unknown } }) => {
    setRole(event.target.value as Role);
  };

  // Handle theme change
  const handleThemeToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setThemeMode(event.target.checked ? 'dark' : 'light');
  };

  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: PageId) => {
    onPageChange(newValue);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      {/* App Bar with role selector and theme toggle */}
      <AppBar position="static">
        <Toolbar>
          {/* App title */}
          <Typography
            variant="h6"
            component="div"
            sx={{ fontWeight: 600, mr: 4 }}
          >
            Guardian Asset Console
          </Typography>

          {/* Navigation Tabs */}
          <Tabs
            value={currentPage}
            onChange={handleTabChange}
            textColor="inherit"
            indicatorColor="secondary"
            sx={{
              flexGrow: 1,
              '& .MuiTab-root': {
                minHeight: 64,
                textTransform: 'none',
                fontSize: '0.95rem',
              },
            }}
          >
            <Tab
              value="assets"
              label="Assets"
              icon={<DashboardIcon />}
              iconPosition="start"
            />
            <Tab
              value="audit"
              label="Audit Log"
              icon={<HistoryIcon />}
              iconPosition="start"
            />
          </Tabs>

          {/* Theme toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={themeMode === 'dark'}
                onChange={handleThemeToggle}
                color="default"
              />
            }
            label={themeMode === 'dark' ? 'Dark' : 'Light'}
            sx={{ mr: 3 }}
          />

          {/* Role selector */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="role-select-label" sx={{ color: 'inherit' }}>
              Role
            </InputLabel>
            <Select
              labelId="role-select-label"
              id="role-select"
              value={role}
              label="Role"
              onChange={handleRoleChange}
              sx={{
                color: 'inherit',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.3)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.5)',
                },
                '& .MuiSvgIcon-root': {
                  color: 'inherit',
                },
              }}
            >
              <MenuItem value="operator">Operator</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="auditor">Auditor</MenuItem>
            </Select>
          </FormControl>
        </Toolbar>
      </AppBar>

      {/* Main content container */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          width: '100%',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
