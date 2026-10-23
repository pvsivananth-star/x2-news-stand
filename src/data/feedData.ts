import type { Article, CategoryId } from '@/src/domain/types';
import feedFile from '../../feeds.json';
import { activeFeeds, parseFeedConfig } from '@/src/config/feeds';
import { extractRssDescription } from '@/src/services/rssDescription';

export interface CategoryOption {
  id: CategoryId;
  label: string;
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { id: 'top-stories', label: 'Top' },
  { id: 'local', label: 'Local' },
  { id: 'district', label: 'District' },
  { id: 'national', label: 'National' },
  { id: 'world', label: 'World' },
  { id: 'markets', label: 'Markets' },
  { id: 'business', label: 'Business' },
  { id: 'technology', label: 'Technology' },
  { id: 'science', label: 'Science' },
  { id: 'health-medical', label: 'Health' },
  { id: 'politics', label: 'Politics' },
  { id: 'sports', label: 'Sports' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'viral-trending', label: 'Viral' },
];

const XML_ENTITY_MAP: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
  '&#39;': "'",
  '&nbsp;': ' ',
};

const decodeXmlText = (value: string | null | undefined): string => {
  if (!value) return '';

  let text = value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
  text = text.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
  text = text.replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(Number.parseInt(code, 16)));

  for (const [entity, decoded] of Object.entries(XML_ENTITY_MAP)) {
    text = text.replace(new RegExp(entity, 'g'), decoded);
  }

  return text.trim();
};

const stripHtml = (value: string | null | undefined): string => {
  if (!value) return '';

  let text = decodeXmlText(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return text;
};

const firstMatch = (source: string, pattern: RegExp): string => {
  const match = source.match(pattern);
  return match ? decodeXmlText(match[1]) : '';
};

const extractArticleText = (itemXml: string): string => {
  const candidates = [
    /<(?:content:encoded|content)\b[^>]*>([\s\S]*?)<\/(?:content:encoded|content)>/i,
    /<(?:description|summary)\b[^>]*>([\s\S]*?)<\/(?:description|summary)>/i,
  ];

  for (const pattern of candidates) {
    const value = firstMatch(itemXml, pattern);
    if (value) {
      const stripped = stripHtml(value);
      if (stripped) return stripped;
    }
  }

  return '';
};

const extractImageUrl = (itemXml: string): string | undefined => {
  const patterns = [
    /<(?:media:content|media:thumbnail|enclosure)\b[^>]*\b(?:url|src)=["']([^"']+)["'][^>]*>/i,
    /<img\b[^>]*\b(?:src|data-src)=["']([^"']+)["'][^>]*>/i,
  ];

  for (const pattern of patterns) {
    const match = itemXml.match(pattern);
    if (match) {
      const candidate = decodeXmlText(match[1]).replace(/\s+/g, '');
      if (candidate) return candidate;
    }
  }

  return undefined;
};

const buildParagraphs = (text: string, maxParagraphs = 4): string[] => {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];

  const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length === 0) return [cleaned];
  if (sentences.length === 1) return [sentences[0]];

  const targetParagraphs = Math.min(maxParagraphs, Math.max(2, Math.min(sentences.length, 4)));
  const paragraphs: string[] = [];
  const size = Math.ceil(sentences.length / targetParagraphs);

  for (let index = 0; index < sentences.length; index += size) {
    const chunk = sentences.slice(index, index + size).join(' ').trim();
    if (chunk) paragraphs.push(chunk);
    if (paragraphs.length >= maxParagraphs) break;
  }

  return paragraphs.length > 0 ? paragraphs : [cleaned];
};

const parsePublishedAt = (rawDate: string | null | undefined, fallbackIndex: number): number => {
  const candidate = rawDate ? rawDate.trim() : '';
  if (candidate) {
    const parsed = new Date(candidate);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.getTime();
    }
  }

  return Date.now() - fallbackIndex * 60 * 60 * 1000;
};

const CATEGORY_KEYWORDS: Record<CategoryId, string[]> = {
  'top-stories': ['top stories', 'news', 'latest', 'breaking', 'updates'],
  local: ['chennai', 'tamil nadu', 'tn', 'local', 'city', 'district', 'municipality', 'traffic', 'water', 'council'],
  district: ['district', 'taluk', 'municipality', 'collector', 'village', 'block', 'rural', 'panchayat'],
  national: ['india', 'national', 'government', 'minister', 'parliament', 'delhi', 'state', 'union'],
  world: ['world', 'international', 'global', 'uk', 'us', 'europe', 'asia', 'africa', 'middle east', 'gaza', 'russia', 'china'],
  markets: ['market', 'stock', 'shares', 'nifty', 'sensex', 'equity', 'ipo', 'trading', 'bse', 'nse'],
  business: ['business', 'startup', 'company', 'revenue', 'industry', 'economy', 'trade', 'banking', 'corporate'],
  technology: ['technology', 'tech', 'ai', 'software', 'app', 'android', 'iphone', 'cloud', 'cyber', 'chip', 'digital'],
  science: ['science', 'research', 'scientist', 'space', 'satellite', 'lab', 'climate', 'study', 'astronomy'],
  'health-medical': ['health', 'medical', 'doctor', 'hospital', 'patient', 'fitness', 'wellness', 'disease', 'clinic', 'covid'],
  politics: ['politics', 'political', 'minister', 'election', 'campaign', 'government', 'policy', 'parliament'],
  sports: ['sports', 'cricket', 'football', 'tennis', 'match', 'team', 'tournament', 'league', 'cup', 'coach'],
  entertainment: ['film', 'movie', 'cinema', 'actor', 'actress', 'music', 'series', 'festival', 'theatre', 'entertainment'],
  lifestyle: ['lifestyle', 'travel', 'food', 'fashion', 'culture', 'wellbeing', 'home', 'garden', 'cooking'],
  'viral-trending': ['viral', 'trending', 'social media', 'reel', 'meme', 'internet', 'craze', 'popular', 'video'],
};

const scoreCategory = (text: string, category: CategoryId): number => {
  const normalized = text.toLowerCase();
  const keywords = CATEGORY_KEYWORDS[category] ?? [];
  return keywords.reduce((score, keyword) => score + (normalized.includes(keyword) ? 2 : 0), 0);
};

const toArticleCategory = (title: string, description: string, feedCategories: CategoryId[], fallbackIndex: number): CategoryId => {
  const candidateText = `${title} ${description}`.toLowerCase();
  const scored = (Object.keys(CATEGORY_KEYWORDS) as CategoryId[]).map((category) => ({
    category,
    score: scoreCategory(candidateText, category),
  })).sort((a, b) => b.score - a.score);

  const matched = scored.find((entry) => entry.score > 0)?.category;
  if (matched) return matched;

  const preferred = feedCategories.find((category) => category !== 'top-stories');
  return preferred ?? feedCategories[0] ?? 'top-stories';
};

const isArticleReachable = async (articleUrl: string): Promise<boolean> => {
  if (!articleUrl) return false;

  const timeoutMs = 5_000;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headResponse = await fetch(articleUrl, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0',
      },
    });

    if (headResponse.ok) {
      return true;
    }

    const getResponse = await fetch(articleUrl, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0',
      },
    });

    return getResponse.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
};

const parseRssItems = (xml: string, feedName: string, feedCategories: CategoryId[]): Article[] => {
  const matches = Array.from(xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi));

  const articles: Article[] = [];
  for (const [index, match] of matches.entries()) {
    const itemXml = match[1] ?? '';
    const title = firstMatch(itemXml, /<(?:title)\b[^>]*>([\s\S]*?)<\/(?:title)>/i);
    const link = firstMatch(itemXml, /<(?:link|guid)\b[^>]*>([\s\S]*?)<\/(?:link|guid)>/i);
    const publishedRaw = firstMatch(itemXml, /<(?:pubDate|published|updated|dc:date)\b[^>]*>([\s\S]*?)<\/(?:pubDate|published|updated|dc:date)>/i);
    const articleUrl = decodeXmlText(link).replace(/\s+/g, '');

    if (!title || !articleUrl) continue;

    const storyText = extractArticleText(itemXml);
    const contentText = storyText || title;
    const paragraphs = buildParagraphs(contentText, 4);
    const imageUrl = extractImageUrl(itemXml);
    const summaryText = extractRssDescription(itemXml);
    const category = toArticleCategory(`${title} ${storyText}`.trim(), storyText, feedCategories, index);
    articles.push({
      id: `${feedName}-${articleUrl}`,
      title,
      url: articleUrl,
      summary: summaryText,
      sourceName: feedName,
      sourceLinks: [{ name: feedName, url: articleUrl }],
      publishedAt: parsePublishedAt(publishedRaw, index),
      category,
      categories: [category],
      bookmarked: false,
      imageUrl,
      content: paragraphs.join('\n\n'),
    });
  }

  return articles;
};

const pruneUnreachableArticles = async (articles: Article[]): Promise<Article[]> => {
  const kept: Article[] = [];

  for (const article of articles) {
    const url = article.url ?? article.sourceLinks[0]?.url;
    if (!url) {
      kept.push(article);
      continue;
    }

    const reachable = await isArticleReachable(url);
    if (reachable) {
      kept.push(article);
    }
  }

  return kept;
};

export let FEED_ARTICLES: Article[] = [];

export const refreshFeedArticles = async (): Promise<Article[]> => {
  try {
    const config = parseFeedConfig(feedFile);
    const feeds = activeFeeds(config);

    const articleLists = await Promise.all(
      feeds.map(async (feed) => {
        try {
          const response = await fetch(feed.url, { headers: { Accept: 'application/rss+xml, application/xml, text/xml;q=0.9,*/*;q=0.8' } });
          if (!response.ok) return [];
          const xml = await response.text();
          return parseRssItems(xml, feed.name, feed.categories as CategoryId[]);
        } catch {
          return [];
        }
      }),
    );

    const merged = new Map<string, Article>();
    for (const list of articleLists) {
      for (const article of list) {
        const key = article.url ?? article.id;
        if (!key) continue;
        if (!merged.has(key)) {
          merged.set(key, article);
        }
      }
    }

    const sorted = Array.from(merged.values()).sort((a, b) => b.publishedAt - a.publishedAt).slice(0, 80);
    FEED_ARTICLES = sorted;
    void pruneUnreachableArticles(sorted).then((validated) => {
      if (validated.length !== sorted.length || validated.some((article, index) => article.id !== sorted[index]?.id)) {
        FEED_ARTICLES = validated;
      }
    }).catch(() => undefined);
    return sorted;
  } catch {
    FEED_ARTICLES = [];
    return [];
  }
};
