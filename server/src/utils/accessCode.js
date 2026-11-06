const crypto = require('node:crypto');

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LIFETIME_MS = 24 * 60 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const normalize = (code) => String(code).toUpperCase().replace(/[^A-Z0-9]/g, '');
const hashCode = (code) => crypto.createHash('sha256').update(normalize(code)).digest('hex');

function generateAccessCode() {
  const bytes = crypto.randomBytes(8);
  const raw = Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join('');
  const code = `${raw.slice(0, 4)}-${raw.slice(4)}`;
  return {
    code,
    hash: hashCode(code),
    expires: new Date(Date.now() + CODE_LIFETIME_MS),
  };
}

function codeMatches(code, storedHash) {
  const candidate = Buffer.from(hashCode(code), 'hex');
  const stored = Buffer.from(storedHash, 'hex');
  return candidate.length === stored.length && crypto.timingSafeEqual(candidate, stored);
}

module.exports = { generateAccessCode, codeMatches, MAX_ATTEMPTS };
