import test from 'node:test';
import assert from 'node:assert/strict';

import {
  PROFILE_HEADLINE_SUGGESTIONS,
  PROFILE_LOCATION_OPTIONS,
  buildProfilePayload,
  getProfileCompletion,
  getPreferredTimeZoneOptions,
  isProfileComplete,
  validateProfileStep,
} from './profileWizard.js';

const completeProfile = {
  headline: '  Frontend engineer focused on talent tools  ',
  location: '  Lisbon, Portugal ',
  timezone: ' UTC+01:00 ',
  availability: '10-20 hours/week',
  portfolioUrl: ' https://example.com/me ',
  skills: ['React', 'Node.js', 'React', 'Design Systems'],
  interests: ['Frontend', 'Product Quality'],
  workStyles: ['Async collaboration'],
};

test('builds a trimmed profile payload and removes duplicate selections', () => {
  assert.deepEqual(buildProfilePayload(completeProfile), {
    headline: 'Frontend engineer focused on talent tools',
    location: 'Lisbon, Portugal',
    timezone: 'UTC+01:00',
    availability: '10-20 hours/week',
    portfolioUrl: 'https://example.com/me',
    skills: ['React', 'Node.js', 'Design Systems'],
    interests: ['Frontend', 'Product Quality'],
    workStyles: ['Async collaboration'],
  });
});

test('requires identity, capacity, skills, interests, and work style before completion', () => {
  assert.equal(isProfileComplete(completeProfile), true);

  assert.equal(isProfileComplete({
    ...completeProfile,
    skills: ['React'],
  }), false);

  assert.equal(isProfileComplete({
    ...completeProfile,
    location: ' ',
  }), false);
});

test('reports progress from required profile sections', () => {
  assert.deepEqual(getProfileCompletion({
    ...completeProfile,
    skills: [],
    interests: [],
  }), {
    completed: 4,
    total: 6,
    percentage: 67,
  });
});

test('provides practical profile suggestions for first-time talent users', () => {
  assert.ok(PROFILE_HEADLINE_SUGGESTIONS.includes('Frontend engineer focused on product quality'));
  assert.ok(PROFILE_LOCATION_OPTIONS.includes('Sao Paulo, Brazil'));
  assert.ok(PROFILE_LOCATION_OPTIONS.includes('Lisbon, Portugal'));
});

test('promotes the detected timezone without duplicating options', () => {
  const options = getPreferredTimeZoneOptions('Europe/Lisbon');

  assert.equal(options[0].value, 'Europe/Lisbon');
  assert.equal(options.filter((option) => option.value === 'Europe/Lisbon').length, 1);
});

test('adds an unknown detected timezone as a selectable option', () => {
  const options = getPreferredTimeZoneOptions('Pacific/Auckland');

  assert.deepEqual(options[0], {
    value: 'Pacific/Auckland',
    label: 'Pacific/Auckland',
    detail: 'Detected from this device',
  });
});

test('validates each wizard step with actionable messages', () => {
  assert.deepEqual(validateProfileStep('identity', {
    ...completeProfile,
    headline: '',
    location: '',
  }), [
    'Add a short professional headline.',
    'Add your current location.',
  ]);

  assert.deepEqual(validateProfileStep('skills', {
    ...completeProfile,
    skills: ['React'],
  }), ['Choose at least two skills.']);

  assert.deepEqual(validateProfileStep('focus', {
    ...completeProfile,
    interests: [],
    workStyles: [],
  }), [
    'Choose at least one interest area.',
    'Choose at least one work style.',
  ]);
});
