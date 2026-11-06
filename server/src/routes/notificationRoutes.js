const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { listMine, markRead, markAllRead } = require('../controllers/notificationController');

const router = express.Router();
router.use(protect, authorize('resident'));
router.get('/mine', listMine);
router.patch('/mine/read-all', markAllRead);
router.patch('/mine/:id/read', markRead);

module.exports = router;
