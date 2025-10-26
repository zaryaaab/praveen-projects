import api from './api';

export const registerUser = async (userData) => {
  try {
    const response = await api.post('users/register/', userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('users/token/', credentials);
    const { access, refresh } = response.data;
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await api.post('users/token/refresh/', { refresh: refreshToken });
    const { access } = response.data;
    localStorage.setItem('accessToken', access);
    return response.data;
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
};