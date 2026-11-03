import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
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
import { appSettings, DEFAULT_CATEGORY_STATE, hydrateSettings } from '@/src/state/appSettings';
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
  const feedListRef = useRef<FlatList<Article> | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { detailsByArticleId, loadArticleDetails } = useArticleDetails();
  const { themeMode } = useAppTheme();
  const router = useRouter();

  const enabledCategories = appSettings.enabledCategories ?? DEFAULT_CATEGORY_STATE;
  const visibleCategories = useMemo(
    () => CATEGORY_OPTIONS.filter((option) => enabledCategories[option.id] !== false),
    [enabledCategories],
  );
  const translationLanguage = appSettings.translationLanguage ?? '';
  const [translatedArticleMap, setTranslatedArticleMap] = useState<Record<string, { title: string; summary: string }>>({});
  const [translatedDetailMap, setTranslatedDetailMap] = useState<Record<string, string>>({});
  const translationCacheRef = useRef<Map<string, string>>(new Map());
  const articleTranslationQueueRef = useRef<Set<string>>(new Set());
  const detailTranslationQueueRef = useRef<Set<string>>(new Set());
  const translationExecutionRef = useRef<Set<string>>(new Set());

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

  const refreshFeed = useCallback(async (options?: { force?: boolean; silent?: boolean }) => {
    if (isRefreshing) {
      return;
    }

    if (options?.force || !options?.silent) {
      setIsRefreshing(true);
    }

    try {
      const refreshed = await refreshFeedArticles();
      setItems(refreshed.length > 0 ? refreshed : FEED_ARTICLES);
      setLastRefreshedAt(Date.now());
    } finally {
      if (options?.force || !options?.silent) {
        setIsRefreshing(false);
      }
    }
  }, [isRefreshing]);

  const restartRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }

    refreshTimerRef.current = setInterval(() => {
      void refreshFeed({ silent: true });
    }, Math.max(1, appSettings.refreshIntervalMinutes) * 60 * 1000);
  }, [appSettings.refreshIntervalMinutes, refreshFeed]);

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
      if (translated !== cleanText) {
        translationCacheRef.current.set(cacheKey, translated);
      }
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
      translationExecutionRef.current.clear();
      return;
    }

    const pendingArticleIds = new Set(items.map((article) => article.id));
    const articleTasks = items.map(async (article) => {
      if (articleTranslationQueueRef.current.has(article.id)) {
        return;
      }

      articleTranslationQueueRef.current.add(article.id);
      translationExecutionRef.current.add(article.id);

      try {
        const translated = await translateArticle(article);
        setTranslatedArticleMap((current) => ({
          ...current,
          [article.id]: {
            title: translated.title ?? article.title,
            summary: translated.summary ?? translated.content ?? article.summary ?? '',
          },
        }));
      } finally {
        articleTranslationQueueRef.current.delete(article.id);
        translationExecutionRef.current.delete(article.id);
        pendingArticleIds.delete(article.id);
      }
    });

    void Promise.allSettled(articleTasks);
  }, [items, translationLanguage, translateArticle]);

  useEffect(() => {
    if (!translationLanguage) {
      return;
    }

    const detailTasks = Object.entries(detailsByArticleId).map(async ([articleId, detailState]) => {
      if (detailState.status !== 'success' || !detailState.details.summary || detailTranslationQueueRef.current.has(articleId)) {
        return;
      }

      detailTranslationQueueRef.current.add(articleId);
      try {
        const translated = await translateTextSnapshot(detailState.details.summary);
        setTranslatedDetailMap((current) => ({
          ...current,
          [articleId]: translated,
        }));
      } finally {
        detailTranslationQueueRef.current.delete(articleId);
      }
    });

    void Promise.allSettled(detailTasks);
  }, [detailsByArticleId, translationLanguage, translateTextSnapshot]);

  useEffect(() => {
    void hydrateSettings().then(() => {
      setSettingsReady(true);
    });
    void refreshFeed({ silent: true });
  }, []);

  useEffect(() => {
    if (visibleCategories.length === 0) {
      setActiveCategory(DEFAULT_CATEGORY);
      return;
    }

    const activeIsVisible = visibleCategories.some((option) => option.id === activeCategory);
    if (!activeIsVisible) {
      setActiveCategory(visibleCategories[0].id);
    }
  }, [activeCategory, visibleCategories]);

  useEffect(() => {
    restartRefreshTimer();
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [restartRefreshTimer]);

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
    const index = filteredItems.findIndex((item) => item.id === id);
    setExpandedIds((current) => ({
      ...current,
      [id]: !current[id],
    }));

    if (index >= 0) {
      requestAnimationFrame(() => {
        feedListRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0,
        });
      });
    }

    if (!expandedIds[id]) {
      const article = items.find((item) => item.id === id);
      void loadArticleDetails(id, article?.sourceLinks[0]?.url ?? article?.url);
    }
  }, [expandedIds, filteredItems, items, loadArticleDetails]);

  const refreshStatus = new Date(lastRefreshedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const scrollToTop = useCallback(() => {
    feedListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const handleCategoryPress = useCallback((categoryId: CategoryId) => {
    setActiveCategory(categoryId);
    const index = visibleCategories.findIndex((item) => item.id === categoryId);
    if (index >= 0) {
      requestAnimationFrame(() => {
        categoryListRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5,
        });
      });
    }
  }, [visibleCategories]);

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
        onOpenSource={(url) => {
          setSelectedSourceUrl(url);
          setSelectedArticleId(item.id);
        }}
        darkMode={themeMode === 'dark'}
      />
    );
  }, [detailsByArticleId, expandedIds, loadArticleDetails, themeMode, toggleExpanded, translateArticle, translatedArticleMap, translatedDetailMap]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: palette.background }]}>
      <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open settings"
            onPress={() => router.push('/settings')}
            style={[styles.iconButton, { backgroundColor: palette.soft, borderColor: palette.soft }]}
          >
            <Text style={[styles.iconText, { color: palette.title }]}>☰</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Scroll to the top of the news feed"
            onPress={scrollToTop}
            style={styles.titlePressable}
          >
            <Text style={[styles.title, { color: palette.title }]} numberOfLines={1} ellipsizeMode="tail">X2 News</Text>
          </Pressable>
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
          ref={feedListRef}
          data={filteredItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.feedList}
          showsVerticalScrollIndicator={false}
          snapToInterval={220}
          snapToAlignment="start"
          decelerationRate="fast"
          getItemLayout={(_, index) => ({ length: 220, offset: index * 220, index })}
          onScrollToIndexFailed={({ index }) => {
            feedListRef.current?.scrollToOffset({
              offset: index * 220,
              animated: false,
            });
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => {
                void refreshFeed({ force: true });
                restartRefreshTimer();
              }}
              tintColor={palette.accent}
              colors={[palette.accent]}
            />
          }
          renderItem={renderArticle}
          ListEmptyComponent={
            !settingsReady ? (
              <View style={[styles.emptyState, { backgroundColor: palette.surface, borderColor: palette.border }]}> 
                <Text style={[styles.emptyTitle, { color: palette.title }]}>Loading news</Text>
              </View>
            ) : (
              <View style={[styles.emptyState, { backgroundColor: palette.surface, borderColor: palette.border }]}> 
                <Text style={[styles.emptyTitle, { color: palette.title }]}>No stories in this view</Text>
                <Text style={[styles.emptyBody, { color: palette.body }]}>Try another category or turn a feed back on in Settings.</Text>
              </View>
            )
          }
        />
      </View>

      <View style={styles.categoryBar}>
        <FlatList
          ref={categoryListRef}
          data={visibleCategories}
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
  titlePressable: {
    flexShrink: 1,
    minWidth: 0,
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
