export type UserRole = 'ROLE_CLIENT' | 'ROLE_PROVIDER' | 'ROLE_ADMIN';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roles: UserRole[];
  avatarUrl?: string;
  createdAt: string;
  isVerified?: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
}
