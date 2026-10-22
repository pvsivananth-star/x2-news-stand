import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Article } from '@/src/domain/types';

interface NewsCardProps {
  article: Article;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleBookmark: () => void;
  onOpenSource: (url: string) => void;
  darkMode: boolean;
}

function formatRelativeTime(timestamp: number): string {
  const diffMinutes = Math.max(1, Math.round((Date.now() - timestamp) / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

export function NewsCard({ article, expanded, onToggleExpand, onToggleBookmark, onOpenSource, darkMode }: NewsCardProps) {
  const sourceCount = article.sourceLinks.length;
  const colors = darkMode
    ? {
        card: '#0f172a',
        cardBorder: '#1f2937',
        meta: '#cbd5e1',
        time: '#94a3b8',
        text: '#f8fafc',
        body: '#dfe7f5',
        muted: '#94a3b8',
        accent: '#7dd3fc',
        action: '#1d4ed8',
        button: '#111827',
      }
    : {
        card: '#ffffff',
        cardBorder: '#dfe7f5',
        meta: '#334155',
        time: '#64748b',
        text: '#0f172a',
        body: '#334155',
        muted: '#64748b',
        accent: '#0369a1',
        action: '#dbeafe',
        button: '#f1f5f9',
      };

  const paragraphs = article.summary ? article.summary.split('\n\n').filter(Boolean) : [''];

  return (
    <Pressable onPress={onToggleExpand} accessibilityRole="button" accessibilityLabel={`Toggle article details for ${article.title}`}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]} accessible>
        <View style={styles.headerRow}>
          <View style={styles.metaBlock}>
            <Text style={[styles.sourceText, { color: colors.meta }]}>{article.sourceName}</Text>
            <Text style={[styles.timeText, { color: colors.time }]}>{formatRelativeTime(article.publishedAt)}</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={article.bookmarked ? 'Remove bookmark' : 'Add bookmark'}
            onPress={(event) => {
              event.stopPropagation();
              onToggleBookmark();
            }}
            style={[styles.iconButton, { backgroundColor: colors.button }]}
          >
            <Text style={[styles.iconText, { color: darkMode ? '#fbbf24' : '#d97706' }]}>{article.bookmarked ? '★' : '☆'}</Text>
          </Pressable>
        </View>

        <Text style={[styles.titleText, { color: colors.text }]}>{article.title}</Text>

        {!expanded ? (
          <Text style={[styles.summaryText, { color: colors.body }]} numberOfLines={4}>
            {paragraphs[0]}
          </Text>
        ) : (
          <View style={styles.expandedView}>
            {paragraphs.map((paragraph, index) => (
              <Text key={`${article.id}-p-${index}`} style={[styles.summaryText, { color: colors.body }]}>
                {paragraph}
              </Text>
            ))}

            {article.sourceLinks.length > 0 && (
              <View style={styles.linkGroup}>
                {article.sourceLinks.map((entry) => (
                  <Pressable
                    key={`${article.id}-${entry.url}`}
                    accessibilityRole="button"
                    accessibilityLabel={`Open source: ${entry.name ?? 'source'}`}
                    onPress={(event) => {
                      event.stopPropagation();
                      onOpenSource(entry.url || article.url || 'https://example.com');
                    }}
                    style={styles.linkButton}
                  >
                    <Text style={[styles.linkText, { color: colors.accent }]}>{entry.name ?? 'Source'}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={styles.footerRow}>
          <Text style={[styles.sourceMetaText, { color: colors.muted }]}>{sourceCount > 1 ? `+${sourceCount - 1} sources` : 'Source'}</Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={expanded ? 'Collapse article' : 'Expand article'}
            onPress={(event) => {
              event.stopPropagation();
              onToggleExpand();
            }}
            style={[styles.expandButton, { backgroundColor: colors.action }]}
          >
            <Text style={[styles.expandText, { color: darkMode ? '#f8fafc' : '#0f172a' }]}>{expanded ? '←' : '→'}</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#0b1120',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  sourceText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
    fontWeight: '700',
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
  expandedView: {
    marginTop: 4,
  },
  linkGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  linkButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(125, 211, 252, 0.12)',
  },
  linkText: {
    fontSize: 13,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sourceMetaText: {
    fontSize: 12,
    fontWeight: '600',
  },
  expandButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandText: {
    fontSize: 22,
    fontWeight: '700',
  },
});
