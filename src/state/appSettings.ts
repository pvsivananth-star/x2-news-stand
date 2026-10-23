import { Appearance } from 'react-native';
import * as FileSystem from 'expo-file-system';
import type { CategoryId } from '@/src/domain/types';
import { shouldApplyHydratedTheme } from '@/src/state/themeHydration';

export type AppTheme = 'system' | 'light' | 'dark';

export interface TranslationLanguageOption {
  code: string;
  label: string;
}

export const TRANSLATION_LANGUAGE_OPTIONS: TranslationLanguageOption[] = [
  { code: '', label: 'None' },
  { code: 'ta', label: 'Tamil' },
  { code: 'hi', label: 'Hindi' },
  { code: 'bn', label: 'Bengali' },
  { code: 'gu', label: 'Gujarati' },
  { code: 'mr', label: 'Marathi' },
  { code: 'pa', label: 'Punjabi' },
  { code: 'kn', label: 'Kannada' },
  { code: 'ml', label: 'Malayalam' },
  { code: 'or', label: 'Odia' },
  { code: 'as', label: 'Assamese' },
  { code: 'te', label: 'Telugu' },
  { code: 'ur', label: 'Urdu' },
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'Arabic' },
  { code: 'zh-CN', label: 'Chinese (Simplified)' },
  { code: 'zh-TW', label: 'Chinese (Traditional)' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'ru', label: 'Russian' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'it', label: 'Italian' },
  { code: 'tr', label: 'Turkish' },
  { code: 'nl', label: 'Dutch' },
  { code: 'id', label: 'Indonesian' },
  { code: 'vi', label: 'Vietnamese' },
  { code: 'th', label: 'Thai' },
  { code: 'fa', label: 'Persian' },
  { code: 'uk', label: 'Ukrainian' },
  { code: 'he', label: 'Hebrew' },
  { code: 'fil', label: 'Filipino' },
  { code: 'sw', label: 'Swahili' },
  { code: 'af', label: 'Afrikaans' },
  { code: 'pl', label: 'Polish' },
  { code: 'cs', label: 'Czech' },
  { code: 'el', label: 'Greek' },
  { code: 'hu', label: 'Hungarian' },
  { code: 'ro', label: 'Romanian' },
];

export interface AppSettingsState {
  refreshIntervalMinutes: number;
  theme: AppTheme;
  enabledCategories: Record<CategoryId, boolean>;
  translationLanguage: string;
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
  translationLanguage: '',
};

const SETTINGS_FILE = `${FileSystem.documentDirectory ?? ''}x2-news-stand-settings.json`;

export const appSettings: AppSettingsState = {
  ...DEFAULT_SETTINGS,
  enabledCategories: { ...DEFAULT_CATEGORY_STATE },
  translationLanguage: DEFAULT_SETTINGS.translationLanguage,
};

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
      translationLanguage: typeof parsed.translationLanguage === 'string' ? parsed.translationLanguage : DEFAULT_SETTINGS.translationLanguage,
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
  appSettings.translationLanguage = persisted.translationLanguage;
  notifyThemeChange();
}

export async function persistSettings(): Promise<void> {
  const serialized = JSON.stringify({
    refreshIntervalMinutes: appSettings.refreshIntervalMinutes,
    theme: appSettings.theme,
    enabledCategories: appSettings.enabledCategories,
    translationLanguage: appSettings.translationLanguage,
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

export function setTranslationLanguage(languageCode: string): void {
  appSettings.translationLanguage = languageCode;
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
