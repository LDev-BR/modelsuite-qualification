import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { updateTalentProfile } from '../../api/profile';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getFocusableElements, getNextFocusableIndex } from '../../utils/focus';
import {
  PROFILE_AVAILABILITY_OPTIONS,
  PROFILE_HEADLINE_SUGGESTIONS,
  PROFILE_INTEREST_OPTIONS,
  PROFILE_LOCATION_OPTIONS,
  PROFILE_SKILL_OPTIONS,
  PROFILE_STEPS,
  PROFILE_WORK_STYLE_OPTIONS,
  buildProfilePayload,
  getPreferredTimeZoneOptions,
  getProfileCompletion,
  isProfileComplete,
  validateProfileStep,
} from '../../utils/profileWizard';

const EMPTY_PROFILE = {
  headline: '',
  location: '',
  timezone: '',
  availability: '',
  portfolioUrl: '',
  skills: [],
  interests: [],
  workStyles: [],
};

const SKILL_DETAILS = {
  React: 'Interactive interfaces, dashboards, and component systems.',
  'Node.js': 'Server workflows, API services, and integrations.',
  MongoDB: 'Document data modeling and query-driven features.',
  'API Design': 'Clear contracts between frontend, backend, and reviewers.',
  Testing: 'Reliable coverage, edge cases, and regression safety.',
  'Design Systems': 'Consistent UI patterns, tokens, and reusable components.',
  Accessibility: 'Keyboard, screen reader, contrast, and inclusive UX.',
  Performance: 'Faster rendering, smaller payloads, and smooth interactions.',
  'Product Thinking': 'User-first decisions, trade-offs, and outcome focus.',
  Documentation: 'Readable handoffs, specs, and implementation notes.',
};

const INTEREST_DETAILS = {
  Frontend: 'UI implementation, interaction quality, and visual polish.',
  Backend: 'Data flows, API behavior, and service reliability.',
  'Full-stack': 'End-to-end product work across client and server.',
  'Product Quality': 'Bugs, UX gaps, and robust acceptance criteria.',
  'Developer Experience': 'Tooling, maintainability, and team workflow.',
  Automation: 'Repeatable workflows and less manual operational effort.',
  'Data Workflows': 'Structured data capture, review, and reporting.',
  'User Research': 'Understanding users before shaping product decisions.',
};

const WORK_STYLE_DETAILS = {
  'Async collaboration': 'Works well with written updates and clear handoffs.',
  'Fast prototypes': 'Explores direction quickly before polishing details.',
  'Deep focus blocks': 'Prefers uninterrupted time for complex tasks.',
  'Structured reviews': 'Uses checklists and feedback loops to reduce misses.',
  'Pairing sessions': 'Collaborates live to unblock decisions and code.',
  'Clear written updates': 'Keeps progress and risk visible for reviewers.',
};

const STEP_SUPPORT = {
  identity: {
    title: 'Start with the basics reviewers need first.',
    items: [
      'Use a headline that says what you do best.',
      'Pick a real location reviewers can recognize.',
      'Keep the detected timezone if it matches your working hours.',
    ],
  },
  skills: {
    title: 'Choose the strongest signals, not every skill.',
    items: [
      'Select at least two skills you want to be evaluated on.',
      'Prioritize areas where you can deliver proof through tasks.',
      'You can combine product, engineering, and quality strengths.',
    ],
  },
  focus: {
    title: 'Tune how task recommendations should feel.',
    items: [
      'Interest areas help route better briefs to your dashboard.',
      'Work style helps reviewers understand collaboration fit.',
      'A portfolio link is optional, but useful when you have one.',
    ],
  },
  review: {
    title: 'Check the profile before claiming work.',
    items: [
      'Confirm required signals are complete.',
      'Make sure the profile sounds specific and professional.',
      'Save when it reflects the work you want to receive.',
    ],
  },
};

const CloseIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <path d="M5 5l10 10M15 5L5 15" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <path d="M4.5 10.5 8.2 14 15.5 6" />
  </svg>
);

const SparkIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3l1.9 5.2L19 10l-5.1 1.8L12 17l-1.9-5.2L5 10l5.1-1.8L12 3Z" />
    <path d="M18 16l.8 2.2L21 19l-2.2.8L18 22l-.8-2.2L15 19l2.2-.8L18 16Z" />
  </svg>
);

const RequiredMark = () => (
  <span className="profile-wizard__required" aria-hidden="true">*</span>
);

const getDetectedTimeZone = () => {
  if (typeof Intl === 'undefined') return '';

  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch {
    return '';
  }
};

const initialProfileFromUser = (profile, detectedTimeZone = '') => {
  const payload = buildProfilePayload({
    ...EMPTY_PROFILE,
    ...profile,
  });

  if (payload.timezone || !detectedTimeZone) return payload;

  return { ...payload, timezone: detectedTimeZone };
};

const toggleArrayValue = (values, value) => (
  values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value]
);

const hasSeenWizardPrompt = (promptKey) => {
  if (!promptKey || typeof window === 'undefined') return true;

  return localStorage.getItem(promptKey) === 'true';
};

const getOptionValue = (option) => (typeof option === 'string' ? option : option.value);

const getOptionLabel = (option) => (typeof option === 'string' ? option : option.label);

const getOptionDetail = (option) => (typeof option === 'string' ? '' : option.detail);

const SelectionButton = ({ isSelected, children, onClick, variant = 'pill', ariaLabel }) => (
  <button
    type="button"
    className={`profile-wizard__choice profile-wizard__choice--${variant} ${isSelected ? 'is-selected' : ''}`}
    aria-label={ariaLabel}
    aria-pressed={isSelected}
    onClick={onClick}>
    <span className="profile-wizard__choice-mark" aria-hidden="true">
      <CheckIcon />
    </span>
    <span className="profile-wizard__choice-content">
      {children}
    </span>
  </button>
);

const SuggestionList = ({ label, options, selectedValue, onSelect, variant = 'chips' }) => (
  <div className={`profile-wizard__suggestions profile-wizard__suggestions--${variant}`}>
    <span>{label}</span>
    <div>
      {options.map((option) => {
        const value = getOptionValue(option);
        const optionLabel = getOptionLabel(option);
        const detail = getOptionDetail(option);
        const isSelected = selectedValue === value;

        return (
          <button
            key={value}
            type="button"
            className={`profile-wizard__suggestion ${isSelected ? 'is-selected' : ''}`}
            aria-label={`Use ${optionLabel}`}
            aria-pressed={isSelected}
            onClick={() => onSelect(value)}>
            <strong>{optionLabel}</strong>
            {detail && <small>{detail}</small>}
          </button>
        );
      })}
    </div>
  </div>
);

const StepTabs = ({ completion, currentStep, currentStepIndex }) => {
  const support = STEP_SUPPORT[currentStep.id];

  return (
    <aside className="profile-wizard__sidebar" aria-label="Profile setup guide">
      <div className="profile-wizard__readiness">
        <span>Profile readiness</span>
        <strong>{completion.percentage}%</strong>
        <div aria-hidden="true">
          <span style={{ width: `${completion.percentage}%` }} />
        </div>
        <p>{completion.completed} of {completion.total} required signals are ready.</p>
      </div>

      <ol className="profile-wizard__steps" aria-label="Profile setup progress">
        {PROFILE_STEPS.map((step, index) => {
          const state = index < currentStepIndex ? 'complete' : index === currentStepIndex ? 'current' : 'pending';

          return (
            <li
              key={step.id}
              className={`profile-wizard__step profile-wizard__step--${state}`}
              aria-current={state === 'current' ? 'step' : undefined}>
              <span className="profile-wizard__step-index">
                {state === 'complete' ? <CheckIcon /> : index + 1}
              </span>
              <div>
                <p>{step.title}</p>
                <small>{step.description}</small>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="profile-wizard__coach-card">
        <span>Guidance</span>
        <h3>{support.title}</h3>
        <ul>
          {support.items.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>
    </aside>
  );
};

const FieldGroup = ({ label, children, hint, required = false }) => (
  <label className="profile-wizard__field">
    <span>
      {label}
      {required && <RequiredMark />}
    </span>
    {children}
    {hint && <small>{hint}</small>}
  </label>
);

const GroupLabel = ({ children, required = false }) => (
  <span className="profile-wizard__group-label">
    {children}
    {required && <RequiredMark />}
  </span>
);

const ProfileSummaryItem = ({ label, value }) => (
  <div className="profile-wizard__summary-item">
    <span>{label}</span>
    <strong>{value || 'Not set'}</strong>
  </div>
);

const ProfilePreviewCard = ({ completion, form }) => {
  const previewTags = [
    ...form.skills.slice(0, 3),
    ...form.interests.slice(0, 2),
  ];
  const locationLine = [form.location, form.timezone].filter(Boolean).join(' - ');

  return (
    <article className="profile-wizard__profile-preview" aria-label="Live profile preview">
      <div className="profile-wizard__preview-topline">
        <span>Live preview</span>
        <strong>{completion.percentage}% ready</strong>
      </div>
      <div className="profile-wizard__preview-avatar" aria-hidden="true">
        TP
      </div>
      <h3>{form.headline || 'Your professional headline'}</h3>
      <p>{locationLine || 'Location and timezone will appear here'}</p>
      <div className="profile-wizard__preview-tags">
        {previewTags.length > 0 ? (
          previewTags.map((tag) => <span key={tag}>{tag}</span>)
        ) : (
          <span>Skills and interests will appear here</span>
        )}
      </div>
    </article>
  );
};

const ProfileWizardStep = ({
  completion,
  currentStep,
  form,
  onFieldChange,
  onToggleSelection,
  timeZoneOptions,
}) => {
  if (currentStep.id === 'identity') {
    return (
      <div className="profile-wizard__form-stack">
        <div className="profile-wizard__field-cluster">
          <FieldGroup label="Professional headline" hint="Keep it short, specific, and role-focused." required>
            <input
              data-profile-wizard-autofocus
              value={form.headline}
              onChange={(event) => onFieldChange('headline', event.target.value)}
              maxLength={90}
              placeholder="Frontend engineer focused on product quality"
              required
              aria-required="true"
              list="profile-headline-suggestions" />
          </FieldGroup>
          <datalist id="profile-headline-suggestions">
            {PROFILE_HEADLINE_SUGGESTIONS.map((headline) => (
              <option key={headline} value={headline} />
            ))}
          </datalist>
          <SuggestionList
            label="Suggested headlines"
            options={PROFILE_HEADLINE_SUGGESTIONS}
            selectedValue={form.headline}
            onSelect={(value) => onFieldChange('headline', value)} />
        </div>

        <div className="profile-wizard__form-grid">
          <div className="profile-wizard__field-cluster">
            <FieldGroup label="Current location" hint="Choose a recognizable city so reviewers understand your working context." required>
              <input
                value={form.location}
                onChange={(event) => onFieldChange('location', event.target.value)}
                maxLength={80}
                placeholder="Sao Paulo, Brazil"
                required
                aria-required="true"
                list="profile-location-options" />
            </FieldGroup>
            <datalist id="profile-location-options">
              {PROFILE_LOCATION_OPTIONS.map((location) => (
                <option key={location} value={location} />
              ))}
            </datalist>
            <SuggestionList
              label="Common locations"
              options={PROFILE_LOCATION_OPTIONS}
              selectedValue={form.location}
              onSelect={(value) => onFieldChange('location', value)} />
          </div>

          <div className="profile-wizard__field-cluster">
            <FieldGroup label="Timezone" hint="This can be detected from your device and adjusted if needed.">
              <input
                value={form.timezone}
                onChange={(event) => onFieldChange('timezone', event.target.value)}
                maxLength={80}
                placeholder="America/Sao_Paulo"
                list="profile-timezone-options" />
            </FieldGroup>
            <datalist id="profile-timezone-options">
              {timeZoneOptions.map((option) => (
                <option key={option.value} value={option.value} />
              ))}
            </datalist>
            <SuggestionList
              label="Timezone options"
              options={timeZoneOptions}
              selectedValue={form.timezone}
              onSelect={(value) => onFieldChange('timezone', value)}
              variant="cards" />
          </div>
        </div>

        <div className="profile-wizard__group profile-wizard__group--wide">
          <GroupLabel required>Weekly availability</GroupLabel>
          <p className="profile-wizard__group-help">Pick the capacity that best matches a normal week.</p>
          <div className="profile-wizard__choice-grid profile-wizard__choice-grid--compact">
            {PROFILE_AVAILABILITY_OPTIONS.map((option) => (
              <SelectionButton
                key={option}
                isSelected={form.availability === option}
                onClick={() => onFieldChange('availability', option)}>
                <strong>{option}</strong>
              </SelectionButton>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (currentStep.id === 'skills') {
    return (
      <div className="profile-wizard__form-stack">
        <div className="profile-wizard__section-heading">
          <div>
            <GroupLabel required>Skills</GroupLabel>
            <h3>Choose at least two strengths</h3>
            <p>Select the areas you can prove through onboarding tasks.</p>
          </div>
          <strong>{form.skills.length}/2 minimum</strong>
        </div>

        <div className="profile-wizard__choice-grid profile-wizard__choice-grid--cards">
          {PROFILE_SKILL_OPTIONS.map((skill) => {
            const isSelected = form.skills.includes(skill);

            return (
              <SelectionButton
                key={skill}
                isSelected={isSelected}
                onClick={() => onToggleSelection('skills', skill)}
                variant="card"
                ariaLabel={`${isSelected ? 'Remove' : 'Select'} ${skill}`}>
                <strong>{skill}</strong>
                <small>{SKILL_DETAILS[skill]}</small>
                <em>{isSelected ? 'Selected' : 'Select skill'}</em>
              </SelectionButton>
            );
          })}
        </div>
      </div>
    );
  }

  if (currentStep.id === 'focus') {
    return (
      <div className="profile-wizard__form-stack">
        <div className="profile-wizard__section-heading">
          <div>
            <GroupLabel required>Interest areas</GroupLabel>
            <h3>Shape the work you want to see</h3>
            <p>Pick the themes that should influence future task matching.</p>
          </div>
          <strong>{form.interests.length} selected</strong>
        </div>

        <div className="profile-wizard__choice-grid profile-wizard__choice-grid--cards">
          {PROFILE_INTEREST_OPTIONS.map((interest) => {
            const isSelected = form.interests.includes(interest);

            return (
              <SelectionButton
                key={interest}
                isSelected={isSelected}
                onClick={() => onToggleSelection('interests', interest)}
                variant="card"
                ariaLabel={`${isSelected ? 'Remove' : 'Select'} ${interest}`}>
                <strong>{interest}</strong>
                <small>{INTEREST_DETAILS[interest]}</small>
                <em>{isSelected ? 'Selected' : 'Select area'}</em>
              </SelectionButton>
            );
          })}
        </div>

        <div className="profile-wizard__section-heading">
          <div>
            <GroupLabel required>Best work style</GroupLabel>
            <h3>Set collaboration expectations</h3>
            <p>Select at least one mode that helps you deliver consistent work.</p>
          </div>
          <strong>{form.workStyles.length} selected</strong>
        </div>

        <div className="profile-wizard__choice-grid profile-wizard__choice-grid--cards">
          {PROFILE_WORK_STYLE_OPTIONS.map((style) => {
            const isSelected = form.workStyles.includes(style);

            return (
              <SelectionButton
                key={style}
                isSelected={isSelected}
                onClick={() => onToggleSelection('workStyles', style)}
                variant="card"
                ariaLabel={`${isSelected ? 'Remove' : 'Select'} ${style}`}>
                <strong>{style}</strong>
                <small>{WORK_STYLE_DETAILS[style]}</small>
                <em>{isSelected ? 'Selected' : 'Select style'}</em>
              </SelectionButton>
            );
          })}
        </div>

        <FieldGroup label="Portfolio or GitHub" hint="Optional, but helpful when you have relevant examples.">
          <input
            value={form.portfolioUrl}
            onChange={(event) => onFieldChange('portfolioUrl', event.target.value)}
            maxLength={180}
            placeholder="https://github.com/your-handle" />
        </FieldGroup>
      </div>
    );
  }

  return (
    <div className="profile-wizard__review">
      <ProfilePreviewCard completion={completion} form={form} />

      <div className="profile-wizard__score-card">
        <div className="profile-wizard__score-ring" style={{ '--profile-score': `${completion.percentage}%` }}>
          <span>{completion.percentage}%</span>
        </div>
        <div>
          <h3>Profile readiness</h3>
          <p>{completion.completed} of {completion.total} required sections are ready for review.</p>
        </div>
      </div>

      <div className="profile-wizard__summary-grid">
        <ProfileSummaryItem label="Headline" value={form.headline} />
        <ProfileSummaryItem label="Location" value={form.location} />
        <ProfileSummaryItem label="Timezone" value={form.timezone} />
        <ProfileSummaryItem label="Availability" value={form.availability} />
        <ProfileSummaryItem label="Skills" value={form.skills.join(', ')} />
        <ProfileSummaryItem label="Interests" value={form.interests.join(', ')} />
        <ProfileSummaryItem label="Work style" value={form.workStyles.join(', ')} />
        <ProfileSummaryItem label="Portfolio" value={form.portfolioUrl} />
      </div>
    </div>
  );
};

const ProfileWizard = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const dialogRef = useRef(null);
  const openerRef = useRef(null);
  const previousBodyOverflowRef = useRef('');
  const [manualOpen, setManualOpen] = useState(false);
  const [hasDismissedAutoOpen, setHasDismissedAutoOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [stepErrors, setStepErrors] = useState([]);
  const detectedTimeZone = useMemo(() => getDetectedTimeZone(), []);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState(() => initialProfileFromUser(user?.profile, detectedTimeZone));
  const timeZoneOptions = useMemo(
    () => getPreferredTimeZoneOptions(detectedTimeZone),
    [detectedTimeZone],
  );
  const profileIsComplete = Boolean(user?.profileCompletedAt) || isProfileComplete(user?.profile);
  const shouldShowWizard = user?.role === 'Talent' && !profileIsComplete;
  const promptKey = user?._id ? `profile-wizard-prompted-${user._id}` : null;
  const isAutoOpen = shouldShowWizard && !hasSeenWizardPrompt(promptKey) && !hasDismissedAutoOpen;
  const isOpen = manualOpen || isAutoOpen;
  const currentStep = PROFILE_STEPS[stepIndex];
  const progressPercent = Math.round(((stepIndex + 1) / PROFILE_STEPS.length) * 100);
  const completion = useMemo(() => getProfileCompletion(form), [form]);

  const restoreOpenerFocus = useCallback(() => {
    const opener = openerRef.current;
    if (!opener?.focus) return;

    window.setTimeout(() => opener.focus(), 0);
  }, []);

  const closeWizard = useCallback(() => {
    if (isAutoOpen && promptKey) {
      localStorage.setItem(promptKey, 'true');
    }

    setHasDismissedAutoOpen(true);
    setManualOpen(false);
    restoreOpenerFocus();
  }, [isAutoOpen, promptKey, restoreOpenerFocus]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeWizard();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusableElements = getFocusableElements(dialogRef.current);
      if (focusableElements.length === 0) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const currentIndex = focusableElements.indexOf(document.activeElement);
      const isLeavingStart = event.shiftKey && currentIndex === 0;
      const isLeavingEnd = !event.shiftKey && currentIndex === focusableElements.length - 1;

      if (currentIndex === -1 || isLeavingStart || isLeavingEnd) {
        event.preventDefault();
        const nextIndex = currentIndex === -1
          ? event.shiftKey ? focusableElements.length - 1 : 0
          : getNextFocusableIndex(currentIndex, focusableElements.length, event.shiftKey ? -1 : 1);
        focusableElements[nextIndex]?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeWizard, isOpen]);

  useEffect(() => {
    if (isOpen) {
      window.setTimeout(() => {
        const preferredElement = dialogRef.current?.querySelector(
          '[data-profile-wizard-autofocus], .profile-wizard__step-panel input, .profile-wizard__step-panel button',
        );
        const [firstFocusable] = getFocusableElements(dialogRef.current);
        (preferredElement || firstFocusable || dialogRef.current)?.focus();
      }, 0);
    }
  }, [isOpen, stepIndex]);

  useEffect(() => {
    if (!isOpen) return undefined;

    previousBodyOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflowRef.current;
    };
  }, [isOpen]);

  if (!shouldShowWizard) {
    return null;
  }

  const handleFieldChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setStepErrors([]);
  };

  const handleToggleSelection = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: toggleArrayValue(current[field], value),
    }));
    setStepErrors([]);
  };

  const moveToStep = (nextIndex) => {
    setStepErrors([]);
    setStepIndex(nextIndex);
  };

  const handleNext = () => {
    const errors = validateProfileStep(currentStep.id, form);

    if (errors.length > 0) {
      setStepErrors(errors);
      return;
    }

    moveToStep(Math.min(stepIndex + 1, PROFILE_STEPS.length - 1));
  };

  const handleComplete = async () => {
    const errors = validateProfileStep('review', form);

    if (errors.length > 0) {
      setStepErrors(errors);
      return;
    }

    setIsSaving(true);
    try {
      const payload = buildProfilePayload(form);
      const { data } = await updateTalentProfile(payload);
      updateUser(data);
      toast.success('Profile completed');
      setManualOpen(false);
      restoreOpenerFocus();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <section className="profile-wizard-prompt page-section" aria-labelledby="profile-wizard-prompt-title">
        <div className="profile-wizard-prompt__icon">
          <SparkIcon />
        </div>
        <div className="profile-wizard-prompt__content">
          <span>Guided onboarding</span>
          <h2 id="profile-wizard-prompt-title">Complete your talent profile</h2>
          <p>Use guided suggestions to set your signal, location, timezone, skills, and working style.</p>
          <div className="profile-wizard-prompt__signals" aria-label="Wizard contents">
            <span>Profile basics</span>
            <span>Skills</span>
            <span>Work style</span>
          </div>
        </div>
        <div className="profile-wizard-prompt__progress" aria-label={`${completion.percentage}% profile complete`}>
          <span>{completion.completed}/{completion.total} required signals</span>
          <div>
            <span style={{ width: `${completion.percentage}%` }} />
          </div>
        </div>
        <button
          type="button"
          className="profile-wizard-prompt__action"
          onClick={(event) => {
            openerRef.current = event.currentTarget;
            setManualOpen(true);
          }}>
          Start guided setup
        </button>
      </section>

      {isOpen && (
        <div className="profile-wizard-overlay" role="presentation">
          <div
            className="profile-wizard"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-wizard-title"
            aria-describedby="profile-wizard-description"
            tabIndex={-1}
            ref={dialogRef}>
            <header className="profile-wizard__header">
              <div>
                <p>Guided profile setup</p>
                <h2 id="profile-wizard-title">{currentStep.title}</h2>
                <span id="profile-wizard-description">{currentStep.description}</span>
                <small className="profile-wizard__required-note">
                  <RequiredMark /> Required fields
                </small>
              </div>
              <div className="profile-wizard__header-actions">
                <span>Step {stepIndex + 1} of {PROFILE_STEPS.length}</span>
                <button
                  type="button"
                  className="profile-wizard__close"
                  aria-label="Finish later"
                  onClick={closeWizard}>
                  <CloseIcon />
                </button>
              </div>
            </header>

            <div className="profile-wizard__body">
              <StepTabs
                completion={completion}
                currentStep={currentStep}
                currentStepIndex={stepIndex} />

              <section className="profile-wizard__workspace" aria-label={currentStep.title}>
                <div className="profile-wizard__progress" aria-hidden="true">
                  <span style={{ width: `${progressPercent}%` }} />
                </div>

                <div key={currentStep.id} className="profile-wizard__step-panel">
                  <ProfileWizardStep
                    completion={completion}
                    currentStep={currentStep}
                    form={form}
                    onFieldChange={handleFieldChange}
                    onToggleSelection={handleToggleSelection}
                    timeZoneOptions={timeZoneOptions} />
                </div>

                {stepErrors.length > 0 && (
                  <div className="profile-wizard__errors" role="alert">
                    {stepErrors.map((error) => <p key={error}>{error}</p>)}
                  </div>
                )}
              </section>
            </div>

            <footer className="profile-wizard__footer">
              <button type="button" className="profile-wizard__secondary" onClick={closeWizard}>
                Finish later
              </button>
              <div>
                {stepIndex > 0 && (
                  <button type="button" className="profile-wizard__secondary" onClick={() => moveToStep(stepIndex - 1)}>
                    Back
                  </button>
                )}
                {stepIndex < PROFILE_STEPS.length - 1 ? (
                  <button type="button" className="profile-wizard__primary" onClick={handleNext}>
                    Continue
                  </button>
                ) : (
                  <button
                    type="button"
                    className="profile-wizard__primary"
                    onClick={handleComplete}
                    disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Complete profile'}
                  </button>
                )}
              </div>
            </footer>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileWizard;
