import { Link } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
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
  setTranslationLanguage,
  TRANSLATION_LANGUAGE_OPTIONS,
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
  const [selectedLanguage, setSelectedLanguage] = useState<string>(appSettings.translationLanguage ?? '');
  const [languageOptionsVisible, setLanguageOptionsVisible] = useState(false);
  const [disclaimerVisible, setDisclaimerVisible] = useState(false);
  const { theme, themeMode } = useAppTheme();
  const [themeSaveError, setThemeSaveError] = useState<string | null>(null);

  useEffect(() => {
    void hydrateSettings().then(() => {
      setEnabledCategories(loadEnabledCategories());
      setLocalRefreshInterval(appSettings.refreshIntervalMinutes);
      setSelectedLanguage(appSettings.translationLanguage ?? '');
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

  const applyLanguage = (code: string) => {
    setSelectedLanguage(code);
    setTranslationLanguage(code);
  };

  const selectedLanguageLabel = TRANSLATION_LANGUAGE_OPTIONS.find((language) => language.code === selectedLanguage)?.label ?? 'None';

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: palette.background }]}> 
      <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />

      <View style={[styles.topBar, { backgroundColor: palette.background, borderBottomColor: palette.soft }]}> 
        <Text style={[styles.title, { color: palette.title }]}>Settings</Text>
      </View>

      <ScrollView style={styles.middleSection} contentContainerStyle={styles.content} showsVerticalScrollIndicator={true}>
        <View style={[styles.section, { backgroundColor: palette.surface, borderColor: palette.soft }]}>
          <Text style={[styles.sectionTitle, { color: palette.title }]}>Language</Text>
          <Text style={[styles.sectionHint, { color: palette.muted }]}>Select a translation language for article text.</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open language selector"
            onPress={() => {
              setLanguageOptionsVisible(true);
              setDisclaimerVisible(false);
            }}
            style={[styles.dropdownButton, { backgroundColor: palette.soft, borderColor: palette.soft }]}
          >
            <Text style={[styles.dropdownText, { color: palette.title }]}>{selectedLanguageLabel}</Text>
            <Text style={[styles.dropdownCaret, { color: palette.title }]}>▾</Text>
          </Pressable>

          <Modal
            transparent
            visible={languageOptionsVisible}
            animationType="fade"
            onRequestClose={() => setLanguageOptionsVisible(false)}
          >
            <Pressable style={styles.modalBackdrop} onPress={() => setLanguageOptionsVisible(false)}>
              <Pressable style={[styles.optionSheet, { backgroundColor: palette.surface, borderColor: palette.soft }]}>
                <View style={[styles.optionSheetHeader, { borderBottomColor: palette.soft }]}> 
                  <Text style={[styles.optionSheetTitle, { color: palette.title }]}>Select language</Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Close language selector"
                    onPress={() => setLanguageOptionsVisible(false)}
                    style={[styles.closeChip, { backgroundColor: palette.soft }]}
                  >
                    <Text style={[styles.closeChipText, { color: palette.title }]}>Close</Text>
                  </Pressable>
                </View>

                <ScrollView style={styles.optionSheetList} contentContainerStyle={styles.optionSheetContent}>
                  {TRANSLATION_LANGUAGE_OPTIONS.map((language) => (
                    <Pressable
                      key={language.code || 'none'}
                      accessibilityRole="button"
                      accessibilityLabel={`Select translation language ${language.label}`}
                      onPress={() => {
                        applyLanguage(language.code);
                        setLanguageOptionsVisible(false);
                      }}
                      style={[
                        styles.dropdownItem,
                        { backgroundColor: selectedLanguage === language.code ? palette.accent : 'transparent' },
                      ]}
                    >
                      <Text style={[styles.dropdownItemText, { color: selectedLanguage === language.code ? palette.onAccent : palette.title }]}>
                        {language.label}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </Pressable>
            </Pressable>
          </Modal>
        </View>

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
          <Text style={[styles.valueText, { color: palette.body }]}>X2 News acts strictly as an automated feed aggregator. All headlines, snippets, and media displayed within the app remain the exclusive intellectual property of their original publishers. This application claims no ownership or authorship of third-party content and serves solely as a reader tool to index publicly available RSS feeds.</Text>
          <Text style={[styles.valueText, { color: palette.body }]}>Translation features (powered by native OS engines or AI models) are provided for user convenience only. Machine-generated translations may contain semantic errors or inaccuracies; therefore, X2 News disclaims all liability regarding translated content. Users are advised to cross-reference translated articles with their original sources. Read our full Legal Disclaimer & Terms for detailed terms.</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open legal disclaimer"
            onPress={() => setDisclaimerVisible(true)}
            style={styles.linkButton}
          >
            <Text style={[styles.linkText, { color: palette.accent }]}>Legal Disclaimer & Terms for detailed terms.</Text>
          </Pressable>
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

      <Modal visible={disclaimerVisible} transparent animationType="fade" onRequestClose={() => setDisclaimerVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.disclaimerModal, { backgroundColor: palette.surface, borderColor: palette.soft }]}> 
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: palette.title }]}>Legal Disclaimer & Terms</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close disclaimer"
                onPress={() => setDisclaimerVisible(false)}
                style={[styles.closeButton, { backgroundColor: palette.soft, borderColor: palette.soft }]}
              >
                <Text style={[styles.closeButtonText, { color: palette.title }]}>✕</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.disclaimerScroll} contentContainerStyle={styles.disclaimerContent} showsVerticalScrollIndicator>
              <Text style={[styles.disclaimerText, { color: palette.body }]}>{`X2 News acts strictly as an automated feed aggregator. All headlines, snippets, and media displayed within the app remain the exclusive intellectual property of their original publishers. This application claims no ownership or authorship of third-party content and serves solely as a reader tool to index publicly available RSS feeds.

Translation features (powered by native OS engines or AI models) are provided for user convenience only. Machine-generated translations may contain semantic errors or inaccuracies; therefore, X2 News disclaims all liability regarding translated content. Users are advised to cross-reference translated articles with their original sources.

Legal Disclaimer & Terms

1. Content Aggregation & Copyright Policy

Feed Aggregator Status: X2 News ("the App") operates exclusively as a technical aggregator of publicly accessible Really Simple Syndication (RSS) feeds.

Intellectual Property Rights: All article titles, excerpts, text, images, and associated media displayed within the App are the exclusive intellectual property of their respective third-party publishers, authors, and copyright holders.

No Rights Claimed: The App claims no ownership, copyright, or exclusive licensing rights over third-party content. Aggregation does not imply endorsement, affiliation, or legal sponsorship by or with the original content publishers. All rights remain fully reserved by the original content creators.

2. Automated & AI Translation Services

As-Is Service: Translation tools integrated within the App (utilizing native operating system translation layers, third-party APIs, or Artificial Intelligence algorithms) are provided strictly on an "as-is" and "as-available" basis for reference purposes only.

Disclaimer of Accuracy & Liability: Automated machine translations are inherently susceptible to context loss, literal translation errors, and semantic misinterpretations. X2 News expressly disclaims all warranties, express or implied, regarding the accuracy, completeness, tone, or reliability of translated material.

User Risk & Verification: The End User assumes all risk associated with reliance on translated content. X2 News shall not be held liable for any claims, losses, or legal disputes arising from inaccuracies, errors, or omissions produced by automated translation processes. Users are strongly encouraged to verify critical facts against the original source feed.`}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  dropdownButton: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontWeight: '700',
    flex: 1,
  },
  dropdownCaret: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  dropdownList: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 260,
    overflow: 'hidden',
  },
  dropdownItem: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownItemText: {
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 10,
  },
  linkText: {
    textDecorationLine: 'underline',
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    padding: 20,
  },
  optionSheet: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '75%',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  optionSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  optionSheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
  },
  closeChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  closeChipText: {
    fontWeight: '700',
  },
  optionSheetList: {
    maxHeight: 420,
  },
  optionSheetContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 16,
  },
  disclaimerModal: {
    width: '100%',
    maxWidth: 540,
    maxHeight: '80%',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '800',
  },
  disclaimerScroll: {
    maxHeight: 420,
  },
  disclaimerContent: {
    padding: 16,
  },
  disclaimerText: {
    fontSize: 14,
    lineHeight: 22,
  },
  valueText: {
    lineHeight: 22,
    marginTop: 6,
  },
});
