'use server';

import { revalidatePath } from 'next/cache';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/admin';

export async function getPlansAction() {
  try {
    const res = await fetch(`${API_URL}/plans`, {
      method: 'GET',
      cache: 'no-store'
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching plans:', error);
    return { success: false, message: 'Failed to connect to server' };
  }
}

export async function updatePlanAction(id, planData) {
  try {
    const res = await fetch(`${API_URL}/plans/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(planData)
    });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/plans');
      revalidatePath('/schools');
    }
    return data;
  } catch (error) {
    console.error('Error updating plan:', error);
    return { success: false, message: 'Failed to connect to server' };
  }
}
