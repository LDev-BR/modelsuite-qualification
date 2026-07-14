import { useCallback, useEffect, useState } from 'react';
import AdminShell from '../../components/admin/AdminShell';
import SubmissionReviewModal from '../../components/admin/SubmissionReviewModal';
import AppIcon from '../../components/AppIcon';
import { fetchAllSubmissions } from '../../api/submissions';
import { useToast } from '../../context/ToastContext';

const REVIEW_STATUS_CLASS = {
  Pending: 'status-badge-Submitted',
  Approved: 'status-badge-Approved',
  Rejected: 'status-badge-Rejected',
};

const SubmissionsPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [reviewTarget, setReviewTarget] = useState(null);
  const toast = useToast();

  const loadSubmissions = useCallback(async () => {
    try {
      const { data } = await fetchAllSubmissions();
      setSubmissions(data);
    } catch {
      toast.error('Failed to load submissions');
    }
  }, [toast]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadSubmissions();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadSubmissions]);

  const pending = submissions.filter((submission) => submission.reviewStatus === 'Pending').length;
  const approved = submissions.filter((submission) => submission.reviewStatus === 'Approved').length;
  const rejected = submissions.filter((submission) => submission.reviewStatus === 'Rejected').length;

  const statCards = [
    { label: 'Total', value: submissions.length, color: 'text-text-primary', icon: 'inbox', iconTone: '' },
    { label: 'Pending', value: pending, color: 'text-info', icon: 'clock', iconTone: 'info' },
    { label: 'Approved', value: approved, color: 'text-success', icon: 'checkCircle', iconTone: 'success' },
    { label: 'Rejected', value: rejected, color: 'text-danger', icon: 'close', iconTone: 'danger' },
  ];

  const thCls = 'text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.7px] text-text-faint border-b border-border whitespace-nowrap';
  const tdCls = 'px-5 py-4 border-b border-border align-middle';

  return (
    <AdminShell className="px-10 py-9">
        <div className="mb-8 page-section flex items-center gap-3">
          <span className="icon-badge icon-badge--lg icon-badge--info">
            <AppIcon name="review" size={23} />
          </span>
          <div>
            <h1 className="text-[26px] font-bold tracking-tight text-text-primary">Submissions</h1>
            <p className="mt-1 text-sm text-text-muted">Review talent submissions and approve or reject them.</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-7 page-section motion-stagger admin-stat-grid">
          {statCards.map(({ label, value, color, icon, iconTone }) => (
            <div key={label} className="elevated-panel rounded-xl px-6 py-5 flex flex-col gap-3 interactive-lift">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[12px] font-medium text-text-muted uppercase tracking-[0.6px]">{label}</span>
                <span className={`icon-badge icon-badge--sm ${iconTone ? `icon-badge--${iconTone}` : ''}`}>
                  <AppIcon name={icon} size={15} />
                </span>
              </div>
              <span className={`text-[32px] font-bold tracking-tight ${color}`}>{value}</span>
            </div>
          ))}
        </div>

        <div className="elevated-panel rounded-xl overflow-hidden page-section">
          <div className="flex items-center justify-between px-6 py-5 border-b border-border">
            <div className="flex items-center gap-2.5">
              <span className="icon-badge icon-badge--sm">
                <AppIcon name="inbox" size={14} />
              </span>
              <h2 className="text-[16px] font-semibold text-text-primary">All Submissions</h2>
            </div>

            <span className="text-[12px] text-text-faint bg-bg-input border border-border px-2.5 py-1 rounded-full">
              {submissions.length} total
            </span>
          </div>

          {submissions.length === 0 ? (
            <div className="command-empty-state">
              <div className="command-empty-state__icon">
                <AppIcon name="inbox" size={24} />
              </div>
              <h3>No submissions yet</h3>
              <p>Talent work will appear here once tasks are submitted for review.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-bg-surface">
                    <th className={thCls}>Task</th>
                    <th className={thCls}>Talent</th>
                    <th className={thCls}>Notes</th>
                    <th className={thCls}>File</th>
                    <th className={thCls}>Submitted</th>
                    <th className={thCls}>Review Status</th>
                    <th className={thCls}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr key={submission._id} className="border-b border-border last:border-0 hover:bg-bg-hover transition-colors table-row-animate">
                      <td className={`${tdCls} max-w-[180px]`}>
                        <span className="block font-medium text-text-primary truncate">
                          {submission.taskId?.title || '-'}
                        </span>
                      </td>

                      <td className={`${tdCls} whitespace-nowrap`}>
                        <div className="flex items-center gap-2">
                          <div className="w-[26px] h-[26px] rounded-full avatar-talent flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                            {submission.talentId?.name?.[0] ?? '?'}
                          </div>
                          <span className="text-text-primary">{submission.talentId?.name || '-'}</span>
                        </div>
                      </td>

                      <td className={`${tdCls} max-w-[200px]`}>
                        <span className="block text-text-muted truncate text-[13px]">
                          {submission.notes || <span className="italic text-text-faint">No notes</span>}
                        </span>
                      </td>

                      <td className={tdCls}>
                        {submission.fileUrl ? (
                          <a href={submission.fileUrl} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-primary text-[13px] hover:text-secondary underline underline-offset-2 transition-colors">
                            <AppIcon name="file" size={14} />
                            View
                          </a>
                        ) : (
                          <span className="text-text-faint text-[13px] italic">None</span>
                        )}
                      </td>

                      <td className={`${tdCls} text-text-muted text-[13px] whitespace-nowrap`}>
                        {submission.createdAt}
                      </td>

                      <td className={tdCls}>
                        <span className={`inline-block px-2.5 py-[3px] rounded-full text-[11px] font-semibold ${REVIEW_STATUS_CLASS[submission.reviewStatus] || 'status-badge-Submitted'}`}>
                          {submission.reviewStatus || 'Pending'}
                        </span>
                      </td>

                      <td className={tdCls}>
                        <button
                          type="button"
                          onClick={() => setReviewTarget(submission)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary/10 text-primary border border-primary/30 rounded-lg text-[12px] font-semibold cursor-pointer hover:bg-primary/20 transition-colors font-sans whitespace-nowrap">
                          <AppIcon name="review" size={14} />
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      {reviewTarget && (
        <SubmissionReviewModal
          submission={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onReviewed={() => { setReviewTarget(null); loadSubmissions(); }}
        />
      )}
    </AdminShell>
  );
};

export default SubmissionsPage;
