import { useCallback, useEffect, useMemo, useState } from 'react';
import TalentSidebar from '../../components/talent/TalentSidebar';
import MyTasksList from '../../components/talent/MyTasksList';
import AppIcon from '../../components/AppIcon';
import { fetchMyTasks } from '../../api/talent';
import { getTalentTaskStats } from '../../utils/talentTasks';

const TalentTasksPage = () => {
  const [myTasks, setMyTasks] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const stats = useMemo(() => getTalentTaskStats(myTasks, []), [myTasks]);

  const loadMyTasks = useCallback(async () => {
    try {
      const { data } = await fetchMyTasks();
      setError(null);
      setMyTasks(data);
    } catch {
      setError('Failed to load your tasks');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadMyTasks();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadMyTasks]);

  const queueMetrics = [
    { label: 'Active', value: stats.active, caption: 'Ready to submit', icon: 'zap', tone: 'warning' },
    { label: 'In Review', value: stats.inReview, caption: 'Waiting on admin', icon: 'clock', tone: 'info' },
    { label: 'Completed', value: stats.completed, caption: 'Approved work', icon: 'checkCircle', tone: 'success' },
    { label: 'Assigned', value: stats.totalAssigned, caption: 'Total workload', icon: 'layers', tone: 'info' },
  ];

  return (
    <div className="flex min-h-screen app-shell talent-dashboard-shell">
      <TalentSidebar />

      <main className="talent-dashboard-main flex-1 px-8 py-8">
        <section className="tasks-queue-hero page-section" aria-labelledby="talent-tasks-title">
          <div className="tasks-queue-hero__content">
            <span className="command-hero__label">
              <AppIcon name="archive" size={14} />
              My Tasks
            </span>
            <h1 id="talent-tasks-title">Task execution queue</h1>
            <p>Submit accepted work, track review status, and revisit completed assignments from one focused timeline.</p>
          </div>

          <div className="tasks-queue-hero__metrics motion-stagger" aria-label="My task status summary">
            {queueMetrics.map((metric) => (
              <div key={metric.label} className="tasks-queue-hero__metric interactive-lift">
                <span className={`icon-badge icon-badge--sm icon-badge--${metric.tone}`}>
                  <AppIcon name={metric.icon} size={15} />
                </span>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <p>{metric.caption}</p>
              </div>
            ))}
          </div>
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

        <section className="mb-7 page-section">
          <div className="command-section-header">
            <div>
              <h2>Task Timeline</h2>
              <p>Submit work, track review, and revisit feedback from one focused queue.</p>
            </div>
            <span className="count-pill">
              {myTasks.length} {myTasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>

          {isLoading ? (
            <div className="command-empty-state">
              <div className="command-empty-state__icon">
                <AppIcon name="activity" size={24} />
              </div>
              <h3>Loading your task timeline</h3>
              <p>Fetching your assigned work and latest review status.</p>
            </div>
          ) : (
            <MyTasksList tasks={myTasks} onRefresh={loadMyTasks} />
          )}
        </section>
      </main>
    </div>
  );
};

export default TalentTasksPage;
