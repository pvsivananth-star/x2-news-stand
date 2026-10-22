import type { Article, CategoryId } from '@/src/domain/types';

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

const now = Date.now();

export const FEED_ARTICLES: Article[] = [
  {
    id: 'article-1',
    title: 'Tamil Nadu braces for another heatwave as districts warn of water stress',
    summary:
      'Officials said daytime temperatures remain above seasonal norms in several districts while rural water boards have been asked to prioritise emergency supplies and public health messaging.',
    sourceName: 'Oneindia Tamil',
    sourceLinks: [{ name: 'Oneindia Tamil', url: 'https://tamil.oneindia.com/' }],
    publishedAt: now - 1000 * 60 * 25,
    category: 'top-stories',
    bookmarked: true,
  },
  {
    id: 'article-2',
    title: 'India’s startup funding shows signs of a steadier second half after a volatile quarter',
    summary:
      'Analysts noted that early-stage rounds remained selective even as larger deals edged back into the market, creating a more cautious but healthier capital environment for founders.',
    sourceName: 'News18 India',
    sourceLinks: [{ name: 'News18 India', url: 'https://www.news18.com/' }],
    publishedAt: now - 1000 * 60 * 58,
    category: 'national',
  },
  {
    id: 'article-3',
    title: 'Global markets rally as investors weigh cooling inflation and better earnings',
    summary:
      'Broad gains across banks, technology, and commodities lifted sentiment after traders priced in a more gradual path for interest rates in major economies.',
    sourceName: 'BBC News',
    sourceLinks: [{ name: 'BBC News', url: 'https://www.bbc.com/news' }],
    publishedAt: now - 1000 * 60 * 137,
    category: 'markets',
  },
  {
    id: 'article-4',
    title: 'Scientists track a rare atmospheric pattern linked to earlier monsoon moisture',
    summary:
      'Researchers said the shift could help meteorologists improve short-range crop and water forecasts in regions that depend on carefully timed rainfall.',
    sourceName: 'The Hindu',
    sourceLinks: [{ name: 'The Hindu', url: 'https://www.thehindu.com/' }],
    publishedAt: now - 1000 * 60 * 190,
    category: 'science',
  },
  {
    id: 'article-5',
    title: 'Tamil film makers lean on regional stories and social themes to win audiences',
    summary:
      'A wave of sharply scoped, grounded dramas is driving a lift in occupancy for smaller productions that are finding audiences beyond big-budget spectacle releases.',
    sourceName: 'Filmibeat Tamil',
    sourceLinks: [{ name: 'Filmibeat Tamil', url: 'https://tamil.filmibeat.com/' }],
    publishedAt: now - 1000 * 60 * 210,
    category: 'entertainment',
  },
  {
    id: 'article-6',
    title: 'New EV charging hubs expand across tier-2 cities as adoption rises',
    summary:
      'Urban planners and private operators say the new sites reduce range anxiety for commuters and are keeping pace with a rapid rise in electric two-wheel sales.',
    sourceName: 'Gizbot Tamil',
    sourceLinks: [{ name: 'Gizbot Tamil', url: 'https://tamil.gizbot.com/' }],
    publishedAt: now - 1000 * 60 * 345,
    category: 'technology',
  },
  {
    id: 'article-7',
    title: 'Local sports clubs push youth training programmes after strong school tournament turnout',
    summary:
      'Coaches said the increase in athlete participation reflects a wider push to keep children active while improving talent pipelines in district-level leagues.',
    sourceName: 'Mykhel Tamil',
    sourceLinks: [{ name: 'Mykhel Tamil', url: 'https://tamil.mykhel.com/' }],
    publishedAt: now - 1000 * 60 * 420,
    category: 'sports',
  },
  {
    id: 'article-8',
    title: 'Primary healthcare spending grows as district hospitals add specialist clinics',
    summary:
      'Health administrators said the focus on preventative care and faster diagnostics is helping local communities receive earlier treatment for chronic conditions.',
    sourceName: 'Goodreturns Tamil',
    sourceLinks: [{ name: 'Goodreturns Tamil', url: 'https://tamil.goodreturns.in/' }],
    publishedAt: now - 1000 * 60 * 500,
    category: 'health-medical',
  },
];
