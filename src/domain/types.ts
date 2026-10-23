export type CategoryId =
  | 'top-stories'
  | 'local'
  | 'district'
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
  'top-stories',
  'local',
  'district',
  'national',
  'world',
  'markets',
  'business',
  'technology',
  'science',
  'health-medical',
  'politics',
  'sports',
  'entertainment',
  'lifestyle',
  'viral-trending',
];

export interface SourceLink {
  name?: string;
  sourceName?: string;
  url: string;
}

export interface RawItem {
  title: string;
  url: string;
  sourceName: string;
  publishedAt: number;
  categories: CategoryId[];
  summary?: string;
}

export interface Article {
  id: string;
  title: string;
  url?: string;
  summary?: string;
  sourceName?: string;
  sourceLinks: SourceLink[];
  publishedAt: number;
  category?: CategoryId;
  categories?: CategoryId[];
  bookmarked?: boolean;
  imageUrl?: string;
  content?: string;
}

export interface Source {
  id: string;
  name: string;
  language: string;
  category: CategoryId;
  type: 'rss' | 'google-news-search';
  url: string;
  status: 'unverified' | 'verified' | 'disabled';
}
