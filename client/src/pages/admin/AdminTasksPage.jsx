import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminShell from '../../components/admin/AdminShell';
import CreateTaskModal from '../../components/admin/CreateTaskModal';
import EditTaskModal from '../../components/admin/EditTaskModal';
import TasksTable from '../../components/admin/TasksTable';
import AppIcon from '../../components/AppIcon';
import { fetchAllTasks } from '../../api/tasks';
import { useToast } from '../../context/ToastContext';

const TASK_STAT_CARDS = [
  { key: 'total', label: 'Total Tasks', colorClass: 'stat-card-default', valueClass: 'text-text-primary', icon: 'layers', iconTone: '' },
  { key: 'open', label: 'Open', colorClass: 'stat-card-blue', valueClass: 'text-primary', icon: 'briefcase', iconTone: 'info' },
  { key: 'submitted', label: 'Submitted', colorClass: 'stat-card-info', valueClass: 'text-info', icon: 'send', iconTone: 'info' },
  { key: 'approved', label: 'Approved', colorClass: 'stat-card-green', valueClass: 'text-success', icon: 'checkCircle', iconTone: 'success' },
];

const AdminTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const toast = useToast();

  const loadTasks = useCallback(async () => {
    try {
      const { data } = await fetchAllTasks();
      setTasks(data);
    } catch {
      toast.error('Failed to load tasks');
    }
  }, [toast]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadTasks();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadTasks]);

  const stats = useMemo(() => ({
    total: tasks.length,
    open: tasks.filter((task) => task.status === 'Open').length,
    submitted: tasks.filter((task) => task.status === 'Submitted').length,
    approved: tasks.filter((task) => task.status === 'Approved').length,
  }), [tasks]);

  const filteredTasks = useMemo(() => tasks.filter((task) => {
    const query = search.toLowerCase();
    const matchSearch = !query ||
      task.title?.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query) ||
      task.assignedTo?.name?.toLowerCase().includes(query);
    const matchStatus = statusFilter === 'All' || task.status === statusFilter;

    return matchSearch && matchStatus;
  }), [search, statusFilter, tasks]);

  return (
    <AdminShell>
      <div className="flex items-center justify-between gap-4 mb-7 page-section admin-page-header">
        <div className="flex items-center gap-3 min-w-0">
          <span className="icon-badge icon-badge--lg">
            <AppIcon name="briefcase" size={23} />
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-[22px] font-semibold tracking-tight text-text-primary">
              Tasks
            </h1>
            <p className="mt-0.5 text-[13px] text-text-muted">
              Create, assign, and track every onboarding task in one focused workspace.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="btn-gradient sheen-hover flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-[13px] font-semibold cursor-pointer font-sans">
          <AppIcon name="plus" size={15} />
          Create Task
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6 page-section motion-stagger admin-stat-grid">
        {TASK_STAT_CARDS.map(({ key, label, colorClass, valueClass, icon, iconTone }) => (
          <div key={label} className={`stat-card interactive-lift ${colorClass}`}>
            <div className="stat-card__topline">
              <span className="block text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-faint">
                {label}
              </span>
              <span className={`icon-badge icon-badge--sm ${iconTone ? `icon-badge--${iconTone}` : ''}`}>
                <AppIcon name={icon} size={15} />
              </span>
            </div>
            <span className={`block text-[32px] font-bold leading-none ${valueClass}`}>
              {stats[key]}
            </span>
          </div>
        ))}
      </div>

      <div className="tasks-container page-section">
        <div className="table-header-bar">
          <div className="flex items-center gap-2">
            <span className="icon-badge icon-badge--sm">
              <AppIcon name="archive" size={14} />
            </span>
            <h2 className="text-[15px] font-semibold text-text-primary">
              Task Queue
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full count-pill">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-faint">
                <AppIcon name="search" size={14} />
              </span>
              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="search-input-glass"
                style={{ minWidth: '180px' }}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="search-input-glass custom-select cursor-pointer"
              style={{ paddingLeft: '12px' }}>
              <option value="All">All Status</option>
              <option value="Open">Open</option>
              <option value="Claimed">Claimed</option>
              <option value="Submitted">Submitted</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <TasksTable tasks={filteredTasks} onEdit={setEditTask} onRefresh={loadTasks} />
      </div>

      {showCreate && (
        <CreateTaskModal onClose={() => setShowCreate(false)} onCreated={loadTasks} />
      )}
      {editTask && (
        <EditTaskModal
          task={editTask}
          onClose={() => setEditTask(null)}
          onUpdated={() => { loadTasks(); setEditTask(null); }}
        />
      )}
    </AdminShell>
  );
};

export default AdminTasksPage;
