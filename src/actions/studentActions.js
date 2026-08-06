'use server';

import { revalidatePath } from 'next/cache';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/admin';

export async function getStudentsAction(params = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.grade && params.grade !== 'all') queryParams.append('grade', params.grade);
    if (params.is_bus && params.is_bus !== 'all') queryParams.append('is_bus', params.is_bus);
    if (params.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params.schoolId) queryParams.append('schoolId', params.schoolId);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const queryString = queryParams.toString();
    const url = `${API_URL}/students${queryString ? `?${queryString}` : ''}`;

    const res = await fetch(url, {
      method: 'GET',
      cache: 'no-store'
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching students:', error);
    return { status: 'error', message: 'Failed to connect to server' };
  }
}

export async function getStudentByIdAction(id) {
  try {
    const res = await fetch(`${API_URL}/students/${id}`, {
      method: 'GET',
      cache: 'no-store'
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching student details:', error);
    return { status: 'error', message: 'Failed to connect to server' };
  }
}

export async function createStudentAction(studentData) {
  try {
    const isFormData = typeof FormData !== 'undefined' && studentData instanceof FormData;
    const options = {
      method: 'POST',
      body: isFormData ? studentData : JSON.stringify(studentData)
    };

    if (!isFormData) {
      options.headers = { 'Content-Type': 'application/json' };
    }

    const res = await fetch(`${API_URL}/students`, options);
    const data = await res.json();

    if (data.status === 'success' || data.success) {
      revalidatePath('/students');
    }
    return data;
  } catch (error) {
    console.error('Error creating student:', error);
    return { status: 'error', message: 'Failed to connect to server' };
  }
}

export async function updateStudentAction(id, studentData) {
  try {
    const isFormData = typeof FormData !== 'undefined' && studentData instanceof FormData;
    const options = {
      method: 'PUT',
      body: isFormData ? studentData : JSON.stringify(studentData)
    };

    if (!isFormData) {
      options.headers = { 'Content-Type': 'application/json' };
    }

    const res = await fetch(`${API_URL}/students/${id}`, options);
    const data = await res.json();

    if (data.status === 'success' || data.success) {
      revalidatePath('/students');
      revalidatePath(`/students/${id}`);
    }
    return data;
  } catch (error) {
    console.error('Error updating student:', error);
    return { status: 'error', message: 'Failed to connect to server' };
  }
}

export async function deleteStudentAction(id) {
  try {
    const res = await fetch(`${API_URL}/students/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();

    if (data.status === 'success' || data.success) {
      revalidatePath('/students');
    }
    return data;
  } catch (error) {
    console.error('Error deleting student:', error);
    return { status: 'error', message: 'Failed to connect to server' };
  }
}

export async function toggleStudentStatusAction(id, status) {
  try {
    const res = await fetch(`${API_URL}/students/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await res.json();

    if (data.status === 'success' || data.success) {
      revalidatePath('/students');
      revalidatePath(`/students/${id}`);
    }
    return data;
  } catch (error) {
    console.error('Error toggling student status:', error);
    return { status: 'error', message: 'Failed to connect to server' };
  }
}
