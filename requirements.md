# Requirements: x2-news-stand

Status: Draft v2. Items marked **OPEN** need an owner decision. Items marked **UNVERIFIED** are source candidates that must be checked before they go live.

## 1. Product Overview
- A free, open-source, ad-free news reader for iOS and Android.
- Serverless: no backend, no paid API keys, no user accounts.
- Fetching, parsing, summarising, and caching run on the device.
- Licence: MIT.

## 2. Goals and Non-Goals

**Goals (v1)**
- Show the latest headlines instantly on launch.
- Simple reading: each card shows the headline exactly as published, its source credit, and one tap to expand.
- Cover national, regional (Tamil), and specialist news, including entertainment, science, and viral stories.
- Settings that are simple: one screen, all categories on by default.

**Non-goals (v1)**
- Tabs or per-category navigation.
- Full-article reading inside the app (publisher pages open in the in-app browser instead).
- Instagram, TikTok, or other social-media content. Viral coverage comes from news publishers only.
- Astrology and horoscope content.
- AI-generated paraphrases. Expanded-card summaries are extractive and use only text from the original publisher page.
- Accounts, cross-device sync, push notifications.
- GPS location.
- Translation of content (deferred to v1.1).
- Page-flip animation (deferred to v1.1).

## 3. Navigation and Screens

### 3.1 Home
- No tabs. One continuous vertical feed with snap scrolling (`FlatList` with `snapToInterval`).
- Articles from all enabled categories, ranked together (see 4.3).
- Each card shows:
  - Headline (bold), exactly as the publisher wrote it.
  - Source credit: publisher name, linked to its article URL.
  - Relative time.
  - "→" control at the end to expand.

### 3.2 Expanded card (inline)
- Tapping "→" expands the card in place. The rest of the feed does not move away.
- The expanded card shows the headline exactly as published, then the list of sources.
- Each source appears as its publisher name (for example "BBC", "The Hindu", "Oneindia") linked to that article's URL. If an article has several sources, each one is listed and linked.
- Tapping a source link opens its article URL in the in-app browser (see 3.3).
- Tapping "→" again collapses the card.

### 3.3 In-app browser
- Opens publisher article pages inside the app, not in the external browser.
- Shows the publisher's page as published. Ads and pop-ups come from the publisher, and the app does not block or alter them.
- The app must tell the user, in Settings and in the store listing, that publisher pages may contain ads.
- Back and close controls are always visible.

### 3.4 Settings (gear icon)
- One gear icon, bottom-left. Opens the Settings screen. There is no separate burger menu.
- One screen. No nested sections and no sub-pages for categories.
- **Categories:** 14 on/off switches, all **on by default**. Switching a category off removes its articles from the feed. Switching it on restores them.
- **Turn all on:** one button that re-enables all categories.
- **Location:** city text field. Used by the Local category.
- **Refresh interval:** default 10 minutes (see O4).
- **Theme:** follows system by default. Options: system, light, dark.
- **Language:** English (read-only in v1).
- **About:** version, licence (MIT), privacy policy link, and the publisher-ads notice from 3.3.

### 3.5 States
- **Loading:** skeleton cards.
- **Empty (no articles at all):** message with a retry button.
- **Empty (all categories off):** message telling the user to turn a category on in Settings.
- **Error (no cache):** message with a retry button.
- **Offline with cache:** cached articles and a "Last updated <time>" banner.

### 3.6 Bookmarks and share
- Bookmark toggle on each card and in the expanded view. Bookmarks stored on-device and survive restart.
- Native share sheet shares the headline and the publisher's article link.

## 4. Content

### 4.1 Categories (Settings switches)
All 14 are on by default.

| # | Category | Covers |
|---|----------|--------|
| 1 | Top stories | Main headlines across all sources |
| 2 | Local | City news, from the user's city setting |
| 3 | National | India-wide news |
| 4 | World | International news |
| 5 | Markets | Equities and indices (EQ), bonds and rates, forex, commodities, metals, crypto, central banks |
| 6 | Business | Companies, economy, jobs, personal finance, earnings |
| 7 | Technology | Gadgets, software, AI, IT services, cybersecurity, automobiles and EVs |
| 8 | Science and space | Science, space and astronomy, environment, climate |
| 9 | Health and medical | Health, medical research, fitness, nutrition |
| 10 | Politics | Politics, elections, law and courts, government |
| 11 | Sports | Cricket, football, tennis, motorsport, other sports |
| 12 | Entertainment | Cinema and movies, TV, OTT, music, books, arts, celebrity |
| 13 | Lifestyle | Food and cooking, travel, fashion, home and garden, photography |
| 14 | Viral and trending | Viral stories, trending topics, human interest, news about social-media trends |

- Astrology is not a category and is excluded from all sources.

### 4.2 Subcategories
- Subcategories (for example cinema, TV, cricket, or EV) are **not** separate switches.
- Articles are matched to a subcategory by keyword within their parent category. Subcategory matches are used for ranking only.

### 4.3 Duplicate merging and ranking
- **Exact duplicates:** items with the same canonical URL merge into one article.
- **Near duplicates:** titles are normalised (lowercase, punctuation removed, common stop words removed), then compared by Jaccard similarity on their word sets. Titles at or above 0.6 merge into one article (see O3).
- A merged article keeps the primary title and lists every source in `sourceLinks`. The card shows "+N sources" where N is the number of other sources.
- **Score:** `sourceCount × 0.5^(ageInHours / 6)`.
- `sourceCount` is the number of sources reporting the story (1 if not merged).
- Ties break by newer `publishedAt`.
- A category that is switched off contributes no articles, so its items never receive a score.

### 4.4 Text as published
- Titles are shown exactly as the publisher's feed provides them.
- Cards show the publisher-provided feed description under the headline when available; descriptions are not rewritten.
- When a card is expanded, the app may fetch the linked public article page to create a concise extractive summary from its text and select its article image. The summary must not add facts or translate the source.
- The article body is processed in memory only; only the generated summary and image URL are kept in the active UI state.
- If the source page cannot be fetched or has insufficient article text, show an explicit unavailable/retry state rather than inventing content.

### 4.5 Viral and trending
- Sources: publisher feeds that cover viral and trending stories (for example News18 viral), and keyless Google News search feeds for trending topics.
- Google Trends daily trending RSS (`trends.google.com/trends/trendingsearches/daily/rss?geo=IN`) lists search terms, not articles. Each trending term is used as a Google News search query, so every card links to a publisher.
- Instagram, TikTok, and other social-media content are out of scope (no public feeds; terms restrict reuse).

### 4.6 Local
- Built from the user's city setting as a Google News search feed. The Local category also includes the local Tamil feeds listed in `feeds.json`.
- If no city is set, Local shows the empty state with a prompt to set one in Settings.

### 4.7 Data stored per article
- `id` (canonical URL), `title` (as published), `url` (publisher's link), `sourceLinks` (publisher name and URL for each source), `publishedAt`, `categories`.
- No teasers, descriptions, or full article bodies are stored.

## 5. Sources

The v1 feed list is in `feeds.json` (last checked 22 Oct 2026). Sections 5.2 and 5.3 are the research record; `feeds.json` is what the app reads.

### 5.1 Source rules
- The feed list lives in `feeds.json` in the project root, separate from the code, so it can be edited on its own. Each entry has `id`, `name`, `language`, `type` (`rss` or `google-news-search`), `url`, `categories`, `status`, `enabled`, and an optional `fallback` flag.
- `feeds.json` is the single source of truth for feeds. The earlier `sources.json` is superseded and should be removed once `feeds.json` is approved.
- A feed is live only when `enabled` is `true` and `status` is `working`. `working` means a successful fetch with items, checked by hand, and terms reviewed.
- Each source is accessed through an adapter. Adding or replacing a source must not change UI code.
- Google News search feeds are the fallback where a publisher has no working feed. Each article must show the original publisher's name.
- Duplicate URLs in the source list are removed before verification.

### 5.1a Public feeds, used as-is
- Use only feeds that are publicly available: no login, no API key, no paid subscription.
- Use each feed as published. No scraping of web pages, no paywall bypass, no rewriting of text.
- Every article credits its publisher by name and links to the publisher's article URL. This is required on every card and in the expanded view.
- Google News search feeds are allowed under the same rule. They must still credit the original publisher.

### 5.2 Verified sources
| Source | Feed | Categories | Notes |
|--------|------|-----------|-------|
| Oneindia Tamil (Tamil Nadu news) | `https://tamil.oneindia.com/rss/feeds/tamil-news-fb.xml` | Local, National, World, Politics | Verified: valid RSS 2.0, updated 13 Oct 2026. Titles are Tamil, shown as published. |

### 5.3 Candidate sources (UNVERIFIED)

**Tamil publishers**
| Publisher | Candidate feed | Categories | Status |
|-----------|---------------|-----------|--------|
| Oneindia Tamil (cinema) | `tamil.oneindia.com/rss/feeds/tamil-cinema-fb.xml` | Entertainment | Unverified |
| Oneindia Tamil (OTT) | `tamil.oneindia.com/rss/feeds/tamil-ott-fb.xml` | Entertainment | Unverified |
| Oneindia Tamil (technology) | `tamil.oneindia.com/rss/feeds/tamil-technology-fb.xml` | Technology | Unverified |
| Oneindia Tamil (automobiles) | `tamil.oneindia.com/rss/feeds/tamil-automobiles-fb.xml` | Technology | Unverified |
| Oneindia Tamil (AI) | `tamil.oneindia.com/rss/feeds/artificial-intelligence-fb.xml` | Technology | Unverified |
| Oneindia Tamil (health) | `tamil.oneindia.com/rss/feeds/tamil-health-fb.xml` | Health and medical | Unverified |
| Oneindia Tamil (education) | `tamil.oneindia.com/rss/feeds/tamil-education-fb.xml` | Science and space | Unverified |
| Oneindia Tamil (gold rate) | `tamil.oneindia.com/rss/feeds/oneindia-gold-rate-fb.xml` | Markets | Unverified |
| Oneindia Tamil (general) | `tamil.oneindia.com/rss/feeds/oneindia-tamil-fb.xml` | Top stories | Unverified (listed twice in source gist; keep once) |
| Goodreturns Tamil (money) | `tamil.goodreturns.in/rss/tamil-money-news-fb.xml` | Markets, Business | Unverified |
| Gizbot Tamil | `tamil.gizbot.com/rss/gizbot-tamil-fb.xml` | Technology | Unverified |
| Filmibeat Tamil | `tamil.filmibeat.com/rss/feeds/filmibeat-tamil-fb.xml` | Entertainment | Unverified |
| Mykhel Tamil | `tamil.mykhel.com/rss/feeds/mykhel-tamil-fb.xml` | Sports | Unverified |
| Asianet Tamil | `tamil.asianetnews.com/rss` | Top stories, National | Unverified |
| Vikatan (magazine) | `vikatan.com/stories.rss` | Lifestyle, Entertainment, Politics | Working (22 Oct 2026, 19 items), enabled. Topic mix unconfirmed. |
| Dinamalar | `rss.dinamalar.com/?cat=ara1` | Top stories | Unverified. The base URL `rss.dinamalar.com/` returned a search page, not a feed. |
| Dinamani | `dinamani.com/rss` | Top stories | Unverified. Could not be checked from here. |
| Hindu Tamil Thisai | `hindutamil.in/topic/rss` | Top stories | Unverified. Could not be checked from here. Legacy feedburner feeds (`Hindu_Tamil_india`, `Hindu_Tamil_world`) may be retired. |
| Daily Thanthi | none yet | Top stories | **Rejected** for `dailythanthi.com/topic/feed`: it is an HTML topic page with items from 2018 to 2023. A real feed URL must be found. |

**National and English publishers**
| Publisher | Candidate feed | Categories | Status |
|-----------|---------------|-----------|--------|
| News18 India | `news18.com/rss/india.xml` | National, Top stories | Unverified |
| News18 World | `news18.com/rss/world.xml` | World | Unverified |
| News18 Politics | `news18.com/commonfeeds/v1/eng/rss/politics.xml` | Politics | Unverified |
| News18 Sports | `news18.com/commonfeeds/v1/eng/rss/sports.xml` | Sports | Unverified |
| News18 Viral | `news18.com/commonfeeds/v1/eng/rss/viral.xml` | Viral and trending | Unverified |
| News18 Tamil National | `tamil.news18.com/commonfeeds/v1/tam/rss/national.xml` | National | Unverified |
| India Today | `indiatoday.in/rss/1206577` | National (topic unconfirmed) | Unverified |
| NDTV top stories | `feeds.feedburner.com/ndtvnews-top-stories` | Top stories | Unverified (feedburner, may be retired) |
| NDTV India | `feeds.feedburner.com/ndtvnews-india-news` | National | Unverified (feedburner, may be retired) |
| Times of India (3 feeds) | `timesofindia.indiatimes.com/rssfeeds/…` (IDs 2128936835, 1898055, 1081479906) | National, Politics (topics unconfirmed) | Unverified |
| The Hindu Sci-Tech Science | `thehindu.com/sci-tech/science/feeder/default.rss` | Science and space | Unverified. Section-level feed listed in source gist. |
| The Hindu International | `thehindu.com/news/international/feeder/default.rss` | World | Unverified. Listed as working by a third-party feed tracker on 3 Oct 2026; not yet checked in this project. |
| ANI National Politics | `aninews.in/rss/feed/category/national/politics.xml` | Politics | Unverified |
| Times of Israel | `timesofisrael.com/feed/` | World | Unverified |
| NYT World | `rss.nytimes.com/services/xml/rss/nyt/World.xml` | World | Unverified (English) |
| NYT US | `rss.nytimes.com/services/xml/rss/nyt/US.xml` | National | Unverified (English) |
| Google Trends (India daily) | `trends.google.com/trends/trendingsearches/daily/rss?geo=IN` | Viral and trending (signal only) | Unverified. Used as search terms, not as articles. |

**Excluded**
- `lemmy.world/feeds/c/technology.xml`: a user-community feed, not a publisher.
- Dailythanthi topic feed: see above.

**Also from earlier research (UNVERIFIED)**
- BBC News Tamil: `feeds.bbci.co.uk/tamil/rss.xml`
- The Hindu national, business, and sci-tech feeds (`thehindu.com/feeder/default.rss` and section feeds): a third-party tracker listed them as working on 3 October 2026. Not yet checked in this project.
- Bloomberg: `bloomberg.com/feeds/news.rss`, `markets/news.rss`, `technology/news.rss`. Terms for headlines in a free app are unconfirmed (O5).
- Reuters: no official RSS. Use a Google News search feed restricted to reuters.com (O2).

## 6. Accessibility
- Support system font scaling. Layouts must not clip text at large sizes.
- Every card, button, and source link has an `accessibilityLabel`.
- Touch targets at least 44pt.
- Text contrast at least 4.5:1 in light and dark themes.
- Status (live, offline, loading) is conveyed by text as well as colour.
- Expand and collapse announce their state to screen readers.

## 7. Performance
- Cold start: cached top items visible as soon as the first screen renders.
- Scrolling at 60 FPS on a mid-range Android device.
- Fetching, parsing, normalising, dedupe, and ranking run off the UI thread using `react-native-worklets-core`.
- No inline arrow functions or inline style objects in render paths. Card components are memoised.
- `FlatList` with `getItemLayout` where card height is fixed. Expanded cards are measured, not fixed.

## 8. Caching, Sync, and Offline
- Cache the latest result set in MMKV with a timestamp.
- Cold start: render cached items immediately. If no cache exists, show loading skeletons.
- Background refresh every 10 minutes while the app is open, plus pull-to-refresh.
- A failed refresh keeps valid cache and shows "Last updated <time>". Cache is never cleared on failure.
- Refreshes are independent per source. One failing source does not affect the others.

## 9. Privacy and Data
- No analytics, advertising identifiers, or tracking SDKs in v1.
- Network requests go only to configured feed hosts and the publisher pages a user opens.
- On-device data: settings, bookmarks, and cache. Nothing is uploaded.
- The privacy policy must say this, including that publisher pages may set their own cookies and ads.

## 10. Legal and Store Requirements
- Publish a privacy policy, linked from Settings and the store listing.
- Attribute every article to its publisher with name and link.
- Review each feed's terms of use before it is verified.
- Review current Google Play and Apple App Store news-app guidelines before submission.
- Include the MIT licence in the repo.

## 11. Acceptance Criteria (v1)

| # | Criterion | How to verify |
|---|-----------|---------------|
| A1 | Cold start shows cached items within 1 second | Relaunch on an emulator and one physical device |
| A2 | Interface has no tabs; one feed; gear icon opens Settings | Visual check |
| A3 | All 14 category switches are on by default | Fresh install |
| A4 | Turning a category off removes its articles; turning it on restores them | Toggle test |
| A5 | "Turn all on" re-enables every category | Toggle test |
| A6 | Card shows headline as published, source credit with link, time, and "→" | Visual check |
| A7 | "→" expands inline; source links appear at the end | Tap test |
| A8 | Source link opens the publisher page in the in-app browser | Tap test |
| A9 | Headlines remain as published; expanded summaries use only source-page text and are not translated | Compare 10 cards with the feed |
| A10 | Duplicate stories merge with "+N sources" | Unit test with fixture feeds |
| A11 | Ranking matches the formula in 4.3 | Unit test |
| A12 | Astrology items never appear | Check all sources and fixtures |
| A13 | Instagram or other social-media sources are not configured | Review `feeds.json` |
| A14 | Only feeds with `status: working` and `enabled: true` are fetched | Review `feeds.json` |
| A15 | Offline with cache shows items and "Last updated" | Airplane mode test |
| A16 | Refresh failure keeps cache | Force a network error |
| A17 | Bookmarks survive restart | Restart test |
| A18 | Local uses the saved city | Change setting, check feed URL |
| A19 | Font scaling at the largest size does not clip | Device setting test |
| A20 | Dark mode follows system by default | Toggle system theme |
| A21 | Scrolling stays at 60 FPS | Profiler on device |
| A22 | No full article bodies, teasers, or descriptions are stored | Code review of data model |
| A23 | Titles display exactly as published (no rewriting) | Compare card text with the feed |
| A24 | Every card and expanded view credits the publisher and links to its URL | Visual check on 10 items |
| A25 | Only public feeds without login or API keys are configured | Review `feeds.json` |

## 12. Open Decisions

| # | Decision | Default if not decided |
|---|----------|------------------------|
| O1 | Resolved 22 Oct 2026: cards use titles only, so teasers are not shown | Done |
| O2 | Reuters: Google News site-restricted search feed | Include via Google News, labelled with the publisher |
| O3 | Dedupe threshold for near-duplicate titles (4.3) | 0.6, tuned on real data |
| O4 | Resolved 22 Oct 2026: refresh interval is 10 minutes | Done |
| O5 | Bloomberg terms for headlines | Hold Bloomberg until terms are confirmed |
| O6 | Dinamani, Hindu Tamil Thisai, Dinamalar, and Daily Thanthi feed URLs | Stay unverified until a working feed is found |
| O7 | Viral and trending: how Google Trends terms become Google News search queries | Top 10 daily terms per refresh |
| O8 | Tamil-language sources in v1 | Included when verified, shown with their own language |
| O9 | Decoding markup entities (for example &amp;) for display only, wording unchanged | Decode entities only |
