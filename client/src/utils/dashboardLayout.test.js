import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const cssPath = resolve(dirname(fileURLToPath(import.meta.url)), '../index.css');
const css = readFileSync(cssPath, 'utf8');

const getRuleBlock = (selector) => {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`));

  return match?.[1] || '';
};

test('centers the dashboard progress value and label as one compact stack', () => {
  const progressRingRule = getRuleBlock('.command-progress-ring');

  assert.match(progressRingRule, /align-content:\s*center;/);
  assert.match(progressRingRule, /justify-items:\s*center;/);
  assert.doesNotMatch(progressRingRule, /place-items:\s*center;/);
});
