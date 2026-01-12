import { createTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

// Extend the theme type to include DataGrid components from @mui/x-data-grid
declare module '@mui/material/styles' {
  interface Components {
    MuiDataGrid?: {
      styleOverrides?: {
        root?: {
          border?: string;
          backgroundColor?: string;
          [key: string]: any;
        };
      };
    };
  }
}

// define colot palette
const palette = {
    primary: {
        main: '#1976d2', // Calm blue
        light: '#42a5f5', // Light blue
        dark: '#1565c0', // Dark blue
        contrastText: '#fff', // White text
    },
    secondary: {
        main: '#424242', // Neutral gray
        light: '#6d6d6d', // Light gray
        dark: '#1d1d1d', // Dark gray
        contrastText: '#fff', // White text
    },
    error: {
        main: '#d32f2f', // Red
        light: '#ef5350', // Light red
        dark: '#c62828', // Dark red
    },
    background: {
        default: '#f5f5f5', // soft gray background
        paper: '#fff', // white paper background
    },
    text: {
        primary: '#212121', // Dark text
        secondary: '#616161', // Medium gray text
    },
};

// create a base theme with DataGrid customization
const baseTheme = createTheme({
    palette,
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: { fontSize: '2rem', fontWeight: 600 },
      h2: { fontSize: '1.75rem', fontWeight: 600 },
      body1: { fontSize: '0.875rem' },
    },
    shape: {
      borderRadius: 8,
    },
    spacing: 8,
    components: {
      // Customize DataGrid to not look default
      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: 'none',
            backgroundColor: 'transparent',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#fafafa',
              borderBottom: '2px solid #e0e0e0',
              fontWeight: 600,
              fontSize: '0.8125rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            },
            '& .MuiDataGrid-row': {
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
              '&.Mui-selected': {
                backgroundColor: '#e3f2fd',
                '&:hover': {
                  backgroundColor: '#bbdefb',
                },
              },
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #f0f0f0',
              fontSize: '0.875rem',
            },
          },
        },
      },
      // Customize buttons
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none', // Don't uppercase
            fontWeight: 500,
            borderRadius: 8,
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
        },
      },
      // Customize AppBar
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            backgroundColor: '#ffffff',
            color: '#212121',
          },
        },
      },
    },
  });

  export const darkTheme = createTheme({
    ...baseTheme,
    palette: {
      ...baseTheme.palette,
      mode: 'dark',
      primary: palette.primary,
      secondary: palette.secondary,
      background: {
        default: '#121212',
        paper: '#1e1e1e',
      },
      text: {
        primary: '#ffffff',
        secondary: '#b0b0b0',
      },
    },
    components: {
      ...baseTheme.components,
      MuiDataGrid: {
        styleOverrides: {
          root: {
            ...baseTheme.components?.MuiDataGrid?.styleOverrides?.root,
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#1e1e1e',
              borderBottom: '2px solid #333333',
            },
            '& .MuiDataGrid-row': {
              '&:hover': {
                backgroundColor: '#2a2a2a',
              },
              '&.Mui-selected': {
                backgroundColor: '#1e3a5f',
              },
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: '#1e1e1e',
            color: '#ffffff',
          },
        },
      },
    },
  });

  export const lightTheme = baseTheme;

export function getTheme(mode: 'light' | 'dark'): Theme {
  return mode === 'dark' ? darkTheme : lightTheme;
}