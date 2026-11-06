const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { createMonthlyDues, getDuesOverview, getMyDues } = require('../controllers/duesController');

const router = express.Router();

router.use(protect);
router.get('/mine', authorize('resident'), getMyDues);
router.get('/', authorize('admin'), getDuesOverview);
router.post('/', authorize('admin'), createMonthlyDues);

module.exports = router;
