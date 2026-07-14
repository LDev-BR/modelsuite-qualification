import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveInitialTheme, isThemeName } from './theme.js';

test('uses a stored light or dark preference before the system theme', () => {
  assert.equal(
    resolveInitialTheme({ storedTheme: 'dark', systemPrefersDark: false }),
    'dark',
  );
  assert.equal(
    resolveInitialTheme({ storedTheme: 'light', systemPrefersDark: true }),
    'light',
  );
});

test('falls back to the system preference when no valid stored theme exists', () => {
  assert.equal(
    resolveInitialTheme({ storedTheme: null, systemPrefersDark: true }),
    'dark',
  );
  assert.equal(
    resolveInitialTheme({ storedTheme: 'midnight', systemPrefersDark: false }),
    'light',
  );
});

test('recognizes only supported theme names', () => {
  assert.equal(isThemeName('light'), true);
  assert.equal(isThemeName('dark'), true);
  assert.equal(isThemeName('system'), false);
  assert.equal(isThemeName(undefined), false);
});
