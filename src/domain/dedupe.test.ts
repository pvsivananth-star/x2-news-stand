import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mergeDuplicates } from './dedupe';
import type { RawItem } from './types';

function raw(title: string, url: string, sourceName: string, categories: RawItem['categories'] = ['national']): RawItem {
  return { title, url, sourceName, publishedAt: 1_000, categories };
}

test('same canonical URL merges into one article with one source link per distinct URL', () => {
  const out = mergeDuplicates([
    raw('Rain hits Chennai', 'https://a.example/rain?utm_source=x', 'A'),
    raw('Rain hits Chennai', 'https://a.example/rain/', 'B'),
  ]);
  assert.equal(out.length, 1);
  assert.equal(out[0].sourceLinks.length, 1);
});

test('near-duplicate titles at or above threshold merge and list every source', () => {
  const out = mergeDuplicates([
    raw('Govt announces new rain relief package for Chennai', 'https://a.example/1', 'A'),
    raw('Govt announces rain relief package for Chennai city', 'https://b.example/2', 'B'),
    raw('Cricket: India win the third T20', 'https://c.example/3', 'C', ['sports']),
  ]);
  assert.equal(out.length, 2);
  const merged = out.find((a) => a.sourceLinks.length === 2);
  assert.ok(merged, 'two sources merged into one article');
  assert.deepEqual(merged.sourceLinks.map((s) => s.name ?? s.sourceName ?? '').sort(), ['A', 'B']);
});

test('unrelated titles stay separate', () => {
  const out = mergeDuplicates([
    raw('Sensex closes higher on banking gains', 'https://a.example/1', 'A', ['markets']),
    raw('Monsoon arrives early in Kerala', 'https://b.example/2', 'B'),
  ]);
  assert.equal(out.length, 2);
});

test('merged article carries the union of categories', () => {
  const out = mergeDuplicates([
    raw('Fed holds rates steady this week', 'https://a.example/1', 'A', ['markets']),
    raw('Fed holds rates steady this week', 'https://b.example/1', 'B', ['world']),
  ]);
  const mergedCategories = out[0].categories ?? [];
  assert.deepEqual([...mergedCategories].sort(), ['markets', 'world']);
});

test('threshold is configurable', () => {
  const items = [
    raw('alpha beta gamma delta', 'https://a.example/1', 'A'),
    raw('alpha beta epsilon zeta', 'https://b.example/2', 'B'),
  ];
  assert.equal(mergeDuplicates(items, 0.6).length, 2);
  assert.equal(mergeDuplicates(items, 0.3).length, 1);
});

test('the title shown is the primary item title, exactly as published', () => {
  const published = 'Govt\u2019s relief plan: 5% “extra” aid & more';
  const out = mergeDuplicates([
    raw(published, 'https://a.example/1', 'A'),
    raw('Govt relief plan 5 percent extra aid and more', 'https://b.example/2', 'B'),
  ]);
  assert.equal(out[0].title, published);
});
