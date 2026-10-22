import type { Article, RawItem, SourceLink } from './types.ts';
import { canonicalUrl, jaccard, titleTokens } from './normalize.ts';

export const DEFAULT_TITLE_THRESHOLD = 0.6;

interface Group {
  primary: RawItem;
  tokens: Set<string>;
  sourceLinks: SourceLink[];
  categories: Set<RawItem['categories'][number]>;
  urls: Set<string>;
}

function addToGroup(g: Group, item: RawItem): void {
  const url = canonicalUrl(item.url);
  if (!g.sourceLinks.some((s) => s.url === url)) g.sourceLinks.push({ sourceName: item.sourceName, url });
  for (const c of item.categories) g.categories.add(c);
  g.urls.add(url);
}

/**
 * Merge items that describe the same story.
 *  1. Same canonical URL: one story.
 *  2. Otherwise, title token Jaccard similarity at or above the threshold: one story.
 * The merged card shows the primary item's title exactly as published, and lists every source.
 */
export function mergeDuplicates(items: readonly RawItem[], threshold: number = DEFAULT_TITLE_THRESHOLD): Article[] {
  const groups: Group[] = [];

  for (const item of items) {
    const url = canonicalUrl(item.url);
    const byUrl = groups.find((g) => g.urls.has(url));
    if (byUrl) {
      addToGroup(byUrl, item);
      continue;
    }
    const tokens = titleTokens(item.title);
    const byTitle = groups.find((g) => jaccard(g.tokens, tokens) >= threshold);
    if (byTitle) {
      addToGroup(byTitle, item);
      continue;
    }
    const g: Group = { primary: item, tokens, sourceLinks: [], categories: new Set(), urls: new Set() };
    addToGroup(g, item);
    groups.push(g);
  }

  return groups.map((g) => ({
    id: canonicalUrl(g.primary.url),
    title: g.primary.title,
    url: canonicalUrl(g.primary.url),
    sourceLinks: g.sourceLinks,
    publishedAt: g.primary.publishedAt,
    categories: [...g.categories],
  }));
}
