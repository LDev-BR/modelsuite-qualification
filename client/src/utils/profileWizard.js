export const PROFILE_SKILL_OPTIONS = [
  'React',
  'Node.js',
  'MongoDB',
  'API Design',
  'Testing',
  'Design Systems',
  'Accessibility',
  'Performance',
  'Product Thinking',
  'Documentation',
];

export const PROFILE_INTEREST_OPTIONS = [
  'Frontend',
  'Backend',
  'Full-stack',
  'Product Quality',
  'Developer Experience',
  'Automation',
  'Data Workflows',
  'User Research',
];

export const PROFILE_WORK_STYLE_OPTIONS = [
  'Async collaboration',
  'Fast prototypes',
  'Deep focus blocks',
  'Structured reviews',
  'Pairing sessions',
  'Clear written updates',
];

export const PROFILE_AVAILABILITY_OPTIONS = [
  '0-5 hours/week',
  '5-10 hours/week',
  '10-20 hours/week',
  '20+ hours/week',
];

export const PROFILE_HEADLINE_SUGGESTIONS = [
  'Frontend engineer focused on product quality',
  'Full-stack developer building reliable workflow tools',
  'Backend engineer focused on APIs and automation',
  'Product-minded engineer with strong UI craft',
  'QA-focused developer specializing in testing and accessibility',
  'Data workflow specialist for operations teams',
];

export const PROFILE_LOCATION_OPTIONS = [
  'Sao Paulo, Brazil',
  'Rio de Janeiro, Brazil',
  'Belo Horizonte, Brazil',
  'Brasilia, Brazil',
  'Lisbon, Portugal',
  'Porto, Portugal',
  'London, United Kingdom',
  'Berlin, Germany',
  'New York, United States',
  'San Francisco, United States',
  'Toronto, Canada',
  'Madrid, Spain',
  'Remote, Worldwide',
];

export const PROFILE_TIMEZONE_OPTIONS = [
  {
    value: 'America/Sao_Paulo',
    label: 'America/Sao_Paulo',
    detail: 'Brasilia, Sao Paulo, Rio de Janeiro',
  },
  {
    value: 'Europe/Lisbon',
    label: 'Europe/Lisbon',
    detail: 'Lisbon and Porto',
  },
  {
    value: 'America/New_York',
    label: 'America/New_York',
    detail: 'New York, Miami, Toronto',
  },
  {
    value: 'America/Los_Angeles',
    label: 'America/Los_Angeles',
    detail: 'San Francisco, Los Angeles, Vancouver',
  },
  {
    value: 'Europe/London',
    label: 'Europe/London',
    detail: 'United Kingdom',
  },
  {
    value: 'Europe/Berlin',
    label: 'Europe/Berlin',
    detail: 'Berlin, Madrid, Paris',
  },
  {
    value: 'Asia/Kolkata',
    label: 'Asia/Kolkata',
    detail: 'India Standard Time',
  },
  {
    value: 'Asia/Singapore',
    label: 'Asia/Singapore',
    detail: 'Singapore and Southeast Asia',
  },
  {
    value: 'Australia/Sydney',
    label: 'Australia/Sydney',
    detail: 'Sydney and Melbourne',
  },
];

export const PROFILE_STEPS = [
  {
    id: 'identity',
    title: 'Set your signal',
    description: 'Help reviewers understand where you are based and how you want to contribute.',
  },
  {
    id: 'skills',
    title: 'Choose your craft',
    description: 'Pick the skills that best represent the work you want to be evaluated on.',
  },
  {
    id: 'focus',
    title: 'Tune your workflow',
    description: 'Share the work areas and collaboration style that help you do your best work.',
  },
  {
    id: 'review',
    title: 'Review your profile',
    description: 'Confirm the profile reviewers will see before you start claiming work.',
  },
];

const REQUIRED_CHECKS = [
  (profile) => Boolean(profile.headline),
  (profile) => Boolean(profile.location),
  (profile) => Boolean(profile.availability),
  (profile) => profile.skills.length >= 2,
  (profile) => profile.interests.length >= 1,
  (profile) => profile.workStyles.length >= 1,
];

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

export const getPreferredTimeZoneOptions = (detectedTimeZone) => {
  const normalizedTimeZone = normalizeText(detectedTimeZone);

  if (!normalizedTimeZone) return PROFILE_TIMEZONE_OPTIONS;

  const detectedOption = PROFILE_TIMEZONE_OPTIONS.find((option) => option.value === normalizedTimeZone);

  if (!detectedOption) {
    return [
      {
        value: normalizedTimeZone,
        label: normalizedTimeZone,
        detail: 'Detected from this device',
      },
      ...PROFILE_TIMEZONE_OPTIONS,
    ];
  }

  return [
    detectedOption,
    ...PROFILE_TIMEZONE_OPTIONS.filter((option) => option.value !== normalizedTimeZone),
  ];
};

const normalizeSelection = (value) => {
  if (!Array.isArray(value)) return [];

  return [...new Set(value.map(normalizeText).filter(Boolean))];
};

export const buildProfilePayload = (profile = {}) => ({
  headline: normalizeText(profile.headline),
  location: normalizeText(profile.location),
  timezone: normalizeText(profile.timezone),
  availability: normalizeText(profile.availability),
  portfolioUrl: normalizeText(profile.portfolioUrl),
  skills: normalizeSelection(profile.skills),
  interests: normalizeSelection(profile.interests),
  workStyles: normalizeSelection(profile.workStyles),
});

export const getProfileCompletion = (profile = {}) => {
  const payload = buildProfilePayload(profile);
  const total = REQUIRED_CHECKS.length;
  const completed = REQUIRED_CHECKS.reduce(
    (count, isComplete) => count + (isComplete(payload) ? 1 : 0),
    0,
  );

  return {
    completed,
    total,
    percentage: Math.round((completed / total) * 100),
  };
};

export const isProfileComplete = (profile = {}) => {
  const completion = getProfileCompletion(profile);
  return completion.completed === completion.total;
};

export const validateProfileStep = (stepId, profile = {}) => {
  const payload = buildProfilePayload(profile);
  const errors = [];

  if (stepId === 'identity') {
    if (!payload.headline) errors.push('Add a short professional headline.');
    if (!payload.location) errors.push('Add your current location.');
    if (!payload.availability) errors.push('Choose your weekly availability.');
  }

  if (stepId === 'skills' && payload.skills.length < 2) {
    errors.push('Choose at least two skills.');
  }

  if (stepId === 'focus') {
    if (payload.interests.length < 1) errors.push('Choose at least one interest area.');
    if (payload.workStyles.length < 1) errors.push('Choose at least one work style.');
  }

  if (stepId === 'review' && !isProfileComplete(payload)) {
    errors.push('Complete every required profile section.');
  }

  return errors;
};
