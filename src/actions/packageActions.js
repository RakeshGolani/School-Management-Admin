'use server';

import { revalidatePath } from 'next/cache';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/admin';

export async function getPackagesAction() {
  try {
    const res = await fetch(`${API_URL}/packages`, {
      method: 'GET',
      cache: 'no-store'
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching packages:', error);
    return { success: false, message: 'Failed to connect to server' };
  }
}

export async function updatePackageAction(id, packageData) {
  try {
    const res = await fetch(`${API_URL}/packages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(packageData)
    });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/packages');
      revalidatePath('/schools');
    }
    return data;
  } catch (error) {
    console.error('Error updating package:', error);
    return { success: false, message: 'Failed to connect to server' };
  }
}
