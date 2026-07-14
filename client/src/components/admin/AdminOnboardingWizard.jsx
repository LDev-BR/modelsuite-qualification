import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppIcon from '../AppIcon';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  ADMIN_ONBOARDING_STEPS,
  getNextAdminOnboardingStep,
  getPreviousAdminOnboardingStep,
  markAdminOnboardingComplete,
  shouldShowAdminOnboarding,
} from '../../utils/adminOnboarding';

const OPEN_GUIDE_EVENT = 'modelsuite-admin-guide:open';

const STEP_ICON = {
  dashboard: 'activity',
  tasks: 'briefcase',
  talents: 'users',
  submissions: 'review',
};

const AdminOnboardingWizard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(() => shouldShowAdminOnboarding(user));
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentStep = ADMIN_ONBOARDING_STEPS[currentIndex];
  const progress = useMemo(
    () => Math.round(((currentIndex + 1) / ADMIN_ONBOARDING_STEPS.length) * 100),
    [currentIndex],
  );

  useEffect(() => {
    const openGuide = () => {
      setCurrentIndex(0);
      setIsOpen(true);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener(OPEN_GUIDE_EVENT, openGuide);
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      window.removeEventListener(OPEN_GUIDE_EVENT, openGuide);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  const completeGuide = () => {
    markAdminOnboardingComplete(user);
    setIsOpen(false);
    setCurrentIndex(0);
    toast.success('Admin guide completed');
  };

  const skipGuide = () => {
    markAdminOnboardingComplete(user);
    setIsOpen(false);
    toast.info('Admin guide dismissed');
  };

  if (!isOpen) return null;

  return (
    <div className="admin-onboarding-overlay" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) skipGuide();
    }}>
      <section
        aria-labelledby="admin-onboarding-title"
        aria-modal="true"
        className="admin-onboarding"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}>
        <header className="admin-onboarding__header">
          <div>
            <p>{currentStep.eyebrow}</p>
            <h2 id="admin-onboarding-title">Admin first-run guide</h2>
            <span>Learn the core workflow once, then reopen this guide anytime from the sidebar.</span>
          </div>
          <button
            aria-label="Skip admin guide"
            className="profile-wizard__close"
            type="button"
            onClick={skipGuide}>
            <AppIcon name="close" size={16} />
          </button>
        </header>

        <div className="admin-onboarding__body">
          <aside className="admin-onboarding__rail">
            <div className="admin-onboarding__progress">
              <strong>{progress}%</strong>
              <span>Guide progress</span>
              <div aria-hidden="true">
                <span style={{ width: `${progress}%` }} />
              </div>
            </div>

            <ol className="admin-onboarding__steps">
              {ADMIN_ONBOARDING_STEPS.map((step, index) => {
                const isCurrent = index === currentIndex;
                const isComplete = index < currentIndex;

                return (
                  <li key={step.id}>
                    <button
                      type="button"
                      className={`${isCurrent ? 'is-current' : ''} ${isComplete ? 'is-complete' : ''}`.trim()}
                      onClick={() => setCurrentIndex(index)}>
                      <span>
                        {isComplete ? <AppIcon name="checkCircle" size={14} /> : index + 1}
                      </span>
                      <div>
                        <strong>{step.title}</strong>
                        <small>{step.id}</small>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ol>
          </aside>

          <article className="admin-onboarding__panel">
            <span className="icon-badge icon-badge--lg icon-badge--info">
              <AppIcon name={STEP_ICON[currentStep.id]} size={24} />
            </span>
            <div>
              <p>{currentStep.eyebrow}</p>
              <h3>{currentStep.title}</h3>
              <span>{currentStep.description}</span>
            </div>

            <ul>
              {currentStep.checklist.map((item) => (
                <li key={item}>
                  <AppIcon name="checkCircle" size={15} />
                  {item}
                </li>
              ))}
            </ul>

            <button
              type="button"
              className="admin-onboarding__route"
              onClick={() => navigate(currentStep.route)}>
              {currentStep.actionLabel}
              <AppIcon name="arrowRight" size={15} />
            </button>
          </article>
        </div>

        <footer className="admin-onboarding__footer">
          <button
            type="button"
            className="profile-wizard__secondary"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((index) => getPreviousAdminOnboardingStep(index))}>
            Back
          </button>
          <div>
            <button type="button" className="profile-wizard__secondary" onClick={skipGuide}>
              Skip guide
            </button>
            {currentIndex === ADMIN_ONBOARDING_STEPS.length - 1 ? (
              <button type="button" className="profile-wizard__primary" onClick={completeGuide}>
                Finish Guide
              </button>
            ) : (
              <button
                type="button"
                className="profile-wizard__primary"
                onClick={() => setCurrentIndex((index) => getNextAdminOnboardingStep(index))}>
                Next
              </button>
            )}
          </div>
        </footer>
      </section>
    </div>
  );
};

export default AdminOnboardingWizard;
