import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminShell from '../../components/admin/AdminShell';
import AppIcon from '../../components/AppIcon';
import { fetchAllTasks, fetchTalents } from '../../api/tasks';
import { useToast } from '../../context/ToastContext';
import { ADMIN_ROUTES } from '../../utils/adminNavigation';
import { buildAdminTalentSummaries, filterAdminTalentSummaries } from '../../utils/adminTalentSummary';
import { formatTaskDate } from '../../utils/talentTasks';

const TALENT_FILTERS = ['All', 'Ready', 'Needs Profile', 'Available', 'Active Work'];

const getInitials = (name = '') => name
  .split(' ')
  .map((part) => part[0])
  .filter(Boolean)
  .slice(0, 2)
  .join('')
  .toUpperCase() || 'T';

const AdminTalentsPage = () => {
  const [talents, setTalents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  const loadTalentData = useCallback(async () => {
    setLoading(true);

    try {
      const [talentResponse, taskResponse] = await Promise.all([
        fetchTalents(),
        fetchAllTasks(),
      ]);

      setTalents(talentResponse.data);
      setTasks(taskResponse.data);
    } catch {
      toast.error('Failed to load talents');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadTalentData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadTalentData]);

  const summaries = useMemo(() => buildAdminTalentSummaries(talents, tasks), [talents, tasks]);
  const filteredSummaries = useMemo(
    () => filterAdminTalentSummaries(summaries, search, filter),
    [filter, search, summaries],
  );

  const stats = useMemo(() => ({
    total: summaries.length,
    ready: summaries.filter((summary) => summary.profileReadiness.isReady).length,
    active: summaries.filter((summary) => summary.taskStats.active > 0 || summary.taskStats.inReview > 0).length,
    available: summaries.filter((summary) => summary.taskStats.active === 0 && summary.taskStats.inReview === 0).length,
  }), [summaries]);

  return (
    <AdminShell>
      <div className="flex items-center justify-between gap-4 mb-7 page-section admin-page-header">
        <div className="flex items-center gap-3 min-w-0">
          <span className="icon-badge icon-badge--lg icon-badge--success">
            <AppIcon name="users" size={23} />
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">
              Talents
            </h1>
            <p className="mt-0.5 text-[13px] text-text-muted">
              Understand profile readiness, workload, and where each talent is in the task pipeline.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate(ADMIN_ROUTES.tasks)}
          className="btn-gradient sheen-hover flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-[13px] font-semibold cursor-pointer font-sans">
          <AppIcon name="plus" size={15} />
          Assign Work
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6 page-section motion-stagger admin-stat-grid">
        <div className="stat-card interactive-lift stat-card-default">
          <div className="stat-card__topline">
            <span className="block text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-faint">Total Talents</span>
            <span className="icon-badge icon-badge--sm"><AppIcon name="users" size={15} /></span>
          </div>
          <span className="block text-[32px] font-bold leading-none text-text-primary">{stats.total}</span>
        </div>
        <div className="stat-card interactive-lift stat-card-green">
          <div className="stat-card__topline">
            <span className="block text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-faint">Ready Profiles</span>
            <span className="icon-badge icon-badge--sm icon-badge--success"><AppIcon name="checkCircle" size={15} /></span>
          </div>
          <span className="block text-[32px] font-bold leading-none text-success">{stats.ready}</span>
        </div>
        <div className="stat-card interactive-lift stat-card-info">
          <div className="stat-card__topline">
            <span className="block text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-faint">Active Talent</span>
            <span className="icon-badge icon-badge--sm icon-badge--info"><AppIcon name="activity" size={15} /></span>
          </div>
          <span className="block text-[32px] font-bold leading-none text-info">{stats.active}</span>
        </div>
        <div className="stat-card interactive-lift stat-card-blue">
          <div className="stat-card__topline">
            <span className="block text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-faint">Available</span>
            <span className="icon-badge icon-badge--sm icon-badge--info"><AppIcon name="briefcase" size={15} /></span>
          </div>
          <span className="block text-[32px] font-bold leading-none text-primary">{stats.available}</span>
        </div>
      </div>

      <div className="tasks-container page-section">
        <div className="table-header-bar">
          <div className="flex items-center gap-2">
            <span className="icon-badge icon-badge--sm">
              <AppIcon name="users" size={14} />
            </span>
            <h2 className="text-[15px] font-semibold text-text-primary">
              Talent Directory
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full count-pill">
              {filteredSummaries.length} shown
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-faint">
                <AppIcon name="search" size={14} />
              </span>
              <input
                type="text"
                placeholder="Search talents..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="search-input-glass"
                style={{ minWidth: '190px' }}
              />
            </div>

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="search-input-glass custom-select cursor-pointer"
              style={{ paddingLeft: '12px' }}>
              {TALENT_FILTERS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="command-empty-state">
            <div className="command-empty-state__icon">
              <AppIcon name="users" size={24} />
            </div>
            <h3>Loading talents</h3>
            <p>Gathering talent profiles and current assignment data.</p>
          </div>
        ) : filteredSummaries.length === 0 ? (
          <div className="command-empty-state">
            <div className="command-empty-state__icon">
              <AppIcon name="search" size={24} />
            </div>
            <h3>No talents match this view</h3>
            <p>Try a different search term or workload filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="table-th">Talent</th>
                  <th className="table-th">Profile Signal</th>
                  <th className="table-th">Workload</th>
                  <th className="table-th">Task Mix</th>
                  <th className="table-th">Next Due</th>
                  <th className="table-th">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSummaries.map((summary, index) => {
                  const profile = summary.profile || {};
                  const skills = Array.isArray(profile.skills) ? profile.skills.slice(0, 3) : [];

                  return (
                    <tr
                      key={summary._id}
                      className="table-row table-row-animate"
                      style={{ animationDelay: `${index * 0.05}s` }}>
                      <td className="table-td min-w-[250px]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full avatar-talent flex items-center justify-center text-[12px] font-bold text-white shrink-0">
                            {getInitials(summary.name)}
                          </div>
                          <div className="min-w-0">
                            <strong className="block text-text-primary truncate">{summary.name || 'Unnamed talent'}</strong>
                            <span className="block text-[12px] text-text-faint truncate">{summary.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="table-td min-w-[260px]">
                        <div className="admin-profile-signal">
                          <div>
                            <strong>{summary.profileReadiness.percentage}% ready</strong>
                            <span>{profile.headline || 'No headline yet'}</span>
                          </div>
                          <div className="admin-profile-signal__bar" aria-hidden="true">
                            <span style={{ width: `${summary.profileReadiness.percentage}%` }} />
                          </div>
                          <div className="admin-talent-tags">
                            {skills.length === 0 ? (
                              <span>No skills yet</span>
                            ) : skills.map((skill) => (
                              <span key={skill}>{skill}</span>
                            ))}
                          </div>
                        </div>
                      </td>

                      <td className="table-td whitespace-nowrap">
                        <span className={`admin-workload-pill admin-workload-pill--${summary.workloadLabel.toLowerCase().replaceAll(' ', '-')}`}>
                          {summary.workloadLabel}
                        </span>
                      </td>

                      <td className="table-td min-w-[220px]">
                        <div className="admin-task-mix">
                          <span>{summary.taskStats.active} active</span>
                          <span>{summary.taskStats.inReview} review</span>
                          <span>{summary.taskStats.completed} done</span>
                        </div>
                      </td>

                      <td className="table-td whitespace-nowrap text-text-muted">
                        {summary.nextDueTask ? (
                          <div className="admin-next-due">
                            <strong>{formatTaskDate(summary.nextDueTask.dueDate) || 'No due date'}</strong>
                            <span>{summary.nextDueTask.title}</span>
                          </div>
                        ) : (
                          <span className="text-text-faint">No active due date</span>
                        )}
                      </td>

                      <td className="table-td">
                        <button
                          type="button"
                          onClick={() => navigate(ADMIN_ROUTES.tasks)}
                          className="soft-action-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer whitespace-nowrap">
                          Assign task
                          <AppIcon name="arrowRight" size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
};

export default AdminTalentsPage;
