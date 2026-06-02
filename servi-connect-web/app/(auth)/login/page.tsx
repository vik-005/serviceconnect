'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get('registered') === 'true';
  const { loginAsync, isLoggingIn } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<any>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      await loginAsync(formData);
      // Redirection is handled in useAuth onSuccess
    } catch (error: any) {
      console.error('Login error:', error);
      const apiErrors = error.response?.data?.errors;
      const message = error.response?.data?.message || error.message;
      
      setErrors(apiErrors || { general: message || 'Erreur de connexion' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connexion
          </h2>
          {isRegistered && (
            <p className="mt-2 text-center text-sm font-medium text-green-600 bg-green-50 p-3 rounded-xl border border-green-100">
              Inscription réussie ! Vous pouvez maintenant vous connecter.
            </p>
          )}
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            required
          />
          <Input
            label="Mot de passe"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={errors.password}
            required
          />
          <Button type="submit" isLoading={isLoggingIn} className="h-12 text-lg w-full">
            Se connecter
          </Button>
          {errors.general && (
            <p className="text-red-500 text-sm text-center">{errors.general}</p>
          )}
          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push('/register')}
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Pas de compte ? S'inscrire
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

