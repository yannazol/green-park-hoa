const mongoose = require('mongoose');
const Facility = require('../models/Facility');
const Reservation = require('../models/Reservation');
const { createNotification } = require('../utils/notifications');
const { validateImage } = require('../utils/imageValidation');

const STATUSES = ['Pending', 'Approved', 'Rejected', 'Cancelled'];
const TIME_SLOTS = ['Morning', 'Afternoon', 'Evening'];
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const PHILIPPINE_DATE = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Manila',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function todayInPhilippines() {
  const parts = Object.fromEntries(
    PHILIPPINE_DATE.formatToParts(new Date()).map(({ type, value }) => [type, value])
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}
const NEXT_STATUSES = {
  Pending: ['Approved', 'Rejected', 'Cancelled'],
  Approved: ['Cancelled'],
  Rejected: [],
  Cancelled: [],
};
const EMAIL_NAME = 'name email unit phone';

function publicFacility(facility) {
  const opensAt = facility.operatingHours?.opensAt;
  const closesAt = facility.operatingHours?.closesAt;
  return {
    _id: facility._id,
    name: facility.name,
    description: facility.description,
    feeCentavos: facility.feeCentavos,
    feeDescription: facility.feeDescription,
    hasPhoto: Boolean(facility.photo?.data),
    operatingHours:
      TIME_PATTERN.test(opensAt ?? '') && TIME_PATTERN.test(closesAt ?? '')
        ? { opensAt, closesAt, slotMinutes: facility.operatingHours.slotMinutes ?? 60 }
        : null,
  };
}

function slotPeriod(time) {
  const hour = Number(time.slice(0, 2));
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

function generateTimeSlots(operatingHours, period) {
  if (
    !operatingHours ||
    !TIME_PATTERN.test(operatingHours.opensAt ?? '') ||
    !TIME_PATTERN.test(operatingHours.closesAt ?? '')
  ) return [];
  const [openHour, openMinute] = operatingHours.opensAt.split(':').map(Number);
  const [closeHour, closeMinute] = operatingHours.closesAt.split(':').map(Number);
  const slotMinutes = operatingHours.slotMinutes ?? 60;
  const opens = openHour * 60 + openMinute;
  const closes = closeHour * 60 + closeMinute;
  if (closes <= opens || slotMinutes !== 60) return [];
  const slots = [];
  for (let minute = opens; minute + slotMinutes <= closes; minute += slotMinutes) {
    const time = `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
    if (!period || slotPeriod(time) === period) slots.push(time);
  }
  return slots;
}

function validTime(value) {
  return typeof value === 'string' && TIME_PATTERN.test(value);
}

function handleError(res, error, message) {
  if (error.code === 11000) {
    return res.status(409).json({
      message: 'This facility is already approved for that date and time slot.',
      code: 'RESERVATION_CONFLICT',
    });
  }
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid reservation information' });
  }
  console.error(`${message}:`, error.message);
  return res.status(500).json({ message });
}

function validDate(date) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(`${date}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === date;
}

exports.getAvailability = async (req, res) => {
  const { facility: facilityId, from, to, schedulePeriod } = req.query;
  if (
    !mongoose.isValidObjectId(facilityId) ||
    !validDate(from) ||
    !validDate(to) ||
    from > to ||
    (schedulePeriod !== undefined && !TIME_SLOTS.includes(schedulePeriod))
  ) {
    return res.status(400).json({ message: 'Choose a valid facility and date range.' });
  }
  const start = new Date(`${from}T00:00:00.000Z`);
  const end = new Date(`${to}T00:00:00.000Z`);
  if ((end - start) / 86400000 > 90) {
    return res.status(400).json({ message: 'Availability can be checked for up to 90 days at a time.' });
  }
  try {
    const facility = await Facility.findOne({ _id: facilityId, isActive: true }).select('operatingHours');
    if (!facility) return res.status(404).json({ message: 'Facility is not available' });
    const reservations = await Reservation.find({
      facility: facilityId,
      date: { $gte: from, $lte: to },
      status: 'Approved',
    })
      .select('date timeSlot schedulePeriod status')
      .sort({ date: 1 });
    const requestedSlots = generateTimeSlots(facility.operatingHours, schedulePeriod);
    const nowTime = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Manila',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(new Date());
    const availableSlots = requestedSlots.filter((slot) => {
      if (from === todayInPhilippines() && slot <= nowTime) return false;
      return !reservations.some((reservation) => {
        if (reservation.date < from || reservation.date > to) return false;
        if (reservation.timeSlot === slot) return true;
        return TIME_SLOTS.includes(reservation.timeSlot) && slotPeriod(slot) === reservation.timeSlot;
      });
    });
    return res.json({
      reservations,
      availableSlots,
      operatingHours: publicFacility(facility).operatingHours,
    });
  } catch (error) {
    return handleError(res, error, 'Could not load facility availability');
  }
};

exports.listFacilities = async (req, res) => {
  try {
    const facilities = await Facility.find({ isActive: true }).sort({ name: 1 });
    return res.json({ facilities: facilities.map(publicFacility) });
  } catch (error) {
    return handleError(res, error, 'Could not load facilities');
  }
};

exports.getFacilityPhoto = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'Facility photo not found' });
  }
  try {
    const facility = await Facility.findOne({ _id: req.params.id, isActive: true }).select('photo');
    if (!facility?.photo) return res.status(404).json({ message: 'Facility photo not found' });
    return res.json({
      photo: {
        mimeType: facility.photo.mimeType,
        data: facility.photo.data,
        name: facility.photo.name,
      },
    });
  } catch (error) {
    return handleError(res, error, 'Could not load facility photo');
  }
};

exports.updateFacilityPhoto = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'Facility not found' });
  }
  const result = validateImage(req.body, 1024 * 1024);
  if (result.error) return res.status(400).json({ message: result.error });
  try {
    const facility = await Facility.findOne({ _id: req.params.id, isActive: true });
    if (!facility) return res.status(404).json({ message: 'Facility not found' });
    facility.photo = result.image;
    await facility.save();
    return res.json({ facility: publicFacility(facility) });
  } catch (error) {
    return handleError(res, error, 'Could not update facility photo');
  }
};

exports.deleteFacilityPhoto = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'Facility not found' });
  }
  try {
    const facility = await Facility.findOne({ _id: req.params.id, isActive: true });
    if (!facility) return res.status(404).json({ message: 'Facility not found' });
    facility.photo = null;
    await facility.save();
    return res.json({ facility: publicFacility(facility) });
  } catch (error) {
    return handleError(res, error, 'Could not remove facility photo');
  }
};

exports.updateFacilitySettings = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'Facility not found' });
  }
  if (Object.keys(req.body ?? {}).some((key) => key !== 'operatingHours')) {
    return res.status(400).json({ message: 'Only facility operating hours can be updated here.' });
  }
  const { operatingHours } = req.body ?? {};
  let nextHours = null;
  if (operatingHours !== null) {
    const { opensAt, closesAt } = operatingHours ?? {};
    if (
      !validTime(opensAt) ||
      !validTime(closesAt) ||
      opensAt >= closesAt
    ) {
      return res.status(400).json({ message: 'Enter valid opening and closing times; closing must be later.' });
    }
    nextHours = { opensAt, closesAt, slotMinutes: 60 };
  }
  try {
    const facility = await Facility.findOne({ _id: req.params.id, isActive: true });
    if (!facility) return res.status(404).json({ message: 'Facility not found' });
    facility.operatingHours = nextHours;
    await facility.save();
    return res.json({ facility: publicFacility(facility) });
  } catch (error) {
    return handleError(res, error, 'Could not update facility operating hours');
  }
};

exports.listMine = async (req, res) => {
  try {
    const reservations = await Reservation.find({ resident: req.user._id })
      .sort({ date: -1, createdAt: -1 })
      .populate('statusHistory.by', 'name');
    return res.json({ reservations });
  } catch (error) {
    return handleError(res, error, 'Could not load your reservations');
  }
};

exports.getMyReservation = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'Reservation not found' });
  }
  try {
    const reservation = await Reservation.findOne({
      _id: req.params.id,
      resident: req.user._id,
    }).populate('statusHistory.by', 'name');
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    return res.json({ reservation });
  } catch (error) {
    return handleError(res, error, 'Could not load reservation details');
  }
};

exports.createReservation = async (req, res) => {
  const {
    facility: facilityId,
    date,
    timeSlot,
    schedulePeriod,
    purpose,
    guestCount = 1,
  } = req.body ?? {};
  if (!mongoose.isValidObjectId(facilityId)) {
    return res.status(400).json({ message: 'Select a valid facility' });
  }
  if (!validDate(date) || date < todayInPhilippines()) {
    return res.status(400).json({ message: 'Choose a valid date that is not in the past' });
  }
  const exactTimeSlot = validTime(timeSlot);
  const legacyTimeSlot = TIME_SLOTS.includes(timeSlot);
  if ((!exactTimeSlot && !legacyTimeSlot) || (schedulePeriod !== undefined && !TIME_SLOTS.includes(schedulePeriod))) {
    return res.status(400).json({ message: 'Select a valid time slot' });
  }
  if (exactTimeSlot && !TIME_SLOTS.includes(schedulePeriod)) {
    return res.status(400).json({ message: 'Select a schedule period for your time slot.' });
  }
  if (typeof purpose !== 'string' || !purpose.trim() || purpose.trim().length > 500) {
    return res.status(400).json({ message: 'Purpose is required and must be 500 characters or fewer' });
  }
  if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 200) {
    return res.status(400).json({ message: 'Guest count must be a whole number between 1 and 200.' });
  }

  try {
    const facility = await Facility.findOne({ _id: facilityId, isActive: true });
    if (!facility) return res.status(404).json({ message: 'Facility is not available' });
    if (exactTimeSlot) {
      const availableForPeriod = generateTimeSlots(facility.operatingHours, schedulePeriod);
      if (!availableForPeriod.includes(timeSlot) || slotPeriod(timeSlot) !== schedulePeriod) {
        return res.status(400).json({ message: 'That time is outside the facility operating hours.' });
      }
      const currentTime = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Manila',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      }).format(new Date());
      if (date === todayInPhilippines() && timeSlot <= currentTime) {
        return res.status(400).json({ message: 'Choose a time slot that has not already started.' });
      }
    }
    const conflict = exactTimeSlot
      ? await Reservation.exists({
          facility: facility._id,
          date,
          status: 'Approved',
          $or: [{ timeSlot }, { timeSlot: schedulePeriod }],
        })
      : await Reservation.exists({
          facility: facility._id,
          date,
          timeSlot,
          status: 'Approved',
        });
    if (conflict) {
      return res.status(409).json({
        message: 'This facility is already approved for that date and time slot.',
        code: 'RESERVATION_CONFLICT',
      });
    }

    const reservation = await Reservation.create({
      resident: req.user._id,
      facility: facility._id,
      facilityName: facility.name,
      date,
      timeSlot,
      schedulePeriod: exactTimeSlot ? schedulePeriod : null,
      purpose: purpose.trim(),
      guestCount,
      feeCentavos: facility.feeCentavos,
      feeDescription: facility.feeDescription,
      statusHistory: [{ status: 'Pending', by: req.user._id }],
    });
    await reservation.populate('resident', EMAIL_NAME);
    const residentReservation = reservation.toObject();
    delete residentReservation.adminNote;
    delete residentReservation.statusHistory;
    await createNotification({
      resident: req.user._id,
      type: 'reservation',
      title: 'Reservation request received',
      message: `${facility.name} is pending HOA review for ${date} (${timeSlot}).`,
      path: '/bookings',
      targetId: reservation._id,
    });
    return res.status(201).json({ reservation: residentReservation });
  } catch (error) {
    return handleError(res, error, 'Could not create the reservation');
  }
};

exports.listAll = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .sort({ date: 1, createdAt: -1 })
      .populate('resident', EMAIL_NAME)
      .populate('statusHistory.by', 'name');
    return res.json({ reservations });
  } catch (error) {
    return handleError(res, error, 'Could not load reservations');
  }
};

exports.getOne = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'Reservation not found' });
  }
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('resident', EMAIL_NAME)
      .populate('statusHistory.by', 'name');
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    return res.json({ reservation });
  } catch (error) {
    return handleError(res, error, 'Could not load the reservation');
  }
};

exports.updateReservation = async (req, res) => {
  const { status, adminNote } = req.body ?? {};
  if (status === undefined && adminNote === undefined) {
    return res.status(400).json({ message: 'Provide a status or administrator note to update' });
  }
  if (status !== undefined && !STATUSES.includes(status)) {
    return res.status(400).json({ message: `Status must be one of: ${STATUSES.join(', ')}` });
  }
  if (adminNote !== undefined && (typeof adminNote !== 'string' || adminNote.trim().length > 2000)) {
    return res.status(400).json({ message: 'Administrator notes must be 2,000 characters or fewer' });
  }
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'Reservation not found' });
  }

  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });

    const nextNote = adminNote === undefined ? reservation.adminNote : adminNote.trim();
    const noteChanged = nextNote !== reservation.adminNote;
    const nextStatus = status ?? reservation.status;
    const statusChanged = nextStatus !== reservation.status;

    if (statusChanged && !(NEXT_STATUSES[reservation.status] ?? []).includes(nextStatus)) {
      return res.status(409).json({
        message: `A ${reservation.status.toLowerCase()} reservation cannot be changed to ${nextStatus.toLowerCase()}.`,
      });
    }
    if (!statusChanged && !noteChanged) {
      await reservation.populate([
        { path: 'resident', select: EMAIL_NAME },
        { path: 'statusHistory.by', select: 'name' },
      ]);
      return res.json({ reservation });
    }

    if (statusChanged) reservation.status = nextStatus;
    if (adminNote !== undefined) reservation.adminNote = nextNote;
    reservation.statusHistory.push({
      status: reservation.status,
      note: noteChanged ? nextNote : '',
      by: req.user._id,
    });
    await reservation.save();
    await reservation.populate([
      { path: 'resident', select: EMAIL_NAME },
      { path: 'statusHistory.by', select: 'name' },
    ]);
    if (statusChanged || noteChanged) {
      await createNotification({
        resident: reservation.resident._id ?? reservation.resident,
        type: 'reservation',
        title: 'Reservation updated',
        message: nextNote || `Your ${reservation.facilityName} reservation is now ${reservation.status.toLowerCase()}.`,
        path: '/bookings',
        targetId: reservation._id,
      });
    }
    return res.json({ reservation });
  } catch (error) {
    return handleError(res, error, 'Could not update the reservation');
  }
};

exports.cancelMyReservation = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'Reservation not found' });
  }
  try {
    const reservation = await Reservation.findOne({
      _id: req.params.id,
      resident: req.user._id,
    });
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    if (!['Pending', 'Approved'].includes(reservation.status)) {
      return res.status(409).json({ message: 'This reservation can no longer be cancelled.' });
    }
    reservation.status = 'Cancelled';
    reservation.statusHistory.push({
      status: 'Cancelled',
      note: 'Cancelled by resident',
      by: req.user._id,
    });
    await reservation.save();
    return res.json({ reservation: { _id: reservation._id, status: reservation.status } });
  } catch (error) {
    return handleError(res, error, 'Could not cancel reservation');
  }
};
