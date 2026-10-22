import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
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

const DEFAULT_CATEGORY_STATE: Record<CategoryId, boolean> = {
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

export default function SettingsScreen() {
  const [enabledCategories, setEnabledCategories] = useState<Record<CategoryId, boolean>>(
    DEFAULT_CATEGORY_STATE,
  );

  const categoriesCount = useMemo(
    () => Object.values(enabledCategories).filter(Boolean).length,
    [enabledCategories],
  );

  const toggleCategory = (categoryId: CategoryId) => {
    setEnabledCategories((current) => ({
      ...current,
      [categoryId]: !current[categoryId],
    }));
  };

  const enableAll = () => {
    setEnabledCategories(DEFAULT_CATEGORY_STATE);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <Text style={styles.title}>Settings</Text>
          <Link href="/" asChild>
            <Pressable accessibilityRole="button" accessibilityLabel="Close settings" style={styles.closeButton}>
              <Text style={styles.closeText}>Done</Text>
            </Pressable>
          </Link>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <Text style={styles.sectionHint}>{categoriesCount} active</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Turn on all categories" onPress={enableAll} style={styles.primaryButton}>
            <Text style={styles.primaryText}>Turn all on</Text>
          </Pressable>

          <View style={styles.toggleGrid}>
            {CATEGORY_OPTIONS.map((category) => (
              <Pressable
                key={category.id}
                accessibilityRole="switch"
                accessibilityLabel={`${category.label} category ${enabledCategories[category.id] ? 'enabled' : 'disabled'}`}
                onPress={() => toggleCategory(category.id)}
                style={[styles.toggleRow, !enabledCategories[category.id] && styles.toggleRowInactive]}
              >
                <Text style={styles.toggleLabel}>{category.label}</Text>
                <Text style={styles.switchValue}>{enabledCategories[category.id] ? 'On' : 'Off'}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <TextInput
            accessibilityLabel="City"
            value="Chennai"
            placeholder="City"
            placeholderTextColor="#64748b"
            style={styles.input}
          />
          <TextInput
            accessibilityLabel="District"
            value="Velachery"
            placeholder="District"
            placeholderTextColor="#64748b"
            style={styles.input}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Refresh interval</Text>
          <Text style={styles.valueText}>30 minutes</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Theme</Text>
          <Text style={styles.valueText}>System</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.valueText}>Version 0.1.0</Text>
          <Text style={styles.valueText}>MIT license</Text>
          <Text style={styles.valueText}>Privacy policy</Text>
          <Text style={styles.valueText}>Publisher pages may contain ads.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#020817',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 48,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  title: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '800',
  },
  closeButton: {
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  closeText: {
    color: '#f8fafc',
    fontWeight: '700',
  },
  section: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1f2937',
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionHint: {
    color: '#94a3b8',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#f59e0b',
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
    backgroundColor: '#111827',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  toggleRowInactive: {
    opacity: 0.5,
  },
  toggleLabel: {
    color: '#e2e8f0',
    fontWeight: '600',
  },
  switchValue: {
    color: '#fbbf24',
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#111827',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 10,
  },
  valueText: {
    color: '#cbd5e1',
    lineHeight: 22,
    marginTop: 6,
  },
});
