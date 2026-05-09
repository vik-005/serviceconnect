import api from './axios';
import { Banner } from '../types/api';

export const getBanners = async (placement: string) => {
  const { data } = await api.get<Banner[]>('/api/banners', { params: { placement } });
  return data;
};
