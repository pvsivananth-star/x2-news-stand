export type CategoryId =
  | 'local' | 'district' | 'national' | 'science'
  | 'tech' | 'it' | 'market' | 'sports';

export interface Article {
  id: string;          // stable hash of canonical URL
  title: string;
  teaser: string;      // plain text, HTML stripped
  url: string;         // link to original publisher
  sourceName: string;
  publishedAt: number; // epoch ms
  category: CategoryId;
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
