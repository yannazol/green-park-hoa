const MAX_IMAGE_BYTES = 1024 * 1024;
const MAX_IMAGES = 3;
const MAX_IMAGE_PIXELS = 40_000_000;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
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

function validImage(mimeType, bytes) {
  if (mimeType === 'image/jpeg') {
    if (
      bytes.length < 12 ||
      bytes[0] !== 0xff ||
      bytes[1] !== 0xd8 ||
      bytes[bytes.length - 2] !== 0xff ||
      bytes[bytes.length - 1] !== 0xd9
    ) return false;

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
        return hasFrame && offset + segmentLength < bytes.length - 2;
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
    ) return false;

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
      if (type === 'IEND') return length === 0 && hasImageData && chunkEnd === bytes.length;
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
    ) return false;

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

function validateImage(image, maxBytes = MAX_IMAGE_BYTES) {
  if (
    !image ||
    typeof image !== 'object' ||
    !IMAGE_TYPES.includes(image.mimeType) ||
    typeof image.data !== 'string' ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(image.data)
  ) return { error: 'Choose a valid JPEG, PNG, or WebP image.' };

  const padding = image.data.endsWith('==') ? 2 : image.data.endsWith('=') ? 1 : 0;
  const estimatedBytes = Math.floor((image.data.length * 3) / 4) - padding;
  if (estimatedBytes < 1 || estimatedBytes > maxBytes) {
    return { error: `Image must be ${Math.floor(maxBytes / (1024 * 1024))} MB or smaller.` };
  }
  const bytes = Buffer.from(image.data, 'base64');
  if (
    bytes.length !== estimatedBytes ||
    bytes.toString('base64') !== image.data ||
    !validImage(image.mimeType, bytes)
  ) return { error: 'Image content does not match the selected image type or is invalid.' };

  return {
    image: {
      mimeType: image.mimeType,
      data: image.data,
      name: typeof image.name === 'string' ? image.name.trim().slice(0, 160) : '',
    },
  };
}

function validateImages(images) {
  if (images === undefined) return { images: undefined };
  if (!Array.isArray(images) || images.length > MAX_IMAGES) {
    return { error: 'Add no more than 3 images.' };
  }
  const validated = [];
  for (const image of images) {
    if (!image || typeof image !== 'object' || !IMAGE_TYPES.includes(image.mimeType) || typeof image.data !== 'string') {
      return { error: 'Images must be valid JPEG, PNG, or WebP files.' };
    }
    const result = validateImage(image);
    if (result.error) {
      return {
        error: result.error.includes('MB or smaller')
          ? 'Each image must be 1 MB or smaller.'
          : 'The image content does not match its file type or is invalid.',
      };
    }
    validated.push(result.image);
  }
  return { images: validated };
}

module.exports = { MAX_IMAGES, validateImage, validateImages };
