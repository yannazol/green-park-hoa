const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  listFacilities,
  listMine,
  createReservation,
  listAll,
  getOne,
  updateReservation,
  getAvailability,
  cancelMyReservation,
  getMyReservation,
  getFacilityPhoto,
  updateFacilityPhoto,
  deleteFacilityPhoto,
  updateFacilitySettings,
} = require('../controllers/reservationController');

const router = express.Router();

router.get('/facilities', protect, authorize('resident', 'admin'), listFacilities);
router.get('/facilities/:id/photo', protect, authorize('resident', 'admin'), getFacilityPhoto);
router.put('/facilities/:id/photo', protect, authorize('admin'), updateFacilityPhoto);
router.delete('/facilities/:id/photo', protect, authorize('admin'), deleteFacilityPhoto);
router.put('/facilities/:id/settings', protect, authorize('admin'), updateFacilitySettings);
router.get('/availability', protect, authorize('resident'), getAvailability);
router.get('/mine', protect, authorize('resident'), listMine);
router.get('/mine/:id', protect, authorize('resident'), getMyReservation);
router.patch('/mine/:id/cancel', protect, authorize('resident'), cancelMyReservation);
router.post('/', protect, authorize('resident'), createReservation);

router.use(protect, authorize('admin'));
router.get('/', listAll);
router.get('/:id', getOne);
router.patch('/:id', updateReservation);

module.exports = router;
