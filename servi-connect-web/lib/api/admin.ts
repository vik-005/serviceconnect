import api from './axios';
import { User } from '../types/user';
import { Banner, Category } from '../types/api';

export const getAdminStats = async () => {
  const { data } = await api.get('/api/admin/stats');
  return data;
};

export const getUsers = async (params: any) => {
  const { data } = await api.get<User[]>('/api/admin/users', { params });
  return data;
};

export const toggleUserStatus = async (userId: string) => {
  const { data } = await api.post(`/api/admin/users/${userId}/toggle-status`);
  return data;
};

export const verifyProvider = async (userId: string) => {
  const { data } = await api.post(`/api/admin/users/${userId}/verify`);
  return data;
};

export const createBanner = async (bannerData: any) => {
  const { data } = await api.post<Banner>('/api/admin/banners', bannerData);
  return data;
};

export const deleteBanner = async (id: number) => {
  await api.delete(`/api/admin/banners/${id}`);
};

export const createCategory = async (categoryData: any) => {
  const { data } = await api.post<Category>('/api/admin/categories', categoryData);
  return data;
};

export const updateCategoriesOrder = async (orders: { id: number; order: number }[]) => {
  await api.post('/api/admin/categories/reorder', { orders });
};
