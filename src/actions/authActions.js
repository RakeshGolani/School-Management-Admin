'use server';

import { setEncryptedCookie, getEncryptedCookie, deleteEncryptedCookie } from '@/lib/cookieHelper';

const API_URL = 'http://localhost:5000/api/admin';

export async function adminLoginAction(formData) {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await res.json();

    if (data.success) {
      const sessionUser = {
        id: data.data?.user?.id || 1,
        name: data.data?.user?.name || 'Super Admin',
        email: data.data?.user?.email || formData.email,
        role: 'super_admin',
        token: data.data?.token
      };

      await setEncryptedCookie('admin_session', sessionUser);
      return { success: true, message: 'Super Admin login successful', user: sessionUser };
    }

    return { success: false, message: data.message || 'Invalid admin credentials' };
  } catch (error) {
    console.error('Admin login error:', error);
    return { success: false, message: 'Server connectivity error' };
  }
}

export async function getAdminSessionAction() {
  try {
    const session = await getEncryptedCookie('admin_session');
    if (session) {
      return { authenticated: true, user: session };
    }
    return { authenticated: false, user: null };
  } catch {
    return { authenticated: false, user: null };
  }
}

export async function adminLogoutAction() {
  await deleteEncryptedCookie('admin_session');
  return { success: true };
}
