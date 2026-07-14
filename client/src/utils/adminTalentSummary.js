const REQUIRED_PROFILE_CHECKS = [
  (profile) => Boolean(profile.headline),
  (profile) => Boolean(profile.location),
  (profile) => Boolean(profile.availability),
  (profile) => Array.isArray(profile.skills) && profile.skills.length >= 2,
  (profile) => Array.isArray(profile.interests) && profile.interests.length >= 1,
  (profile) => Array.isArray(profile.workStyles) && profile.workStyles.length >= 1,
];

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

const getAssignedTalentId = (task = {}) => {
  if (!task.assignedTo) return null;
  if (typeof task.assignedTo === 'string') return task.assignedTo;

  return task.assignedTo._id || null;
};

const getDueTime = (task = {}) => {
  if (!task.dueDate) return Number.POSITIVE_INFINITY;

  const parsed = new Date(task.dueDate);
  return Number.isNaN(parsed.getTime()) ? Number.POSITIVE_INFINITY : parsed.getTime();
};

export const getProfileReadiness = (profile = {}) => {
  const normalizedProfile = {
    headline: normalizeText(profile.headline),
    location: normalizeText(profile.location),
    availability: normalizeText(profile.availability),
    skills: Array.isArray(profile.skills) ? profile.skills.map(normalizeText).filter(Boolean) : [],
    interests: Array.isArray(profile.interests) ? profile.interests.map(normalizeText).filter(Boolean) : [],
    workStyles: Array.isArray(profile.workStyles) ? profile.workStyles.map(normalizeText).filter(Boolean) : [],
  };
  const total = REQUIRED_PROFILE_CHECKS.length;
  const completed = REQUIRED_PROFILE_CHECKS.reduce(
    (count, isComplete) => count + (isComplete(normalizedProfile) ? 1 : 0),
    0,
  );

  return {
    completed,
    total,
    percentage: Math.round((completed / total) * 100),
    isReady: completed === total,
  };
};

const getWorkloadLabel = ({ active, inReview, total }) => {
  if (total === 0) return 'Available';
  if (inReview > 0) return 'In Review';
  if (active >= 2) return 'Busy';
  if (active > 0) return 'Active Work';

  return 'Available';
};

export const buildAdminTalentSummaries = (talents = [], tasks = []) => talents.map((talent) => {
  const assignedTasks = tasks.filter((task) => getAssignedTalentId(task) === talent._id);
  const taskStats = assignedTasks.reduce(
    (stats, task) => {
      const status = task.status || 'Open';

      if (status === 'Submitted') stats.inReview += 1;
      else if (status === 'Approved') stats.completed += 1;
      else if (status === 'Rejected') stats.rejected += 1;
      else stats.active += 1;

      return stats;
    },
    { total: assignedTasks.length, active: 0, inReview: 0, completed: 0, rejected: 0 },
  );
  const openDueTasks = [...assignedTasks]
    .filter((task) => !['Approved', 'Rejected'].includes(task.status))
    .sort((first, second) => getDueTime(first) - getDueTime(second));

  return {
    ...talent,
    assignedTasks,
    nextDueTask: openDueTasks[0] || null,
    profileReadiness: getProfileReadiness(talent.profile || {}),
    taskStats,
    workloadLabel: getWorkloadLabel(taskStats),
  };
});

export const filterAdminTalentSummaries = (summaries = [], search = '', filter = 'All') => {
  const query = normalizeText(search).toLowerCase();

  return summaries.filter((summary) => {
    const profile = summary.profile || {};
    const matchesSearch = !query ||
      summary.name?.toLowerCase().includes(query) ||
      summary.email?.toLowerCase().includes(query) ||
      profile.headline?.toLowerCase().includes(query) ||
      profile.skills?.some((skill) => skill.toLowerCase().includes(query));

    if (!matchesSearch) return false;
    if (filter === 'Ready') return summary.profileReadiness.isReady;
    if (filter === 'Needs Profile') return !summary.profileReadiness.isReady;
    if (filter === 'Available') return summary.taskStats.active === 0 && summary.taskStats.inReview === 0;
    if (filter === 'Active Work') return summary.taskStats.active > 0 || summary.taskStats.inReview > 0;

    return true;
  });
};
