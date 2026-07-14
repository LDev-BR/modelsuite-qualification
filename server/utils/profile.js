const MAX_TEXT_LENGTH = {
  headline: 90,
  location: 80,
  timezone: 80,
  portfolioUrl: 180,
};

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

const normalizeSelection = (value) => {
  if (!Array.isArray(value)) return [];

  return [...new Set(value.map(normalizeText).filter(Boolean))];
};

const buildTalentProfileUpdate = (payload = {}) => {
  const profile = {
    headline: normalizeText(payload.headline),
    location: normalizeText(payload.location),
    timezone: normalizeText(payload.timezone),
    availability: normalizeText(payload.availability),
    portfolioUrl: normalizeText(payload.portfolioUrl),
    skills: normalizeSelection(payload.skills),
    interests: normalizeSelection(payload.interests),
    workStyles: normalizeSelection(payload.workStyles),
  };

  const errors = [];

  if (!profile.headline) errors.push('Add a professional headline.');
  if (!profile.location) errors.push('Add your current location.');
  if (!profile.availability) errors.push('Choose your weekly availability.');
  if (profile.skills.length < 2) errors.push('Choose at least two skills.');
  if (profile.interests.length < 1) errors.push('Choose at least one interest area.');
  if (profile.workStyles.length < 1) errors.push('Choose at least one work style.');

  Object.entries(MAX_TEXT_LENGTH).forEach(([field, maxLength]) => {
    if (profile[field].length > maxLength) {
      errors.push(`${field} must be ${maxLength} characters or fewer.`);
    }
  });

  if (errors.length > 0) {
    const error = new Error(errors.join(' '));
    error.statusCode = 400;
    throw error;
  }

  return profile;
};

const isTalentProfileComplete = (payload = {}) => {
  try {
    buildTalentProfileUpdate(payload);
    return true;
  } catch {
    return false;
  }
};

module.exports = {
  buildTalentProfileUpdate,
  isTalentProfileComplete,
};
