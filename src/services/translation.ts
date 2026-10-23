const GOOGLE_TRANSLATE_URL = 'https://translate.googleapis.com/translate_a/single';

export const isTranslationEnabled = (languageCode: string | undefined): boolean =>
  typeof languageCode === 'string' && languageCode.trim().length > 0;

const buildTranslationUrl = (text: string, targetLanguage: string): string => {
  const params = new URLSearchParams({
    client: 'gtx',
    sl: 'auto',
    tl: targetLanguage.trim(),
    dt: 't',
    ie: 'UTF-8',
    oe: 'UTF-8',
    q: text,
  });
  return `${GOOGLE_TRANSLATE_URL}?${params.toString()}`;
};

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  const cleanText = text?.trim() ?? '';
  if (!cleanText || !isTranslationEnabled(targetLanguage)) {
    return text;
  }

  try {
    const response = await fetch(buildTranslationUrl(cleanText, targetLanguage), {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      return text;
    }

    const payload = (await response.json()) as unknown;
    if (!Array.isArray(payload) || !Array.isArray(payload[0])) {
      return text;
    }

    const translated = payload[0]
      .map((segment) => {
        if (Array.isArray(segment) && typeof segment[0] === 'string') {
          return segment[0];
        }
        return '';
      })
      .join('')
      .trim();

    return translated || text;
  } catch {
    return text;
  }
};
