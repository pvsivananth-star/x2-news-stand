import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import WebView from 'react-native-webview';
import { CategoryPill } from '@/src/components/CategoryPill';
import { NewsCard } from '@/src/components/NewsCard';
import { CATEGORY_OPTIONS, FEED_ARTICLES, refreshFeedArticles, type CategoryOption } from '@/src/data/feedData';
import type { Article, CategoryId } from '@/src/domain/types';
import { useArticleDetails } from '@/src/hooks/useArticleDetails';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { appSettings, hydrateSettings } from '@/src/state/appSettings';
import { translateText } from '@/src/services/translation';

const DEFAULT_CATEGORY: CategoryId = 'top-stories';

export default function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>(DEFAULT_CATEGORY);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [items, setItems] = useState<Article[]>(FEED_ARTICLES);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<number>(Date.now());
  const [selectedSourceUrl, setSelectedSourceUrl] = useState<string | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [settingsReady, setSettingsReady] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const categoryListRef = useRef<FlatList<CategoryOption> | null>(null);
  const { detailsByArticleId, loadArticleDetails } = useArticleDetails();
  const { themeMode } = useAppTheme();

  const enabledCategories = appSettings.enabledCategories ?? {};
  const translationLanguage = appSettings.translationLanguage ?? '';
  const [translatedArticleMap, setTranslatedArticleMap] = useState<Record<string, { title: string; summary: string }>>({});
  const [translatedDetailMap, setTranslatedDetailMap] = useState<Record<string, string>>({});
  const translationCacheRef = useRef<Map<string, string>>(new Map());
  const articleTranslationQueueRef = useRef<Set<string>>(new Set());
  const detailTranslationQueueRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    translationCacheRef.current.clear();
    articleTranslationQueueRef.current.clear();
    detailTranslationQueueRef.current.clear();
    setTranslatedArticleMap({});
    setTranslatedDetailMap({});
  }, [translationLanguage]);

  useFocusEffect(
    useCallback(() => {
      void hydrateSettings();
    }, []),
  );
  const palette = themeMode === 'dark'
    ? {
        background: '#020817',
        surface: '#0f172a',
        soft: '#111827',
        title: '#f8fafc',
        body: '#cbd5e1',
        muted: '#94a3b8',
        accent: '#f59e0b',
        card: '#0f172a',
        border: '#1f2937',
      }
    : {
        background: '#f8fafc',
        surface: '#ffffff',
        soft: '#e2e8f0',
        title: '#0f172a',
        body: '#334155',
        muted: '#64748b',
        accent: '#f59e0b',
        card: '#ffffff',
        border: '#dfe7f5',
      };

  const refreshFeed = useCallback(async () => {
    if (isRefreshing) {
      return;
    }

    setIsRefreshing(true);
    try {
      const refreshed = await refreshFeedArticles();
      setItems(refreshed.length > 0 ? refreshed : FEED_ARTICLES);
      setLastRefreshedAt(Date.now());
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  const translateTextSnapshot = useCallback(async (value: string): Promise<string> => {
    const cleanText = value?.trim() ?? '';
    if (!cleanText || !translationLanguage) {
      return value;
    }

    const cacheKey = `${translationLanguage}:${cleanText}`;
    const cached = translationCacheRef.current.get(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    try {
      const translated = await translateText(cleanText, translationLanguage);
      translationCacheRef.current.set(cacheKey, translated);
      return translated;
    } catch {
      return value;
    }
  }, [translationLanguage]);

  const translateArticle = useCallback(async (article: Article): Promise<Article> => {
    if (!translationLanguage) {
      return article;
    }

    const titleText = article.title?.trim() ?? '';
    const summaryText = article.summary?.trim() || article.content?.trim() || '';

    try {
      const [translatedTitle, translatedSummary] = await Promise.all([
        titleText ? translateTextSnapshot(titleText) : Promise.resolve(titleText),
        summaryText ? translateTextSnapshot(summaryText) : Promise.resolve(summaryText),
      ]);

      return {
        ...article,
        title: translatedTitle || article.title,
        summary: translatedSummary || article.summary,
        content: translatedSummary || article.content,
      };
    } catch {
      return article;
    }
  }, [translationLanguage, translateTextSnapshot]);

  useEffect(() => {
    if (!translationLanguage) {
      return;
    }

    for (const article of items) {
      if (articleTranslationQueueRef.current.has(article.id)) {
        continue;
      }

      articleTranslationQueueRef.current.add(article.id);
      void translateArticle(article).then((translated) => {
        articleTranslationQueueRef.current.delete(article.id);
        setTranslatedArticleMap((current) => ({
          ...current,
          [article.id]: {
            title: translated.title ?? article.title,
            summary: translated.summary ?? translated.content ?? article.summary ?? '',
          },
        }));
      }).catch(() => {
        articleTranslationQueueRef.current.delete(article.id);
      });
    }
  }, [items, translationLanguage, translateArticle]);

  useEffect(() => {
    if (!translationLanguage) {
      return;
    }

    for (const [articleId, detailState] of Object.entries(detailsByArticleId)) {
      if (detailState.status !== 'success' || !detailState.details.summary || detailTranslationQueueRef.current.has(articleId)) {
        continue;
      }

      detailTranslationQueueRef.current.add(articleId);
      void translateTextSnapshot(detailState.details.summary).then((translated) => {
        detailTranslationQueueRef.current.delete(articleId);
        setTranslatedDetailMap((current) => ({
          ...current,
          [articleId]: translated,
        }));
      }).catch(() => {
        detailTranslationQueueRef.current.delete(articleId);
      });
    }
  }, [detailsByArticleId, translationLanguage, translateTextSnapshot]);

  useEffect(() => {
    void hydrateSettings().then(() => {
      setSettingsReady(true);
    });
    void refreshFeed();
  }, []);

  useEffect(() => {
    const intervalMs = appSettings.refreshIntervalMinutes * 60 * 1000;
    const timer = setInterval(() => {
      void refreshFeed();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [appSettings.refreshIntervalMinutes]);

  const filteredItems = useMemo(
    () => items.filter((item) => {
      const resolvedCategory = item.category ?? 'top-stories';
      const categoryAllowed = enabledCategories[resolvedCategory] ?? true;

      if (!categoryAllowed) {
        return false;
      }

      return activeCategory === 'top-stories'
        ? true
        : item.category === activeCategory;
    }),
    [items, activeCategory, enabledCategories],
  );

  const toggleExpanded = useCallback((id: string) => {
    const expanding = !expandedIds[id];
    setExpandedIds((current) => ({
      ...current,
      [id]: !current[id],
    }));
    if (expanding) {
      const article = items.find((item) => item.id === id);
      void loadArticleDetails(id, article?.sourceLinks[0]?.url ?? article?.url);
    }
  }, [expandedIds, items, loadArticleDetails]);

  const toggleBookmark = useCallback((id: string) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, bookmarked: !item.bookmarked } : item,
      ),
    );
  }, []);

  const refreshStatus = new Date(lastRefreshedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleCategoryPress = useCallback((categoryId: CategoryId) => {
    setActiveCategory(categoryId);
    const index = CATEGORY_OPTIONS.findIndex((item) => item.id === categoryId);
    if (index >= 0) {
      requestAnimationFrame(() => {
        categoryListRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5,
        });
      });
    }
  }, []);

  const shouldAllowArticleNavigation = useCallback((requestUrl: string) => {
   if (!selectedSourceUrl) {
     return false;
   }

   try {
     const allowed = new URL(selectedSourceUrl);
     const next = new URL(requestUrl);

     if (!['http:', 'https:'].includes(next.protocol)) {
       return false;
     }

     return next.origin === allowed.origin;
   } catch {
     return requestUrl === selectedSourceUrl;
   }
  }, [selectedSourceUrl]);

  const renderArticle = useCallback(({ item }: { item: Article }) => {
    const translatedArticle = translatedArticleMap[item.id]
      ? {
          ...item,
          title: translatedArticleMap[item.id].title || item.title,
          summary: translatedArticleMap[item.id].summary || item.summary,
          content: translatedArticleMap[item.id].summary || item.content,
        }
      : item;

    const articleDetails = detailsByArticleId[item.id];
    const translatedDetails = articleDetails?.status === 'success' && translatedDetailMap[item.id]
      ? {
          ...articleDetails,
          details: {
            ...articleDetails.details,
            summary: translatedDetailMap[item.id],
          },
        }
      : articleDetails;

    return (
      <NewsCard
        article={translatedArticle}
        expanded={Boolean(expandedIds[item.id])}
        details={translatedDetails}
        onRetryDetails={() => void loadArticleDetails(item.id, item.sourceLinks[0]?.url ?? item.url)}
        onToggleExpand={() => toggleExpanded(item.id)}
        onToggleBookmark={() => toggleBookmark(item.id)}
        onOpenSource={(url) => {
          setSelectedSourceUrl(url);
          setSelectedArticleId(item.id);
        }}
        onTranslate={async () => {
          const translated = await translateArticle(item);
          setItems((current) => current.map((entry) => entry.id === item.id ? translated : entry));
        }}
        darkMode={themeMode === 'dark'}
      />
    );
  }, [detailsByArticleId, expandedIds, loadArticleDetails, themeMode, toggleExpanded, toggleBookmark, translateArticle, translatedArticleMap, translatedDetailMap]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: palette.background }]}>
      <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Link href="/settings" asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open settings"
              style={[styles.iconButton, { backgroundColor: palette.soft, borderColor: palette.soft }]}
            >
              <Text style={[styles.iconText, { color: palette.title }]}>☰</Text>
            </Pressable>
          </Link>

          <Text style={[styles.title, { color: palette.title }]} numberOfLines={1} ellipsizeMode="tail">X2 News</Text>
          {translationLanguage ? (
            <Text style={[styles.translatedBadge, { color: palette.muted }]}>{'Translated'}</Text>
          ) : null}
        </View>

        <View style={styles.headerActions}>
          <Text style={[styles.bannerText, { color: palette.muted }]}>{refreshStatus}</Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Refresh feeds"
            onPress={() => void refreshFeed()}
            disabled={isRefreshing}
            style={[
              styles.iconButton,
              styles.refreshButton,
              { backgroundColor: palette.soft, borderColor: palette.soft },
              isRefreshing && styles.refreshButtonDisabled,
            ]}
          >
            <Text style={[styles.iconText, { color: palette.title }]}>{isRefreshing ? '⏳' : '↻'}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.contentArea}>
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.feedList}
          showsVerticalScrollIndicator={false}
          snapToInterval={220}
          snapToAlignment="start"
          decelerationRate="fast"
          renderItem={renderArticle}
          ListEmptyComponent={
            <View style={[styles.emptyState, { backgroundColor: palette.surface, borderColor: palette.border }]}> 
              <Text style={[styles.emptyTitle, { color: palette.title }]}>No stories in this view</Text>
              <Text style={[styles.emptyBody, { color: palette.body }]}>Try another category or turn a feed back on in Settings.</Text>
            </View>
          }
        />
      </View>

      <View style={styles.categoryBar}>
        <FlatList
          ref={categoryListRef}
          data={CATEGORY_OPTIONS}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
          keyExtractor={(item) => item.id}
          onScrollToIndexFailed={({ index }) => {
            categoryListRef.current?.scrollToOffset({
              offset: index * 90,
              animated: false,
            });
          }}
          renderItem={({ item }) => (
            <CategoryPill
              label={item.label}
              active={activeCategory === item.id}
              onPress={() => handleCategoryPress(item.id)}
            />
          )}
        />
      </View>

      <Modal visible={selectedSourceUrl !== null} animationType="slide" transparent={false} onRequestClose={() => setSelectedSourceUrl(null)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
          {selectedSourceUrl ? (
            <WebView
              source={{ uri: selectedSourceUrl }}
              startInLoadingState
              style={styles.webView}
              onShouldStartLoadWithRequest={(request) => shouldAllowArticleNavigation(request.url)}
            />
          ) : null}

          <View style={styles.modalFooter}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close story"
              onPress={() => {
                setSelectedSourceUrl(null);
                setSelectedArticleId(null);
              }}
              style={[styles.modalCloseButton, { backgroundColor: palette.soft, borderColor: palette.border }]}
            >
              <Text style={[styles.modalCloseText, { color: palette.title }]}>✕</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 8,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
    flex: 1,
    marginRight: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
    flexShrink: 0,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    flexShrink: 1,
    lineHeight: 24,
    includeFontPadding: false,
    textAlign: 'left',
    minWidth: 0,
  },
  translatedBadge: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#0f172a',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  refreshButton: {
    minWidth: 44,
  },
  refreshButtonDisabled: {
    opacity: 0.6,
  },
  iconText: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 20,
  },
  bannerRow: {
    paddingHorizontal: 18,
    marginBottom: 6,
  },
  bannerText: {
    fontSize: 10,
    fontWeight: '600',
    flexShrink: 1,
  },
  contentArea: {
    flex: 1,
  },
  categoryBar: {
    height: 58,
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.18)',
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  categoryList: {
    paddingRight: 20,
    paddingVertical: 4,
    alignItems: 'center',
  },
  feedList: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 18,
  },
  emptyState: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    marginTop: 28,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 22,
    alignItems: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.12)',
  },
  modalCloseButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  modalCloseText: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 18,
  },
  webView: {
    flex: 1,
  },
});
