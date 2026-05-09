import { User } from './user';

export interface Category {
  id: number | string;
  name: string;
  slug: string;
  iconUrl?: string;
  displayOrder?: number;
}

export interface Service {
  id: number;
  name: string;
  description?: string;
  categoryId: number;
}

export interface PortfolioItem {
  id: number;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  author: Partial<User>;
}

export interface Provider extends User {
  bio?: string;
  experienceYears?: number;
  status: 'available' | 'busy' | 'inactive';
  categories: Category[];
  services: Service[];
  portfolio: PortfolioItem[];
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
  location?: {
    lat: number;
    lng: number;
    address?: string;
    city?: string;
  };
  distance?: number; // Calculated on search
}
