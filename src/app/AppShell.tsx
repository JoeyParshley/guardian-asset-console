/**
 * Main Layout with navigation, role selector and theme toggle
 */
import React from 'react';
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
} from '@mui/material';
import { useSessionStore } from '../store/useSessionStore';
import type { Role } from '../domain/types';

// define the props interface
interface AppShellProps {
    children: React.ReactNode;
}

// define the component
export function AppShell({ children }: AppShellProps) {
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

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* App Bar with role selector and theme toggle */}
            <AppBar position="static">
                <Toolbar>
                    {/* App title */}
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1, fontWeight: 600 }}
                    >
                        Guardian Asset Console
                    </Typography>
                    {/* Theme toggle */}
                    <FormControlLabel
                        control={
                            <Switch
                                checked={themeMode === 'dark'}
                                onChange={handleThemeToggle}
                                color="primary"
                            />
                        }
                        label={themeMode === 'dark' ? 'Dark' : 'Light'}
                        sx={{ mr: 3 }}
                    />

                    {/* Role selector */}
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel id="role-select-label">Role</InputLabel>
                        <Select
                            labelId="role-select-label"
                            id="role-select"
                            value={role}
                            label="Role"
                            onChange={handleRoleChange}
                        >
                            <MenuItem value="operator">Operator</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="auditor">Auditor</MenuItem>
                        </Select>
                    </FormControl>
                </Toolbar>
            </AppBar>

            {/* Main content container */}
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                {children}
            </Box>
        </Box>
    );
}