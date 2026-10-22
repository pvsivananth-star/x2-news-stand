import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Article } from '@/src/domain/types';

interface NewsCardProps {
  article: Article;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleBookmark: () => void;
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

export function NewsCard({ article, expanded, onToggleExpand, onToggleBookmark }: NewsCardProps) {
  const sourceCount = article.sourceLinks.length;

  return (
    <View style={styles.card} accessible>
      <View style={styles.headerRow}>
        <View style={styles.metaBlock}>
          <Text style={styles.sourceText}>{article.sourceName}</Text>
          <Text style={styles.timeText}>{formatRelativeTime(article.publishedAt)}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={article.bookmarked ? 'Remove bookmark' : 'Add bookmark'}
          onPress={onToggleBookmark}
          style={styles.iconButton}
        >
          <Text style={styles.iconText}>{article.bookmarked ? '★' : '☆'}</Text>
        </Pressable>
      </View>

      <Text style={styles.titleText}>{article.title}</Text>

      {!expanded ? (
        <Text style={styles.summaryText} numberOfLines={3}>
          {article.summary}
        </Text>
      ) : (
        <View style={styles.expandedView}>
          <Text style={styles.summaryText}>{article.summary}</Text>
          {article.sourceLinks.length > 0 && (
            <Text style={styles.linkText}>
              {article.sourceLinks.map((entry) => entry.name).join(' • ')}
            </Text>
          )}
        </View>
      )}

      <View style={styles.footerRow}>
        <Text style={styles.sourceMetaText}>{sourceCount > 1 ? `+${sourceCount - 1} sources` : 'Source'}</Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={expanded ? 'Collapse article' : 'Expand article'}
          onPress={onToggleExpand}
          style={styles.expandButton}
        >
          <Text style={styles.expandText}>{expanded ? '←' : '→'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0f172a',
    borderColor: '#1f2937',
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#0b1120',
    shadowOpacity: 0.25,
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
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  timeText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
  },
  iconText: {
    color: '#fbbf24',
    fontSize: 18,
    fontWeight: '700',
  },
  titleText: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 30,
    marginBottom: 12,
  },
  summaryText: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  expandedView: {
    marginTop: 4,
  },
  linkText: {
    color: '#7dd3fc',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sourceMetaText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  expandButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1d4ed8',
  },
  expandText: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '700',
  },
});
