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
    url: 'https://tamil.oneindia.com/news/tamil-nadu/heatwave-water-stress-warning-2026-123456.html',
    summary:
      'Officials said daytime temperatures remain above seasonal norms in several districts, with rural water boards prioritising emergency supplies and public health messaging.\n\nThe warning comes after a steady rise in power demand and a tighter water supply outlook in the region, prompting officials to reopen emergency cooling shelters and raise awareness for vulnerable residents.\n\nLocal authorities said the combination of sparse rainfall and prolonged heat could intensify fatigue and dehydration risks, especially for children, the elderly, and outdoor workers.',
    sourceName: 'Oneindia Tamil',
    sourceLinks: [{ name: 'Oneindia Tamil', url: 'https://tamil.oneindia.com/news/tamil-nadu/heatwave-water-stress-warning-2026-123456.html' }],
    publishedAt: now - 1000 * 60 * 25,
    category: 'top-stories',
    bookmarked: true,
  },
  {
    id: 'article-2',
    title: 'India’s startup funding shows signs of a steadier second half after a volatile quarter',
    url: 'https://www.news18.com/india/startup-funding-steadies-in-second-half-2026-123456',
    summary:
      'Analysts noted that early-stage rounds remained selective even as larger deals edged back into the market, creating a more cautious but healthier capital environment for founders.\n\nInvestors said better revenue visibility and a narrower focus on efficiency are giving startups a clearer path to funding, particularly in AI, enterprise software, and climate technology.\n\nThe wider market still expects more discipline in pricing and valuations, but the tone is more stable than during the sharper contraction seen earlier in the year.',
    sourceName: 'News18 India',
    sourceLinks: [{ name: 'News18 India', url: 'https://www.news18.com/india/startup-funding-steadies-in-second-half-2026-123456' }],
    publishedAt: now - 1000 * 60 * 58,
    category: 'national',
  },
  {
    id: 'article-3',
    title: 'Global markets rally as investors weigh cooling inflation and better earnings',
    url: 'https://www.bbc.com/news/business-64728000',
    summary:
      'Broad gains across banks, technology, and commodities lifted sentiment after traders priced in a more gradual path for interest rates in major economies.\n\nInvestors were encouraged by steady inflation readings and encouraging company reports, while industrial demand and consumer spending remained resilient in several markets.\n\nThe rally still depends on how central banks respond to the next earnings cycle, but early moves suggest traders are leaning toward a softer landing in growth.',
    sourceName: 'BBC News',
    sourceLinks: [{ name: 'BBC News', url: 'https://www.bbc.com/news/business-64728000' }],
    publishedAt: now - 1000 * 60 * 137,
    category: 'markets',
  },
  {
    id: 'article-4',
    title: 'Scientists track a rare atmospheric pattern linked to earlier monsoon moisture',
    url: 'https://www.thehindu.com/sci-tech/science/monsoon-moisture-patterns-2026/article123456',
    summary:
      'Researchers said the shift could help meteorologists improve short-range crop and water forecasts in regions that depend on carefully timed rainfall.\n\nThe pattern was linked to changing wind flow and cloud movement across the subcontinent, which may explain why some areas received moisture earlier than expected.\n\nForecast teams said the trend could become especially relevant for agriculture and flood planning as extreme weather events continue to arrive in shorter bursts.',
    sourceName: 'The Hindu',
    sourceLinks: [{ name: 'The Hindu', url: 'https://www.thehindu.com/sci-tech/science/monsoon-moisture-patterns-2026/article123456' }],
    publishedAt: now - 1000 * 60 * 190,
    category: 'science',
  },
  {
    id: 'article-5',
    title: 'Tamil film makers lean on regional stories and social themes to win audiences',
    url: 'https://tamil.filmibeat.com/news/tamil-film-makers-regional-stories-win-audiences-2026-123456.html',
    summary:
      'A wave of sharply scoped, grounded dramas is driving a lift in occupancy for smaller productions that are finding audiences beyond big-budget spectacle releases.\n\nWriters and directors are increasingly focusing on community tensions, urban migration, and everyday realism, which is helping regional films feel distinct and current.\n\nThe shift has given smaller and mid-budget films a stronger foothold in multiplexes, where audiences appear to be rewarding emotionally grounded storytelling over scale alone.',
    sourceName: 'Filmibeat Tamil',
    sourceLinks: [{ name: 'Filmibeat Tamil', url: 'https://tamil.filmibeat.com/news/tamil-film-makers-regional-stories-win-audiences-2026-123456.html' }],
    publishedAt: now - 1000 * 60 * 210,
    category: 'entertainment',
  },
  {
    id: 'article-6',
    title: 'New EV charging hubs expand across tier-2 cities as adoption rises',
    url: 'https://tamil.gizbot.com/electric-vehicles/ev-charging-hubs-tier-2-cities-2026-123456',
    summary:
      'Urban planners and private operators say the new sites reduce range anxiety for commuters and are keeping pace with a rapid rise in electric two-wheel sales.\n\nThe expansion is especially significant in corridor towns where transport demand is growing faster than the existing charging network can support.\n\nAnalysts say the next phase will depend on grid reliability, pricing consistency, and government backing for public charging infrastructure in smaller urban centres.',
    sourceName: 'Gizbot Tamil',
    sourceLinks: [{ name: 'Gizbot Tamil', url: 'https://tamil.gizbot.com/electric-vehicles/ev-charging-hubs-tier-2-cities-2026-123456' }],
    publishedAt: now - 1000 * 60 * 345,
    category: 'technology',
  },
  {
    id: 'article-7',
    title: 'Local sports clubs push youth training programmes after strong school tournament turnout',
    url: 'https://tamil.mykhel.com/sports/local-sports-clubs-youth-training-programmes-2026-123456',
    summary:
      'Coaches said the increase in athlete participation reflects a wider push to keep children active while improving talent pipelines in district-level leagues.\n\nClubs are adding training camps, recovery support, and structured routines for younger players, making it easier for schools and local academies to push talent through a longer pathway.\n\nThe increase in local participation has also been credited with stronger community engagement and a rise in grassroots support for weekend matches.',
    sourceName: 'Mykhel Tamil',
    sourceLinks: [{ name: 'Mykhel Tamil', url: 'https://tamil.mykhel.com/sports/local-sports-clubs-youth-training-programmes-2026-123456' }],
    publishedAt: now - 1000 * 60 * 420,
    category: 'sports',
  },
  {
    id: 'article-8',
    title: 'Primary healthcare spending grows as district hospitals add specialist clinics',
    url: 'https://tamil.goodreturns.in/healthcare/district-hospitals-specialist-clinics-2026-123456',
    summary:
      'Health administrators said the focus on preventative care and faster diagnostics is helping local communities receive earlier treatment for chronic conditions.\n\nSeveral district hospitals are adding specialist consultation slots and focused screening programmes, improving access without forcing patients to travel long distances for routine care.\n\nOfficials said the effort is part of a wider push to reduce emergency load and catch chronic illnesses before they become severe or expensive to treat.',
    sourceName: 'Goodreturns Tamil',
    sourceLinks: [{ name: 'Goodreturns Tamil', url: 'https://tamil.goodreturns.in/healthcare/district-hospitals-specialist-clinics-2026-123456' }],
    publishedAt: now - 1000 * 60 * 500,
    category: 'health-medical',
  },
  {
    id: 'article-9',
    title: 'Reuters says global shipping lanes face fresh pressure from weather and geopolitical risk',
    url: 'https://www.reuters.com/world/global-shipping-risk-weather-geopolitics-2026-123456',
    summary:
      'Analysts at Reuters said shipping firms are re-routing cargo amid rising insurance costs and volatile weather conditions, with some routes seeing slower deliveries and higher fuel spending.\n\nThe report underscores how supply chains remain sensitive to conflict zones, port bottlenecks, and unusually sharp swings in demand across regional trade networks.\n\nExecutives said the cost of resiliency is now a central consideration for importers and exporters looking to keep inventories and deadlines stable.',
    sourceName: 'Reuters',
    sourceLinks: [{ name: 'Reuters', url: 'https://www.reuters.com/world/global-shipping-risk-weather-geopolitics-2026-123456' }],
    publishedAt: now - 1000 * 60 * 18,
    category: 'world',
  },
  {
    id: 'article-10',
    title: 'Bloomberg tracks a rebound in clean-energy investment as power demand climbs',
    url: 'https://www.bloomberg.com/news/articles/clean-energy-investment-power-demand-rise-2026-123456',
    summary:
      'Bloomberg reported that utilities and infrastructure funds are leaning into storage, grid upgrades, and solar capacity as electricity demand rises from data centres, electric mobility, and manufacturing.\n\nAnalysts said the capital cycle is still uneven, but investor appetite improved after a period of slower project approvals and higher financing costs.\n\nThe shift suggests the next phase of expansion will favour projects that can deliver predictable returns as power demand becomes more volatile and less seasonal.',
    sourceName: 'Bloomberg',
    sourceLinks: [{ name: 'Bloomberg', url: 'https://www.bloomberg.com/news/articles/clean-energy-investment-power-demand-rise-2026-123456' }],
    publishedAt: now - 1000 * 60 * 44,
    category: 'business',
  },
  {
    id: 'article-11',
    title: 'BBC News examines how AI is changing newsroom workflow and public trust',
    url: 'https://www.bbc.com/news/technology-64728001',
    summary:
      'BBC reporters said AI tools are helping editors summarise long briefs, draft first-pass copy, and speed up fact-checking, although human oversight remains central to newsroom standards.\n\nMedia groups said the challenge is not only efficiency but trust, because audiences increasingly expect transparency over how stories are assembled and checked.\n\nThe shift has prompted new editorial guidelines focused on disclosure, source verification, and the use of machine-generated summaries in sensitive reporting contexts.',
    sourceName: 'BBC News',
    sourceLinks: [{ name: 'BBC News', url: 'https://www.bbc.com/news/technology-64728001' }],
    publishedAt: now - 1000 * 60 * 66,
    category: 'technology',
  },
  {
    id: 'article-12',
    title: 'CNBC reports that chipmakers expand output as AI demand keeps infrastructure spending high',
    url: 'https://www.cnbc.com/2026/10/22/chipmakers-expand-output-ai-demand.html',
    summary:
      'CNBC said semiconductor firms are increasing production across several manufacturing hubs as orders remain elevated for data-centre processors, edge chips, and memory components.\n\nExecutives pointed to sustained investment in AI infrastructure, which is keeping yields and capacity utilisation above typical seasonal levels.\n\nIndustry watchers said the supply picture remains tight in premium components, with pricing power still unusually strong for advanced chips used in model training and inference workloads.',
    sourceName: 'CNBC',
    sourceLinks: [{ name: 'CNBC', url: 'https://www.cnbc.com/2026/10/22/chipmakers-expand-output-ai-demand.html' }],
    publishedAt: now - 1000 * 60 * 92,
    category: 'technology',
  },
  {
    id: 'article-13',
    title: 'Federal leaders debate infrastructure and tax relief as growth expectations hold steady',
    url: 'https://www.reuters.com/world/us/federal-leaders-infrastructure-tax-relief-2026-123456',
    summary:
      'Policy talks remained focused on public spending resilience, tax relief for households, and incentives for industrial expansion across key transport corridors.\n\nEconomists said the debate reflects a wider view that growth is stable but uneven, requiring targeted support rather than broad fiscal shocks.\n\nInvestors are now watching how quickly legislative priorities translate into execution, especially where infrastructure and logistics spending can support output across the country.',
    sourceName: 'Reuters',
    sourceLinks: [{ name: 'Reuters', url: 'https://www.reuters.com/world/us/federal-leaders-infrastructure-tax-relief-2026-123456' }],
    publishedAt: now - 1000 * 60 * 120,
    category: 'politics',
  },
  {
    id: 'article-14',
    title: 'Oil and gas traders watch price volatility as inventories and demand expectations shift',
    url: 'https://www.bloomberg.com/news/articles/oil-gas-traders-price-volatility-demand-shift-2026-123456',
    summary:
      'Bloomberg reported that traders are reacting to a mixed picture of inventories, refinery throughput, and regional spot demand, keeping crude price moves sharply reactive to weekly data.\n\nEnergy analysts said a softer pace in industrial output is offset by transport demand and shipping constraints, creating an unstable but manageable market backdrop.\n\nThe volatility is encouraging more hedging among producers and consumers, even as longer-horizon investment remains guided by broader decarbonisation and supply resilience plans.',
    sourceName: 'Bloomberg',
    sourceLinks: [{ name: 'Bloomberg', url: 'https://www.bloomberg.com/news/articles/oil-gas-traders-price-volatility-demand-shift-2026-123456' }],
    publishedAt: now - 1000 * 60 * 166,
    category: 'markets',
  },
];
