import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from '../App';
import { createAppTheme } from '../theme';
import { useTheme } from '../hooks/useTheme';

/**
 * Wrapper component that provides theme based on user preference.
 * Must be inside ConvexProvider to access user data.
 */
export function ThemedApp() {
  const { theme: themeMode } = useTheme();
  const theme = React.useMemo(() => createAppTheme(themeMode), [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
}
