# Requirements: x2-news-stand

## Product
- Free, open-source, ad-free, serverless news reader (iOS, Android).
- No paid API keys, no backend.

## Content
- Categories: local, district, national, science, tech, IT, market, sports.
- Sources: public RSS feeds, and Google News search feeds where needed.
- Each article shows source name, publish time, and link to original.
- Do not store or redistribute full article bodies.

## Language
- English in v1. Translation deferred to v1.1 (ML Kit on-device, per-language model download).

## Behaviour
- Cold start renders cached top 10 immediately.
- Background refresh every 30 minutes.
- Offline: show cache with "Last updated" banner.
- Refresh failure never clears valid cache.
- Dedupe: merge exact URL duplicates and near-duplicate titles (token overlap ~0.6) into one card with "+N sources".
- Rank: source count x recency decay (6-hour half-life).

## UI
- Vertical snap scroll (FlatList with snapToInterval).
- Card: bold headline + short teaser.
- Tap: modal with cleaned summary, source, "Open article" (in-app browser).
- Settings: categories, city/district, refresh interval, language (English only in v1).
- Bookmarks stored locally. Native share sheet. System dark mode.
- Loading skeletons, empty, error states.

## Accessibility
- Font scaling, accessibilityLabel on cards, 44pt touch targets, contrast 4.5:1 minimum.

## Store and legal
- Publish a privacy policy (even with no data collection).
- Check current Google Play and App Store news guidelines before submission.
- Verify each feed's terms before shipping.
