import { encrypt, decrypt, encryptCookieKey } from './cryptoHelper';
import { cookies } from 'next/headers';

/**
 * Cookie Helper for AES Encrypted Key and Value Cookies
 */
export async function setEncryptedCookie(key, value, options = {}) {
  const cookieStore = await cookies();
  const encryptedKey = encryptCookieKey(key);
  const encryptedValue = encrypt(typeof value === 'object' ? JSON.stringify(value) : String(value));

  cookieStore.set(encryptedKey, encryptedValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    ...options
  });
}

export async function getEncryptedCookie(key) {
  const cookieStore = await cookies();
  const encryptedKey = encryptCookieKey(key);
  const cookieItem = cookieStore.get(encryptedKey);
  
  if (cookieItem && cookieItem.value) {
    const decryptedValue = decrypt(cookieItem.value);
    try {
      return JSON.parse(decryptedValue);
    } catch {
      return decryptedValue;
    }
  }

  // Fallback check for legacy unencrypted key
  const legacyItem = cookieStore.get(key);
  if (legacyItem && legacyItem.value) {
    const decryptedValue = decrypt(legacyItem.value);
    try {
      return JSON.parse(decryptedValue);
    } catch {
      return decryptedValue || legacyItem.value;
    }
  }

  return null;
}

export async function deleteEncryptedCookie(key) {
  const cookieStore = await cookies();
  const encryptedKey = encryptCookieKey(key);
  cookieStore.delete(encryptedKey);
  cookieStore.delete(key);
}
