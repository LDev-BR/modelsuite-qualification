const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildTalentProfileUpdate,
  isTalentProfileComplete,
} = require('./profile');

const validPayload = {
  headline: '  Full-stack builder ',
  location: ' Remote ',
  timezone: ' UTC-03:00 ',
  availability: '10-20 hours/week',
  portfolioUrl: ' https://example.com ',
  skills: ['React', 'Node.js', 'React'],
  interests: ['Frontend'],
  workStyles: ['Async collaboration'],
};

test('buildTalentProfileUpdate trims text and deduplicates profile arrays', () => {
  assert.deepEqual(buildTalentProfileUpdate(validPayload), {
    headline: 'Full-stack builder',
    location: 'Remote',
    timezone: 'UTC-03:00',
    availability: '10-20 hours/week',
    portfolioUrl: 'https://example.com',
    skills: ['React', 'Node.js'],
    interests: ['Frontend'],
    workStyles: ['Async collaboration'],
  });
});

test('buildTalentProfileUpdate rejects invalid payloads with field messages', () => {
  assert.throws(
    () => buildTalentProfileUpdate({ ...validPayload, headline: '', skills: ['React'] }),
    /professional headline.*at least two skills/i,
  );
});

test('isTalentProfileComplete checks required onboarding sections', () => {
  assert.equal(isTalentProfileComplete(validPayload), true);
  assert.equal(isTalentProfileComplete({ ...validPayload, workStyles: [] }), false);
});
