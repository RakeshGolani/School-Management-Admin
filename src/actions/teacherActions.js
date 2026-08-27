'use server';

import { revalidatePath } from 'next/cache';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/admin';

export async function getTeachersAction(params = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.subject && params.subject !== 'all') queryParams.append('subject', params.subject);
    if (params.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params.schoolId && params.schoolId !== 'all') queryParams.append('schoolId', params.schoolId);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const queryString = queryParams.toString();
    const url = `${API_URL}/teachers${queryString ? `?${queryString}` : ''}`;

    const res = await fetch(url, {
      method: 'GET',
      cache: 'no-store'
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return { success: false, message: 'Failed to connect to server' };
  }
}

export async function getTeacherByIdAction(id) {
  try {
    const res = await fetch(`${API_URL}/teachers/${id}`, {
      method: 'GET',
      cache: 'no-store'
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching teacher details:', error);
    return { success: false, message: 'Failed to connect to server' };
  }
}

export async function createTeacherAction(teacherData) {
  try {
    const isFormData = typeof FormData !== 'undefined' && teacherData instanceof FormData;
    const options = {
      method: 'POST',
      body: isFormData ? teacherData : JSON.stringify(teacherData)
    };

    if (!isFormData) {
      options.headers = { 'Content-Type': 'application/json' };
    }

    const res = await fetch(`${API_URL}/teachers`, options);
    const data = await res.json();

    if (data.status === 'success' || data.success) {
      revalidatePath('/teachers');
    }

    return data;
  } catch (error) {
    console.error('Error creating teacher:', error);
    return { success: false, message: 'Failed to create teacher' };
  }
}

export async function updateTeacherAction(id, teacherData) {
  try {
    const isFormData = typeof FormData !== 'undefined' && teacherData instanceof FormData;
    const options = {
      method: 'PUT',
      body: isFormData ? teacherData : JSON.stringify(teacherData)
    };

    if (!isFormData) {
      options.headers = { 'Content-Type': 'application/json' };
    }

    const res = await fetch(`${API_URL}/teachers/${id}`, options);
    const data = await res.json();

    if (data.status === 'success' || data.success) {
      revalidatePath('/teachers');
    }

    return data;
  } catch (error) {
    console.error('Error updating teacher:', error);
    return { success: false, message: 'Failed to update teacher' };
  }
}

export async function deleteTeacherAction(id) {
  try {
    const res = await fetch(`${API_URL}/teachers/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();

    if (data.status === 'success' || data.success) {
      revalidatePath('/teachers');
    }

    return data;
  } catch (error) {
    console.error('Error deleting teacher:', error);
    return { success: false, message: 'Failed to delete teacher' };
  }
}

export async function toggleTeacherStatusAction(id, status) {
  try {
    const res = await fetch(`${API_URL}/teachers/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await res.json();

    if (data.status === 'success' || data.success) {
      revalidatePath('/teachers');
    }

    return data;
  } catch (error) {
    console.error('Error toggling teacher status:', error);
    return { success: false, message: 'Failed to update teacher status' };
  }
}
