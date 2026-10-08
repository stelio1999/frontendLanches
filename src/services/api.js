// src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://backendlanches.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

// Interceptor para adicionar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    
    // NÃO redirecionar se for rota de autenticação
    const isAuthRoute = 
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/login/phone') ||
      url.includes('/auth/verify') ||
      url.includes('/auth/send-verification-code');
    
    // Só fazer logout/redirect se:
    // - for 401
    // - NÃO for rota de login
    // - JÁ tiver token armazenado (indica sessão expirada)
    if (status === 401 && !isAuthRoute) {
      const hasToken = !!localStorage.getItem('token');
      
      if (hasToken) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        window.location.href = '/';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;