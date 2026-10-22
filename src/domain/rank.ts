import type { Article } from './types.ts';

export const HALF_LIFE_HOURS = 6;
const MS_PER_HOUR = 3_600_000;

/** sourceCount x 0.5^(ageInHours / 6). Items in the future are treated as age 0. */
export function scoreArticle(sourceCount: number, publishedAt: number, now: number): number {
  const ageHours = Math.max(0, (now - publishedAt) / MS_PER_HOUR);
  return sourceCount * Math.pow(0.5, ageHours / HALF_LIFE_HOURS);
}

/** Highest score first. Ties break by newer publishedAt. Does not mutate the input. */
export function rankArticles(articles: readonly Article[], now: number): Article[] {
  return articles
    .map((a) => ({ a, score: scoreArticle(a.sourceLinks.length, a.publishedAt, now) }))
    .sort((x, y) => y.score - x.score || y.a.publishedAt - x.a.publishedAt)
    .map((x) => x.a);
}

/** Keep only articles that belong to at least one enabled category. */
export function filterByEnabledCategories(
  articles: readonly Article[],
  enabled: ReadonlySet<string>,
): Article[] {
  return articles.filter((a) => a.categories.some((c) => enabled.has(c)));
}
