import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

type ThemeMode = 'light' | 'dark';

export function useTheme(): {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => Promise<void>;
  isLoading: boolean;
} {
  const user = useQuery(api.users.current);
  const updateTheme = useMutation(api.users.updateTheme);

  // Default to 'dark' if user is not loaded or theme is not set
  const theme: ThemeMode = user?.theme ?? 'dark';

  const setTheme = async (newTheme: ThemeMode) => {
    await updateTheme({ theme: newTheme });
  };

  return {
    theme,
    setTheme,
    isLoading: user === undefined,
  };
}
