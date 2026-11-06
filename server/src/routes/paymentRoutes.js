const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createPayment,
  getMyPayments,
  getPayments,
  getReceipt,
  updateVerification,
} = require('../controllers/paymentController');

const router = express.Router();

router.use(protect);
router.get('/mine', authorize('resident'), getMyPayments);
router.post('/', authorize('resident'), createPayment);
router.get('/', authorize('admin'), getPayments);
router.get('/:id/receipt', authorize('admin'), getReceipt);
router.patch('/:id/verification', authorize('admin'), updateVerification);

module.exports = router;
