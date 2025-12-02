import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

const http = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor: Antes de enviar a requisição, coloca o Token no Header
http.interceptors.request.use((config) => {
  const auth = useAuthStore();
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});

export default http;
