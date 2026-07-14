export const TALENT_ROUTES = {
  dashboard: '/talent/dashboard',
  tasks: '/talent/tasks',
};

export const TALENT_ROUTE_PATHS = Object.values(TALENT_ROUTES);

export const TALENT_PAGE_ROUTES = [
  { path: TALENT_ROUTES.dashboard, page: 'dashboard' },
  { path: TALENT_ROUTES.tasks, page: 'tasks' },
];

export const TALENT_NAV_ITEMS = [
  { key: 'dashboard', label: 'My Dashboard', path: TALENT_ROUTES.dashboard },
  { key: 'tasks', label: 'My Tasks', path: TALENT_ROUTES.tasks },
];
