const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  list,
  getOne,
  create,
  update,
  getImage,
  toggleLike,
  getComments,
  createComment,
  moderateComment,
} = require('../controllers/announcementController');

const router = express.Router();

router.use(protect);
router.get('/', authorize('admin', 'staff', 'resident'), list);
router.get('/:id/images/:index', authorize('admin', 'staff', 'resident'), getImage);
router.post('/:id/like', authorize('resident'), toggleLike);
router.get('/:id/comments', authorize('admin', 'staff', 'resident'), getComments);
router.post('/:id/comments', authorize('resident'), createComment);
router.patch('/:id/comments/:commentId', authorize('admin'), moderateComment);
router.get('/:id', authorize('admin', 'staff', 'resident'), getOne);
router.post('/', authorize('admin'), create);
router.patch('/:id', authorize('admin'), update);

module.exports = router;
