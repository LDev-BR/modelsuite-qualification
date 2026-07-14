import test from 'node:test';
import assert from 'node:assert/strict';

import { getNextFocusableIndex } from './focus.js';

test('wraps focus movement inside a dialog', () => {
  assert.equal(getNextFocusableIndex(0, 3, -1), 2);
  assert.equal(getNextFocusableIndex(2, 3, 1), 0);
  assert.equal(getNextFocusableIndex(1, 3, 1), 2);
});

test('keeps focus index stable when no focusable elements exist', () => {
  assert.equal(getNextFocusableIndex(0, 0, 1), 0);
  assert.equal(getNextFocusableIndex(2, -1, -1), 2);
});
