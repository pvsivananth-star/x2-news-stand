import TranslateText, { TranslateLanguage } from '@react-native-ml-kit/translate-text';

const GOOGLE_TRANSLATE_URL = 'https://translate.googleapis.com/translate_a/single';
const MY_MEMORY_TRANSLATE_URL = 'https://api.mymemory.translated.net/get';
const MAX_TRANSLATION_QUERY_LENGTH = 500;

export const isTranslationEnabled = (languageCode: string | undefined): boolean =>
  typeof languageCode === 'string' && languageCode.trim().length > 0;

const normalizeForTranslation = (text: string): string => {
  const compactText = text.replace(/\s+/g, ' ').trim();
  if (!compactText) {
    return compactText;
  }

  return compactText.slice(0, MAX_TRANSLATION_QUERY_LENGTH);
};

const normalizeLanguageCode = (targetLanguage: string): string => {
  const trimmed = targetLanguage.trim();
  if (!trimmed) {
    return trimmed;
  }

  return trimmed.replace('_', '-');
};

const NATIVE_LANGUAGE_MAP: Record<string, TranslateLanguage> = {
  af: TranslateLanguage.AFRIKAANS,
  ar: TranslateLanguage.ARABIC,
  be: TranslateLanguage.BELARUSIAN,
  bg: TranslateLanguage.BULGARIAN,
  bn: TranslateLanguage.BENGALI,
  ca: TranslateLanguage.CATALAN,
  cs: TranslateLanguage.CZECH,
  da: TranslateLanguage.DANISH,
  de: TranslateLanguage.GERMAN,
  el: TranslateLanguage.GREEK,
  en: TranslateLanguage.ENGLISH,
  es: TranslateLanguage.SPANISH,
  et: TranslateLanguage.ESTONIAN,
  fa: TranslateLanguage.PERSIAN,
  fil: TranslateLanguage.TAGALOG,
  fr: TranslateLanguage.FRENCH,
  gu: TranslateLanguage.GUJARATI,
  he: TranslateLanguage.HEBREW,
  hi: TranslateLanguage.HINDI,
  hr: TranslateLanguage.CROATIAN,
  hu: TranslateLanguage.HUNGARIAN,
  id: TranslateLanguage.INDONESIAN,
  it: TranslateLanguage.ITALIAN,
  ja: TranslateLanguage.JAPANESE,
  kn: TranslateLanguage.KANNADA,
  ko: TranslateLanguage.KOREAN,
  ml: TranslateLanguage.MALAY,
  mr: TranslateLanguage.MARATHI,
  ms: TranslateLanguage.MALAY,
  nl: TranslateLanguage.DUTCH,
  pl: TranslateLanguage.POLISH,
  pt: TranslateLanguage.PORTUGUESE,
  ro: TranslateLanguage.ROMANIAN,
  ru: TranslateLanguage.RUSSIAN,
  sk: TranslateLanguage.SLOVAK,
  sl: TranslateLanguage.SLOVENIAN,
  sq: TranslateLanguage.ALBANIAN,
  sv: TranslateLanguage.SWEDISH,
  sw: TranslateLanguage.SWAHILI,
  ta: TranslateLanguage.TAMIL,
  te: TranslateLanguage.TELUGU,
  th: TranslateLanguage.THAI,
  tr: TranslateLanguage.TURKISH,
  uk: TranslateLanguage.UKRAINIAN,
  ur: TranslateLanguage.URDU,
  vi: TranslateLanguage.VIETNAMESE,
  zh: TranslateLanguage.CHINESE,
  'zh-cn': TranslateLanguage.CHINESE,
  'zh-tw': TranslateLanguage.CHINESE,
};

const mapToNativeTargetLanguage = (targetLanguage: string): TranslateLanguage | null => {
  const normalizedTarget = normalizeLanguageCode(targetLanguage).toLowerCase();
  const requested = normalizedTarget.replace(/_/g, '-');

  if (requested in NATIVE_LANGUAGE_MAP) {
    return NATIVE_LANGUAGE_MAP[requested];
  }

  const shortCode = requested.split('-')[0];
  return NATIVE_LANGUAGE_MAP[shortCode] ?? null;
};

const detectSourceLanguage = (text: string): TranslateLanguage => {
  const normalizedText = text.normalize('NFKC');

  if (/[\u0B80-\u0BFF]/.test(normalizedText)) {
    return TranslateLanguage.TAMIL;
  }

  if (/[\u0900-\u097F]/.test(normalizedText)) {
    return TranslateLanguage.HINDI;
  }

  if (/[\u0980-\u09FF]/.test(normalizedText)) {
    return TranslateLanguage.BENGALI;
  }

  if (/[\u0A80-\u0AFF]/.test(normalizedText)) {
    return TranslateLanguage.GUJARATI;
  }

  if (/[\u0C80-\u0CFF]/.test(normalizedText)) {
    return TranslateLanguage.KANNADA;
  }

  if (/[\u0D00-\u0D7F]/.test(normalizedText)) {
    return TranslateLanguage.MALAY;
  }

  if (/[\u0600-\u06FF]/.test(normalizedText)) {
    return TranslateLanguage.ARABIC;
  }

  if (/[\u3040-\u30FF\u31F0-\u31FF]/.test(normalizedText)) {
    return TranslateLanguage.JAPANESE;
  }

  if (/[\u4E00-\u9FFF]/.test(normalizedText)) {
    return TranslateLanguage.CHINESE;
  }

  if (/[\uAC00-\uD7AF]/.test(normalizedText)) {
    return TranslateLanguage.KOREAN;
  }

  if (/[\u0400-\u04FF]/.test(normalizedText)) {
    return TranslateLanguage.RUSSIAN;
  }

  return TranslateLanguage.ENGLISH;
};

const isProviderWarningText = (value: string | null | undefined): boolean => {
  if (!value) {
    return true;
  }

  return /query length limit exceeded|max allowed query|you used all available free translations|mymemory warning/i.test(value);
};

const warnTranslationFallback = (reason: string, targetLanguage: string, textLength: number): void => {
  console.warn(`[translation] ${reason} target=${targetLanguage} sourceLength=${textLength}`);
};

const toTranslatedString = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 && !isProviderWarningText(trimmed) ? trimmed : null;
  }

  if (value && typeof value === 'object') {
    const candidate = value as { text?: unknown; translatedText?: unknown; result?: unknown };
    const text = candidate.text ?? candidate.translatedText ?? candidate.result;
    if (typeof text === 'string') {
      const trimmed = text.trim();
      return trimmed.length > 0 && !isProviderWarningText(trimmed) ? trimmed : null;
    }
  }

  return null;
};

const translateWithNative = async (text: string, targetLanguage: string): Promise<string | null> => {
  const nativeTargetLanguage = mapToNativeTargetLanguage(targetLanguage);
  if (!nativeTargetLanguage) {
    return null;
  }

  try {
    const translated = await TranslateText.translate({
      text,
      sourceLanguage: detectSourceLanguage(text),
      targetLanguage: nativeTargetLanguage,
      downloadModelIfNeeded: true,
      requireWifi: false,
      requireCharging: false,
    });

    return toTranslatedString(translated);
  } catch (error) {
    warnTranslationFallback(`Native translation unavailable: ${error instanceof Error ? error.message : String(error)}`, targetLanguage, text.length);
    return null;
  }
};

const buildMyMemoryUrl = (text: string, targetLanguage: string): string => {
  const params = new URLSearchParams({
    q: text,
    langpair: `auto|${normalizeLanguageCode(targetLanguage)}`,
  });

  return `${MY_MEMORY_TRANSLATE_URL}?${params.toString()}`;
};

const buildGoogleTranslationUrl = (text: string, targetLanguage: string): string => {
  const params = new URLSearchParams({
    client: 'gtx',
    sl: 'auto',
    tl: normalizeLanguageCode(targetLanguage),
    dt: 't',
    ie: 'UTF-8',
    oe: 'UTF-8',
    q: text,
  });

  return `${GOOGLE_TRANSLATE_URL}?${params.toString()}`;
};

const parseGoogleTranslatedText = (payload: unknown): string | null => {
  if (!Array.isArray(payload) || !Array.isArray(payload[0])) {
    return null;
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

  return translated || null;
};

const translateWithGoogle = async (text: string, targetLanguage: string): Promise<string | null> => {
  try {
    const response = await fetch(buildGoogleTranslationUrl(text, targetLanguage), {
      headers: { Accept: 'application/json', 'User-Agent': 'X2NewsStand/1.0' },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as unknown;
    const translatedText = parseGoogleTranslatedText(payload);
    return translatedText && !isProviderWarningText(translatedText) ? translatedText : null;
  } catch {
    return null;
  }
};

const translateWithMyMemory = async (text: string, targetLanguage: string): Promise<string | null> => {
  try {
    const response = await fetch(buildMyMemoryUrl(text, targetLanguage), {
      headers: { Accept: 'application/json', 'User-Agent': 'X2NewsStand/1.0' },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { responseData?: { translatedText?: string } };
    const translatedText = payload.responseData?.translatedText?.trim();
    return translatedText && !isProviderWarningText(translatedText) ? translatedText : null;
  } catch {
    return null;
  }
};

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  const cleanText = normalizeForTranslation(text ?? '');
  if (!cleanText || !isTranslationEnabled(targetLanguage)) {
    return text;
  }

  const normalizedTarget = normalizeLanguageCode(targetLanguage);
  if (!normalizedTarget) {
    return text;
  }

  const nativeResult = await translateWithNative(cleanText, normalizedTarget);
  if (nativeResult) {
    return nativeResult;
  }

  const googleResult = await translateWithGoogle(cleanText, normalizedTarget);
  if (googleResult) {
    return googleResult;
  }

  const myMemoryResult = await translateWithMyMemory(cleanText, normalizedTarget);
  if (myMemoryResult) {
    return myMemoryResult;
  }

  warnTranslationFallback('No translation result returned by providers; using original text', normalizedTarget, cleanText.length);
  return text;
};
