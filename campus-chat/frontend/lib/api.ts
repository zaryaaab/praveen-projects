import axios from 'axios';
import { getAuthToken } from './utils';

const api = axios.create({
  baseURL: 'http://localhost:1005/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to every request if available
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export default api;

// Simple toast utility (replace with a real toast library if desired)
function showToast(message: string) {
  if (typeof window !== 'undefined') {
    window.alert(message);
  }
}

export const getUsers = async () => {
  try {
    const res = await api.get('/users');
    return res.data;
  } catch (error: any) {
    showToast(error?.response?.data?.message || error.message || 'Failed to fetch users');
    return [];
  }
};

export const getConversations = async () => {
  try {
    const res = await api.get('/conversations');
    return res.data;
  } catch (error: any) {
    showToast(error?.response?.data?.message || error.message || 'Failed to fetch conversations');
    return [];
  }
};

export const createConversation = async (data: any) => {
  try {
    const res = await api.post('/conversations', data);
    return res.data;
  } catch (error: any) {
    showToast(error?.response?.data?.message || error.message || 'Failed to create conversation');
    return null;
  }
};

export const getMessages = async (conversationId: string | number) => {
  try {
    const res = await api.get(`/messages/conversation/${conversationId}`);
    return res.data;
  } catch (error: any) {
    showToast(error?.response?.data?.message || error.message || 'Failed to fetch messages');
    return [];
  }
};

export const sendMessage = async (data: any) => {
  try {
    const res = await api.post('/messages', data);
    return res.data;
  } catch (error: any) {
    showToast(error?.response?.data?.message || error.message || 'Failed to send message');
    return null;
  }
};

export const addParticipantsToGroup = async (conversationId: string | number, participants: any[]) => {
  try {
    const res = await api.post(`/conversations/${conversationId}/participants`, { participants });
    return res.data;
  } catch (error: any) {
    showToast(error?.response?.data?.message || error.message || 'Failed to add participants');
    return null;
  }
};

export const blockUser = async (userId: string) => {
  try {
    const res = await api.post(`/users/block/${userId}`);
    return res.data;
  } catch (error: any) {
    showToast(error?.response?.data?.message || error.message || 'Failed to block user');
    return null;
  }
};

export const unblockUser = async (userId: string) => {
  try {
    const res = await api.delete(`/users/block/${userId}`);
    return res.data;
  } catch (error: any) {
    showToast(error?.response?.data?.message || error.message || 'Failed to unblock user');
    return null;
  }
};

export const getBlockedUsers = async () => {
  try {
    const res = await api.get('/users/block');
    return res.data;
  } catch (error: any) {
    showToast(error?.response?.data?.message || error.message || 'Failed to fetch blocked users');
    return [];
  }
};

export const muteConversation = async (conversationId: string) => {
  try {
    const res = await api.post(`/conversations/${conversationId}/mute`);
    return res.data;
  } catch (error: any) {
    showToast(error?.response?.data?.message || error.message || 'Failed to mute conversation');
    return null;
  }
};

export const unmuteConversation = async (conversationId: string) => {
  try {
    const res = await api.post(`/conversations/${conversationId}/unmute`);
    return res.data;
  } catch (error: any) {
    showToast(error?.response?.data?.message || error.message || 'Failed to unmute conversation');
    return null;
  }
};

export const leaveGroup = async (conversationId: string) => {
  try {
    const res = await api.post(`/conversations/${conversationId}/leave`);
    return res.data;
  } catch (error: any) {
    showToast(error?.response?.data?.message || error.message || 'Failed to leave group');
    return null;
  }
};

export const reactToMessage = async (messageId: string, reactionType: string) => {
  try {
    const res = await api.post(`/messages/${messageId}/reactions`, { reaction_type: reactionType });
    return res.data;
  } catch (error: any) {
    showToast(error?.response?.data?.message || error.message || 'Failed to react to message');
    return null;
  }
}; 