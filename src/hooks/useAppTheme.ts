import { useSyncExternalStore } from 'react';
import { useColorScheme } from 'react-native';
import {
  appSettings,
  getEffectiveTheme,
  subscribeToThemeChanges,
} from '@/src/state/appSettings';

const getThemeSnapshot = (): typeof appSettings.theme => appSettings.theme;

export function useAppTheme(): { theme: typeof appSettings.theme; themeMode: 'light' | 'dark' } {
  const theme = useSyncExternalStore(
    subscribeToThemeChanges,
    getThemeSnapshot,
    getThemeSnapshot,
  );
  const systemTheme = useColorScheme();

  return {
    theme,
    themeMode: getEffectiveTheme(theme, systemTheme),
  };
}
