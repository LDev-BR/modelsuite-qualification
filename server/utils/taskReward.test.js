const test = require('node:test');
const assert = require('node:assert/strict');

const { buildTaskRewardAmount } = require('./taskReward');

test('buildTaskRewardAmount normalizes missing and numeric reward values', () => {
  assert.equal(buildTaskRewardAmount(undefined), 0);
  assert.equal(buildTaskRewardAmount(''), 0);
  assert.equal(buildTaskRewardAmount('1250'), 1250);
  assert.equal(buildTaskRewardAmount(875.5), 875.5);
});

test('buildTaskRewardAmount rejects negative and non-numeric values', () => {
  assert.throws(() => buildTaskRewardAmount(-1), /non-negative/i);
  assert.throws(() => buildTaskRewardAmount('abc'), /valid reward/i);
});
