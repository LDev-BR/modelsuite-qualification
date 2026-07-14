export const ADMIN_ONBOARDING_STEPS = [
  {
    id: 'dashboard',
    title: 'Read the control room',
    eyebrow: 'Step 1',
    description: 'Start on the dashboard to see open work, submitted deliverables, approvals, and where attention is needed.',
    actionLabel: 'Open Dashboard',
    route: '/admin/dashboard',
    checklist: ['Check open task volume', 'Review submitted work', 'Use quick actions for the next workflow'],
  },
  {
    id: 'tasks',
    title: 'Create and assign work',
    eyebrow: 'Step 2',
    description: 'Use Tasks to publish onboarding work, set due dates, add rewards, and assign tasks to available talent.',
    actionLabel: 'Open Tasks',
    route: '/admin/tasks',
    checklist: ['Create a task', 'Assign a talent or leave it open', 'Track status changes'],
  },
  {
    id: 'talents',
    title: 'Monitor talent capacity',
    eyebrow: 'Step 3',
    description: 'Use Talents to compare profiles, active assignments, submissions, and who is ready for more work.',
    actionLabel: 'Open Talents',
    route: '/admin/talents',
    checklist: ['Scan workload', 'Spot incomplete profiles', 'Match talent to task needs'],
  },
  {
    id: 'submissions',
    title: 'Review and close the loop',
    eyebrow: 'Step 4',
    description: 'Use Submissions to inspect uploaded work, approve strong submissions, or reject with clear review status.',
    actionLabel: 'Open Submissions',
    route: '/admin/submissions',
    checklist: ['Open submitted work', 'Approve or reject', 'Keep talent feedback timely'],
  },
];

export const getAdminOnboardingStorageKey = (user) => {
  const identity = user?._id || user?.email || 'global';
  return `modelsuite.adminOnboarding.${identity}`;
};

export const shouldShowAdminOnboarding = (user, storage = globalThis.localStorage) => {
  if (!storage) return true;

  return storage.getItem(getAdminOnboardingStorageKey(user)) !== 'completed';
};

export const markAdminOnboardingComplete = (user, storage = globalThis.localStorage) => {
  storage?.setItem(getAdminOnboardingStorageKey(user), 'completed');
};

export const getNextAdminOnboardingStep = (currentIndex) => (
  Math.min(currentIndex + 1, ADMIN_ONBOARDING_STEPS.length - 1)
);

export const getPreviousAdminOnboardingStep = (currentIndex) => (
  Math.max(currentIndex - 1, 0)
);
