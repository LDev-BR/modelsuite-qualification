export const ADMIN_ROUTES = {
  dashboard: '/admin/dashboard',
  tasks: '/admin/tasks',
  submissions: '/admin/submissions',
  talents: '/admin/talents',
};

export const ADMIN_ROUTE_PATHS = Object.values(ADMIN_ROUTES);

export const ADMIN_PAGE_ROUTES = [
  { path: ADMIN_ROUTES.dashboard, page: 'dashboard' },
  { path: ADMIN_ROUTES.tasks, page: 'tasks' },
  { path: ADMIN_ROUTES.submissions, page: 'submissions' },
  { path: ADMIN_ROUTES.talents, page: 'talents' },
];

export const ADMIN_NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', path: ADMIN_ROUTES.dashboard, icon: 'dashboard' },
  { key: 'tasks', label: 'Tasks', path: ADMIN_ROUTES.tasks, icon: 'tasks' },
  { key: 'submissions', label: 'Submissions', path: ADMIN_ROUTES.submissions, icon: 'submissions' },
  { key: 'talents', label: 'Talents', path: ADMIN_ROUTES.talents, icon: 'talents' },
];
