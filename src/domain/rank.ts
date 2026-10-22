import type { Article } from './types';

export const HALF_LIFE_HOURS = 6;
const MS_PER_HOUR = 3_600_000;

export function scoreArticle(sourceCount: number, publishedAt: number, now: number): number {
  const ageHours = Math.max(0, (now - publishedAt) / MS_PER_HOUR);
  return sourceCount * Math.pow(0.5, ageHours / HALF_LIFE_HOURS);
}

export function rankArticles(articles: readonly Article[], now: number): Article[] {
  return articles
    .map((a) => ({ a, score: scoreArticle(a.sourceLinks.length, a.publishedAt, now) }))
    .sort((x, y) => y.score - x.score || y.a.publishedAt - x.a.publishedAt)
    .map((x) => x.a);
}

export function filterByEnabledCategories(
  articles: readonly Article[],
  enabled: ReadonlySet<string>,
): Article[] {
  const categories = articles.flatMap((a) => a.categories ?? [a.category ?? 'top-stories']);
  return articles.filter((a) => {
    const itemCategories = a.categories ?? [a.category ?? 'top-stories'];
    return itemCategories.some((c) => enabled.has(c));
  });
}
