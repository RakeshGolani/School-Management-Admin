'use server';

import { setEncryptedCookie, getEncryptedCookie, deleteEncryptedCookie } from '@/lib/cookieHelper';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/admin';

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

export async function updateAdminProfileAction(id, profileData) {
  try {
    const res = await fetch(`${API_URL}/profile/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Update admin profile action error:', error);
    return { success: false, message: 'Server connectivity error' };
  }
}

export async function updateAdminSessionAction(newUserData) {
  try {
    const session = await getEncryptedCookie('admin_session');
    if (session) {
      const updatedSession = {
        ...session,
        name: newUserData.name || session.name,
        email: newUserData.email || session.email,
        phone: newUserData.phone || session.phone
      };
      await setEncryptedCookie('admin_session', updatedSession);
      return { success: true, user: updatedSession };
    }
    return { success: false, message: 'No active session found' };
  } catch (error) {
    console.error('Update admin session cookie error:', error);
    return { success: false, message: 'Failed to update session cookie' };
  }
}

