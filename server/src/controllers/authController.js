const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { codeMatches, MAX_ATTEMPTS } = require('../utils/accessCode');

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  unit: u.unit,
  phone: u.phone || '',
  residentType: u.residentType || null,
});

exports.register = async (req, res) => {
  const { name, email, password, unit } = req.body ?? {};

  if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }
  const cleanEmail = email.toLowerCase().trim();
  const exists = await User.findOne({ email: cleanEmail });
  if (exists) {
    return res.status(409).json({ message: 'Email is already registered' });
  }

  const hashed = await bcrypt.hash(password, 10);
  // Role is always 'resident' here. Never read the role from the request body.
  const user = await User.create({
    name,
    email: cleanEmail,
    password: hashed,
    unit,
    role: 'resident',
  });

  res.status(201).json({ token: signToken(user), user: publicUser(user) });
};

exports.login = async (req, res) => {
  const { email, password } = req.body ?? {};

  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  const valid = user && (await bcrypt.compare(password, user.password));

  if (!valid) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  if (user.isActive === false) {
    return res
      .status(403)
      .json({ message: 'This account has been deactivated. Please contact the HOA office.' });
  }

  res.json({ token: signToken(user), user: publicUser(user) });
};

exports.me = async (req, res) => {
  res.json({ user: publicUser(req.user) });
};

exports.resetPassword = async (req, res) => {
  const { email, code, password } = req.body ?? {};
  if (typeof email !== 'string' || typeof code !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Email, access code and new password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }
  if (Buffer.byteLength(password, 'utf8') > 72) {
    return res.status(400).json({ message: 'Password must be 72 bytes or fewer' });
  }
  if (code.length > 32) {
    return res.status(400).json({ message: 'That access code is invalid or has expired' });
  }

  const invalid = () =>
    res.status(400).json({ message: 'That access code is invalid or has expired' });

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      '+accessCodeHash +accessCodeExpires +accessCodeAttempts'
    );
    const now = new Date();
    if (
      !user ||
      user.role !== 'resident' ||
      user.isActive === false ||
      !user.accessCodeHash ||
      !user.accessCodeExpires ||
      user.accessCodeExpires <= now ||
      user.accessCodeAttempts >= MAX_ATTEMPTS
    ) {
      return invalid();
    }

    if (!codeMatches(code, user.accessCodeHash)) {
      await User.updateOne(
        {
          _id: user._id,
          accessCodeHash: user.accessCodeHash,
          accessCodeExpires: { $gt: now },
          accessCodeAttempts: { $lt: MAX_ATTEMPTS },
        },
        { $inc: { accessCodeAttempts: 1 } }
      );
      return invalid();
    }

    const result = await User.updateOne(
      {
        _id: user._id,
        role: 'resident',
        isActive: { $ne: false },
        accessCodeHash: user.accessCodeHash,
        accessCodeExpires: { $gt: now },
        accessCodeAttempts: { $lt: MAX_ATTEMPTS },
      },
      {
        $set: { password: await bcrypt.hash(password, 10), accessCodeAttempts: 0 },
        $unset: { accessCodeHash: 1, accessCodeExpires: 1 },
      }
    );
    if (result.modifiedCount !== 1) return invalid();
    return res.json({ message: 'Password set successfully. You can now sign in.' });
  } catch (error) {
    console.error('Could not set resident password:', error.message);
    return res.status(500).json({ message: 'Could not set your password' });
  }
};