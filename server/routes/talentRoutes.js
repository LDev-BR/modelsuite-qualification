const express = require('express');
const router = express.Router();
const { getAvailableTasks, getMyTasks, claimTask } = require('../controllers/talentController');
const { protect, talentOnly } = require('../middleware/authMiddleware');

router.get('/tasks/available', protect, talentOnly, getAvailableTasks);
router.get('/tasks/mine', protect, talentOnly, getMyTasks);
router.put('/tasks/:id/claim', protect, talentOnly, claimTask);

module.exports = router;
