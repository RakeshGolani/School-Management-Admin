import { encrypt, decrypt } from './cryptoHelper';
import { cookies } from 'next/headers';

/**
 * Cookie Helper for AES Encrypted Key and Value Cookies
 */
export async function setEncryptedCookie(key, value, options = {}) {
  const cookieStore = await cookies();
  const encryptedKey = encrypt(key);
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
  const allCookies = cookieStore.getAll();
  
  for (const c of allCookies) {
    try {
      const decryptedKey = decrypt(c.name);
      if (decryptedKey === key) {
        const decryptedValue = decrypt(c.value);
        try {
          return JSON.parse(decryptedValue);
        } catch {
          return decryptedValue;
        }
      }
    } catch {
      // Ignore unencrypted or invalid key cookies
    }
  }
  return null;
}

export async function deleteEncryptedCookie(key) {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  for (const c of allCookies) {
    try {
      const decryptedKey = decrypt(c.name);
      if (decryptedKey === key) {
        cookieStore.delete(c.name);
      }
    } catch {
      // Ignore
    }
  }
}
