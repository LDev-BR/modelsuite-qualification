import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import TalentSidebar from '../../components/talent/TalentSidebar';
import AvailableTasksList from '../../components/talent/AvailableTasksList';
import ProfileWizard from '../../components/talent/ProfileWizard';
import AppIcon from '../../components/AppIcon';
import { fetchAvailableTasks, fetchMyTasks } from '../../api/talent';
import { useAuth } from '../../context/AuthContext';
import {
  formatEarnedAmount,
  formatTaskDate,
  getTalentTaskStats,
  normalizeTaskStatus,
} from '../../utils/talentTasks';
import { TALENT_ROUTES } from '../../utils/navigation';

const FOCUS_PRIORITY = {
  Rejected: 0,
  Claimed: 1,
  Open: 1,
  Submitted: 2,
  Approved: 3,
};

const FOCUS_META = {
  Open: {
    label: 'Ready to submit',
    detail: 'Start the brief and upload your first pass when it is ready.',
    icon: 'zap',
    tone: 'warning',
  },
  Claimed: {
    label: 'Ready to submit',
    detail: 'Start the brief and upload your first pass when it is ready.',
    icon: 'zap',
    tone: 'warning',
  },
  Submitted: {
    label: 'In review',
    detail: 'Your submission is with the admin team for feedback.',
    icon: 'clock',
    tone: 'info',
  },
  Approved: {
    label: 'Completed',
    detail: 'Approved work is archived in My Tasks.',
    icon: 'checkCircle',
    tone: 'success',
  },
  Rejected: {
    label: 'Needs revision',
    detail: 'Review the feedback and submit an updated version.',
    icon: 'close',
    tone: 'danger',
  },
};

const IconArrow = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <path d="M5 10h9M11 6.5 14.5 10 11 13.5" />
  </svg>
);

const IconCalendar = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <rect x="3.5" y="4.5" width="13" height="12" rx="2" />
    <path d="M7 3v3M13 3v3M3.5 8.5h13" />
  </svg>
);

const getDashboardFocusTasks = (tasks = []) => [...tasks]
  .filter((task) => normalizeTaskStatus(task.status) !== 'Approved')
  .sort((firstTask, secondTask) => {
    const firstPriority = FOCUS_PRIORITY[normalizeTaskStatus(firstTask.status)];
    const secondPriority = FOCUS_PRIORITY[normalizeTaskStatus(secondTask.status)];

    return firstPriority - secondPriority;
  })
  .slice(0, 2);

const DashboardFocusPreview = ({ tasks }) => {
  const focusTasks = getDashboardFocusTasks(tasks);

  return (
    <section className="dashboard-focus page-section" aria-labelledby="dashboard-focus-title">
      <div className="command-section-header dashboard-focus__header">
        <div>
          <h2 id="dashboard-focus-title">Next Focus</h2>
          <p>A compact view of assigned work that may need your attention.</p>
        </div>
        <Link className="dashboard-focus__link" to={TALENT_ROUTES.tasks}>
          Open My Tasks
          <IconArrow />
        </Link>
      </div>

      {focusTasks.length > 0 ? (
        <div className="dashboard-focus__grid">
          {focusTasks.map((task) => {
            const status = normalizeTaskStatus(task.status);
            const statusMeta = FOCUS_META[status];
            const dueDate = formatTaskDate(task.dueDate);

            return (
              <article key={task._id} className={`dashboard-focus-card dashboard-focus-card--${status.toLowerCase()}`}>
                <header>
                  <div className="dashboard-focus-card__title">
                    <span className={`icon-badge icon-badge--sm icon-badge--${statusMeta.tone}`}>
                      <AppIcon name={statusMeta.icon} size={15} />
                    </span>
                    <div>
                      <span>{statusMeta.label}</span>
                    <h3>{task.title || 'Untitled Task'}</h3>
                    </div>
                  </div>
                  <Link className="dashboard-focus-card__action" to={TALENT_ROUTES.tasks} aria-label={`Open ${task.title || 'this task'} in My Tasks`}>
                    <IconArrow />
                  </Link>
                </header>

                <p>{task.description || statusMeta.detail}</p>

                <footer>
                  <span>
                    <IconCalendar />
                    {dueDate ? `Due ${dueDate}` : 'No due date'}
                  </span>
                  <small>{statusMeta.detail}</small>
                </footer>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="dashboard-focus__empty command-empty-state">
          <h3>No assigned work needs attention</h3>
          <p>Claim an open brief from the marketplace when you are ready for the next assignment.</p>
          <a href="#available-tasks" className="dashboard-focus__link">
            Browse available tasks
            <IconArrow />
          </a>
        </div>
      )}
    </section>
  );
};

const TalentDashboard = () => {
  const { user } = useAuth();
  const [availableTasks, setAvailableTasks] = useState([]);
  const [myTasks, setMyTasks]               = useState([]);
  const [error, setError] = useState(null);
  const stats = useMemo(
    () => getTalentTaskStats(myTasks, availableTasks),
    [availableTasks, myTasks],
  );
  const firstName = user?.name?.split(' ')[0] || 'there';

  const loadAvailable = useCallback(async () => {
    try {
      const { data } = await fetchAvailableTasks();
      setAvailableTasks(data);
    } catch {
      setError('Failed to load available tasks');
    }
  }, []);

  const loadMyTasks = useCallback(async () => {
    try {
      const { data } = await fetchMyTasks();
      setMyTasks(data);
    } catch {
      setError('Failed to load your tasks');
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadAvailable();
      loadMyTasks();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadAvailable, loadMyTasks]);
  const handleRefresh = () => { loadAvailable(); loadMyTasks(); };
  const summaryCopy = stats.active > 0
    ? `${stats.active} active ${stats.active === 1 ? 'task needs' : 'tasks need'} your next move.`
    : 'Your active queue is clear.';

  const statCards = [
    { label: 'Active', value: stats.active, caption: 'Ready to move', tone: 'warning', icon: 'zap' },
    { label: 'In Review', value: stats.inReview, caption: 'Awaiting feedback', tone: 'info', icon: 'clock' },
    { label: 'Completed', value: stats.completed, caption: 'Approved work', tone: 'success', icon: 'checkCircle' },
    { label: 'Earned', value: formatEarnedAmount(stats.totalEarned), caption: 'Approved bounties', tone: 'success', icon: 'dollar' },
    { label: 'Available', value: stats.available, caption: 'Open to claim', tone: 'primary', icon: 'briefcase' },
  ];

  return (
    <div className="flex min-h-screen app-shell talent-dashboard-shell">
      <TalentSidebar />

      <main className="talent-dashboard-main flex-1 px-8 py-8">

        <section className="command-hero page-section" aria-labelledby="talent-command-title">
          <div className="command-hero__content">
            <span className="command-hero__label">
              <AppIcon name="spark" size={14} />
              Talent Command Center
            </span>
            <h1 id="talent-command-title">Welcome back, {firstName}</h1>
            <p>
              {summaryCopy} Track your pipeline, submit work, and keep momentum visible from one place.
            </p>
            <div className="command-hero__meta" aria-label="Current workload summary">
              <span>{stats.totalAssigned} assigned</span>
              <span>{stats.inReview} under review</span>
              <span>{stats.completed} completed</span>
              <span>{formatEarnedAmount(stats.totalEarned)} earned</span>
            </div>
          </div>

          <div className="command-progress-card" aria-label="Pipeline completion">
            <div
              className="command-progress-ring"
              style={{ '--command-progress': `${stats.completionRate}%` }}>
              <span>{stats.completionRate}%</span>
              <small>complete</small>
            </div>
            <div>
              <p>
                <AppIcon name="activity" size={16} />
                Pipeline completion
              </p>
              <span>
                {stats.completed} of {stats.totalAssigned} assigned {stats.totalAssigned === 1 ? 'task' : 'tasks'} approved.
              </span>
            </div>
          </div>
        </section>

        <ProfileWizard />

        <section className="command-stats-grid page-section motion-stagger" aria-label="Talent task stats">
          {statCards.map((card) => (
            <article key={card.label} className={`command-stat-card command-stat-card--${card.tone} interactive-lift`}>
              <div className={`icon-badge icon-badge--sm icon-badge--${card.tone === 'primary' ? 'info' : card.tone}`}>
                <AppIcon name={card.icon} size={15} />
              </div>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <p>{card.caption}</p>
            </article>
          ))}
        </section>

        {error && (
          <p className="text-[13px] mb-4 px-4 py-3 rounded-lg"
            style={{
              color: 'var(--ms-color-danger)',
              background: 'color-mix(in srgb, var(--ms-color-danger) 10%, transparent)',
              border: '1px solid color-mix(in srgb, var(--ms-color-danger) 28%, transparent)',
            }}>
            {error}
          </p>
        )}

        <DashboardFocusPreview tasks={myTasks} />

        <section id="available-tasks" className="mb-7 page-section">
          <div className="flex items-center gap-2.5 mb-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em]"
              style={{ color: 'var(--ms-text-faint)', fontFamily: 'Inter, sans-serif' }}>
              Available Tasks
            </h2>
            <span className="text-[10.5px] px-2 py-0.5 rounded-full count-pill">
              {availableTasks.length}
            </span>
          </div>
          <AvailableTasksList tasks={availableTasks} onClaimed={handleRefresh} />
        </section>
      </main>
    </div>
  );
};

export default TalentDashboard;
