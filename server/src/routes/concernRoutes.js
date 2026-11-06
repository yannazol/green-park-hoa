const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createConcern,
  getMyConcerns,
  getMyConcern,
  getAllConcerns,
  updateConcernStatus,
} = require('../controllers/concernController');

const router = express.Router();

// Every concern route requires login
router.use(protect);

// Residents
router.post('/', authorize('resident'), createConcern);
router.get('/mine', authorize('resident'), getMyConcerns);
router.get('/mine/:id', authorize('resident'), getMyConcern);

// Staff and admins
router.get('/', authorize('admin', 'staff'), getAllConcerns);
router.patch('/:id/status', authorize('admin', 'staff'), updateConcernStatus);

module.exports = router;