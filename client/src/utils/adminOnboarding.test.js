import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ADMIN_ONBOARDING_STEPS,
  getAdminOnboardingStorageKey,
  getNextAdminOnboardingStep,
  getPreviousAdminOnboardingStep,
  shouldShowAdminOnboarding,
} from './adminOnboarding.js';

test('defines a concise first-run guide for the admin workflow', () => {
  assert.equal(ADMIN_ONBOARDING_STEPS.length, 4);
  assert.deepEqual(
    ADMIN_ONBOARDING_STEPS.map((step) => step.id),
    ['dashboard', 'tasks', 'talents', 'submissions'],
  );
});

test('scopes admin onboarding storage by user id when available', () => {
  assert.equal(getAdminOnboardingStorageKey({ _id: 'admin-123' }), 'modelsuite.adminOnboarding.admin-123');
  assert.equal(getAdminOnboardingStorageKey({ email: 'admin@test.com' }), 'modelsuite.adminOnboarding.admin@test.com');
  assert.equal(getAdminOnboardingStorageKey(null), 'modelsuite.adminOnboarding.global');
});

test('shows onboarding until the stored completion flag is present', () => {
  const storage = {
    getItem: (key) => (key === 'modelsuite.adminOnboarding.admin-123' ? 'completed' : null),
  };

  assert.equal(shouldShowAdminOnboarding({ _id: 'admin-123' }, storage), false);
  assert.equal(shouldShowAdminOnboarding({ _id: 'admin-456' }, storage), true);
});

test('moves between guide steps without overflowing the step bounds', () => {
  assert.equal(getNextAdminOnboardingStep(0), 1);
  assert.equal(getNextAdminOnboardingStep(3), 3);
  assert.equal(getPreviousAdminOnboardingStep(3), 2);
  assert.equal(getPreviousAdminOnboardingStep(0), 0);
});
