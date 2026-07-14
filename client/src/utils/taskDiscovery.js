import { formatRewardAmount } from './talentTasks.js';

export const DISCOVERY_FILTER_ALL = 'all';

const DISCOVERY_CATEGORIES = [
  {
    id: 'design',
    label: 'Design',
    tone: 'mint',
    keywords: ['brand', 'identity', 'logo', 'figma', 'palette', 'typography', 'design', 'visual'],
  },
  {
    id: 'research',
    label: 'Research',
    tone: 'blue',
    keywords: ['research', 'analysis', 'market', 'competitor', 'recommendation', 'report'],
  },
  {
    id: 'video',
    label: 'Video',
    tone: 'violet',
    keywords: ['video', 'record', 'series', 'walkthrough'],
  },
  {
    id: 'growth',
    label: 'Growth',
    tone: 'amber',
    keywords: ['social', 'linkedin', 'twitter', 'instagram', 'campaign', 'launch'],
  },
  {
    id: 'content',
    label: 'Content',
    tone: 'rose',
    keywords: ['write', 'copy', 'content', 'calendar', 'draft', 'page'],
  },
  {
    id: 'operations',
    label: 'Ops',
    tone: 'slate',
    keywords: ['onboarding', 'workflow', 'process', 'task', 'portal'],
  },
];

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const toPublicCategory = ({ id, label, tone }) => ({ id, label, tone });

const normalizeText = (task = {}) => `${task.title || ''} ${task.description || ''}`.toLowerCase();

const formatDiscoveryDate = (raw) => {
  if (!raw) return null;

  const dateOnlyMatch = DATE_ONLY_PATTERN.exec(raw);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    const monthIndex = Number(month) - 1;

    if (MONTH_LABELS[monthIndex]) {
      return `${MONTH_LABELS[monthIndex]} ${Number(day)}, ${year}`;
    }
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const inferTaskCategory = (task = {}) => {
  const text = normalizeText(task);
  const category = DISCOVERY_CATEGORIES.find((current) =>
    current.keywords.some((keyword) => text.includes(keyword)),
  );

  return toPublicCategory(category || DISCOVERY_CATEGORIES[DISCOVERY_CATEGORIES.length - 1]);
};

const enrichTask = (task) => {
  const matchedCategory = DISCOVERY_CATEGORIES.find((category) => category.id === inferTaskCategory(task).id);

  return {
    ...task,
    discovery: {
      category: toPublicCategory(matchedCategory),
      rewardLabel: formatRewardAmount(task.rewardAmount),
      dueLabel: formatDiscoveryDate(task.dueDate),
    },
  };
};

const buildFilters = (tasks) => [
  {
    id: DISCOVERY_FILTER_ALL,
    label: 'All',
    tone: 'all',
    count: tasks.length,
  },
  ...DISCOVERY_CATEGORIES.map((category) => ({
    id: category.id,
    label: category.label,
    tone: category.tone,
    count: tasks.filter((task) => task.discovery.category.id === category.id).length,
  })),
];

export const getTaskDiscoveryModel = (tasks = [], requestedFilter = DISCOVERY_FILTER_ALL) => {
  const enrichedTasks = Array.isArray(tasks) ? tasks.map(enrichTask) : [];
  const filters = buildFilters(enrichedTasks);
  const matchingFilter = filters.find((filter) => filter.id === requestedFilter && filter.count > 0);
  const activeFilter = matchingFilter ? matchingFilter.id : DISCOVERY_FILTER_ALL;
  const visibleTasks = activeFilter === DISCOVERY_FILTER_ALL
    ? enrichedTasks
    : enrichedTasks.filter((task) => task.discovery.category.id === activeFilter);
  const [featuredTask = null, ...gridTasks] = visibleTasks;

  return {
    activeFilter,
    totalCount: enrichedTasks.length,
    filters,
    visibleTasks,
    featuredTask,
    gridTasks,
  };
};
