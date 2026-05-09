import api from './axios';
import { User } from '../types/user';

export const login = async (credentials: any) => {
  const { data } = await api.post('/api/auth/login', credentials);
  return data;
};

export const register = async (userData: any) => {
  // Nettoyer les champs non nécessaires et sérialiser correctement
  const cleanData = {
    email: userData.email,
    password: userData.password,
    firstName: userData.firstName,
    lastName: userData.lastName,
    phone: userData.phone || null,
    role: userData.role,
    country: userData.country || 'BJ',
    // confirmPassword et selectedCategories ne sont pas envoyés à l'API
  };

  const { data } = await api.post('/api/auth/register', cleanData);
  return data;
};

export const getProfile = async () => {
  const { data } = await api.get<User>('/api/me');
  return data;
};

export const updateProfile = async (userData: Partial<User>) => {
  const { data } = await api.patch<User>('/api/me', userData);
  return data;
};
