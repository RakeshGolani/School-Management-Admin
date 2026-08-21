'use server';

import { revalidatePath } from 'next/cache';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/admin';

export async function getSystemSettingsAction() {
  try {
    const res = await fetch(`${API_URL}/system-settings`, {
      method: 'GET',
      cache: 'no-store'
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching system settings:', error);
    return { success: false, message: 'Failed to connect to server' };
  }
}

export async function updateSystemSettingsAction(formDataPayload) {
  try {
    const res = await fetch(`${API_URL}/system-settings`, {
      method: 'PUT',
      // When using FormData, browser automatically sets multipart/form-data boundary
      body: formDataPayload
    });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/settings');
    }
    return data;
  } catch (error) {
    console.error('Error updating system settings:', error);
    return { success: false, message: 'Failed to connect to server' };
  }
}
