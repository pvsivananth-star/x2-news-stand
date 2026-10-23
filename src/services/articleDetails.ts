export interface ArticleDetails {
  summary: string;
  imageUrl?: string;
}

const decodeEntities = (value: string): string =>
  value
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_match, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_match, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    );

const stripMarkup = (html: string): string =>
  decodeEntities(
    html
      .replace(/<(script|style|svg|noscript|template)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<br\b[^>]*\/?>/gi, ' ')
      .replace(/<\/(p|div|li|h[1-6])\s*>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();

const getArticleMarkup = (html: string): string => {
  const article = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i);
  if (article?.[1]) return article[1];

  const articleBody = html.match(
    /<(?:div|section)\b[^>]*(?:itemprop=["']articleBody["']|class=["'][^"']*(?:article-body|article__body|story-body)[^"']*["'])[^>]*>([\s\S]*?)<\/(?:div|section)>/i,
  );
  return articleBody?.[1] ?? html;
};

const extractParagraphs = (html: string): string[] => {
  const articleMarkup = getArticleMarkup(html)
    .replace(/<(nav|aside|header|footer|form|figure|button)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ');
  const paragraphs = Array.from(articleMarkup.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi))
    .map((match) => stripMarkup(match[1] ?? ''))
    .filter((paragraph) => paragraph.length >= 35);

  if (paragraphs.length > 0) return paragraphs.slice(0, 40);

  const fallback = stripMarkup(articleMarkup);
  return fallback.length >= 100 ? [fallback] : [];
};

const summarize = (paragraphs: string[]): string => {
  const sentences = paragraphs
    .join(' ')
    .split(/(?<=[.!?।])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 20);
  if (sentences.length === 0) return '';

  const selectedCount = Math.min(8, sentences.length);
  const selected = Array.from({ length: selectedCount }, (_unused, index) => {
    const sentenceIndex =
      selectedCount === 1
        ? 0
        : Math.round((index * (sentences.length - 1)) / (selectedCount - 1));
    return sentences[sentenceIndex];
  });
  const paragraphCount = Math.min(4, Math.max(3, Math.ceil(selected.length / 2)));
  const sentencesPerParagraph = Math.ceil(selected.length / paragraphCount);
  const summaryParagraphs: string[] = [];

  for (let index = 0; index < selected.length; index += sentencesPerParagraph) {
    summaryParagraphs.push(selected.slice(index, index + sentencesPerParagraph).join(' '));
  }

  return summaryParagraphs.join('\n\n');
};

const extractImageUrl = (html: string, articleUrl: string): string | undefined => {
  const metadata = Array.from(html.matchAll(/<meta\b[^>]*>/gi));
  const metaImage = metadata
    .map((match) => {
      const tag = match[0];
      const property = tag.match(/\b(?:property|name)=["'](og:image(?::url)?|twitter:image)["']/i)?.[1];
      if (!property) return undefined;
      return tag.match(/\bcontent=["']([^"']+)["']/i)?.[1];
    })
    .find((value): value is string => Boolean(value));

  const imageTag = getArticleMarkup(html).match(/<img\b[^>]*>/i)?.[0];
  const inlineImage = imageTag?.match(/\b(?:src|data-src)=["']([^"']+)["']/i)?.[1];
  const candidate = metaImage ?? inlineImage;
  if (!candidate || candidate.startsWith('data:')) return undefined;

  try {
    const url = new URL(decodeEntities(candidate), articleUrl);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : undefined;
  } catch {
    return undefined;
  }
};

export const parseArticleDetails = (html: string, articleUrl: string): ArticleDetails => {
  const paragraphs = extractParagraphs(html);
  const summary = summarize(paragraphs);
  if (!summary) throw new Error('The original article did not contain enough text to summarize.');

  return { summary, imageUrl: extractImageUrl(html, articleUrl) };
};

export const fetchArticleDetails = async (articleUrl: string): Promise<ArticleDetails> => {
  let response: Response;
  let html = '';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    response = await fetch(articleUrl, {
      headers: { Accept: 'text/html,application/xhtml+xml' },
      signal: controller.signal,
    });
    if (response.ok) html = await response.text();
  } catch (error) {
    throw new Error(
      `Could not load the original article: ${error instanceof Error ? error.message : 'network error'}`,
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`The publisher returned HTTP ${response.status} for the original article.`);
  }
  if (html.length > 5_000_000) {
    throw new Error('The original article page is too large to process.');
  }

  return parseArticleDetails(html, articleUrl);
};
