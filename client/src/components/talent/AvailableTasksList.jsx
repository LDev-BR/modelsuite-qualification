import { useMemo, useState } from 'react';
import { claimTask } from '../../api/talent';
import { useToast } from '../../context/ToastContext';
import { DISCOVERY_FILTER_ALL, getTaskDiscoveryModel } from '../../utils/taskDiscovery';

const IconAll = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <path d="M4 5.5h12M4 10h12M4 14.5h12" />
  </svg>
);

const IconDesign = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <path d="M4 14.5 13.5 5a2.1 2.1 0 1 1 3 3L7 17H4v-2.5Z" />
    <path d="m12 6.5 1.5 1.5" />
  </svg>
);

const IconResearch = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <circle cx="9" cy="9" r="4.5" />
    <path d="m12.5 12.5 3.5 3.5M7 9h4M9 7v4" />
  </svg>
);

const IconVideo = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <rect x="3" y="5" width="10" height="10" rx="2" />
    <path d="m13 8 4-2.5v9L13 12" />
  </svg>
);

const IconGrowth = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <path d="M4 14.5 8 10l3 2.5 5-7" />
    <path d="M13 5.5h3v3" />
  </svg>
);

const IconContent = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <path d="M5 3.5h7l3 3V16a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 5 16V3.5Z" />
    <path d="M12 3.5V7h3M7.5 10h5M7.5 13h5" />
  </svg>
);

const IconOperations = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <path d="M10 3.5 16 7v6l-6 3.5L4 13V7l6-3.5Z" />
    <path d="M10 10 16 7M10 10v6.5M10 10 4 7" />
  </svg>
);

const IconCalendar = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <rect x="3.5" y="4.5" width="13" height="12" rx="2" />
    <path d="M7 3v3M13 3v3M3.5 8.5h13" />
  </svg>
);

const IconArrow = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <path d="M5 10h9M11 6.5 14.5 10 11 13.5" />
  </svg>
);

const FILTER_ICONS = {
  [DISCOVERY_FILTER_ALL]: IconAll,
  design: IconDesign,
  research: IconResearch,
  video: IconVideo,
  growth: IconGrowth,
  content: IconContent,
  operations: IconOperations,
};

const CategoryIcon = ({ type }) => {
  const Icon = FILTER_ICONS[type] || IconOperations;

  return <Icon />;
};

const TaskMeta = ({ task }) => (
  <div className="task-discovery-card__meta">
    <span>
      <IconCalendar />
      {task.discovery.dueLabel ? `Due ${task.discovery.dueLabel}` : 'Flexible deadline'}
    </span>
    {task.createdBy?.name && <span>Curated by {task.createdBy.name}</span>}
  </div>
);

const ClaimButton = ({ task, isClaiming, onClaim }) => (
  <button
    type="button"
    className="task-discovery-card__action"
    onClick={() => onClaim(task)}
    disabled={isClaiming}
    aria-label={`Claim ${task.title || 'this task'}`}>
    {isClaiming ? 'Claiming...' : 'Claim brief'}
    <IconArrow />
  </button>
);

const TaskCard = ({ task, isClaiming, onClaim }) => (
  <article className={`task-discovery-card task-discovery-card--${task.discovery.category.tone} interactive-lift`}>
    <header className="task-discovery-card__header">
      <span className="task-discovery-card__reward">{task.discovery.rewardLabel}</span>
      <span className="task-discovery-card__category">
        <CategoryIcon type={task.discovery.category.id} />
        {task.discovery.category.label}
      </span>
    </header>

    <div className="task-discovery-card__body">
      <h3>{task.title || 'Untitled Task'}</h3>
      <p>{task.description || 'No description has been added yet.'}</p>
    </div>

    <footer className="task-discovery-card__footer">
      <TaskMeta task={task} />
      <ClaimButton task={task} isClaiming={isClaiming} onClaim={onClaim} />
    </footer>
  </article>
);

const FeaturedTask = ({ task, isClaiming, onClaim }) => (
  <article className={`task-discovery-spotlight task-discovery-card--${task.discovery.category.tone} sheen-hover`}>
    <div className="task-discovery-spotlight__content">
      <div className="task-discovery-card__header">
        <span className="task-discovery-card__reward">{task.discovery.rewardLabel}</span>
        <span className="task-discovery-card__category">
          <CategoryIcon type={task.discovery.category.id} />
          {task.discovery.category.label}
        </span>
      </div>

      <h3>{task.title || 'Untitled Task'}</h3>
      <p>{task.description || 'No description has been added yet.'}</p>

      <TaskMeta task={task} />
    </div>

    <div className="task-discovery-spotlight__aside">
      <span>Featured brief</span>
      <strong>{task.discovery.rewardLabel}</strong>
      <p>{task.discovery.dueLabel ? `Due ${task.discovery.dueLabel}` : 'Flexible deadline'}</p>
      <ClaimButton task={task} isClaiming={isClaiming} onClaim={onClaim} />
    </div>
  </article>
);

const EmptyDiscoveryState = () => (
  <div className="command-empty-state task-discovery-empty">
    <div className="command-empty-state__icon">
      <IconAll />
    </div>
    <h3>No open briefs right now</h3>
    <p>New marketplace opportunities will appear here as admins publish them.</p>
  </div>
);

const AvailableTasksList = ({ tasks, onClaimed }) => {
  const toast = useToast();
  const [activeFilter, setActiveFilter] = useState(DISCOVERY_FILTER_ALL);
  const [claimingTaskId, setClaimingTaskId] = useState(null);
  const discovery = useMemo(
    () => getTaskDiscoveryModel(tasks, activeFilter),
    [activeFilter, tasks],
  );

  const handleClaim = async (task) => {
    setClaimingTaskId(task._id);

    try {
      await claimTask(task._id);
      toast.success('Task claimed');
      if (onClaimed) onClaimed();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to claim task');
    } finally {
      setClaimingTaskId(null);
    }
  };

  if (!tasks || tasks.length === 0) {
    return <EmptyDiscoveryState />;
  }

  return (
    <div className="task-discovery">
      <div className="task-discovery__header">
        <div>
          <span className="task-discovery__eyebrow">Task Marketplace</span>
          <h2>Find your next high-impact brief</h2>
          <p>Browse curated open work by category, reward signal, and deadline.</p>
        </div>

        <div className="task-discovery__metric" aria-label={`${discovery.totalCount} open tasks`}>
          <strong>{discovery.totalCount}</strong>
          <span>open briefs</span>
        </div>
      </div>

      <div className="task-discovery-filter" aria-label="Filter available tasks by category">
        {discovery.filters.map((filter) => {
          const isActive = discovery.activeFilter === filter.id;
          const isDisabled = filter.id !== DISCOVERY_FILTER_ALL && filter.count === 0;

          return (
            <button
              key={filter.id}
              type="button"
              className={`task-discovery-filter__item task-discovery-filter__item--${filter.tone} interactive-lift${isActive ? ' is-active' : ''}`}
              onClick={() => setActiveFilter(filter.id)}
              disabled={isDisabled}
              aria-pressed={isActive}>
              <CategoryIcon type={filter.id} />
              <span>{filter.label}</span>
              <strong>{filter.count}</strong>
            </button>
          );
        })}
      </div>

      {discovery.featuredTask && (
        <FeaturedTask
          task={discovery.featuredTask}
          isClaiming={claimingTaskId === discovery.featuredTask._id}
          onClaim={handleClaim}
        />
      )}

      {discovery.gridTasks.length > 0 && (
        <div className="task-discovery-grid motion-stagger">
          {discovery.gridTasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              isClaiming={claimingTaskId === task._id}
              onClaim={handleClaim}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableTasksList;
