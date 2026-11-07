const { validateImage } = require('../utils/imageValidation');

exports.getMyProfile = async (req, res) => {
  const { _id, name, email, unit, phone, residentType, createdAt, profilePhoto } = req.user;
  return res.json({
    user: {
      id: _id,
      name,
      email,
      unit: unit ?? '',
      phone: phone ?? '',
      residentType: residentType ?? null,
      createdAt,
      profilePhoto: profilePhoto
        ? { mimeType: profilePhoto.mimeType, data: profilePhoto.data }
        : null,
    },
  });
};

exports.updateMyProfilePhoto = async (req, res) => {
  if (Object.keys(req.body ?? {}).some((key) => !['mimeType', 'data', 'name'].includes(key))) {
    return res.status(400).json({ message: 'Only profile photo image data can be uploaded here.' });
  }
  const result = validateImage(req.body, 1024 * 1024);
  if (result.error) return res.status(400).json({ message: result.error });

  try {
    req.user.profilePhoto = result.image;
    await req.user.save();
    return exports.getMyProfile(req, res);
  } catch (error) {
    console.error('Could not update resident profile photo:', error.message);
    return res.status(500).json({ message: 'Could not update your profile photo' });
  }
};

exports.updateMyProfile = async (req, res) => {
  const { name, phone } = req.body ?? {};
  const updates = {};
  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 80) {
      return res.status(400).json({ message: 'Name is required and must be 80 characters or fewer.' });
    }
    updates.name = name.trim();
  }
  if (phone !== undefined) {
    if (typeof phone !== 'string' || (phone.trim() && !/^[0-9+()\-\s]{7,30}$/.test(phone.trim()))) {
      return res.status(400).json({ message: 'Enter a valid phone number.' });
    }
    updates.phone = phone.trim();
  }
  if (Object.keys(req.body ?? {}).some((key) => !['name', 'phone'].includes(key))) {
    return res.status(400).json({ message: 'Only your name and phone number can be changed here.' });
  }

  try {
    Object.assign(req.user, updates);
    if (Object.keys(updates).length) await req.user.save();
    return exports.getMyProfile(req, res);
  } catch (error) {
    console.error('Could not update resident profile:', error.message);
    return res.status(500).json({ message: 'Could not update your profile' });
  }
};
