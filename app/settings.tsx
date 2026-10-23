import { Link } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CATEGORY_OPTIONS } from '@/src/data/feedData';
import type { CategoryId } from '@/src/domain/types';
import {
  appSettings,
  DEFAULT_CATEGORY_STATE,
  hydrateSettings,
  loadEnabledCategories,
  setEnabledCategories as persistEnabledCategories,
  setRefreshInterval,
  setTheme,
  type AppTheme,
} from '@/src/state/appSettings';
import { useAppTheme } from '@/src/hooks/useAppTheme';

const refreshOptions = [5, 10, 15, 30, 60];
const themeOptions: AppTheme[] = ['system', 'light', 'dark'];

export default function SettingsScreen() {
  const [enabledCategories, setEnabledCategories] = useState<Record<CategoryId, boolean>>(
    loadEnabledCategories(),
  );
  const [refreshInterval, setLocalRefreshInterval] = useState<number>(appSettings.refreshIntervalMinutes);
  const { theme, themeMode } = useAppTheme();
  const [themeSaveError, setThemeSaveError] = useState<string | null>(null);

  useEffect(() => {
    void hydrateSettings().then(() => {
      setEnabledCategories(loadEnabledCategories());
      setLocalRefreshInterval(appSettings.refreshIntervalMinutes);
    });
  }, []);

  const palette = themeMode === 'dark'
    ? {
        background: '#020817',
        surface: '#0f172a',
        soft: '#111827',
        title: '#f8fafc',
        body: '#cbd5e1',
        muted: '#94a3b8',
        accent: '#f59e0b',
        onAccent: '#111827',
      }
    : {
        background: '#f8fafc',
        surface: '#ffffff',
        soft: '#e2e8f0',
        title: '#0f172a',
        body: '#334155',
        muted: '#64748b',
        accent: '#f59e0b',
        onAccent: '#111827',
      };

  const categoriesCount = useMemo(
    () => Object.values(enabledCategories).filter(Boolean).length,
    [enabledCategories],
  );

  const toggleCategory = (categoryId: CategoryId) => {
    setEnabledCategories((current) => {
      const next = {
        ...current,
        [categoryId]: !current[categoryId],
      };
      persistEnabledCategories(next);
      return next;
    });
  };

  const enableAll = () => {
    const next = { ...DEFAULT_CATEGORY_STATE };
    setEnabledCategories(next);
    persistEnabledCategories(next);
  };

  const applyRefresh = (minutes: number) => {
    setLocalRefreshInterval(minutes);
    setRefreshInterval(minutes);
  };

  const applyTheme = async (nextTheme: AppTheme) => {
    setThemeSaveError(null);
    try {
      await setTheme(nextTheme);
    } catch (error) {
      setThemeSaveError(
        error instanceof Error ? `Theme could not be saved: ${error.message}` : 'Theme could not be saved.',
      );
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: palette.background }]}> 
      <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />

      <View style={[styles.topBar, { backgroundColor: palette.background, borderBottomColor: palette.soft }]}> 
        <Text style={[styles.title, { color: palette.title }]}>Settings</Text>
      </View>

      <ScrollView style={styles.middleSection} contentContainerStyle={styles.content} showsVerticalScrollIndicator={true}>
        <View style={[styles.section, { backgroundColor: palette.surface, borderColor: palette.soft }]}>
          <Text style={[styles.sectionTitle, { color: palette.title }]}>Categories</Text>
          <Text style={[styles.sectionHint, { color: palette.muted }]}>{categoriesCount} active</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Turn on all categories" onPress={enableAll} style={[styles.primaryButton, { backgroundColor: palette.accent }]}>
            <Text style={styles.primaryText}>Turn all on</Text>
          </Pressable>

          <View style={styles.toggleGrid}>
            {CATEGORY_OPTIONS.map((category) => (
              <Pressable
                key={category.id}
                accessibilityRole="switch"
                accessibilityLabel={`${category.label} category ${enabledCategories[category.id] ? 'enabled' : 'disabled'}`}
                onPress={() => toggleCategory(category.id)}
                style={[styles.toggleRow, { backgroundColor: palette.soft, borderColor: palette.soft }, !enabledCategories[category.id] && styles.toggleRowInactive]}
              >
                <Text style={[styles.toggleLabel, { color: palette.title }]}>{category.label}</Text>
                <Text style={[styles.switchValue, { color: palette.accent }]}>{enabledCategories[category.id] ? 'On' : 'Off'}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: palette.surface, borderColor: palette.soft }]}>
          <Text style={[styles.sectionTitle, { color: palette.title }]}>Location</Text>
          <TextInput
            accessibilityLabel="City"
            value="Chennai"
            placeholder="City"
            placeholderTextColor={palette.muted}
            style={[styles.input, { backgroundColor: palette.soft, borderColor: palette.soft, color: palette.title }]}
          />
          <TextInput
            accessibilityLabel="District"
            value="Velachery"
            placeholder="District"
            placeholderTextColor={palette.muted}
            style={[styles.input, { backgroundColor: palette.soft, borderColor: palette.soft, color: palette.title }]}
          />
        </View>

        <View style={[styles.section, { backgroundColor: palette.surface, borderColor: palette.soft }]}>
          <Text style={[styles.sectionTitle, { color: palette.title }]}>Refresh interval</Text>
          <View style={styles.optionRow}>
            {refreshOptions.map((minutes) => (
              <Pressable
                key={minutes}
                accessibilityRole="button"
                accessibilityLabel={`Refresh every ${minutes} minutes`}
                onPress={() => applyRefresh(minutes)}
                style={[styles.optionButton, { backgroundColor: refreshInterval === minutes ? palette.accent : palette.soft }]}
              >
                <Text style={[styles.optionText, { color: refreshInterval === minutes ? palette.onAccent : palette.title }]}>{minutes}m</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: palette.surface, borderColor: palette.soft }]}>
          <Text style={[styles.sectionTitle, { color: palette.title }]}>Theme</Text>
          <View style={styles.optionRow}>
            {themeOptions.map((option) => (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityLabel={`Set theme to ${option}`}
                onPress={() => applyTheme(option)}
                style={[styles.optionButton, { backgroundColor: theme === option ? palette.accent : palette.soft }]}
              >
                <Text style={[styles.optionText, { color: theme === option ? palette.onAccent : palette.title }]}>{option}</Text>
              </Pressable>
            ))}
          </View>
          {themeSaveError ? (
            <Text accessibilityRole="alert" style={[styles.valueText, { color: palette.body }]}>
              {themeSaveError}
            </Text>
          ) : null}
        </View>

        <View style={[styles.section, { backgroundColor: palette.surface, borderColor: palette.soft }]}>
          <Text style={[styles.sectionTitle, { color: palette.title }]}>About</Text>
          <Text style={[styles.valueText, { color: palette.body }]}>Version 0.1.0</Text>
          <Text style={[styles.valueText, { color: palette.body }]}>MIT license</Text>
          <Text style={[styles.valueText, { color: palette.body }]}>Privacy policy</Text>
          <Text style={[styles.valueText, { color: palette.body }]}>Publisher pages may contain ads.</Text>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: palette.background, borderTopColor: palette.soft }]}> 
        <Link href="/" asChild>
          <Pressable accessibilityRole="button" accessibilityLabel="Cancel settings" style={[styles.actionButton, { backgroundColor: palette.soft }]}> 
            <Text style={[styles.actionText, { color: palette.title }]}>Cancel</Text>
          </Pressable>
        </Link>

        <Link href="/" asChild>
          <Pressable accessibilityRole="button" accessibilityLabel="Apply settings" style={[styles.actionButton, styles.primaryActionButton, { backgroundColor: palette.soft }]}>
            <Text style={[styles.primaryActionText, { color: palette.title }]}>Apply</Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  middleSection: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionButton: {
    minWidth: 120,
  },
  actionText: {
    fontWeight: '700',
  },
  primaryActionText: {
    fontWeight: '800',
  },
  section: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionHint: {
    marginBottom: 12,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryText: {
    color: '#111827',
    fontWeight: '800',
  },
  toggleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  toggleRow: {
    width: '48%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  toggleRowInactive: {
    opacity: 0.5,
  },
  toggleLabel: {
    fontWeight: '600',
  },
  switchValue: {
    fontWeight: '700',
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 10,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  optionButton: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 58,
    alignItems: 'center',
  },
  optionText: {
    fontWeight: '700',
  },
  valueText: {
    lineHeight: 22,
    marginTop: 6,
  },
});
