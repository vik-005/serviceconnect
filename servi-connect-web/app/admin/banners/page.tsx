'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBanners } from '@/lib/api/banners';
import { createBanner, deleteBanner } from '@/lib/api/admin';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { Plus, Trash2, Eye, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminBannersPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: homeBanners = [], isLoading: isLoadingHome } = useQuery({ queryKey: ['banners', 'home'], queryFn: () => getBanners('home') });
  const { data: searchBanners = [], isLoading: isLoadingSearch } = useQuery({ queryKey: ['banners', 'search'], queryFn: () => getBanners('search') });

  const deleteMutation = useMutation({
    mutationFn: deleteBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success('Bannière supprimée');
    }
  });

  if (isLoadingHome || isLoadingSearch) return <Spinner size="lg" />;

  const allBanners = [...homeBanners, ...searchBanners];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Gestion des Bannières</h1>
          <p className="text-gray-500 font-medium">Configurez les bannières publicitaires et informatives.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="mt-4 md:mt-0 rounded-xl font-bold py-3 px-6">
          <Plus size={20} className="mr-2" /> Nouvelle bannière
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {allBanners.map((banner) => (
          <div key={banner.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group">
            <div className="h-40 relative">
              <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white ${
                  banner.placement === 'home' ? 'bg-blue-600' : 'bg-green-600'
                }`}>
                  {banner.placement}
                </span>
              </div>
            </div>
            <div className="p-6 flex-1 space-y-4">
              <div>
                <h3 className="font-bold text-gray-900 truncate">{banner.title}</h3>
                <p className="text-xs text-gray-500 font-medium mt-1 truncate">{banner.targetUrl || 'Aucun lien'}</p>
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${banner.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{banner.isActive ? 'Actif' : 'Pause'}</span>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 hover:bg-gray-50 text-gray-400 hover:text-blue-600 rounded-lg transition-colors">
                    <ExternalLink size={18} />
                  </button>
                  <button 
                    onClick={() => { if(confirm('Sûr ?')) deleteMutation.mutate(banner.id); }}
                    className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {allBanners.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-100 italic text-gray-400">
          Aucune bannière configurée.
        </div>
      )}

      {/* Manual Creation Form Placeholder */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nouvelle bannière">
        <div className="space-y-4">
          <Input label="Titre" placeholder="Promotion d'été" />
          <Input label="Image URL" placeholder="https://..." />
          <Input label="Lien de redirection" placeholder="/search?category=..." />
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Placement</label>
            <select className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500">
              <option value="home">Accueil (Principal)</option>
              <option value="search">Recherche (Intercalaire)</option>
              <option value="profile">Profil (Bas de page)</option>
            </select>
          </div>
          <Button className="w-full mt-4 rounded-xl font-bold py-3" onClick={() => setIsModalOpen(false)}>
            Créer la bannière
          </Button>
        </div>
      </Modal>
    </div>
  );
}
