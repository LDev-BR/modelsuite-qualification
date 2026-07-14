const Submission = require('../models/Submission');
const Task = require('../models/Task');

const REVIEW_STATUSES = ['Approved', 'Rejected'];

const normalizeId = (value) => {
  const id = value && value._id ? value._id : value;
  return id ? id.toString() : null;
};

const isSameId = (left, right) => {
  const leftId = normalizeId(left);
  const rightId = normalizeId(right);
  return Boolean(leftId && rightId && leftId === rightId);
};

const authorizeTaskSubmission = async (req, res, next) => {
  if (req.user.role !== 'Talent') {
    return res.status(403).json({ message: 'Only talent users can submit tasks' });
  }

  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (!isSameId(task.assignedTo, req.user._id)) {
      return res.status(403).json({ message: 'You can only submit tasks assigned to you' });
    }

    req.task = task;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Submit a task with a file upload
// @route POST /api/submissions/:taskId
// @access Talent
const submitTask = async (req, res) => {
  const { taskId } = req.params;
  const { notes } = req.body;

  if (req.user.role !== 'Talent') {
    return res.status(403).json({ message: 'Only talent users can submit tasks' });
  }

  try {
    const task = req.task || await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (!isSameId(task.assignedTo, req.user._id)) {
      return res.status(403).json({ message: 'You can only submit tasks assigned to you' });
    }

    const fileUrl = req.file
      ? `http://localhost:5000/uploads/${req.file.filename}`
      : req.body.fileUrl || null;

    let submission = await Submission.findOne({ taskId, talentId: req.user._id });

    if (submission) {
      submission.fileUrl = fileUrl;
      submission.notes = notes;
      await submission.save();
    } else {
      submission = await Submission.create({
        taskId,
        talentId: req.user._id,
        fileUrl,
        notes,
      });
    }

    await Task.findByIdAndUpdate(taskId, { status: 'Submitted' });

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get submission for a specific task
// @route GET /api/submissions/:taskId
// @access Auth
const getSubmission = async (req, res) => {
  try {
    const query = { taskId: req.params.taskId };

    if (req.user.role === 'Talent') {
      query.talentId = req.user._id;
    } else if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const submission = await Submission.findOne(query)
      .populate('talentId', 'name email');

    if (!submission) {
      return res.status(404).json({ message: 'No submission found for this task' });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get ALL submissions
// @route GET /api/submissions/admin/all
// @access Admin
const getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({})
      .populate('taskId', 'title dueDate status')
      .populate('talentId', 'name email')
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Approve or Reject a submission
// @route PUT /api/submissions/:id/review
// @access Admin
const reviewSubmission = async (req, res) => {
  const { reviewStatus } = req.body;

  if (!REVIEW_STATUSES.includes(reviewStatus)) {
    return res.status(400).json({ message: 'Review status must be Approved or Rejected' });
  }

  try {
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { reviewStatus },
      { new: true, runValidators: true }
    );

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    await Task.findByIdAndUpdate(
      submission.taskId,
      { status: reviewStatus },
      { runValidators: true }
    );

    await submission.populate([
      { path: 'taskId', select: 'title status' },
      { path: 'talentId', select: 'name email' },
    ]);

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  authorizeTaskSubmission,
  submitTask,
  getSubmission,
  getAllSubmissions,
  reviewSubmission,
};
