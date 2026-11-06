const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');
const mongoose = require('mongoose');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { generateAccessCode } = require('../utils/accessCode');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+()\-\s]{7,30}$/;
const TYPES = User.schema.path('residentType').enumValues;
const EDITABLE = ['name', 'email', 'unit', 'phone', 'residentType'];
const AUDIT_WARNING = 'The change was saved, but its activity could not be recorded.';

const publicResident = (resident) => ({
  _id: resident._id,
  name: resident.name,
  email: resident.email,
  unit: resident.unit || '',
  phone: resident.phone || '',
  residentType: resident.residentType || null,
  isActive: resident.isActive !== false,
  createdAt: resident.createdAt,
  updatedAt: resident.updatedAt,
});

async function audit(req, action, resident, details) {
  try {
    await AuditLog.create({
      actor: req.user._id,
      actorName: req.user.name,
      action,
      target: resident._id,
      targetLabel: resident.name,
      details,
    });
    return true;
  } catch (error) {
    console.error('Audit log failed:', error.message);
    return false;
  }
}

function validate(body, { requireAll }) {
  const data = {};
  const input = body ?? {};

  for (const key of EDITABLE) {
    if (input[key] === undefined) continue;
    if (typeof input[key] !== 'string') return { error: `Invalid ${key}` };
    data[key] = input[key].trim();
  }

  if (requireAll) {
    for (const key of ['name', 'email', 'unit', 'residentType']) {
      if (!data[key]) {
        return { error: `${key === 'residentType' ? 'Resident type' : key} is required` };
      }
    }
  }
  if (data.name !== undefined && (!data.name || data.name.length > 80)) {
    return { error: 'Name is required and must be 80 characters or fewer' };
  }
  if (data.email !== undefined) {
    data.email = data.email.toLowerCase();
    if (!EMAIL_RE.test(data.email)) return { error: 'Enter a valid email address' };
  }
  if (data.unit !== undefined && (!data.unit || data.unit.length > 40)) {
    return { error: 'Unit is required and must be 40 characters or fewer' };
  }
  if (data.phone && !PHONE_RE.test(data.phone)) {
    return { error: 'Enter a valid phone number' };
  }
  if (data.residentType !== undefined && !TYPES.includes(data.residentType)) {
    return { error: `Resident type must be one of: ${TYPES.join(', ')}` };
  }
  return { data };
}

function findResident(id) {
  return mongoose.isValidObjectId(id) ? User.findOne({ _id: id, role: 'resident' }) : null;
}

function notFound(res) {
  return res.status(404).json({ message: 'Resident not found' });
}

function handleError(res, error, message) {
  console.error(`${message}:`, error.message);
  if (error.code === 11000) {
    return res.status(409).json({ message: 'Email is already registered' });
  }
  return res.status(500).json({ message });
}

exports.listResidents = async (req, res) => {
  try {
    const residents = await User.find({ role: 'resident' }).sort({ name: 1 });
    return res.json({ residents: residents.map(publicResident) });
  } catch (error) {
    return handleError(res, error, 'Could not load residents');
  }
};

exports.getResident = async (req, res) => {
  try {
    const resident = await findResident(req.params.id);
    if (!resident) return notFound(res);

    const activity = await AuditLog.find({ target: resident._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('action actorName details createdAt');
    return res.json({ resident: publicResident(resident), activity });
  } catch (error) {
    return handleError(res, error, 'Could not load resident activity');
  }
};

exports.createResident = async (req, res) => {
  const { data, error } = validate(req.body, { requireAll: true });
  if (error) return res.status(400).json({ message: error });

  const { code, hash, expires } = generateAccessCode();
  try {
    const resident = await User.create({
      ...data,
      role: 'resident',
      password: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10),
      accessCodeHash: hash,
      accessCodeExpires: expires,
    });
    const auditRecorded = await audit(req, 'resident.created', resident, { unit: resident.unit });
    return res.status(201).json({
      resident: publicResident(resident),
      accessCode: { code, expiresAt: expires },
      ...(auditRecorded ? {} : { warning: AUDIT_WARNING }),
    });
  } catch (error) {
    return handleError(res, error, 'Could not add the resident');
  }
};

exports.updateResident = async (req, res) => {
  const { data, error } = validate(req.body, { requireAll: false });
  if (error) return res.status(400).json({ message: error });

  try {
    const resident = await findResident(req.params.id);
    if (!resident) return notFound(res);

    const changes = {};
    for (const key of EDITABLE) {
      if (data[key] !== undefined && data[key] !== (resident[key] || '')) {
        changes[key] = { from: resident[key] || '', to: data[key] };
        resident[key] = data[key];
      }
    }
    if (Object.keys(changes).length === 0) {
      return res.json({ resident: publicResident(resident) });
    }

    await resident.save();
    const auditRecorded = await audit(req, 'resident.updated', resident, { changes });
    return res.json({
      resident: publicResident(resident),
      ...(auditRecorded ? {} : { warning: AUDIT_WARNING }),
    });
  } catch (error) {
    return handleError(res, error, 'Could not update the resident');
  }
};

exports.setResidentStatus = async (req, res) => {
  const { isActive } = req.body ?? {};
  if (typeof isActive !== 'boolean') {
    return res.status(400).json({ message: 'isActive must be true or false' });
  }

  try {
    const resident = await findResident(req.params.id);
    if (!resident) return notFound(res);

    if (resident.isActive !== isActive) {
      resident.isActive = isActive;
      await resident.save();
      const auditRecorded = await audit(
        req,
        isActive ? 'resident.activated' : 'resident.deactivated',
        resident
      );
      return res.json({
        resident: publicResident(resident),
        ...(auditRecorded ? {} : { warning: AUDIT_WARNING }),
      });
    }
    return res.json({ resident: publicResident(resident) });
  } catch (error) {
    return handleError(res, error, 'Could not update resident status');
  }
};

exports.resetResidentAccess = async (req, res) => {
  try {
    const resident = await findResident(req.params.id);
    if (!resident) return notFound(res);
    if (resident.isActive === false) {
      return res.status(400).json({ message: 'Activate this account before resetting its access' });
    }

    const { code, hash, expires } = generateAccessCode();
    resident.accessCodeHash = hash;
    resident.accessCodeExpires = expires;
    resident.accessCodeAttempts = 0;
    await resident.save();
    const auditRecorded = await audit(req, 'resident.access_reset', resident);

    return res.json({
      accessCode: { code, expiresAt: expires },
      ...(auditRecorded ? {} : { warning: AUDIT_WARNING }),
    });
  } catch (error) {
    return handleError(res, error, 'Could not reset resident access');
  }
};
