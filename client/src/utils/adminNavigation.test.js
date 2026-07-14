import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ADMIN_NAV_ITEMS,
  ADMIN_PAGE_ROUTES,
  ADMIN_ROUTE_PATHS,
  ADMIN_ROUTES,
} from './adminNavigation.js';

test('admin sidebar links point to registered admin routes', () => {
  const routePaths = new Set(ADMIN_ROUTE_PATHS);

  for (const item of ADMIN_NAV_ITEMS) {
    assert.equal(routePaths.has(item.path), true, `${item.path} is missing from admin routes`);
  }

  assert.equal(routePaths.has('/admin/tasks'), true);
  assert.equal(routePaths.has('/admin/talents'), true);
});

test('admin task and talent routes resolve to distinct page surfaces', () => {
  const pageByPath = Object.fromEntries(
    ADMIN_PAGE_ROUTES.map((route) => [route.path, route.page]),
  );

  assert.equal(pageByPath[ADMIN_ROUTES.dashboard], 'dashboard');
  assert.equal(pageByPath[ADMIN_ROUTES.tasks], 'tasks');
  assert.equal(pageByPath[ADMIN_ROUTES.talents], 'talents');
  assert.equal(pageByPath[ADMIN_ROUTES.submissions], 'submissions');
});
