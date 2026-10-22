# AGENTS.md

Guidance for AI coding tools working in this repo.

- Stack: React Native + Expo, TypeScript (strict), Expo Router, Zustand, react-native-mmkv.
- Read `requirements.md` and `architecture.md` before changing code.
- Never fabricate news items, sources, or summaries.
- Screens depend on service interfaces, never on concrete RSS or HTTP code.
- Only the composition root (`src/config/composition.ts`) selects implementations.
- Keep pure logic (normalize, dedupe, rank) free of React and storage imports.
- Do not add paid APIs, API keys, or a backend.
- Do not push or open PRs. The owner does that.
