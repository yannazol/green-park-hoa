const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const community = require('../controllers/communityController');

const router = express.Router();
router.use(protect);

router.get('/vehicles', authorize('admin', 'staff', 'resident'), community.listVehicles);
router.post('/vehicles', authorize('resident'), community.createVehicle);
router.delete('/vehicles/:id', authorize('resident'), community.deleteVehicle);

router.get('/gate-fees', authorize('admin', 'staff', 'resident'), community.listGateFees);
router.post('/gate-fees', authorize('admin'), community.createGateFee);
router.patch('/gate-fees/:id', authorize('admin'), community.updateGateFee);

router.get('/assistance/mine', authorize('resident'), community.listMyAssistance);
router.post('/assistance', authorize('resident'), community.createAssistance);
router.get('/assistance', authorize('admin', 'staff'), community.listAllAssistance);
router.patch('/assistance/:id', authorize('admin', 'staff'), community.updateAssistance);

module.exports = router;
