import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000'; // Cambia si usas otro puerto o dominio

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Interceptor para agregar el token JWT si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
