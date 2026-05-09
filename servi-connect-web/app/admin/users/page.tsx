'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, toggleUserStatus, verifyProvider } from '@/lib/api/admin';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import Input from '@/components/ui/Input';
import { Search, Filter, ShieldCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: users = [], isLoading, error } = useQuery({ 
    queryKey: ['admin-users', searchTerm], 
    queryFn: () => getUsers({ search: searchTerm }),
    staleTime: 5 * 60 * 1000 
  });

  const toggleStatusMutation = useMutation({
    mutationFn: toggleUserStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Statut utilisateur mis à jour');
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour du statut');
    }
  });

  const verifyMutation = useMutation({
    mutationFn: verifyProvider,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Prestataire vérifié');
    },
    onError: () => {
      toast.error('Erreur lors de la vérification');
    }
  });

  if (isLoading) return <Spinner size="lg" />;
  if (error) return <div className="text-red-600 p-4">Erreur lors du chargement des utilisateurs</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Utilisateurs</h1>
          <p className="text-gray-500 font-medium">Gérez les comptes clients et prestataires.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1 relative">
          <Input 
            placeholder="Rechercher par nom ou email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
        <Button variant="outline" className="rounded-xl font-bold">
          <Filter size={20} className="mr-2" /> Filtres
        </Button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 bg-gray-50/50">
              <th className="px-6 py-4">Utilisateur</th>
              <th className="px-6 py-4">Savoir-être</th>
              <th className="px-6 py-4">Vérification</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users && users.length > 0 ? users.map((user: any) => (
              <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <Avatar src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} />
                    <div>
                      <p className="font-bold text-gray-900">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-gray-500 font-medium">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={user.role === 'provider' ? 'primary' : 'gray'}>
                    {user.role === 'provider' ? 'Prestataire' : 'Client'}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  {user.role === 'provider' && (
                    <button 
                      onClick={() => verifyMutation.mutate(user.id)}
                      disabled={verifyMutation.isPending}
                      className={`flex items-center space-x-1 font-bold text-xs uppercase tracking-tighter transition-colors ${
                        user.isVerified 
                          ? 'text-blue-600' 
                          : 'text-gray-400 hover:text-blue-600'
                      }`}
                    >
                      <ShieldCheck size={16} fill={user.isVerified ? 'currentColor' : 'none'} />
                      <span>{user.isVerified ? 'Vérifié' : 'Vérifier'}</span>
                    </button>
                  )}
                </td>
                <td className="px-6 py-4 text-xs font-bold text-gray-400">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '-'}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end space-x-2">
                    <button 
                      onClick={() => toggleStatusMutation.mutate(user.id)}
                      disabled={toggleStatusMutation.isPending}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      title={user.isActive ? "Désactiver" : "Activer"}
                    >
                      <UserX size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Aucun utilisateur trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
