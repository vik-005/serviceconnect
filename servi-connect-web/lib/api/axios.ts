import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://web.motiriispace.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    // Si la réponse est déjà au format {success: true, data: ...}, on extrait le data
    const res = response.data;
    if (res && res.success === true && res.hasOwnProperty('data') && res.hasOwnProperty('message')) {
      return { ...response, data: res.data };
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;
      
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}/api/auth/refresh`, { refresh_token: refreshToken });
          const { token, refreshToken: newRefreshToken } = res.data;
          
          useAuthStore.getState().login(useAuthStore.getState().user!, token, newRefreshToken);
          
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (refreshError) {
          useAuthStore.getState().logout();
          return Promise.reject(refreshError);
        }
      } else {
        useAuthStore.getState().logout();
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
