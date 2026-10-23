import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shouldApplyHydratedTheme } from './themeHydration.ts';

test('allows persisted theme when no selection changed during hydration', () => {
  assert.equal(shouldApplyHydratedTheme(2, 2), true);
});

test('does not let an in-flight settings read overwrite a new theme selection', () => {
  assert.equal(shouldApplyHydratedTheme(2, 3), false);
});
