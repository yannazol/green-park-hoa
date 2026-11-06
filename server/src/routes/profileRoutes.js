const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { getMyProfile, updateMyProfile } = require('../controllers/profileController');

const router = express.Router();
router.use(protect, authorize('resident'));
router.get('/', getMyProfile);
router.patch('/', updateMyProfile);

module.exports = router;
