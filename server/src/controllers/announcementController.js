const mongoose = require('mongoose');
const Announcement = require('../models/Announcement');
const { notifyResidents } = require('../utils/notifications');

const CATEGORIES = ['Notice', 'Maintenance', 'Reminder', 'Fees'];
const STATUSES = ['Draft', 'Scheduled', 'Published', 'Archived'];
const MAX_IMAGE_BYTES = 1024 * 1024;
const MAX_IMAGES = 3;
const MAX_IMAGE_PIXELS = 40_000_000;
const CRC_TABLE = new Uint32Array(256);
for (let index = 0; index < CRC_TABLE.length; index += 1) {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  CRC_TABLE[index] = value >>> 0;
}

function crc32(bytes, start, end) {
  let crc = 0xffffffff;
  for (let index = start; index < end; index += 1) {
    crc = CRC_TABLE[(crc ^ bytes[index]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function escapedRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function validImage(mimeType, bytes) {
  if (mimeType === 'image/jpeg') {
    if (
      bytes.length < 12 ||
      bytes[0] !== 0xff ||
      bytes[1] !== 0xd8 ||
      bytes[bytes.length - 2] !== 0xff ||
      bytes[bytes.length - 1] !== 0xd9
    ) {
      return false;
    }

    const frameMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
    let offset = 2;
    let hasFrame = false;
    while (offset + 4 < bytes.length) {
      if (bytes[offset] !== 0xff) return false;
      while (offset < bytes.length && bytes[offset] === 0xff) offset += 1;
      const marker = bytes[offset];
      offset += 1;
      if (marker === 0xd9) return false;
      if (marker === 0xda) {
        if (offset + 2 > bytes.length) return false;
        const segmentLength = bytes.readUInt16BE(offset);
        if (segmentLength < 6 || offset + segmentLength > bytes.length) return false;
        const scanStart = offset + segmentLength;
        return hasFrame && scanStart < bytes.length - 2;
      }
      if ([0xd8, 0x01, 0xd0, 0xd1, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7].includes(marker)) {
        continue;
      }
      if (offset + 2 > bytes.length) return false;
      const segmentLength = bytes.readUInt16BE(offset);
      if (segmentLength < 2 || offset + segmentLength > bytes.length) return false;
      if (frameMarkers.has(marker)) {
        if (segmentLength < 7) return false;
        const height = bytes.readUInt16BE(offset + 3);
        const width = bytes.readUInt16BE(offset + 5);
        if (width === 0 || height === 0 || width * height > MAX_IMAGE_PIXELS) return false;
        hasFrame = true;
      }
      offset += segmentLength;
    }
    return false;
  }
  if (mimeType === 'image/png') {
    if (
      bytes.length < 45 ||
      !bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    ) {
      return false;
    }

    let offset = 8;
    let hasHeader = false;
    let hasImageData = false;
    while (offset + 12 <= bytes.length) {
      const length = bytes.readUInt32BE(offset);
      const chunkEnd = offset + length + 12;
      if (chunkEnd > bytes.length) return false;
      const type = bytes.toString('ascii', offset + 4, offset + 8);
      const dataStart = offset + 8;
      const crcOffset = dataStart + length;
      if (crc32(bytes, offset + 4, crcOffset) !== bytes.readUInt32BE(crcOffset)) return false;

      if (!hasHeader) {
        if (type !== 'IHDR' || length !== 13) return false;
        const width = bytes.readUInt32BE(dataStart);
        const height = bytes.readUInt32BE(dataStart + 4);
        if (width === 0 || height === 0 || width * height > MAX_IMAGE_PIXELS) return false;
        hasHeader = true;
      } else if (type === 'IHDR') {
        return false;
      }
      if (type === 'IDAT') hasImageData = true;
      if (type === 'IEND') {
        return length === 0 && hasImageData && chunkEnd === bytes.length;
      }
      offset = chunkEnd;
    }
    return false;
  }
  if (mimeType === 'image/webp') {
    if (
      bytes.length < 20 ||
      bytes.toString('ascii', 0, 4) !== 'RIFF' ||
      bytes.readUInt32LE(4) !== bytes.length - 8 ||
      bytes.toString('ascii', 8, 12) !== 'WEBP'
    ) {
      return false;
    }

    let offset = 12;
    let firstChunk = '';
    let firstChunkLength = 0;
    while (offset + 8 <= bytes.length) {
      const chunkType = bytes.toString('ascii', offset, offset + 4);
      const chunkLength = bytes.readUInt32LE(offset + 4);
      if (offset + 8 + chunkLength > bytes.length) return false;
      if (!firstChunk) {
        firstChunk = chunkType;
        firstChunkLength = chunkLength;
      }
      offset += 8 + chunkLength + (chunkLength % 2);
    }
    if (offset !== bytes.length) return false;

    let width;
    let height;
    if (firstChunk === 'VP8X' && firstChunkLength >= 10) {
      width = 1 + bytes.readUIntLE(24, 3);
      height = 1 + bytes.readUIntLE(27, 3);
    } else if (firstChunk === 'VP8L' && firstChunkLength >= 5 && bytes[20] === 0x2f) {
      width = 1 + (((bytes[22] & 0x3f) << 8) | bytes[21]);
      height = 1 + (((bytes[24] & 0x0f) << 10) | (bytes[23] << 2) | ((bytes[22] & 0xc0) >> 6));
    } else if (
      firstChunk === 'VP8 ' &&
      firstChunkLength >= 10 &&
      bytes[23] === 0x9d &&
      bytes[24] === 0x01 &&
      bytes[25] === 0x2a
    ) {
      width = bytes.readUInt16LE(26) & 0x3fff;
      height = bytes.readUInt16LE(28) & 0x3fff;
    } else {
      return false;
    }
    return width > 0 && height > 0 && width * height <= MAX_IMAGE_PIXELS;
  }
  return false;
}

function validateImages(images) {
  if (images === undefined) return { images: undefined };
  if (!Array.isArray(images) || images.length > MAX_IMAGES) {
    return { error: 'Add no more than 3 images.' };
  }

  const validated = [];
  for (const image of images) {
    if (
      !image ||
      typeof image !== 'object' ||
      !['image/jpeg', 'image/png', 'image/webp'].includes(image.mimeType) ||
      typeof image.data !== 'string' ||
      !/^[A-Za-z0-9+/]+={0,2}$/.test(image.data)
    ) {
      return { error: 'Images must be valid JPEG, PNG, or WebP files.' };
    }

    const padding = image.data.endsWith('==') ? 2 : image.data.endsWith('=') ? 1 : 0;
    const estimatedBytes = Math.floor((image.data.length * 3) / 4) - padding;
    if (estimatedBytes === 0 || estimatedBytes > MAX_IMAGE_BYTES) {
      return { error: 'Each image must be 1 MB or smaller.' };
    }

    const bytes = Buffer.from(image.data, 'base64');
    if (
      bytes.length > MAX_IMAGE_BYTES ||
      bytes.toString('base64') !== image.data ||
      !validImage(image.mimeType, bytes)
    ) {
      return { error: 'The image content does not match its file type or is invalid.' };
    }

    validated.push({
      mimeType: image.mimeType,
      data: image.data,
      name: typeof image.name === 'string' ? image.name.trim().slice(0, 160) : '',
    });
  }

  return { images: validated };
}

function validateContent(body) {
  const { title, category, message } = body ?? {};
  if (typeof title !== 'string' || !title.trim() || title.trim().length > 160) {
    return { error: 'Title is required and must be 160 characters or fewer.' };
  }
  if (!CATEGORIES.includes(category)) {
    return { error: `Category must be one of: ${CATEGORIES.join(', ')}.` };
  }
  if (typeof message !== 'string' || !message.trim() || message.trim().length > 10000) {
    return { error: 'Message is required and must be 10,000 characters or fewer.' };
  }
  return { data: { title: title.trim(), category, message: message.trim() } };
}

function publicImage(image) {
  return { mimeType: image.mimeType, data: image.data, name: image.name };
}

function safeAnnouncement(announcement, includeImages = false, viewerId) {
  const value = announcement.toObject ? announcement.toObject() : { ...announcement };
  value.authorName =
    value.createdBy?.name ??
    value.history?.find((entry) => entry.actorName)?.actorName ??
    'Green Park Village HOA';
  value.likesCount = value.likes?.length ?? 0;
  value.commentsCount = (value.comments ?? []).filter((comment) => comment.status !== 'Hidden').length;
  value.likedByMe = viewerId
    ? (value.likes ?? []).some((id) => String(id) === String(viewerId))
    : false;
  if (includeImages) {
    value.images = (value.images ?? []).map(publicImage);
  } else {
    value.images = (value.images ?? []).map(({ mimeType, name }) => ({ mimeType, name }));
  }
  delete value.history;
  delete value.createdBy;
  delete value.likes;
  delete value.comments;
  return value;
}

function isResidentPublished(announcement) {
  return (
    (announcement.status ?? 'Published') === 'Published' &&
    (!announcement.publishAt || announcement.publishAt <= new Date())
  );
}

function statusFilter(status) {
  if (status === 'All' || status === 'all' || !status) return {};
  if (status === 'Published') {
    return { $or: [{ status: 'Published' }, { status: { $exists: false } }] };
  }
  return { status };
}

function dateFilter(from, to) {
  if (!from && !to) return null;
  const range = {};
  if (from) range.$gte = new Date(`${from}T00:00:00.000+08:00`);
  if (to) range.$lte = new Date(`${to}T23:59:59.999+08:00`);
  return { date: range };
}

function isDateOnly(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

function parsePublishAt(value) {
  if (typeof value !== 'string') return null;
  const isLocalManilaTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value);
  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);
  if (!isLocalManilaTime && !hasTimezone) return null;
  const date = new Date(isLocalManilaTime ? `${value}:00+08:00` : value);
  if (Number.isNaN(date.valueOf())) return null;
  if (isLocalManilaTime) {
    const formatted = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(date);
    const parts = Object.fromEntries(formatted.map(({ type, value: part }) => [type, part]));
    if (`${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}` !== value) {
      return null;
    }
  }
  return date;
}

function handleError(res, error, message) {
  console.error(`${message}:`, error.message);
  return res.status(500).json({ message });
}

async function publishDueAnnouncements() {
  const now = new Date();
  while (true) {
    const announcement = await Announcement.findOneAndUpdate(
      { status: 'Scheduled', publishAt: { $lte: now } },
      {
        $set: { status: 'Published', publishedAt: now, date: now },
        $push: {
          history: {
            action: 'Published automatically',
            actor: null,
            actorName: 'System',
            at: now,
            details: 'Scheduled publication time reached (Asia/Manila).',
          },
        },
      },
      { new: true, sort: { publishAt: 1 } }
    ).select('_id title');
    if (!announcement) break;
    await notifyResidents({
      type: 'announcement',
      title: 'New community announcement',
      message: announcement.title,
      path: '/announcements',
      targetId: announcement._id,
    });
  }
}

exports.list = async (req, res) => {
  try {
    await publishDueAnnouncements();

    if (req.user.role === 'resident') {
      const announcements = await Announcement.find({
        $or: [{ status: 'Published' }, { status: { $exists: false } }],
        $and: [
          {
            $or: [
              { publishAt: null },
              { publishAt: { $exists: false } },
              { publishAt: { $lte: new Date() } },
            ],
          },
        ],
      })
        .populate('createdBy', 'name')
        .select('-images.data -history -comments.message -comments.authorName -comments.resident')
        .sort({ publishedAt: -1, date: -1, createdAt: -1 })
        .limit(20);

      return res.json({
        announcements: announcements.map((item) => safeAnnouncement(item, false, req.user._id)),
      });
    }

    if (req.query.status && req.query.status !== 'All' && !STATUSES.includes(req.query.status)) {
      return res.status(400).json({ message: 'Announcement status filter is invalid.' });
    }
    if (req.query.category && !CATEGORIES.includes(req.query.category)) {
      return res.status(400).json({ message: 'Announcement category filter is invalid.' });
    }
    if (
      (req.query.from && !isDateOnly(req.query.from)) ||
      (req.query.to && !isDateOnly(req.query.to)) ||
      (req.query.from && req.query.to && req.query.from > req.query.to)
    ) {
      return res.status(400).json({ message: 'Choose a valid date range.' });
    }

    const page = Math.min(10000, Math.max(1, Number.parseInt(req.query.page, 10) || 1));
    const limit = Math.min(20, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
    const filter = { ...statusFilter(req.query.status) };
    if (CATEGORIES.includes(req.query.category)) filter.category = req.query.category;
    if (typeof req.query.search === 'string' && req.query.search.trim()) {
      const expression = new RegExp(escapedRegex(req.query.search.trim().slice(0, 100)), 'i');
      filter.$and = [
        ...(filter.$and ?? []),
        { $or: [{ title: expression }, { message: expression }] },
      ];
    }
    if (typeof req.query.from === 'string' || typeof req.query.to === 'string') {
      const dates = dateFilter(req.query.from, req.query.to);
      if (dates) filter.date = dates.date;
    }

    const [announcements, total, counts] = await Promise.all([
      Announcement.find(filter)
        .populate('createdBy', 'name')
        .select('-images.data -history -comments.message -comments.authorName -comments.resident')
        .sort({ date: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Announcement.countDocuments(filter),
      Announcement.aggregate([
        {
          $group: {
            _id: { $ifNull: ['$status', 'Published'] },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const summary = { total: 0, Draft: 0, Scheduled: 0, Published: 0, Archived: 0 };
    for (const entry of counts) {
      if (Object.hasOwn(summary, entry._id)) summary[entry._id] = entry.count;
      summary.total += entry.count;
    }

    return res.json({
      announcements: announcements.map((item) => safeAnnouncement(item, false, req.user._id)),
      summary,
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (error) {
    return handleError(res, error, 'Could not load announcements');
  }
};

exports.getOne = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'Announcement not found' });
  }
  try {
    await publishDueAnnouncements();
    const announcement = await Announcement.findById(req.params.id)
      .populate('createdBy', 'name')
      .select('-comments.message -comments.authorName -comments.resident');
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
    if (req.user.role === 'resident' && !isResidentPublished(announcement)) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    return res.json({ announcement: safeAnnouncement(announcement, true, req.user._id) });
  } catch (error) {
    return handleError(res, error, 'Could not load announcement');
  }
};

exports.getImage = async (req, res) => {
  const { id, index } = req.params;
  const imageIndex = Number(index);
  if (!mongoose.isValidObjectId(id) || !Number.isInteger(imageIndex) || imageIndex < 0 || imageIndex >= MAX_IMAGES) {
    return res.status(404).json({ message: 'Announcement image not found' });
  }
  try {
    await publishDueAnnouncements();
    const announcement = await Announcement.findById(id).select('status publishAt images');
    if (!announcement || (req.user.role === 'resident' && !isResidentPublished(announcement))) {
      return res.status(404).json({ message: 'Announcement image not found' });
    }
    const image = announcement.images[imageIndex];
    if (!image) return res.status(404).json({ message: 'Announcement image not found' });
    return res.json({ image: publicImage(image) });
  } catch (error) {
    return handleError(res, error, 'Could not load announcement image');
  }
};

exports.toggleLike = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'Announcement not found' });
  }
  try {
    await publishDueAnnouncements();
    const announcement = await Announcement.findById(req.params.id).select('status publishAt likes');
    if (!announcement || !isResidentPublished(announcement)) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    const alreadyLiked = announcement.likes.some((id) => String(id) === String(req.user._id));
    const updatedLike = await Announcement.updateOne(
      {
        _id: announcement._id,
        $and: [
          { $or: [{ status: 'Published' }, { status: { $exists: false } }] },
          {
            $or: [
              { publishAt: null },
              { publishAt: { $exists: false } },
              { publishAt: { $lte: new Date() } },
            ],
          },
        ],
      },
      alreadyLiked ? { $pull: { likes: req.user._id } } : { $addToSet: { likes: req.user._id } },
    );
    if (updatedLike.matchedCount === 0) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    const updated = await Announcement.findById(announcement._id).select('likes');
    return res.json({
      liked: !alreadyLiked,
      likesCount: updated.likes.length,
    });
  } catch (error) {
    return handleError(res, error, 'Could not update announcement like');
  }
};

exports.getComments = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'Announcement not found' });
  }
  try {
    await publishDueAnnouncements();
    const announcement = await Announcement.findById(req.params.id).select('status publishAt comments');
    if (!announcement || (req.user.role === 'resident' && !isResidentPublished(announcement))) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    const comments = announcement.comments
      .filter((comment) => req.user.role !== 'resident' || comment.status !== 'Hidden')
      .map((comment) => ({
        _id: comment._id,
        authorName: comment.authorName,
        message: comment.message,
        status: comment.status,
        createdAt: comment.createdAt,
      }));
    return res.json({ comments });
  } catch (error) {
    return handleError(res, error, 'Could not load announcement comments');
  }
};

exports.createComment = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'Announcement not found' });
  }
  const message = req.body?.message;
  if (typeof message !== 'string' || !message.trim() || message.trim().length > 1000) {
    return res.status(400).json({ message: 'Comment is required and must be 1,000 characters or fewer.' });
  }
  try {
    await publishDueAnnouncements();
    const announcement = await Announcement.findById(req.params.id).select('status publishAt comments');
    if (!announcement || !isResidentPublished(announcement)) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    if (announcement.comments.length >= 500) {
      return res.status(409).json({ message: 'This announcement has reached its comment limit.' });
    }
    announcement.comments.push({
      resident: req.user._id,
      authorName: req.user.name,
      message: message.trim(),
      status: 'Visible',
    });
    await announcement.save();
    const comment = announcement.comments[announcement.comments.length - 1];
    return res.status(201).json({
      comment: {
        _id: comment._id,
        authorName: comment.authorName,
        message: comment.message,
        createdAt: comment.createdAt,
      },
      commentsCount: announcement.comments.filter((entry) => entry.status !== 'Hidden').length,
    });
  } catch (error) {
    return handleError(res, error, 'Could not save announcement comment');
  }
};

exports.moderateComment = async (req, res) => {
  const { id, commentId } = req.params;
  const { status } = req.body ?? {};
  if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(commentId)) {
    return res.status(404).json({ message: 'Comment not found' });
  }
  if (!['Visible', 'Hidden'].includes(status)) {
    return res.status(400).json({ message: 'Comment status must be Visible or Hidden.' });
  }
  try {
    const announcement = await Announcement.findById(id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
    const comment = announcement.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    comment.status = status;
    await announcement.save();
    return res.json({
      comment: {
        _id: comment._id,
        authorName: comment.authorName,
        message: comment.message,
        status: comment.status,
        createdAt: comment.createdAt,
      },
      commentsCount: announcement.comments.filter((entry) => entry.status !== 'Hidden').length,
    });
  } catch (error) {
    return handleError(res, error, 'Could not moderate announcement comment');
  }
};

exports.create = async (req, res) => {
  const { data, error } = validateContent(req.body);
  if (error) return res.status(400).json({ message: error });
  const imageResult = validateImages(req.body.images);
  if (imageResult.error) return res.status(400).json({ message: imageResult.error });
  const status = req.body.status ?? 'Draft';
  if (!['Draft', 'Published', 'Scheduled'].includes(status)) {
    return res.status(400).json({ message: 'New announcements can be saved as drafts, published, or scheduled.' });
  }

  const now = new Date();
  let publishAt = null;
  if (status === 'Scheduled') {
    publishAt = parsePublishAt(req.body.publishAt);
    if (!publishAt || publishAt <= now) {
      return res.status(400).json({ message: 'Choose a future publication time in Philippine time.' });
    }
  }

  try {
    const announcement = await Announcement.create({
      ...data,
      createdBy: req.user._id,
      status,
      publishAt,
      publishedAt: status === 'Published' ? now : null,
      date: status === 'Published' ? now : publishAt ?? now,
      images: imageResult.images ?? [],
      history: [
        {
          action:
            status === 'Draft'
              ? 'Draft created'
              : status === 'Scheduled'
                ? 'Publication scheduled'
                : 'Published',
          actor: req.user._id,
          actorName: req.user.name,
          at: now,
          details: status === 'Scheduled' ? `Scheduled for ${publishAt.toISOString()}` : '',
        },
      ],
    });
    if (status === 'Published') {
      await notifyResidents({
        type: 'announcement',
        title: 'New community announcement',
        message: announcement.title,
        path: '/announcements',
        targetId: announcement._id,
      });
    }
    return res.status(201).json({ announcement: safeAnnouncement(announcement, true, req.user._id) });
  } catch (createError) {
    return handleError(res, createError, 'Could not create announcement');
  }
};

exports.update = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'Announcement not found' });
  }

  const status = req.body.status;
  if (status !== undefined && !STATUSES.includes(status)) {
    return res.status(400).json({ message: `Status must be one of: ${STATUSES.join(', ')}.` });
  }

  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });

    const hasContent = ['title', 'category', 'message'].some((key) =>
      Object.hasOwn(req.body, key)
    );
    const content = hasContent
      ? validateContent({
          title: req.body.title ?? announcement.title,
          category: req.body.category ?? announcement.category,
          message: req.body.message ?? announcement.message,
        })
      : { data: {} };
    if (content.error) return res.status(400).json({ message: content.error });
    const imageResult = validateImages(req.body.images);
    if (imageResult.error) return res.status(400).json({ message: imageResult.error });

    const now = new Date();
    let publishAt;
    if (status === 'Scheduled') {
      publishAt = parsePublishAt(req.body.publishAt);
      if (!publishAt || publishAt <= now) {
        return res.status(400).json({ message: 'Choose a future publication time in Philippine time.' });
      }
    }

    const oldStatus = announcement.status ?? 'Published';
    const nextStatus = status ?? oldStatus;
    Object.assign(announcement, content.data);
    if (imageResult.images !== undefined) announcement.images = imageResult.images;
    announcement.status = nextStatus;

    if (nextStatus === 'Scheduled') {
      announcement.publishAt = publishAt;
      announcement.publishedAt = null;
      announcement.date = publishAt;
    } else if (nextStatus === 'Published') {
      announcement.publishAt = null;
      if (oldStatus !== 'Published') announcement.publishedAt = now;
      announcement.date = announcement.publishedAt ?? announcement.date ?? now;
    } else if (nextStatus === 'Draft' || nextStatus === 'Archived') {
      announcement.publishAt = null;
    }

    const action =
      status === 'Archived'
        ? 'Archived'
        : status === 'Draft' && oldStatus === 'Archived'
          ? 'Restored to draft'
          : status === 'Scheduled'
            ? 'Publication scheduled'
            : status === 'Published'
              ? 'Published'
              : 'Updated';
    announcement.history.push({
      action,
      actor: req.user._id,
      actorName: req.user.name,
      at: now,
      details: status === 'Scheduled' ? `Scheduled for ${publishAt.toISOString()}` : '',
    });

    await announcement.save();
    if (oldStatus !== 'Published' && nextStatus === 'Published') {
      await notifyResidents({
        type: 'announcement',
        title: 'New community announcement',
        message: announcement.title,
        path: '/announcements',
        targetId: announcement._id,
      });
    }
    return res.json({ announcement: safeAnnouncement(announcement, true, req.user._id) });
  } catch (updateError) {
    if (updateError.name === 'ValidationError') {
      return res.status(400).json({ message: 'Announcement data is invalid.' });
    }
    return handleError(res, updateError, 'Could not update announcement');
  }
};
