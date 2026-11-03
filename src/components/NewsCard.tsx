import { memo } from 'react';
import { Image, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import type { Article } from '@/src/domain/types';
import type { ArticleDetailsState } from '@/src/hooks/useArticleDetails';

interface NewsCardProps {
  article: Article;
  expanded: boolean;
  details?: ArticleDetailsState;
  onRetryDetails: () => void;
  onToggleExpand: () => void;
  onOpenSource: (url: string) => void;
  darkMode: boolean;
}

function formatRelativeTime(timestamp: number): string {
  const diffMinutes = Math.max(1, Math.round((Date.now() - timestamp) / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d`;
}

const NewsCardComponent = ({
  article,
  expanded,
  details,
  onRetryDetails,
  onToggleExpand,
  onOpenSource,
  darkMode,
}: NewsCardProps) => {
  const primarySource = article.sourceLinks[0]?.url || article.url || 'https://example.com';

  const handleShare = () => {
    void Share.share({
      message: `${article.title}\n${primarySource}`,
      url: primarySource,
    });
  };

  const handleLongPress = () => {
    const selectionText = [article.title, article.summary, summaryText].filter(Boolean).join('\n\n');
    if (!selectionText) {
      return;
    }

    void Share.share({
      message: selectionText,
      title: article.title,
    });
  };

  const colors = darkMode
    ? {
        card: '#0f172a',
        cardBorder: '#1f2937',
        time: '#94a3b8',
        text: '#f8fafc',
        body: '#dfe7f5',
        accent: '#7dd3fc',
        button: '#111827',
      }
    : {
        card: '#ffffff',
        cardBorder: '#dfe7f5',
        time: '#64748b',
        text: '#0f172a',
        body: '#334155',
        accent: '#0369a1',
        button: '#f1f5f9',
      };

  const summaryText =
    details?.status === 'success' ? details.details.summary : article.content || article.summary || '';
  const paragraphs = summaryText.split('\n\n').filter(Boolean);
  const storyText = paragraphs.length > 0 ? paragraphs : [''];
  const descriptionText = article.summary?.trim() ?? '';

  return (
    <Pressable
      onPress={onToggleExpand}
      onLongPress={handleLongPress}
      accessibilityRole="button"
      accessibilityLabel={`Toggle article details for ${article.title}`}
    >
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]} accessible>
        <Text style={[styles.titleText, { color: colors.text }]}>{article.title}</Text>

        {!expanded ? (
          descriptionText ? (
            <Text style={[styles.summaryText, { color: colors.body }]} numberOfLines={3}>
              {descriptionText}
            </Text>
          ) : null
        ) : (
          <View style={styles.expandedView}>
            {(details?.status === 'success' ? details.details.imageUrl : undefined) ?? article.imageUrl ? (
              <Image
                source={{
                  uri:
                    (details?.status === 'success' ? details.details.imageUrl : undefined) ??
                    article.imageUrl,
                }}
                style={styles.articleImage}
                resizeMode="cover"
              />
            ) : null}

            {details?.status === 'loading' ? (
              <Text style={[styles.summaryText, { color: colors.body }]}>Loading the original article summary…</Text>
            ) : details?.status === 'error' ? (
              <View>
                <Text style={[styles.summaryText, { color: colors.body }]}>{details.message}</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={(event) => {
                    event.stopPropagation();
                    onRetryDetails();
                  }}
                >
                  <Text style={[styles.summaryText, { color: colors.accent }]}>Try again</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <Text style={[styles.summaryLabel, { color: colors.accent }]}>
                  Summary from the original article
                </Text>
                {storyText.map((paragraph, index) => (
                  <Text key={`${article.id}-p-${index}`} style={[styles.summaryText, { color: colors.body }]}>
                    {paragraph}
                  </Text>
                ))}
              </>
            )}
          </View>
        )}

        <View style={styles.footerRow}>
          <View style={styles.metaBlock}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Share article"
              onPress={(event) => {
                event.stopPropagation();
                handleShare();
              }}
              style={[styles.shareButton, { backgroundColor: colors.button }]}
            >
              <Text style={[styles.shareIcon, { color: colors.accent }]}>↗</Text>
            </Pressable>
          </View>

          <View style={styles.metaBlockRight}>
            <Text style={[styles.timeText, { color: colors.time }]}>{formatRelativeTime(article.publishedAt)}</Text>

            {article.sourceLinks.length > 0 && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Open original story: ${primarySource}`}
                onPress={(event) => {
                  event.stopPropagation();
                  onOpenSource(primarySource);
                }}
                style={[styles.sourceLinkButton, { backgroundColor: colors.button }]}
              >
                <Text style={[styles.sourceLinkText, { color: colors.accent }]}>{article.sourceName || 'Source'}</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export const NewsCard = memo(NewsCardComponent);

const styles = StyleSheet.create({
  card: {
    borderWidth: 0,
    borderRadius: 0,
    paddingVertical: 12,
    paddingHorizontal: 0,
    marginBottom: 10,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
    elevation: 0,
  },
  metaBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: 8,
  },
  metaBlockRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    flexShrink: 1,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  sourceLinkButton: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceLinkText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  shareButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareIcon: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 12,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 30,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  expandedView: {
    marginTop: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 8,
  },
  articleImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#cbd5e1',
  },
});
