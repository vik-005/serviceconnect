import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import * as authApi from '../api/auth';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const { login, logout, user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      login(data.user, data.token, data.refreshToken);
      queryClient.setQueryData(['profile'], data.user);
      
      const role = data.user.role;
      if (role === 'admin') router.push('/admin/dashboard');
      else if (role === 'provider') router.push('/provider/dashboard');
      else router.push('/client/conversations');
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      // Les composants gèrent la redirection
    },
  });

  const logoutAction = () => {
    logout();
    queryClient.clear();
    router.push('/login');
  };

  return {
    user,
    isAuthenticated,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    logout: logoutAction,
  };
};
