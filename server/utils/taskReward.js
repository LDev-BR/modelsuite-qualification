const buildTaskRewardAmount = (value) => {
  if (value === undefined || value === null || value === '') return 0;

  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    const error = new Error('Enter a valid reward amount.');
    error.statusCode = 400;
    throw error;
  }

  if (amount < 0) {
    const error = new Error('Reward amount must be non-negative.');
    error.statusCode = 400;
    throw error;
  }

  return amount;
};

module.exports = { buildTaskRewardAmount };
