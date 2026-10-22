import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseFeedConfig, activeFeeds } from './feeds.ts';

const feedsPath = fileURLToPath(new URL('../../feeds.json', import.meta.url));
const raw: unknown = JSON.parse(readFileSync(feedsPath, 'utf8'));

test('feeds.json parses and passes validation', () => {
  const cfg = parseFeedConfig(raw);
  assert.ok(cfg.feeds.length > 0);
});

test('feed ids are unique and every URL is http(s)', () => {
  const cfg = parseFeedConfig(raw);
  const ids = cfg.feeds.map((f) => f.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const f of cfg.feeds) assert.match(f.url, /^https?:\/\//, f.id);
});

test('only working or tracker-listed feeds that are enabled are fetched', () => {
  const cfg = parseFeedConfig(raw);
  for (const f of activeFeeds(cfg)) {
    assert.equal(f.enabled, true, f.id);
    assert.ok(f.status === 'working' || f.status === 'tracker-listed', f.id);
  }
  assert.ok(activeFeeds(cfg).length < cfg.feeds.length, 'candidates and pending are excluded');
});

test('rejects an unknown category', () => {
  const bad = { lastChecked: '2026-10-22', feeds: [{ id: 'x', name: 'x', language: 'en', type: 'rss', url: 'https://e.com/f', categories: ['tech'], status: 'working', enabled: true }] };
  assert.throws(() => parseFeedConfig(bad), /unknown category "tech"/);
});

test('rejects duplicate ids and non-http urls', () => {
  const base = { id: 'x', name: 'x', language: 'en', type: 'rss', url: 'https://e.com/f', categories: ['world'], status: 'working', enabled: true };
  assert.throws(() => parseFeedConfig({ lastChecked: 'd', feeds: [base, base] }), /duplicate id/);
  assert.throws(() => parseFeedConfig({ lastChecked: 'd', feeds: [{ ...base, url: 'ftp://e.com' }] }), /http/);
});
