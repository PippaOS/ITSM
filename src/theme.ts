import { createTheme, type Theme } from '@mui/material/styles';

// Extend the MUI theme to include custom palette properties
declare module '@mui/material/styles' {
  interface Palette {
    userMessage: {
      main: string;
      contrastText: string;
    };
  }
  interface PaletteOptions {
    userMessage?: {
      main: string;
      contrastText: string;
    };
  }
}

type ThemeMode = 'light' | 'dark';

/**
 * Create theme for PippaOS ITSM
 * Supports both light and dark modes with white primary accent
 */
export function createAppTheme(mode: ThemeMode): Theme {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        // White primary for dark mode, dark primary for light mode
        main: isDark ? '#ffffff' : '#000000',
        light: isDark ? '#f5f5f5' : '#424242',
        dark: isDark ? '#c2c2c2' : '#000000',
        contrastText: isDark ? '#000000' : '#ffffff',
      },
      // Custom color for user messages in chat
      userMessage: {
        main: isDark ? '#4b4b4b' : '#f4f4f4',
        contrastText: isDark ? '#ffffff' : '#000000',
      },
      background: {
        default: isDark ? '#212121' : '#ffffff',
        paper: isDark ? '#212121' : '#ffffff',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            backgroundColor: isDark ? '#212121' : '#ffffff',
          },
          body: {
            backgroundColor: isDark ? '#212121' : '#ffffff',
          },
          '#root': {
            backgroundColor: isDark ? '#212121' : '#ffffff',
            minHeight: '100vh',
          },
          // Scrollbar styles
          '*::-webkit-scrollbar': {
            width: '12px',
            height: '12px',
          },
          '*::-webkit-scrollbar-track': {
            backgroundColor: isDark ? '#212121' : '#ffffff',
          },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: isDark ? '#555555' : '#cccccc',
            borderRadius: '6px',
            border: `3px solid ${isDark ? '#212121' : '#ffffff'}`,
          },
          '*::-webkit-scrollbar-thumb:hover': {
            backgroundColor: isDark ? '#666666' : '#999999',
          },
          '*': {
            scrollbarWidth: 'thin',
            scrollbarColor: isDark ? '#555555 #212121' : '#cccccc #ffffff',
          },
        },
      },
      MuiDataGrid: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#303030' : '#ffffff',
            '& .MuiDataGrid-main': {
              backgroundColor: isDark ? '#303030' : '#ffffff',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: isDark ? '#303030' : '#ffffff',
            },
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: isDark ? '#303030' : '#ffffff',
            },
            '& .MuiDataGrid-row': {
              backgroundColor: isDark ? '#303030' : '#ffffff',
              '&:hover': {
                backgroundColor: isDark ? '#3a3a3a' : '#f5f5f5',
              },
            },
            '& .MuiDataGrid-cell': {
              backgroundColor: isDark ? '#303030' : '#ffffff',
            },
            '& .MuiDataGrid-virtualScroller': {
              backgroundColor: isDark ? '#303030' : '#ffffff',
            },
            '& .MuiDataGrid-footerContainer': {
              backgroundColor: isDark ? '#303030' : '#ffffff',
            },
          },
        },
      },
    },
  });
}
