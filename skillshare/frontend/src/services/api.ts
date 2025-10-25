import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://147.79.68.160:8300/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tokenss');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login on authentication error
      localStorage.removeItem('tokenss');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default api; 