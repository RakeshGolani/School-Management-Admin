import crypto from 'crypto';

const SECRET_KEY = process.env.COOKIE_ENCRYPTION_KEY || 'super-admin-secret-key-32-chars!!';
const ALGORITHM = 'aes-256-cbc';

// Normalize key to 32 bytes
const getKey = () => {
  return crypto.createHash('sha256').update(String(SECRET_KEY)).digest();
};

// Derive deterministic encrypted cookie key name
export function encryptCookieKey(keyName = 'admin_session') {
  let hash = 0x811c9dc5;
  const str = keyName + String(SECRET_KEY);
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  const hex = (hash >>> 0).toString(16).padStart(8, '0');
  return `enc_key_${hex}`;
}

export function encrypt(text) {
  if (!text) return '';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(String(text), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedText) {
  if (!encryptedText || !encryptedText.includes(':')) return '';
  try {
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return '';
  }
}

