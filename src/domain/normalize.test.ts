import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canonicalUrl, titleTokens, jaccard } from './normalize';

test('canonicalUrl removes tracking params and fragments, forces https, drops trailing slash', () => {
  assert.equal(
    canonicalUrl('http://News.Example.com/story/?utm_source=x&id=7&fbclid=abc#top'),
    'https://news.example.com/story/?id=7',
  );
  assert.equal(canonicalUrl('https://example.com/a/'), 'https://example.com/a');
  assert.equal(canonicalUrl('https://example.com/'), 'https://example.com/');
});

test('canonicalUrl returns invalid input trimmed rather than throwing', () => {
  assert.equal(canonicalUrl('  not a url  '), 'not a url');
});

test('titleTokens lowercases, drops punctuation and stop words, keeps Tamil letters', () => {
  assert.deepEqual([...titleTokens('The Fed, cuts rates!')].sort(), ['cuts', 'fed', 'rates']);
  assert.ok(titleTokens('இந்தியா வெற்றி!').has('இந்தியா'));
});

test('jaccard: identical sets 1, disjoint 0, partial overlap computed', () => {
  assert.equal(jaccard(new Set(['a', 'b']), new Set(['a', 'b'])), 1);
  assert.equal(jaccard(new Set(['a']), new Set(['b'])), 0);
  assert.ok(Math.abs(jaccard(new Set(['a', 'b', 'c']), new Set(['b', 'c', 'd'])) - 0.5) < 1e-9);
  assert.equal(jaccard(new Set(), new Set()), 0);
});
