'use server';

import { revalidatePath } from 'next/cache';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/admin';

export async function getInquiriesAction(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.status && params.status !== 'ALL') query.set('status', params.status);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const url = `${API_URL}/inquiries?${query.toString()}`;
    const res = await fetch(url, {
      method: 'GET',
      cache: 'no-store'
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return { success: false, message: 'Failed to connect to server' };
  }
}

export async function getInquiryDetailsAction(id) {
  try {
    const res = await fetch(`${API_URL}/inquiries/${id}`, {
      method: 'GET',
      cache: 'no-store'
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching inquiry details:', error);
    return { success: false, message: 'Failed to connect to server' };
  }
}

export async function updateInquiryStatusAction(id, status) {
  try {
    const res = await fetch(`${API_URL}/inquiries/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/inquiries');
    }
    return data;
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    return { success: false, message: 'Failed to connect to server' };
  }
}

export async function updateInquiryNotesAction(id, admin_notes) {
  try {
    const res = await fetch(`${API_URL}/inquiries/${id}/notes`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_notes })
    });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/inquiries');
    }
    return data;
  } catch (error) {
    console.error('Error updating inquiry notes:', error);
    return { success: false, message: 'Failed to connect to server' };
  }
}

export async function deleteInquiryAction(id) {
  try {
    const res = await fetch(`${API_URL}/inquiries/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (data.success) {
      revalidatePath('/inquiries');
    }
    return data;
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    return { success: false, message: 'Failed to connect to server' };
  }
}
