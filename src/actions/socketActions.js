'use server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/admin';

/**
 * Fetch live Socket.IO metrics and gateway health
 */
export async function getSocketMetricsAction() {
  try {
    const res = await fetch(`${API_URL}/sockets/metrics`, {
      method: 'GET',
      cache: 'no-store'
    });
    return await res.json();
  } catch (error) {
    console.error('Error fetching socket metrics:', error);
    return { success: false, message: 'Failed to connect to backend server' };
  }
}

/**
 * Fetch paginated and filtered Socket.IO activity logs
 */
export async function getSocketLogsAction(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.eventType && params.eventType !== 'ALL') query.append('eventType', params.eventType);
    if (params.search) query.append('search', params.search);

    const res = await fetch(`${API_URL}/sockets/logs?${query.toString()}`, {
      method: 'GET',
      cache: 'no-store'
    });
    return await res.json();
  } catch (error) {
    console.error('Error fetching socket logs:', error);
    return { success: false, message: 'Failed to connect to backend server' };
  }
}

/**
 * Fetch currently connected active socket clients
 */
export async function getActiveSocketClientsAction() {
  try {
    const res = await fetch(`${API_URL}/sockets/clients`, {
      method: 'GET',
      cache: 'no-store'
    });
    return await res.json();
  } catch (error) {
    console.error('Error fetching active socket clients:', error);
    return { success: false, message: 'Failed to connect to backend server' };
  }
}

/**
 * Force disconnect a specific socket client
 */
export async function disconnectSocketClientAction(socketId, reason = 'Disconnected by Admin') {
  try {
    const res = await fetch(`${API_URL}/sockets/disconnect/${socketId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
      cache: 'no-store'
    });
    return await res.json();
  } catch (error) {
    console.error('Error disconnecting socket client:', error);
    return { success: false, message: 'Failed to disconnect socket client' };
  }
}

/**
 * Broadcast emergency alert or system announcement to all sockets
 */
export async function broadcastSocketMessageAction(payload) {
  try {
    const res = await fetch(`${API_URL}/sockets/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store'
    });
    return await res.json();
  } catch (error) {
    console.error('Error broadcasting socket message:', error);
    return { success: false, message: 'Failed to send broadcast message' };
  }
}

/**
 * Clear in-memory log buffer
 */
export async function clearSocketLogsAction() {
  try {
    const res = await fetch(`${API_URL}/sockets/logs`, {
      method: 'DELETE',
      cache: 'no-store'
    });
    return await res.json();
  } catch (error) {
    console.error('Error clearing socket logs:', error);
    return { success: false, message: 'Failed to clear socket logs' };
  }
}
