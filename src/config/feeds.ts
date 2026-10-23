import { ALL_CATEGORIES } from '../domain/types';
import type { CategoryId } from '../domain/types';

export type FeedStatus = 'working' | 'tracker-listed' | 'candidate' | 'pending';

export interface FeedEntry {
  id: string;
  name: string;
  language: string;
  type: 'rss' | 'google-news-search';
  url: string;
  categories: CategoryId[];
  status: FeedStatus;
  enabled: boolean;
  fallback?: boolean;
  notes?: string;
}

export interface FeedConfig {
  lastChecked: string;
  feeds: FeedEntry[];
}

const STATUSES: readonly FeedStatus[] = ['working', 'tracker-listed', 'candidate', 'pending'];

/** Throws with a readable message on the first problem found. Returns the typed config. */
export function parseFeedConfig(raw: unknown): FeedConfig {
  if (typeof raw !== 'object' || raw === null) throw new Error('feeds: root must be an object');
  const root = raw as Record<string, unknown>;
  if (typeof root.lastChecked !== 'string') throw new Error('feeds: lastChecked must be a string');
  if (!Array.isArray(root.feeds)) throw new Error('feeds: feeds must be an array');

  const seen = new Set<string>();
  const feeds: FeedEntry[] = root.feeds.map((entry, i) => {
    const where = `feeds[${i}]`;
    if (typeof entry !== 'object' || entry === null) throw new Error(`${where}: must be an object`);
    const f = entry as Record<string, unknown>;
    for (const key of ['id', 'name', 'language', 'url'] as const) {
      if (typeof f[key] !== 'string' || (f[key] as string).trim() === '') {
        throw new Error(`${where}.${key}: must be a non-empty string`);
      }
    }
    const id = f.id as string;
    if (seen.has(id)) throw new Error(`${where}: duplicate id "${id}"`);
    seen.add(id);

    const url = f.url as string;
    if (!/^https?:\/\//.test(url)) throw new Error(`${where}.url: must start with http:// or https://`);
    if (f.type !== 'rss' && f.type !== 'google-news-search') {
      throw new Error(`${where}.type: must be "rss" or "google-news-search"`);
    }
    if (!STATUSES.includes(f.status as FeedStatus)) throw new Error(`${where}.status: unknown status`);
    if (typeof f.enabled !== 'boolean') throw new Error(`${where}.enabled: must be true or false`);
    if (!Array.isArray(f.categories) || f.categories.length === 0) {
      throw new Error(`${where}.categories: must be a non-empty array`);
    }
    for (const c of f.categories) {
      if (!ALL_CATEGORIES.includes(c as CategoryId)) {
        throw new Error(`${where}.categories: unknown category "${String(c)}"`);
      }
    }
    if (f.fallback !== undefined && typeof f.fallback !== 'boolean') {
      throw new Error(`${where}.fallback: must be true or false`);
    }
    return f as unknown as FeedEntry;
  });

  return { lastChecked: root.lastChecked as string, feeds };
}

/**
 * Feeds the app fetches: enabled, and either verified by the owner ("working")
 * or listed by a tracker and awaiting the owner's check ("tracker-listed").
 * Candidates and pending entries are never fetched.
 */
export function activeFeeds(config: FeedConfig): FeedEntry[] {
  return config.feeds.filter(
    (f) => f.enabled && (f.status === 'working' || f.status === 'tracker-listed'),
  );
}
