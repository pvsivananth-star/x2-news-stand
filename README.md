# x2-news-stand

A free, open-source, ad-free news reader for iOS and Android.
Serverless: no backend, no paid API keys. News is fetched directly from public RSS feeds.

## Status
Early scaffold. Feed sources are being verified (see `sources.json`).

## Features (v1 target)
- Categories: local, district, national, science, tech, IT, market, sports
- Top 10 on cold start from cache, background refresh every 30 minutes
- Tap a card for a summary modal and "Open article"
- Bookmarks, share, dark mode, accessibility support
- English only in v1

## Run locally
```
npm install
npx expo start
```
Use a development build or Expo Go on a device.

## Docs
- `requirements.md`: product spec
- `architecture.md`: structure and rules
- `AGENTS.md`: guidance for AI coding tools
- `sources.json`: feed registry

## License
MIT. See `LICENSE`.
