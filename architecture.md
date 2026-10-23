# Architecture: x2-news-stand

## Layers
```
UI (screens, components)
  -> application contracts (INewsService, IPersistenceService)
  -> custom hooks
  -> services (cache, refresh orchestration)
  -> source adapters (RSS, Google News search)
  -> external feeds
```

## Rules
1. Screens never import adapters, MMKV, or fetch.
2. Concrete implementations are wired only in `src/config/composition.ts`.
3. Adapters normalize feed data into `Article` before it reaches state.
4. A failed refresh keeps valid cached data and marks the category stale.
5. Each category has independent state. Refreshing one never changes another.
6. Pure functions (normalize, dedupe, rank) have no UI or storage dependencies.
7. Never fabricate items. Missing data shows an empty or unavailable state.
8. Article detail requests and summary extraction run in the service layer; raw article bodies are not persisted.

## Data flow
```
Feed URL -> Adapter -> normalize -> dedupe -> rank -> cache -> Zustand store -> UI
Article URL -> article-details service -> extractive summary + image URL -> hook -> UI
```

## Folders
- `app/`: Expo Router screens
- `src/domain/`: types and pure logic
- `src/services/`: contracts and orchestration
- `src/adapters/`: feed adapters (added in Phase 3)
- `src/config/`: sources and composition root
