import test from 'node:test';
import assert from 'node:assert/strict';

import {
  formatEarnedAmount,
  formatRewardAmount,
  getTaskAction,
  getTaskWorkflow,
  getTalentTaskStats,
  normalizeTaskStatus,
} from './talentTasks.js';

test('normalizes missing and unknown statuses as active work', () => {
  assert.equal(normalizeTaskStatus(undefined), 'Claimed');
  assert.equal(normalizeTaskStatus(null), 'Claimed');
  assert.equal(normalizeTaskStatus(''), 'Claimed');
  assert.equal(normalizeTaskStatus('Archived'), 'Claimed');
});

test('builds workflow states for active, submitted, approved, and rejected tasks', () => {
  assert.deepEqual(
    getTaskWorkflow({ status: 'Claimed' }).map((step) => [step.label, step.state]),
    [
      ['Accepted', 'complete'],
      ['In Progress', 'current'],
      ['Under Review', 'pending'],
      ['Completed', 'pending'],
    ],
  );

  assert.deepEqual(
    getTaskWorkflow({ status: 'Submitted' }).map((step) => [step.label, step.state]),
    [
      ['Accepted', 'complete'],
      ['In Progress', 'complete'],
      ['Under Review', 'current'],
      ['Completed', 'pending'],
    ],
  );

  assert.deepEqual(
    getTaskWorkflow({ status: 'Approved' }).map((step) => [step.label, step.state]),
    [
      ['Accepted', 'complete'],
      ['In Progress', 'complete'],
      ['Under Review', 'complete'],
      ['Completed', 'complete'],
    ],
  );

  assert.deepEqual(
    getTaskWorkflow({ status: 'Rejected' }).map((step) => [step.label, step.state]),
    [
      ['Accepted', 'complete'],
      ['In Progress', 'current'],
      ['Under Review', 'attention'],
      ['Completed', 'pending'],
    ],
  );
});

test('returns submit actions only for actionable task states', () => {
  assert.deepEqual(getTaskAction({ status: 'Claimed' }), { label: 'Submit', tone: 'primary' });
  assert.deepEqual(getTaskAction({}), { label: 'Submit', tone: 'primary' });
  assert.equal(getTaskAction({ status: 'Submitted' }), null);
  assert.deepEqual(getTaskAction({ status: 'Rejected' }), { label: 'Re-submit', tone: 'danger' });
  assert.equal(getTaskAction({ status: 'Approved' }), null);
});

test('formats reward amounts with a zero-value fallback', () => {
  assert.equal(formatRewardAmount(1250), '$1,250');
  assert.equal(formatRewardAmount('875'), '$875');
  assert.equal(formatRewardAmount(0), 'Bounty TBD');
  assert.equal(formatRewardAmount(undefined), 'Bounty TBD');
});

test('formats earned totals as currency even when the value is zero', () => {
  assert.equal(formatEarnedAmount(0), '$0');
  assert.equal(formatEarnedAmount(1550), '$1,550');
});

test('derives dashboard stats from my tasks and available tasks', () => {
  const myTasks = [
    { status: 'Claimed' },
    { status: 'Submitted' },
    { status: 'Approved', rewardAmount: 1200 },
    { status: 'Rejected' },
    {},
  ];
  const availableTasks = [{}, {}, {}];

  assert.deepEqual(getTalentTaskStats(myTasks, availableTasks), {
    totalAssigned: 5,
    active: 3,
    inReview: 1,
    completed: 1,
    available: 3,
    completionRate: 20,
    totalEarned: 1200,
  });
});

test('counts only approved task rewards as earned totals', () => {
  const myTasks = [
    { status: 'Approved', rewardAmount: 900 },
    { status: 'Approved', rewardAmount: '650' },
    { status: 'Submitted', rewardAmount: 500 },
    { status: 'Rejected', rewardAmount: 300 },
    { status: 'Claimed' },
  ];

  assert.equal(getTalentTaskStats(myTasks, []).totalEarned, 1550);
});
