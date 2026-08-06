'use server';

import { revalidatePath } from 'next/cache';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/admin';

export async function getSchoolsAction() {
  try {
    const res = await fetch(`${API_URL}/schools`, {
      method: 'GET',
      cache: 'no-store'
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching schools:', error);
    return { success: false, message: 'Failed to connect to server' };
  }
}

export async function createSchoolAction(schoolData) {
  try {
    const res = await fetch(`${API_URL}/schools`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schoolData)
    });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/schools');
    }
    return data;
  } catch (error) {
    console.error('Error creating school:', error);
    return { success: false, message: 'Failed to connect to server' };
  }
}

export async function updateSchoolAction(id, schoolData) {
  try {
    const res = await fetch(`${API_URL}/schools/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schoolData)
    });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/schools');
    }
    return data;
  } catch (error) {
    console.error('Error updating school:', error);
    return { success: false, message: 'Failed to connect to server' };
  }
}

export async function deleteSchoolAction(id) {
  try {
    const res = await fetch(`${API_URL}/schools/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/schools');
    }
    return data;
  } catch (error) {
    console.error('Error deleting school:', error);
    return { success: false, message: 'Failed to connect to server' };
  }
}

export async function toggleSchoolStatusAction(id, status) {
  try {
    const res = await fetch(`${API_URL}/schools/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/schools');
    }
    return data;
  } catch (error) {
    console.error('Error toggling school status:', error);
    return { success: false, message: 'Failed to connect to server' };
  }
}

export async function getSchoolByIdAction(id) {
  try {
    const res = await getSchoolsAction();
    if (res.success && Array.isArray(res.data)) {
      const school = res.data.find(s => String(s.id) === String(id));
      if (school) {
        return { success: true, data: school };
      }
    }
    return { success: false, message: 'School not found' };
  } catch (error) {
    console.error('Error fetching school by ID:', error);
    return { success: false, message: 'Failed to fetch school details' };
  }
}

