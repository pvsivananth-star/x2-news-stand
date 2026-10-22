const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'in', 'is',
  'it', 'of', 'on', 'or', 'the', 'to', 'with', 'after', 'over', 'its', 'this',
]);

const TRACKING_PARAMS = /^(utm_[a-z]+|fbclid|gclid|ref|ref_src|mc_cid|mc_eid)$/i;

/**
 * Canonical form of an article URL, used only for matching duplicates.
 * The URL shown to users is always the publisher's own link. This drops tracking
 * parameters and fragments, forces https, and drops a trailing slash.
 */
export function canonicalUrl(raw: string): string {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return raw.trim();
  }
  url.protocol = 'https:';
  url.hash = '';
  for (const key of [...url.searchParams.keys()]) {
    if (TRACKING_PARAMS.test(key)) url.searchParams.delete(key);
  }
  let out = url.toString();
  if (out.endsWith('/') && url.pathname !== '/') out = out.slice(0, -1);
  return out;
}

/** Lowercased word tokens for matching only. Never shown to users. Keeps Tamil letters and vowel signs (\p{M}). */
export function titleTokens(title: string): Set<string> {
  const words = title.toLowerCase().match(/[\p{L}\p{M}\p{N}]+/gu) ?? [];
  return new Set(words.filter((w) => !STOP_WORDS.has(w)));
}

/** Jaccard similarity of two token sets, in the range 0 to 1. Two empty sets score 0. */
export function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}
