import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoreArticle, rankArticles, filterByEnabledCategories } from './rank.ts';
import type { Article } from './types.ts';

const H = 3_600_000;
const now = 1_000 * H;

function art(id: string, sources: number, ageHours: number, categories: Article['categories'] = ['top-stories']): Article {
  return {
    id,
    title: id,
    url: `https://example.com/${id}`,
    sourceLinks: Array.from({ length: sources }, (_, i) => ({ sourceName: `s${i}`, url: `https://s${i}.example/${id}` })),
    publishedAt: now - ageHours * H,
    categories,
  };
}

test('score is 1 for a brand-new single-source story', () => {
  assert.equal(scoreArticle(1, now, now), 1);
});

test('score halves every 6 hours', () => {
  assert.ok(Math.abs(scoreArticle(1, now - 6 * H, now) - 0.5) < 1e-9);
  assert.ok(Math.abs(scoreArticle(1, now - 12 * H, now) - 0.25) < 1e-9);
});

test('score scales with source count', () => {
  assert.ok(Math.abs(scoreArticle(4, now - 6 * H, now) - 2) < 1e-9);
});

test('future timestamps are treated as age 0', () => {
  assert.equal(scoreArticle(1, now + 5 * H, now), 1);
});

test('ranking puts higher score first and does not mutate input', () => {
  const input = [art('old-big', 5, 12), art('new-small', 1, 0), art('new-big', 3, 0)];
  const snapshot = input.map((a) => a.id);
  const ranked = rankArticles(input, now).map((a) => a.id);
  // new-big = 3, old-big = 5 x 0.5^2 = 1.25, new-small = 1
  assert.deepEqual(ranked, ['new-big', 'old-big', 'new-small']);
  assert.deepEqual(input.map((a) => a.id), snapshot);
});

test('ties break by newer publishedAt', () => {
  const ranked = rankArticles([art('older', 1, 2), art('newer', 1, 1)], now).map((a) => a.id);
  assert.deepEqual(ranked, ['newer', 'older']);
});

test('filterByEnabledCategories keeps articles with at least one enabled category', () => {
  const items = [art('a', 1, 0, ['sports']), art('b', 1, 0, ['markets', 'business']), art('c', 1, 0, ['world'])];
  const kept = filterByEnabledCategories(items, new Set(['markets'])).map((a) => a.id);
  assert.deepEqual(kept, ['b']);
});
