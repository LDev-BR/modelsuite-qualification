import { useState } from 'react';
import SubmitTaskModal from './SubmitTaskModal';
import AppIcon from '../AppIcon';
import {
  formatTaskDate,
  formatRewardAmount,
  getTaskAction,
  getTaskWorkflow,
  normalizeTaskStatus,
} from '../../utils/talentTasks';

const STATUS_CLASS = {
  Open: 'status-badge-Open',
  Claimed: 'status-badge-Claimed',
  Submitted: 'status-badge-Submitted',
  Approved: 'status-badge-Approved',
  Rejected: 'status-badge-Rejected',
};

const STATUS_META = {
  Open: {
    label: 'In Progress',
    detail: 'Ready for your first submission.',
    icon: 'zap',
    tone: 'warning',
  },
  Claimed: {
    label: 'In Progress',
    detail: 'Ready for your first submission.',
    icon: 'zap',
    tone: 'warning',
  },
  Submitted: {
    label: 'Under Review',
    detail: 'Submitted and waiting for admin feedback.',
    icon: 'clock',
    tone: 'info',
  },
  Approved: {
    label: 'Completed',
    detail: 'Approved and complete.',
    icon: 'checkCircle',
    tone: 'success',
  },
  Rejected: {
    label: 'Needs Rework',
    detail: 'Feedback received. Submit an updated version.',
    icon: 'close',
    tone: 'danger',
  },
};

const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="14" height="14" rx="2" />
    <path d="M7 2v4M13 2v4M3 9h14" />
  </svg>
);

const IconUpload = () => (
  <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 14V4M6 8l4-4 4 4" />
    <path d="M3 17h14" />
  </svg>
);

const MyTasksList = ({ tasks, onRefresh }) => {
  const [submitTarget, setSubmitTarget] = useState(null);

  if (!tasks || tasks.length === 0) {
    return (
      <div className="command-empty-state">
        <div className="command-empty-state__icon">
          <AppIcon name="checkCircle" size={26} />
        </div>
        <h3>No active tasks yet</h3>
        <p>Claim an available task to start building your timeline.</p>
      </div>
    );
  }

  return (
    <>
      <div className="task-command-grid">
        {tasks.map((task, index) => {
          const status = normalizeTaskStatus(task.status);
          const statusMeta = STATUS_META[status];
          const action = getTaskAction(task);
          const dueDate = formatTaskDate(task.dueDate);
          const workflow = getTaskWorkflow(task);

          return (
            <article
              key={task._id}
              className="task-command-card table-row-animate interactive-lift"
              style={{ animationDelay: `${index * 0.06}s` }}>
              <header className="task-command-card__header">
                <div className="task-command-card__title">
                  <div className="task-command-card__title-row">
                    <span className={`icon-badge icon-badge--sm icon-badge--${statusMeta.tone}`}>
                      <AppIcon name={statusMeta.icon} size={15} />
                    </span>
                    <h3>{task.title || 'Untitled Task'}</h3>
                  </div>
                  <p>{statusMeta.detail}</p>
                </div>
                <span className={`task-command-card__badge ${STATUS_CLASS[status] || ''}`}>
                  {statusMeta.label}
                </span>
              </header>

              {task.description && (
                <p className="task-command-card__description">
                  {task.description}
                </p>
              )}

              <div className="task-command-card__meta">
                <span>
                  <IconCalendar />
                  {dueDate ? `Due ${dueDate}` : 'No due date'}
                </span>
                <span>{formatRewardAmount(task.rewardAmount)}</span>
              </div>

              <ol className="task-workflow" aria-label={`Progress for ${task.title || 'this task'}`}>
                {workflow.map((step) => (
                  <li key={step.label} className={`task-workflow__step task-workflow__step--${step.state}`}>
                    <span className="task-workflow__dot" aria-hidden="true" />
                    <span className="task-workflow__label">{step.label}</span>
                  </li>
                ))}
              </ol>

              <footer className="task-command-card__footer">
                <span>{statusMeta.detail}</span>
                {action && (
                  <button
                    type="button"
                    onClick={() => setSubmitTarget(task)}
                    className={`task-command-card__action task-command-card__action--${action.tone}`}>
                    <IconUpload />
                    {action.label}
                  </button>
                )}
              </footer>
            </article>
          );
        })}
      </div>

      {submitTarget && (
        <SubmitTaskModal
          task={submitTarget}
          onClose={() => setSubmitTarget(null)}
          onSubmitted={() => {
            setSubmitTarget(null);
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </>
  );
};

export default MyTasksList;
