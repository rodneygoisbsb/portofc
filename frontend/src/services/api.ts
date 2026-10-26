import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const isBrowser = typeof window !== 'undefined';
const isCloudHost = isBrowser && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

// Se estiver na nuvem (ex: Vercel) e não tiver URL remota HTTPS configurada, não tentar conectar a localhost (Mixed Content)
export const isRemoteApiConfigured = !isCloudHost || (Boolean(import.meta.env.VITE_API_URL) && !import.meta.env.VITE_API_URL.includes('localhost'));

export const apiClient = axios.create({
  baseURL: rawApiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: isRemoteApiConfigured ? 2500 : 100,
});

// Interceptor para adicionar token de autenticação se disponível
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('portofc_auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
