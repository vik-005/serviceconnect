'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: 'client' | 'provider';
  country: string;
}

interface Errors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
  country?: string;
  general?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { registerAsync, isRegistering } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'client',
    country: 'BJ',
  });
  
  const [errors, setErrors] = useState<Errors>({});

  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Le prénom est requis";
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'Le prénom doit contenir au moins 2 caractères';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Le nom doit contenir au moins 2 caractères';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (formData.phone && !/^[+]?[0-9]{8,15}$/.test(formData.phone)) {
      newErrors.phone = 'Numéro de téléphone invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name as keyof FormData]: value }));
    if (errors[name as keyof Errors]) {
      setErrors(prev => ({ ...prev, [name as keyof Errors]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await registerAsync({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone || null,
        password: formData.password,
        role: formData.role,
        country: formData.country,
      });
      
      router.push('/login?registered=true');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      const apiErrors = error?.response?.data?.errors;
      const message = error?.response?.data?.message || error?.message;

      if (message?.toLowerCase().includes('email') || apiErrors?.email) {
        setErrors({ email: 'Cet email est déjà utilisé' });
      } else if (apiErrors) {
        setErrors(apiErrors);
      } else {
        setErrors({ general: message || "Erreur lors de l'inscription. Veuillez réessayer." });
      }
    }
  };

  const countries = [
    { code: 'BJ', name: 'Bénin' },
    { code: 'CI', name: "Côte d'Ivoire" },
    { code: 'FR', name: 'France' },
    { code: 'TG', name: 'Togo' },
    { code: 'NG', name: 'Nigéria' },
    { code: 'GH', name: 'Ghana' },
    { code: 'SN', name: 'Sénégal' },
    { code: 'CM', name: 'Cameroun' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Créer un compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Rejoignez notre plateforme dès aujourd'hui
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="firstName"
              label="Prénom"
              value={formData.firstName}
              onChange={handleChange}
              error={errors.firstName}
              required
              disabled={isRegistering}
            />
            <Input
              name="lastName"
              label="Nom"
              value={formData.lastName}
              onChange={handleChange}
              error={errors.lastName}
              required
              disabled={isRegistering}
            />
          </div>

          <Input
            name="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
            disabled={isRegistering}
            autoComplete="email"
          />

          <Input
            name="phone"
            label="Téléphone (optionnel)"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            disabled={isRegistering}
            placeholder="+229 XX XXX XXX"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Rôle *
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isRegistering}
              >
                <option value="client">Client</option>
                <option value="provider">Prestataire</option>
              </select>
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                Pays *
              </label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isRegistering}
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            name="password"
            label="Mot de passe"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
            disabled={isRegistering}
            autoComplete="new-password"
          />

          <Input
            name="confirmPassword"
            label="Confirmer le mot de passe"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
            disabled={isRegistering}
            autoComplete="new-password"
          />

          <Button 
            type="submit" 
            isLoading={isRegistering} 
            className="h-12 text-lg w-full"
            disabled={isRegistering}
          >
            {isRegistering ? 'Inscription en cours...' : "S'inscrire"}
          </Button>

          {errors.general && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-red-700 text-sm text-center">{errors.general}</p>
            </div>
          )}

          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-indigo-600 hover:text-indigo-500 font-medium transition-colors"
              disabled={isRegistering}
            >
              Déjà un compte ? Se connecter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
