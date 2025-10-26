import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { useSessionStore } from '../store/sessionStore';

// Create Axios instance with default configuration for the backend API
const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api', // Django backend URL
  timeout: 10000, // 10 seconds
  headers: {
    'accept': 'application/json'
  },
});

// Add token to request headers for authentication
api.interceptors.request.use(
  (config) => {
    const token = useSessionStore.getState().token || window.localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle API responses and errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error: AxiosError) => {
    if (error.response) {
      // Handle response errors (status codes outside 2xx range)
      console.error('Response error:', error.response.data);
      if (error.response.status === 401) {
        // Clear session on unauthorized access
        useSessionStore.getState().clearSession();
      }
    } else if (error.request) {
      console.error('Request error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
