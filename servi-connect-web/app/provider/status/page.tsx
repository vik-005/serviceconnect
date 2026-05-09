'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile } from '@/lib/api/auth';
import { updateProviderStatus } from '@/lib/api/providers';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { toast } from 'sonner';
import { CheckCircle2, Clock, Moon, AlertCircle } from 'lucide-react';

export default function ProviderStatusPage() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useQuery({ queryKey: ['profile'], queryFn: getProfile });

  const currentStatus = (profile as any)?.status || 'inactive';

  const mutation = useMutation({
    mutationFn: updateProviderStatus,
    onSuccess: (newStatus) => {
      queryClient.setQueryData(['profile'], (prev: any) => ({ ...prev, status: newStatus }));
      toast.success('Statut mis à jour', {
        description: `Vous êtes maintenant ${
          newStatus === 'available' ? 'disponible' : newStatus === 'busy' ? 'occupé' : 'absent'
        }`
      });
    },
    onError: () => {
      toast.error('Erreur', { description: 'Impossible de changer le statut.' });
    }
  });

  if (isLoading) return <Spinner size="lg" />;

  const statusOptions = [
    { 
      id: 'available', 
      label: 'Disponible', 
      desc: 'Vous apparaissez en vert sur la carte et recevez des notifications.', 
      icon: CheckCircle2, 
      color: 'text-green-600', 
      bg: 'bg-green-50', 
      border: 'border-green-200' 
    },
    { 
      id: 'busy', 
      label: 'Occupé', 
      desc: 'Vous êtes en cours de prestation. Les clients peuvent toujours vous écrire.', 
      icon: Clock, 
      color: 'text-orange-600', 
      bg: 'bg-orange-50', 
      border: 'border-orange-200' 
    },
    { 
      id: 'inactive', 
      label: 'Absent', 
      desc: 'Vous n\'êtes plus visible sur la carte pour le moment.', 
      icon: Moon, 
      color: 'text-gray-600', 
      bg: 'bg-gray-50', 
      border: 'border-gray-200' 
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Mon Statut</h1>
        <p className="text-gray-500 font-medium">Gérez votre visibilité en temps réel sur la plateforme.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {statusOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => mutation.mutate(option.id)}
            disabled={mutation.isPending}
            className={`p-8 rounded-3xl border-2 transition-all flex items-center text-left space-x-6 relative overflow-hidden group ${
              currentStatus === option.id 
                ? `${option.border} ${option.bg} shadow-md` 
                : 'border-gray-100 bg-white hover:border-blue-100 hover:shadow-lg'
            }`}
          >
            <div className={`p-4 rounded-2xl ${
              currentStatus === option.id ? 'bg-white' : 'bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600'
            } transition-colors`}>
              <option.icon size={32} className={currentStatus === option.id ? option.color : ''} />
            </div>
            <div className="flex-1">
              <h3 className={`text-xl font-black ${currentStatus === option.id ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-900'} transition-colors`}>
                {option.label}
              </h3>
              <p className={`text-sm mt-1 font-medium ${currentStatus === option.id ? 'text-gray-600' : 'text-gray-400 group-hover:text-gray-500'} transition-colors`}>
                {option.desc}
              </p>
            </div>
            {currentStatus === option.id && (
              <div className="absolute top-4 right-4 animate-in zoom-in duration-300">
                <CheckCircle2 size={24} className="text-blue-600" />
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="bg-blue-50 p-6 rounded-3xl flex items-start space-x-4 border border-blue-100 outline outline-4 outline-white">
        <AlertCircle className="text-blue-600 mt-1 flex-shrink-0" size={24} />
        <div className="space-y-1">
          <h4 className="font-bold text-blue-900">Conseil visibilité</h4>
          <p className="text-sm text-blue-800 leading-relaxed font-medium">
            Restez en statut "Disponible" dès que vous êtes prêt à recevoir des demandes pour maximiser vos chances de trouver des clients.
          </p>
        </div>
      </div>
    </div>
  );
}
