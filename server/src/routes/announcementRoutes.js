const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  list,
  getOne,
  create,
  update,
} = require('../controllers/announcementController');

const router = express.Router();

router.use(protect);
router.get('/', authorize('admin', 'staff', 'resident'), list);
router.get('/:id', authorize('admin', 'staff', 'resident'), getOne);
router.post('/', authorize('admin'), create);
router.patch('/:id', authorize('admin'), update);

module.exports = router;
