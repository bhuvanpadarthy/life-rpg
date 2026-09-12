import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach Authorization Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('life_rpg_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for auth expiration handling
api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response && error.response.status === 401) {
    // If token invalid/expired, log out locally
    const currentPath = window.location.pathname;
    if (currentPath !== '/auth') {
      localStorage.removeItem('life_rpg_token');
      localStorage.removeItem('life_rpg_user');
      window.location.href = '/auth';
    }
  }
  return Promise.reject(error);
});

export default api;
