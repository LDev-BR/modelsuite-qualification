import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const readSource = (relativePath) => readFile(new URL(relativePath, import.meta.url), 'utf8');

const getLogoutSvgTag = (source) => {
  const match = source.match(/const IconLogout = \(\) => \(\s*(<svg\b[^>]*>)/);

  assert.ok(match, 'IconLogout SVG tag not found');

  return match[1];
};

test('sidebar logout SVGs serialize as standalone image data URLs', async () => {
  const sidebarPaths = [
    '../components/talent/TalentSidebar.jsx',
    '../components/admin/Sidebar.jsx',
  ];

  for (const sidebarPath of sidebarPaths) {
    const source = await readSource(sidebarPath);

    assert.match(
      getLogoutSvgTag(source),
      /xmlns=["']http:\/\/www\.w3\.org\/2000\/svg["']/,
      `${sidebarPath} logout icon should include the SVG namespace`,
    );
  }
});
