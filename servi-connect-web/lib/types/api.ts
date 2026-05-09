export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number;
    page: number;
    lastPage: number;
    limit: number;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
}

export interface Banner {
  id: number;
  title: string;
  imageUrl: string;
  targetUrl?: string;
  placement: 'home' | 'search' | 'profile';
  isActive: boolean;
  order: number;
}
