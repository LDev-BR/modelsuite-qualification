const express = require('express');
const router = express.Router();
const {
  authorizeTaskSubmission,
  submitTask,
  getSubmission,
  getAllSubmissions,
  reviewSubmission,
} = require('../controllers/submissionController');
const { protect, adminOnly, talentOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.get('/admin/all', protect, adminOnly, getAllSubmissions);
router.put('/:id/review', protect, adminOnly, reviewSubmission);

router.post('/:taskId', protect, talentOnly, authorizeTaskSubmission, upload.single('file'), submitTask);
router.get('/:taskId', protect, getSubmission);

module.exports = router;
