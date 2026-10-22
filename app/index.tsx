import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CategoryPill } from '@/src/components/CategoryPill';
import { NewsCard } from '@/src/components/NewsCard';
import { CATEGORY_OPTIONS, FEED_ARTICLES } from '@/src/data/feedData';
import type { Article, CategoryId } from '@/src/domain/types';

const DEFAULT_CATEGORY: CategoryId = 'top-stories';

export default function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>(DEFAULT_CATEGORY);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [items, setItems] = useState<Article[]>(FEED_ARTICLES);

  const filteredItems = useMemo(
    () => items.filter((item) => item.category === activeCategory || activeCategory === 'top-stories'),
    [items, activeCategory],
  );

  const toggleExpanded = (id: string) => {
    setExpandedIds((current) => ({
      ...current,
      [id]: !current[id],
    }));
  };

  const toggleBookmark = (id: string) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, bookmarked: !item.bookmarked } : item,
      ),
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>x2-news-stand</Text>
          <Text style={styles.title}>Today</Text>
        </View>

        <Link href="/settings" asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open settings"
            style={styles.settingsButton}
          >
            <Text style={styles.settingsText}>⚙</Text>
          </Pressable>
        </Link>
      </View>

      <View style={styles.categoryRow}>
        <FlatList
          data={CATEGORY_OPTIONS}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CategoryPill
              label={item.label}
              active={activeCategory === item.id}
              onPress={() => setActiveCategory(item.id)}
            />
          )}
        />
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.feedList}
        showsVerticalScrollIndicator={false}
        snapToInterval={220}
        snapToAlignment="start"
        decelerationRate="fast"
        renderItem={({ item }) => (
          <NewsCard
            article={item}
            expanded={Boolean(expandedIds[item.id])}
            onToggleExpand={() => toggleExpanded(item.id)}
            onToggleBookmark={() => toggleBookmark(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No stories in this view</Text>
            <Text style={styles.emptyBody}>Try another category or turn a feed back on in Settings.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#020817',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 8,
  },
  eyebrow: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  title: {
    color: '#f8fafc',
    fontSize: 34,
    fontWeight: '800',
  },
  settingsButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  settingsText: {
    fontSize: 22,
    color: '#e2e8f0',
  },
  categoryRow: {
    paddingLeft: 18,
    marginBottom: 12,
  },
  categoryList: {
    paddingRight: 20,
    paddingBottom: 4,
  },
  feedList: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 42,
  },
  emptyState: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1f2937',
    padding: 18,
    marginTop: 28,
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyBody: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
  },
});
