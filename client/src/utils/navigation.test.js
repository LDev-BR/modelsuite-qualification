import test from 'node:test';
import assert from 'node:assert/strict';

import { TALENT_NAV_ITEMS, TALENT_PAGE_ROUTES, TALENT_ROUTE_PATHS, TALENT_ROUTES } from './navigation.js';

test('talent sidebar links point to registered talent routes', () => {
  const routePaths = new Set(TALENT_ROUTE_PATHS);

  for (const item of TALENT_NAV_ITEMS) {
    assert.equal(routePaths.has(item.path), true, `${item.path} is missing from talent routes`);
  }

  assert.equal(routePaths.has('/talent/tasks'), true);
});

test('talent dashboard and task routes resolve to distinct page surfaces', () => {
  const pageByPath = Object.fromEntries(
    TALENT_PAGE_ROUTES.map((route) => [route.path, route.page]),
  );

  assert.equal(pageByPath[TALENT_ROUTES.dashboard], 'dashboard');
  assert.equal(pageByPath[TALENT_ROUTES.tasks], 'tasks');
});
