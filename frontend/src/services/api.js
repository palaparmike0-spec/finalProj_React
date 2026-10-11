import axios from 'axios';

const baseURL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').trim();

const api = axios.create({
  baseURL,
  headers: { Accept: 'application/json' },
});

// Send the token with every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A 401 means the token is missing or expired: clear it and go to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;