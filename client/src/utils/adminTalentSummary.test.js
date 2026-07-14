import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildAdminTalentSummaries,
  filterAdminTalentSummaries,
  getProfileReadiness,
} from './adminTalentSummary.js';

const talents = [
  {
    _id: 'talent-1',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    profile: {
      headline: 'Frontend engineer',
      location: 'Lisbon',
      availability: '10-20 hours/week',
      skills: ['React', 'Testing'],
      interests: ['Frontend'],
      workStyles: ['Async collaboration'],
    },
  },
  {
    _id: 'talent-2',
    name: 'Grace Hopper',
    email: 'grace@example.com',
    profile: {
      headline: '',
      skills: ['Node.js'],
    },
  },
];

const tasks = [
  { _id: 'task-1', title: 'Build UI', status: 'Claimed', assignedTo: { _id: 'talent-1' }, dueDate: '2026-08-10' },
  { _id: 'task-2', title: 'Review API', status: 'Submitted', assignedTo: { _id: 'talent-1' }, dueDate: '2026-08-02' },
  { _id: 'task-3', title: 'Fix copy', status: 'Approved', assignedTo: { _id: 'talent-1' }, dueDate: '2026-07-20' },
  { _id: 'task-4', title: 'Open work', status: 'Open', assignedTo: null },
];

test('reports profile readiness from admin-visible profile fields', () => {
  assert.deepEqual(getProfileReadiness(talents[0].profile), {
    completed: 6,
    total: 6,
    percentage: 100,
    isReady: true,
  });

  assert.deepEqual(getProfileReadiness(talents[1].profile), {
    completed: 0,
    total: 6,
    percentage: 0,
    isReady: false,
  });
});

test('builds task and readiness summaries per talent', () => {
  const summaries = buildAdminTalentSummaries(talents, tasks);
  const ada = summaries[0];
  const grace = summaries[1];

  assert.equal(ada.taskStats.total, 3);
  assert.equal(ada.taskStats.active, 1);
  assert.equal(ada.taskStats.inReview, 1);
  assert.equal(ada.taskStats.completed, 1);
  assert.equal(ada.nextDueTask.title, 'Review API');
  assert.equal(ada.profileReadiness.isReady, true);

  assert.equal(grace.taskStats.total, 0);
  assert.equal(grace.workloadLabel, 'Available');
});

test('filters talent summaries by search and workload/readiness groups', () => {
  const summaries = buildAdminTalentSummaries(talents, tasks);

  assert.deepEqual(filterAdminTalentSummaries(summaries, 'ada', 'All').map((summary) => summary._id), ['talent-1']);
  assert.deepEqual(filterAdminTalentSummaries(summaries, '', 'Ready').map((summary) => summary._id), ['talent-1']);
  assert.deepEqual(filterAdminTalentSummaries(summaries, '', 'Needs Profile').map((summary) => summary._id), ['talent-2']);
  assert.deepEqual(filterAdminTalentSummaries(summaries, '', 'Available').map((summary) => summary._id), ['talent-2']);
  assert.deepEqual(filterAdminTalentSummaries(summaries, '', 'Active Work').map((summary) => summary._id), ['talent-1']);
});
