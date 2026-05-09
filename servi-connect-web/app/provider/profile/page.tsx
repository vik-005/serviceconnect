'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile } from '@/lib/api/auth';
import { getCategories } from '@/lib/api/providers';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Avatar from '@/components/ui/Avatar';
import Spinner from '@/components/ui/Spinner';
import { toast } from 'sonner';
import { Camera, Save } from 'lucide-react';

const profileSchema = z.object({
  firstName: z.string().min(2, 'Prénom trop court'),
  lastName: z.string().min(2, 'Nom trop court'),
  bio: z.string().max(1000, 'Bio trop longue').optional(),
  experienceYears: z.number().min(0).max(50).optional(),
  selectedCategories: z.array(z.number()).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProviderProfileEdit() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useQuery({ queryKey: ['profile'], queryFn: getProfile });
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: profile ? {
      firstName: profile.firstName,
      lastName: profile.lastName,
      bio: (profile as any).bio || '',
      experienceYears: (profile as any).experienceYears || 0,
    } : undefined
  });

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profil mis à jour');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
    }
  });

  if (isLoading) return <Spinner size="lg" />;

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Mon Profil</h1>
        <p className="text-gray-500 font-medium">Gérez vos informations publiques et vos services.</p>
      </div>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-8">
        {/* Avatar Upload */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
          <div className="relative group cursor-pointer">
            <Avatar src={profile?.avatarUrl} alt={profile?.firstName} size="xl" className="ring-4 ring-blue-50" />
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Camera size={32} />
            </div>
          </div>
          <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Cliquez pour changer la photo</p>
        </div>

        {/* Personal Info */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-xl font-black text-gray-900 mb-6">Informations Générales</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <Input label="Prénom" error={errors.firstName?.message} {...register('firstName')} />
            <Input label="Nom" error={errors.lastName?.message} {...register('lastName')} />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Ma biographie</label>
              <textarea 
                rows={5}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none text-sm leading-relaxed"
                placeholder="Décrivez votre parcours et vos compétences..."
                {...register('bio')}
              />
              {errors.bio && <p className="text-xs text-red-500 mt-1">{errors.bio.message}</p>}
            </div>
            <Input 
              label="Années d'expérience" 
              type="number" 
              error={errors.experienceYears?.message} 
              {...register('experienceYears', { valueAsNumber: true })} 
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="px-10 rounded-xl font-bold" isLoading={mutation.isPending}>
            <Save size={20} className="mr-2" /> Enregistrer les modifications
          </Button>
        </div>
      </form>
    </div>
  );
}
