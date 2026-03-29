import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Attach JWT automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem('kmg_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('kmg_token');
      localStorage.removeItem('kmg_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
