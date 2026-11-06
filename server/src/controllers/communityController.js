const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const GateEntryFee = require('../models/GateEntryFee');
const SeniorAssistance = require('../models/SeniorAssistance');
const { createNotification } = require('../utils/notifications');

const VEHICLE_TYPES = ['Car', 'Motorcycle', 'SUV', 'Van'];
const ASSISTANCE_TYPES = [
  'Grocery delivery',
  'Medical / Pharmacy run',
  'Emergency gate escort',
  'Home maintenance',
];
const ASSISTANCE_STATUSES = ['Pending', 'In progress', 'Done', 'Cancelled'];

function handleError(res, error, message) {
  if (error.code === 11000) return res.status(409).json({ message: 'That record already exists.' });
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({ message: 'The submitted information is invalid.' });
  }
  console.error(`${message}:`, error.message);
  return res.status(500).json({ message });
}

exports.listVehicles = async (req, res) => {
  try {
    const filter = req.user.role === 'resident' ? { resident: req.user._id } : {};
    const vehicles = await Vehicle.find(filter)
      .sort({ createdAt: -1 })
      .populate('resident', 'name email unit');
    return res.json({ vehicles });
  } catch (error) {
    return handleError(res, error, 'Could not load vehicles');
  }
};

exports.createVehicle = async (req, res) => {
  const { plateNumber, makeModel, type } = req.body ?? {};
  if (
    typeof plateNumber !== 'string' ||
    !/^[A-Z0-9][A-Z0-9 -]{1,15}$/i.test(plateNumber.trim())
  ) {
    return res.status(400).json({ message: 'Enter a valid plate number.' });
  }
  if (typeof makeModel !== 'string' || !makeModel.trim() || makeModel.trim().length > 80) {
    return res.status(400).json({ message: 'Make and model are required and must be 80 characters or fewer.' });
  }
  if (!VEHICLE_TYPES.includes(type)) {
    return res.status(400).json({ message: `Vehicle type must be one of: ${VEHICLE_TYPES.join(', ')}.` });
  }
  try {
    const vehicle = await Vehicle.create({
      resident: req.user._id,
      plateNumber: plateNumber.trim().toUpperCase(),
      makeModel: makeModel.trim(),
      type,
    });
    await vehicle.populate('resident', 'name email unit');
    return res.status(201).json({ vehicle });
  } catch (error) {
    return handleError(res, error, 'Could not register vehicle');
  }
};

exports.deleteVehicle = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Vehicle not found' });
  try {
    const vehicle = await Vehicle.findOneAndDelete({ _id: req.params.id, resident: req.user._id });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    return res.json({ message: 'Vehicle removed' });
  } catch (error) {
    return handleError(res, error, 'Could not remove vehicle');
  }
};

exports.listGateFees = async (req, res) => {
  try {
    const fees = await GateEntryFee.find().sort({ category: 1 });
    return res.json({ fees });
  } catch (error) {
    return handleError(res, error, 'Could not load gate-entry fees');
  }
};

exports.createGateFee = async (req, res) => {
  const { category, description, amount } = req.body ?? {};
  if (typeof category !== 'string' || !category.trim() || category.trim().length > 100) {
    return res.status(400).json({ message: 'Fee category is required and must be 100 characters or fewer.' });
  }
  if (typeof description !== 'string' || !description.trim() || description.trim().length > 500) {
    return res.status(400).json({ message: 'Fee description is required and must be 500 characters or fewer.' });
  }
  const amountText = String(amount ?? '').trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(amountText)) {
    return res.status(400).json({ message: 'Enter a valid non-negative fee amount.' });
  }
  const amountCentavos = Math.round(Number(amountText) * 100);
  if (!Number.isSafeInteger(amountCentavos)) {
    return res.status(400).json({ message: 'Enter a valid non-negative fee amount.' });
  }
  try {
    const fee = await GateEntryFee.create({
      category: category.trim(),
      description: description.trim(),
      amountCentavos,
      updatedBy: req.user._id,
    });
    return res.status(201).json({ fee });
  } catch (error) {
    return handleError(res, error, 'Could not create gate-entry fee');
  }
};

exports.updateGateFee = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Fee not found' });
  const updates = {};
  const { category, description, amount } = req.body ?? {};
  if (category !== undefined) {
    if (typeof category !== 'string' || !category.trim() || category.trim().length > 100) {
      return res.status(400).json({ message: 'Fee category is required and must be 100 characters or fewer.' });
    }
    updates.category = category.trim();
  }
  if (description !== undefined) {
    if (typeof description !== 'string' || !description.trim() || description.trim().length > 500) {
      return res.status(400).json({ message: 'Fee description is required and must be 500 characters or fewer.' });
    }
    updates.description = description.trim();
  }
  if (amount !== undefined) {
    const amountText = String(amount).trim();
    if (!/^\d+(?:\.\d{1,2})?$/.test(amountText) || !Number.isSafeInteger(Math.round(Number(amountText) * 100))) {
      return res.status(400).json({ message: 'Enter a valid non-negative fee amount.' });
    }
    updates.amountCentavos = Math.round(Number(amountText) * 100);
  }
  if (Object.keys(updates).length === 0) return res.status(400).json({ message: 'Provide a fee change.' });
  updates.updatedBy = req.user._id;
  try {
    const fee = await GateEntryFee.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
    if (!fee) return res.status(404).json({ message: 'Fee not found' });
    return res.json({ fee });
  } catch (error) {
    return handleError(res, error, 'Could not update gate-entry fee');
  }
};

exports.listMyAssistance = async (req, res) => {
  try {
    const requests = await SeniorAssistance.find({ resident: req.user._id }).sort({ createdAt: -1 });
    return res.json({ requests });
  } catch (error) {
    return handleError(res, error, 'Could not load assistance requests');
  }
};

exports.createAssistance = async (req, res) => {
  const { type, details } = req.body ?? {};
  if (!ASSISTANCE_TYPES.includes(type)) {
    return res.status(400).json({ message: 'Choose a valid assistance type.' });
  }
  if (typeof details !== 'string' || !details.trim() || details.trim().length > 1000) {
    return res.status(400).json({ message: 'Details are required and must be 1,000 characters or fewer.' });
  }
  try {
    const request = await SeniorAssistance.create({
      resident: req.user._id,
      type,
      details: details.trim(),
      statusHistory: [{ status: 'Pending', by: req.user._id }],
    });
    await createNotification({
      resident: req.user._id,
      type: 'service',
      title: 'Assistance request received',
      message: 'Your senior assistance request is pending HOA review.',
      path: '/services',
      targetId: request._id,
    });
    return res.status(201).json({ request });
  } catch (error) {
    return handleError(res, error, 'Could not submit assistance request');
  }
};

exports.listAllAssistance = async (req, res) => {
  try {
    const requests = await SeniorAssistance.find()
      .sort({ createdAt: -1 })
      .populate('resident', 'name email unit phone')
      .populate('statusHistory.by', 'name');
    return res.json({ requests });
  } catch (error) {
    return handleError(res, error, 'Could not load assistance requests');
  }
};

exports.updateAssistance = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Request not found' });
  const { status, adminNote } = req.body ?? {};
  if (status !== undefined && !ASSISTANCE_STATUSES.includes(status)) {
    return res.status(400).json({ message: `Status must be one of: ${ASSISTANCE_STATUSES.join(', ')}.` });
  }
  if (adminNote !== undefined && (typeof adminNote !== 'string' || adminNote.trim().length > 1000)) {
    return res.status(400).json({ message: 'The administrator note must be 1,000 characters or fewer.' });
  }
  if (status === undefined && adminNote === undefined) {
    return res.status(400).json({ message: 'Provide a status or note to update.' });
  }
  try {
    const request = await SeniorAssistance.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    const nextStatus = status ?? request.status;
    const nextNote = adminNote === undefined ? request.adminNote : adminNote.trim();
    const changed = nextStatus !== request.status || nextNote !== request.adminNote;
    if (changed) {
      request.status = nextStatus;
      request.adminNote = nextNote;
      request.statusHistory.push({ status: nextStatus, note: nextNote, by: req.user._id });
      await request.save();
      await createNotification({
        resident: request.resident,
        type: 'service',
        title: 'Assistance request updated',
        message: nextNote || `Your request is now ${nextStatus.toLowerCase()}.`,
        path: '/services',
        targetId: request._id,
      });
    }
    await request.populate([
      { path: 'resident', select: 'name email unit phone' },
      { path: 'statusHistory.by', select: 'name' },
    ]);
    return res.json({ request });
  } catch (error) {
    return handleError(res, error, 'Could not update assistance request');
  }
};
