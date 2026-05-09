import api from './axios';
import { Provider, Category } from '../types/provider';
import { PaginatedResponse } from '../types/api';

export const getProviders = async (params: any) => {
  const { data } = await api.get<PaginatedResponse<Provider>>('/api/search/providers', { params });
  return data;
};

export const getProviderById = async (id: string | number) => {
  const { data } = await api.get<Provider>(`/api/providers/${id}`);
  return data;
};

export const getCategories = async () => {
  const { data } = await api.get<Category[]>('/api/search/categories');
  return data;
};

export const updateProviderStatus = async (status: string) => {
  const { data } = await api.patch('/api/provider/status', { status });
  return data;
};
