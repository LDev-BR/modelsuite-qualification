import { useEffect, useState } from 'react';
import { createTask, fetchTalents } from '../../api/tasks';
import { useToast } from '../../context/ToastContext';
import AppIcon from '../AppIcon';

const STATUS_OPTIONS = ['Open', 'Claimed', 'Submitted', 'Approved', 'Rejected'];

const inputCls = 'w-full bg-bg-input border border-border rounded-lg px-3.5 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-faint focus:border-primary focus:ring-[3px] focus:ring-primary/15 transition-all font-sans resize-y';
const labelCls = 'text-[11px] font-semibold uppercase tracking-[0.5px] text-text-muted';

const CreateTaskModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ title: '', description: '', status: 'Open', assignedTo: '', dueDate: '', rewardAmount: '' });
  const [talents, setTalents] = useState([]);
  const [loadingTalents, setLoadingTalents] = useState(true);
  const toast = useToast();

  useEffect(() => {
    let ignore = false;

    fetchTalents()
      .then(({ data }) => {
        if (!ignore) setTalents(data);
      })
      .catch(() => toast.error('Failed to load talents'))
      .finally(() => {
        if (!ignore) setLoadingTalents(false);
      });

    return () => {
      ignore = true;
    };
  }, [toast]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await createTask({ ...form, assignedTo: form.assignedTo || undefined });
      onCreated(data);
      toast.success('Task created');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  };

  return (
    <div className="fixed inset-0 modal-backdrop backdrop-blur-sm flex items-center justify-center z-[200] p-6"
      onClick={onClose}>
      <div className="bg-bg-card border border-border rounded-xl w-full max-w-xl elevated-modal animate-modal-in"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <span className="icon-badge icon-badge--sm">
              <AppIcon name="plus" size={15} />
            </span>
            <h2 className="text-[17px] font-semibold text-text-primary">Create New Task</h2>
          </div>
          <button onClick={onClose}
            className="bg-transparent border-none text-text-muted text-base cursor-pointer px-2 py-1 rounded-md hover:bg-bg-hover hover:text-text-primary transition-all"
            aria-label="Close modal">
            <AppIcon name="close" size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-[18px]">
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Title</label>
            <input name="title" value={form.title} onChange={handleChange}
              placeholder="e.g. Design landing page mockup" className={inputCls} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              rows={3} placeholder="Describe the task deliverables..." className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Status</label>
              <select name="status" value={form.status} onChange={handleChange}
                className={`${inputCls} custom-select cursor-pointer`}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Due Date</label>
              <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} className={inputCls} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Reward Amount</label>
            <input
              type="number"
              min="0"
              step="1"
              name="rewardAmount"
              value={form.rewardAmount}
              onChange={handleChange}
              placeholder="e.g. 1200"
              className={inputCls} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Assign To</label>
            <select name="assignedTo" value={form.assignedTo} onChange={handleChange}
              className={`${inputCls} custom-select cursor-pointer`}>
              <option value="">Unassigned</option>
              {loadingTalents
                ? <option disabled>Loading...</option>
                : talents.map((t) => <option key={t._id} value={t._id}>{t.name} ({t.email})</option>)}
            </select>
          </div>

          <div className="flex justify-end gap-2.5 pt-1 border-t border-border mt-1">
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 bg-bg-input text-text-muted border border-border rounded-lg text-sm font-medium cursor-pointer hover:bg-bg-hover hover:text-text-primary transition-all font-sans">
              Cancel
            </button>
            <button type="submit"
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer btn-gradient sheen-hover border-none font-sans inline-flex items-center gap-2">
              <AppIcon name="plus" size={15} />
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
