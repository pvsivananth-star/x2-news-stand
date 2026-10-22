# AGENTS.md

Guidance for AI coding agents working in `x2-forex-app`.

## 1. Access Rules

- **Read:** Agents may read the whole repository.
- **Write:** Agents may edit files and commit only on a local dev branch named `dev/<short-topic>`, created from `main`.
- **Owner-only actions:** Agents must not push, merge, rebase, reset, force anything, open pull requests, or touch `main`. The owner pushes and opens PRs.
- **Dirty tree:** If `git status` shows changes you did not make, stop and ask before editing.

## 2. Source of Truth

- `requirements.md`: product behaviour.
- `architecture.md`: structure and rules.
- If code and these documents disagree, stop and ask the owner. Do not choose one silently.

## 3. Architecture and React Standards

- Follow feature-based / domain-driven structure. Keep UI presentation, custom hooks (logic), and services (data access) separate.
- No source file may exceed 600 lines. Split components into single-responsibility pieces.
- Strict TypeScript. Never use `any`. Define explicit interfaces for component props, API payloads, and state.
- Avoid inline arrow functions and inline object literals in JSX where they cause avoidable re-renders. Use stable handlers and styles.
- Screens never import services, storage, or HTTP code directly. Use the service layer.

## 4. Codebase Inspection

- Inspect the relevant code and dependencies before changing anything. Do not assume behaviour.
- For shared code, trace all callers. Previous cleanups broke FX, crypto, metals, and UI flows.
- Identify the root cause before proposing a fix. No speculative fixes.

## 5. Implementation

- Deliver complete replacement files, not partial snippets, unless the owner asks otherwise.
- Do not add a dependency without stating why and which version.
- Never fabricate market prices. If data is unavailable, use valid cache if it exists; otherwise show an unavailable state.
- Define each currency, metal, and crypto asset in one catalog only.

## 6. Verification

- A passing `tsc --noEmit` is not enough.
- Before reporting a change as ready, confirm that the app starts (`npx expo start`) and that modules resolve for both iOS and Android bundling.
- If you cannot run a check, say so explicitly. Do not report it as passing.

## 7. Commands

- Give only commands that are needed for the task.
- Do not include `git fetch`, `git pull`, `git reset`, or repeated status checks unless a failure requires them.

## 8. Response Style

- Be concise. Give the actionable steps, not background.
