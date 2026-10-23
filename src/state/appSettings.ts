import { Appearance } from 'react-native';
import * as FileSystem from 'expo-file-system';
import type { CategoryId } from '@/src/domain/types';
import { shouldApplyHydratedTheme } from '@/src/state/themeHydration';

export type AppTheme = 'system' | 'light' | 'dark';

export interface AppSettingsState {
  refreshIntervalMinutes: number;
  theme: AppTheme;
  enabledCategories: Record<CategoryId, boolean>;
}

export const DEFAULT_CATEGORY_STATE: Record<CategoryId, boolean> = {
  'top-stories': true,
  local: true,
  district: true,
  national: true,
  world: true,
  markets: true,
  business: true,
  technology: true,
  science: true,
  'health-medical': true,
  politics: true,
  sports: true,
  entertainment: true,
  lifestyle: true,
  'viral-trending': true,
};

export const DEFAULT_SETTINGS: AppSettingsState = {
  refreshIntervalMinutes: 10,
  theme: 'system',
  enabledCategories: { ...DEFAULT_CATEGORY_STATE },
};

const SETTINGS_FILE = `${FileSystem.documentDirectory ?? ''}x2-news-stand-settings.json`;

export const appSettings: AppSettingsState = { ...DEFAULT_SETTINGS, enabledCategories: { ...DEFAULT_CATEGORY_STATE } };

const themeListeners = new Set<() => void>();
let themeRevision = 0;
let persistenceQueue: Promise<void> = Promise.resolve();

export function subscribeToThemeChanges(listener: () => void): () => void {
  themeListeners.add(listener);
  return () => {
    themeListeners.delete(listener);
  };
}

function notifyThemeChange(): void {
  for (const listener of [...themeListeners]) {
    listener();
  }
}

async function readPersistedSettings(): Promise<AppSettingsState> {
  try {
    const raw = await FileSystem.readAsStringAsync(SETTINGS_FILE);
    if (!raw) {
      return { ...DEFAULT_SETTINGS, enabledCategories: { ...DEFAULT_CATEGORY_STATE } };
    }

    const parsed = JSON.parse(raw) as Partial<AppSettingsState>;
    return {
      refreshIntervalMinutes: Math.min(60, Math.max(1, Number(parsed.refreshIntervalMinutes) || DEFAULT_SETTINGS.refreshIntervalMinutes)),
      theme: parsed.theme === 'light' || parsed.theme === 'dark' || parsed.theme === 'system' ? parsed.theme : DEFAULT_SETTINGS.theme,
      enabledCategories: {
        ...DEFAULT_CATEGORY_STATE,
        ...(parsed.enabledCategories ?? {}),
      },
    };
  } catch {
    return { ...DEFAULT_SETTINGS, enabledCategories: { ...DEFAULT_CATEGORY_STATE } };
  }
}

export async function hydrateSettings(): Promise<void> {
  const hydrationStartedAtRevision = themeRevision;
  const persisted = await readPersistedSettings();
  appSettings.refreshIntervalMinutes = persisted.refreshIntervalMinutes;
  if (shouldApplyHydratedTheme(hydrationStartedAtRevision, themeRevision)) {
    appSettings.theme = persisted.theme;
  }
  appSettings.enabledCategories = { ...DEFAULT_CATEGORY_STATE, ...persisted.enabledCategories };
  notifyThemeChange();
}

export async function persistSettings(): Promise<void> {
  const serialized = JSON.stringify({
    refreshIntervalMinutes: appSettings.refreshIntervalMinutes,
    theme: appSettings.theme,
    enabledCategories: appSettings.enabledCategories,
  });
  const write = persistenceQueue.then(
    () => FileSystem.writeAsStringAsync(SETTINGS_FILE, serialized),
    () => FileSystem.writeAsStringAsync(SETTINGS_FILE, serialized),
  );
  persistenceQueue = write.then(
    () => undefined,
    () => undefined,
  );
  await write;
}

export function setRefreshInterval(minutes: number): void {
  appSettings.refreshIntervalMinutes = Math.min(60, Math.max(1, Number(minutes) || DEFAULT_SETTINGS.refreshIntervalMinutes));
  void persistSettings();
}

export async function setTheme(theme: AppTheme): Promise<void> {
  themeRevision += 1;
  appSettings.theme = theme;
  notifyThemeChange();
  await persistSettings();
}

export function setEnabledCategories(enabledCategories: Record<CategoryId, boolean>): void {
  appSettings.enabledCategories = { ...DEFAULT_CATEGORY_STATE, ...enabledCategories };
  void persistSettings();
}

export function loadEnabledCategories(): Record<CategoryId, boolean> {
  return { ...DEFAULT_CATEGORY_STATE, ...(appSettings.enabledCategories ?? DEFAULT_CATEGORY_STATE) };
}

export function getEffectiveTheme(
  theme: AppTheme = appSettings.theme,
  systemTheme: ReturnType<typeof Appearance.getColorScheme> = Appearance.getColorScheme(),
): 'light' | 'dark' {
  const resolvedSystemTheme = systemTheme ?? 'light';
  return theme === 'system' ? resolvedSystemTheme : theme;
}

export function resolveTheme(): 'light' | 'dark' {
  return getEffectiveTheme();
}
