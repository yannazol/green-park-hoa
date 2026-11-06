const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  listResidents,
  getResident,
  createResident,
  updateResident,
  setResidentStatus,
  resetResidentAccess,
} = require('../controllers/residentController');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/', listResidents);
router.post('/', createResident);
router.get('/:id', getResident);
router.patch('/:id', updateResident);
router.patch('/:id/status', setResidentStatus);
router.post('/:id/reset-access', resetResidentAccess);

module.exports = router;
