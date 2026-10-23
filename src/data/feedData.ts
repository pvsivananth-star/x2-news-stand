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

const toArticleCategory = (feedCategories: CategoryId[], fallbackIndex: number): CategoryId => {
  const preferred = feedCategories.find((category) => category !== 'top-stories');
  return preferred ?? feedCategories[0] ?? 'top-stories';
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
    const category = toArticleCategory(feedCategories, index);
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
    return sorted;
  } catch {
    FEED_ARTICLES = [];
    return [];
  }
};
