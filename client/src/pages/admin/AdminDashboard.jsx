import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminShell from '../../components/admin/AdminShell';
import AppIcon from '../../components/AppIcon';
import { fetchAllTasks } from '../../api/tasks';
import { useToast } from '../../context/ToastContext';
import { ADMIN_ROUTES } from '../../utils/adminNavigation';
import { formatRewardAmount, formatTaskDate } from '../../utils/talentTasks';

const STATUS_CLASS = {
  Open: 'status-badge-Open',
  Claimed: 'status-badge-Claimed',
  Submitted: 'status-badge-Submitted',
  Approved: 'status-badge-Approved',
  Rejected: 'status-badge-Rejected',
};

const AdminDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const toast = useToast();
  const navigate = useNavigate();

  const loadTasks = useCallback(async () => {
    try {
      const { data } = await fetchAllTasks();
      setTasks(data);
    } catch {
      toast.error('Failed to load admin dashboard');
    }
  }, [toast]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadTasks();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadTasks]);

  const stats = useMemo(() => {
    const submitted = tasks.filter((task) => task.status === 'Submitted').length;
    const rejected = tasks.filter((task) => task.status === 'Rejected').length;

    return {
      total: tasks.length,
      open: tasks.filter((task) => task.status === 'Open').length,
      assigned: tasks.filter((task) => Boolean(task.assignedTo)).length,
      submitted,
      approved: tasks.filter((task) => task.status === 'Approved').length,
      attention: submitted + rejected,
    };
  }, [tasks]);

  const recentTasks = useMemo(() => tasks.slice(0, 5), [tasks]);
  const openTasks = useMemo(() => tasks.filter((task) => task.status === 'Open').slice(0, 3), [tasks]);

  const statCards = [
    { label: 'Total Tasks', value: stats.total, icon: 'layers', tone: '' },
    { label: 'Open Work', value: stats.open, icon: 'briefcase', tone: 'info' },
    { label: 'In Review', value: stats.submitted, icon: 'inbox', tone: 'warning' },
    { label: 'Approved', value: stats.approved, icon: 'checkCircle', tone: 'success' },
  ];

  return (
    <AdminShell>
      <section className="admin-command-hero page-section">
        <div className="admin-command-hero__content">
          <span className="command-hero__label">
            <AppIcon name="activity" size={14} />
            Admin Command Center
          </span>
          <h1>Run onboarding work from one clear queue.</h1>
          <p>
            Watch task volume, talent workload, and submissions that need review before they slow down the pipeline.
          </p>

          <div className="admin-command-hero__actions">
            <button
              type="button"
              onClick={() => navigate(ADMIN_ROUTES.tasks)}
              className="btn-gradient sheen-hover inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-[13px] font-semibold cursor-pointer font-sans">
              <AppIcon name="plus" size={15} />
              Create Task
            </button>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event('modelsuite-admin-guide:open'))}
              className="soft-action-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-[13px] font-semibold cursor-pointer font-sans">
              <AppIcon name="spark" size={15} />
              Open Guide
            </button>
          </div>
        </div>

        <div className="admin-command-hero__panel">
          <span className="icon-badge icon-badge--lg icon-badge--info">
            <AppIcon name="rocket" size={24} />
          </span>
          <div>
            <span className="admin-command-hero__panel-label">Needs attention</span>
            <strong>{stats.attention}</strong>
            <p>Submitted or rejected tasks waiting for admin follow-up.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate(ADMIN_ROUTES.submissions)}
            className="admin-command-hero__panel-link">
            Review submissions
            <AppIcon name="arrowRight" size={14} />
          </button>
        </div>
      </section>

      <section className="grid grid-cols-4 gap-4 mb-6 page-section motion-stagger admin-stat-grid">
        {statCards.map(({ label, value, icon, tone }) => (
          <div key={label} className="stat-card interactive-lift">
            <div className="stat-card__topline">
              <span className="block text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-faint">
                {label}
              </span>
              <span className={`icon-badge icon-badge--sm ${tone ? `icon-badge--${tone}` : ''}`}>
                <AppIcon name={icon} size={15} />
              </span>
            </div>
            <span className="block text-[32px] font-bold leading-none text-text-primary">
              {value}
            </span>
          </div>
        ))}
      </section>

      <section className="admin-dashboard-grid page-section">
        <div className="tasks-container">
          <div className="table-header-bar">
            <div className="flex items-center gap-2">
              <span className="icon-badge icon-badge--sm">
                <AppIcon name="archive" size={14} />
              </span>
              <h2 className="text-[15px] font-semibold text-text-primary">Recent Tasks</h2>
            </div>
            <button
              type="button"
              onClick={() => navigate(ADMIN_ROUTES.tasks)}
              className="soft-action-primary inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer">
              View all
              <AppIcon name="arrowRight" size={13} />
            </button>
          </div>

          {recentTasks.length === 0 ? (
            <div className="command-empty-state">
              <div className="command-empty-state__icon">
                <AppIcon name="archive" size={24} />
              </div>
              <h3>No tasks yet</h3>
              <p>Create the first task to start the admin workflow.</p>
            </div>
          ) : (
            <div className="admin-task-list">
              {recentTasks.map((task) => (
                <div key={task._id} className="admin-task-list__item">
                  <div className="min-w-0">
                    <strong>{task.title || 'Untitled task'}</strong>
                    <span>
                      {task.assignedTo?.name || 'Unassigned'} - {formatRewardAmount(task.rewardAmount)}
                    </span>
                  </div>
                  <div className="admin-task-list__meta">
                    <span className={`inline-block px-2.5 py-[3px] rounded-full text-[11.5px] font-medium ${STATUS_CLASS[task.status] || 'status-badge-Open'}`}>
                      {task.status || 'Open'}
                    </span>
                    <small>{formatTaskDate(task.dueDate) || 'No due date'}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="admin-next-steps">
          <div className="admin-next-steps__header">
            <span className="icon-badge icon-badge--sm icon-badge--success">
              <AppIcon name="users" size={15} />
            </span>
            <div>
              <h2>Recommended next steps</h2>
              <p>Keep the pipeline moving with the highest-leverage actions.</p>
            </div>
          </div>

          <div className="admin-next-steps__list">
            <button type="button" onClick={() => navigate(ADMIN_ROUTES.tasks)}>
              <span>Publish work</span>
              <strong>{stats.open} open tasks</strong>
            </button>
            <button type="button" onClick={() => navigate(ADMIN_ROUTES.talents)}>
              <span>Balance talent load</span>
              <strong>{stats.assigned} assigned tasks</strong>
            </button>
            <button type="button" onClick={() => navigate(ADMIN_ROUTES.submissions)}>
              <span>Review submissions</span>
              <strong>{stats.submitted} waiting</strong>
            </button>
          </div>

          <div className="admin-open-work">
            <span>Open work snapshot</span>
            {openTasks.length === 0 ? (
              <p>No open tasks are waiting for talent.</p>
            ) : (
              openTasks.map((task) => (
                <p key={task._id}>{task.title || 'Untitled task'}</p>
              ))
            )}
          </div>
        </aside>
      </section>
    </AdminShell>
  );
};

export default AdminDashboard;
