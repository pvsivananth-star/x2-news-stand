/** Categories shown as Settings switches. "district" was removed; local covers the city. */
export type CategoryId =
  | 'top-stories'
  | 'local'
  | 'national'
  | 'world'
  | 'markets'
  | 'business'
  | 'technology'
  | 'science'
  | 'health-medical'
  | 'politics'
  | 'sports'
  | 'entertainment'
  | 'lifestyle'
  | 'viral-trending';

export const ALL_CATEGORIES: readonly CategoryId[] = [
  'top-stories', 'local', 'national', 'world', 'markets', 'business', 'technology',
  'science', 'health-medical', 'politics', 'sports', 'entertainment', 'lifestyle',
  'viral-trending',
];

export interface SourceLink {
  sourceName: string;
  url: string;
}

/** One item as published by a single feed. Text is kept exactly as published. */
export interface RawItem {
  title: string;
  url: string;
  sourceName: string;
  publishedAt: number; // epoch ms
  categories: CategoryId[];
}

/** One card after duplicate merging. Every card credits its sources and links to them. */
export interface Article {
  id: string;
  title: string;
  url: string;
  sourceLinks: SourceLink[];
  publishedAt: number;
  categories: CategoryId[];
}
