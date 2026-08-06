'use server';

import { revalidatePath } from 'next/cache';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/admin';

export async function getBillingSettingsAction() {
  try {
    const res = await fetch(`${API_URL}/billing-settings`, {
      method: 'GET',
      cache: 'no-store'
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching billing settings:', error);
    return { success: false, message: 'Failed to connect to server' };
  }
}

export async function updateBillingSettingsAction(settingsData) {
  try {
    const res = await fetch(`${API_URL}/billing-settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsData)
    });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/billing-settings');
    }
    return data;
  } catch (error) {
    console.error('Error updating billing settings:', error);
    return { success: false, message: 'Failed to connect to server' };
  }
}
