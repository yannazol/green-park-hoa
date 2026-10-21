const mongoose = require('mongoose');
const Concern = require('../models/Concern');

const STATUSES = Concern.schema.path('status').enumValues;

// Resident: submit a concern
exports.createConcern = async (req, res) => {
  const { type, category, subject, description } = req.body ?? {};

  try {
    // The resident always comes from the login token, never from the request body
    const concern = await Concern.create({
      resident: req.user._id,
      type,
      category,
      subject,
      description,
    });
    res.status(201).json({ concern });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const first = Object.values(err.errors)[0];
      return res.status(400).json({ message: first.message });
    }
    res.status(500).json({ message: 'Could not save the concern' });
  }
};

// Resident: list my own concerns
exports.getMyConcerns = async (req, res) => {
  const concerns = await Concern.find({ resident: req.user._id }).sort({ createdAt: -1 });
  res.json({ concerns });
};

// Staff/admin: list all concerns, optionally filtered by ?status=
exports.getAllConcerns = async (req, res) => {
  const filter = {};
  const { status } = req.query;
  if (typeof status === 'string' && STATUSES.includes(status)) {
    filter.status = status;
  }

  const concerns = await Concern.find(filter)
    .sort({ createdAt: -1 })
    .populate('resident', 'name email unit');
  res.json({ concerns });
};

// Staff/admin: change a concern's status (and optionally leave a note)
exports.updateConcernStatus = async (req, res) => {
  const { id } = req.params;
  const { status, staffNote } = req.body ?? {};

  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ message: 'Concern not found' });
  }
  if (!STATUSES.includes(status)) {
    return res.status(400).json({ message: `Status must be one of: ${STATUSES.join(', ')}` });
  }

  const update = { status, handledBy: req.user._id };
  if (typeof staffNote === 'string') update.staffNote = staffNote;

  try {
    const concern = await Concern.findByIdAndUpdate(id, update, {
      returnDocument: 'after',
      runValidators: true,
    }).populate('resident', 'name email unit');

    if (!concern) {
      return res.status(404).json({ message: 'Concern not found' });
    }
    res.json({ concern });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const first = Object.values(err.errors)[0];
      return res.status(400).json({ message: first.message });
    }
    res.status(500).json({ message: 'Could not update the concern' });
  }
};