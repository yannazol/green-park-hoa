const mongoose = require('mongoose');
const Concern = require('../models/Concern');
const { createNotification } = require('../utils/notifications');

const STATUSES = Concern.schema.path('status').enumValues;
const MAX_PHOTOS = 3;
const MAX_PHOTO_BYTES = 1024 * 1024;
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function validatePhotos(photos) {
  if (photos === undefined) return { photos: [] };
  if (!Array.isArray(photos) || photos.length > MAX_PHOTOS) {
    return { error: 'Attach no more than 3 photos.' };
  }
  const result = [];
  for (const photo of photos) {
    if (
      !photo ||
      typeof photo !== 'object' ||
      !PHOTO_TYPES.includes(photo.mimeType) ||
      typeof photo.data !== 'string' ||
      !/^[A-Za-z0-9+/]+={0,2}$/.test(photo.data)
    ) {
      return { error: 'Photos must be valid JPEG, PNG, or WebP images.' };
    }
    const padding = photo.data.endsWith('==') ? 2 : photo.data.endsWith('=') ? 1 : 0;
    const estimate = Math.floor((photo.data.length * 3) / 4) - padding;
    if (estimate < 1 || estimate > MAX_PHOTO_BYTES) {
      return { error: 'Each photo must be 1 MB or smaller.' };
    }
    const data = Buffer.from(photo.data, 'base64');
    let validSignature = false;
    if (photo.mimeType === 'image/jpeg') {
      validSignature = data.length >= 4 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff;
    } else if (photo.mimeType === 'image/png') {
      validSignature =
        data.length >= 24 &&
        data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) &&
        data.toString('ascii', 12, 16) === 'IHDR';
    } else {
      validSignature =
        data.length >= 20 &&
        data.toString('ascii', 0, 4) === 'RIFF' &&
        data.toString('ascii', 8, 12) === 'WEBP';
    }
    if (data.toString('base64') !== photo.data || !validSignature) {
      return { error: 'Photo content does not match the selected image type.' };
    }
    result.push(`data:${photo.mimeType};base64,${photo.data}`);
  }
  return { photos: result };
}

// Allowed status moves. Resolved and rejected are final.
const NEXT_STATUS = {
  pending: ['under_review', 'rejected'],
  under_review: ['in_progress', 'rejected'],
  in_progress: ['resolved', 'rejected'],
  resolved: [],
  rejected: [],
};

// Resident: submit a concern
exports.createConcern = async (req, res) => {
  const { type, category, subject, description } = req.body ?? {};
  const photoResult = validatePhotos(req.body?.photos);
  if (photoResult.error) return res.status(400).json({ message: photoResult.error });

  try {
    // The resident always comes from the login token, never from the request body
    const concern = await Concern.create({
      resident: req.user._id,
      type,
      category,
      subject,
      description,
      photos: photoResult.photos,
      statusHistory: [{ status: 'pending', by: req.user._id }],
    });
    const concernResponse = concern.toObject();
    delete concernResponse.photos;
    res.status(201).json({ concern: concernResponse });
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
  try {
    const concerns = await Concern.find({ resident: req.user._id })
    .select('-statusHistory -photos')
    .sort({ createdAt: -1 });
    return res.json({ concerns });
  } catch (error) {
    console.error('Could not load resident concerns:', error.message);
    return res.status(500).json({ message: 'Could not load concerns' });
  }
};

exports.getMyConcern = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'Concern not found' });
  }
  try {
    const concern = await Concern.findOne({ _id: req.params.id, resident: req.user._id })
    .populate('statusHistory.by', 'name');
    if (!concern) return res.status(404).json({ message: 'Concern not found' });
    return res.json({ concern });
  } catch (error) {
    console.error('Could not load resident concern:', error.message);
    return res.status(500).json({ message: 'Could not load concern details' });
  }
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
    .populate('resident', 'name email unit')
    .populate('statusHistory.by', 'name');
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

const note = typeof staffNote === 'string' ? staffNote.trim() : undefined;

  try {
    const concern = await Concern.findById(id);
    if (!concern) {
      return res.status(404).json({ message: 'Concern not found' });
    }

    const changed = status !== concern.status;
    if (changed && !(NEXT_STATUS[concern.status] ?? []).includes(status)) {
      return res
        .status(400)
        .json({ message: `A concern cannot move from ${concern.status} to ${status}` });
    }

    const noteChanged = note !== undefined && note !== concern.staffNote;
    const finalNote = note !== undefined ? note : concern.staffNote;
    if (status === 'rejected' && !finalNote) {
      return res.status(400).json({ message: 'Please give a reason for rejecting this concern' });
    }

    if (note !== undefined) concern.staffNote = note;
    concern.handledBy = req.user._id;
    if (changed) {
      concern.status = status;
      concern.statusHistory.push({
        status,
        note: noteChanged || status === 'rejected' ? finalNote : '',
        by: req.user._id,
      });
    }
    await concern.save();
    await concern.populate([
      { path: 'resident', select: 'name email unit' },
      { path: 'statusHistory.by', select: 'name' },
    ]);

    if (changed || noteChanged) {
      await createNotification({
        resident: concern.resident._id ?? concern.resident,
        type: 'concern',
        title: 'Concern updated',
        message: finalNote || `Your concern status is now ${concern.status.replaceAll('_', ' ')}.`,
        path: '/concerns',
        targetId: concern._id,
      });
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