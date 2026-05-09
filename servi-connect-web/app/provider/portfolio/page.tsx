'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile } from '@/lib/api/auth';
import PortfolioGrid from '@/components/provider/PortfolioGrid';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { Upload, Plus, X, Image as ImageIcon, Film } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';

export default function ProviderPortfolioPage() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useQuery({ queryKey: ['profile'], queryFn: getProfile });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      // Simulate upload
      setUploading(true);
      setTimeout(() => {
        setUploading(false);
        setIsModalOpen(false);
        toast.success('Média ajouté avec succès');
      }, 2000);
    },
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'video/*': ['.mp4', '.mov']
    }
  });

  const handleDelete = (id: number) => {
    toast.info('Élément supprimé');
    // In real app, call API
  };

  if (isLoading) return <Spinner size="lg" />;

  const portfolio = (profile as any)?.portfolio || [];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Mon Portfolio</h1>
          <p className="text-gray-500 font-medium">Présentez vos meilleures réalisations à vos futurs clients.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="mt-4 md:mt-0 rounded-xl font-bold py-3 px-6">
          <Plus size={20} className="mr-2" /> Ajouter un média
        </Button>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        {portfolio.length > 0 ? (
          <PortfolioGrid items={portfolio} isEditable onDeleteItem={handleDelete} />
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-3xl space-y-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
              <ImageIcon size={40} />
            </div>
            <p className="text-gray-400 font-medium italic">Votre portfolio est vide. Commencez par ajouter des photos ou vidéos.</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Ajouter au portfolio" size="lg">
        <div className="space-y-6">
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer ${
              isDragActive ? 'border-blue-600 bg-blue-50 scale-[0.98]' : 'border-gray-100 bg-gray-50 hover:border-blue-200'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600">
                <Upload size={32} />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">Glissez vos fichiers ici</p>
                <p className="text-sm text-gray-500 font-medium">PNG, JPG ou MP4 (max. 10MB)</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Input label="Titre de la réalisation" placeholder="Ex: Rénovation cuisine complète" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description (optionnel)</label>
              <textarea 
                rows={3}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="Détails sur le projet..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button className="px-8 rounded-xl font-bold" isLoading={uploading}>Publier</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
