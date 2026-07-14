import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DISCOVERY_FILTER_ALL,
  getTaskDiscoveryModel,
  inferTaskCategory,
} from './taskDiscovery.js';

const sampleTasks = [
  {
    _id: 'brand-kit',
    title: 'Complete Brand Identity Kit',
    description: 'Deliver logo variants, a color palette, and a typography guide in Figma.',
    dueDate: '2024-06-15',
    rewardAmount: 1200,
  },
  {
    _id: 'market-report',
    title: 'Write Q2 Market Analysis Report',
    description: 'Research competitors and produce recommendations for the talent platform.',
    dueDate: '2024-06-20',
    rewardAmount: 900,
  },
  {
    _id: 'video-series',
    title: 'Record Onboarding Video Series',
    description: 'Create a 3-part video series walking new talents through platform features.',
  },
  {
    _id: 'social-calendar',
    title: 'Social Media Content Calendar',
    description: 'Plan LinkedIn, Twitter, and Instagram content for the talent portal launch.',
  },
];

test('infers discovery categories from task title and description', () => {
  assert.equal(inferTaskCategory(sampleTasks[0]).id, 'design');
  assert.equal(inferTaskCategory(sampleTasks[1]).id, 'research');
  assert.equal(inferTaskCategory(sampleTasks[2]).id, 'video');
  assert.equal(inferTaskCategory(sampleTasks[3]).id, 'growth');
  assert.equal(inferTaskCategory({ title: 'General onboarding task' }).id, 'operations');
});

test('builds filter counts, featured task, and enriched marketplace cards', () => {
  const model = getTaskDiscoveryModel(sampleTasks);

  assert.equal(model.activeFilter, DISCOVERY_FILTER_ALL);
  assert.equal(model.totalCount, 4);
  assert.equal(model.featuredTask._id, 'brand-kit');
  assert.equal(model.gridTasks.length, 3);

  assert.deepEqual(
    model.filters.map((filter) => [filter.id, filter.count]),
    [
      ['all', 4],
      ['design', 1],
      ['research', 1],
      ['video', 1],
      ['growth', 1],
      ['content', 0],
      ['operations', 0],
    ],
  );

  assert.deepEqual(model.featuredTask.discovery, {
    category: {
      id: 'design',
      label: 'Design',
      tone: 'mint',
    },
    rewardLabel: '$1,200',
    dueLabel: 'Jun 15, 2024',
  });
});

test('uses Bounty TBD when an available task has no reward amount', () => {
  const model = getTaskDiscoveryModel([{ title: 'General onboarding task' }]);

  assert.equal(model.featuredTask.discovery.rewardLabel, 'Bounty TBD');
});

test('filters marketplace cards by active discovery category', () => {
  const model = getTaskDiscoveryModel(sampleTasks, 'growth');

  assert.equal(model.activeFilter, 'growth');
  assert.equal(model.totalCount, 4);
  assert.equal(model.visibleTasks.length, 1);
  assert.equal(model.featuredTask._id, 'social-calendar');
  assert.deepEqual(model.gridTasks, []);
});

test('falls back to all tasks when a selected filter has no matches', () => {
  const model = getTaskDiscoveryModel(sampleTasks, 'content');

  assert.equal(model.activeFilter, DISCOVERY_FILTER_ALL);
  assert.equal(model.visibleTasks.length, 4);
});
