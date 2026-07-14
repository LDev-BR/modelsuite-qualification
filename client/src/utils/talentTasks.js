const SUPPORTED_STATUSES = ['Open', 'Claimed', 'Submitted', 'Approved', 'Rejected'];
const REWARD_FALLBACK_LABEL = 'Bounty TBD';

const normalizeRewardAmount = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
};

export const WORKFLOW_STEPS = ['Accepted', 'In Progress', 'Under Review', 'Completed'];

export const normalizeTaskStatus = (status) => {
  if (SUPPORTED_STATUSES.includes(status)) return status;
  return 'Claimed';
};

export const getTaskWorkflow = (task = {}) => {
  const status = normalizeTaskStatus(task.status);

  const statesByStatus = {
    Open: ['complete', 'current', 'pending', 'pending'],
    Claimed: ['complete', 'current', 'pending', 'pending'],
    Submitted: ['complete', 'complete', 'current', 'pending'],
    Approved: ['complete', 'complete', 'complete', 'complete'],
    Rejected: ['complete', 'current', 'attention', 'pending'],
  };

  return WORKFLOW_STEPS.map((label, index) => ({
    label,
    state: statesByStatus[status][index],
  }));
};

export const getTaskAction = (task = {}) => {
  const status = normalizeTaskStatus(task.status);

  if (status === 'Approved') return null;
  if (status === 'Submitted') return null;
  if (status === 'Rejected') return { label: 'Re-submit', tone: 'danger' };

  return { label: 'Submit', tone: 'primary' };
};

export const formatRewardAmount = (value) => {
  const amount = normalizeRewardAmount(value);
  if (amount === 0) return REWARD_FALLBACK_LABEL;

  return formatEarnedAmount(amount);
};

export const formatEarnedAmount = (value) => {
  const amount = Number(value);

  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(Number.isFinite(amount) && amount > 0 ? amount : 0);
};

export const getTalentTaskStats = (myTasks = [], availableTasks = []) => {
  const totalAssigned = myTasks.length;
  const counts = myTasks.reduce(
    (current, task) => {
      const status = normalizeTaskStatus(task.status);

      if (status === 'Approved') {
        current.completed += 1;
        current.totalEarned += normalizeRewardAmount(task.rewardAmount);
      } else if (status === 'Submitted') {
        current.inReview += 1;
      } else {
        current.active += 1;
      }

      return current;
    },
    { active: 0, inReview: 0, completed: 0, totalEarned: 0 },
  );

  return {
    totalAssigned,
    active: counts.active,
    inReview: counts.inReview,
    completed: counts.completed,
    available: availableTasks.length,
    completionRate: totalAssigned === 0 ? 0 : Math.round((counts.completed / totalAssigned) * 100),
    totalEarned: counts.totalEarned,
  };
};

export const formatTaskDate = (raw) => {
  if (!raw) return null;

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};
