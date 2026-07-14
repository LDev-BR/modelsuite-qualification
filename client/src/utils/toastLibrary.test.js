import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const readSource = (relativePath) => readFile(new URL(relativePath, import.meta.url), 'utf8');

test('toast context delegates app notifications to Sonner', async () => {
  const source = await readSource('../context/ToastContext.jsx');

  assert.match(source, /from ['"]sonner['"]/);
  assert.match(source, /<Toaster\b/);
  assert.doesNotMatch(source, /alert\s*\(/);
  assert.doesNotMatch(source, /useState/);
  assert.doesNotMatch(source, /toast-stack/);
});

test('client declares Sonner as the toast dependency', async () => {
  const packageJson = JSON.parse(await readSource('../../package.json'));

  assert.equal(typeof packageJson.dependencies?.sonner, 'string');
});
