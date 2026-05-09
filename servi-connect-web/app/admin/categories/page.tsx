'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories } from '@/lib/api/providers';
import { updateCategoriesOrder, createCategory } from '@/lib/api/admin';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import { Plus, GripVertical, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [newCatName, setNewCatName] = useState('');
  
  const { data: categories = [], isLoading } = useQuery({ 
    queryKey: ['categories'], 
    queryFn: getCategories 
  });

  const createMutation = useMutation({
    mutationFn: () => createCategory({ name: newCatName, slug: newCatName.toLowerCase().replace(/ /g, '-') }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setNewCatName('');
      toast.success('Catégorie ajoutée');
    }
  });

  if (isLoading) return <Spinner size="lg" />;

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Catégories</h1>
        <p className="text-gray-500 font-medium">Gérez l'ordre et les noms des catégories de services.</p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4">
        <Input 
          placeholder="Nouvelle catégorie (ex: Plomberie)" 
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
        />
        <Button 
          onClick={() => createMutation.mutate()} 
          disabled={!newCatName.trim()}
          isLoading={createMutation.isPending}
          className="rounded-xl font-bold px-8"
        >
          Ajouter
        </Button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50/50 border-b border-gray-50">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Faites glisser pour réorganiser</p>
        </div>
        <div className="divide-y divide-gray-50">
          {categories.map((cat, index) => (
            <div key={cat.id} className="flex items-center px-6 py-4 hover:bg-gray-50 transition-colors group">
              <div className="text-gray-300 hover:text-blue-600 cursor-grab active:cursor-grabbing mr-4">
                <GripVertical size={20} />
              </div>
              <div className="flex-1 flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold">
                  {cat.icon || '🛠️'}
                </div>
                <span className="font-bold text-gray-900">{cat.name}</span>
                <span className="text-xs text-gray-400 font-medium font-mono">/{cat.slug}</span>
              </div>
              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-white transition-all">
                  <Edit2 size={18} />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-white transition-all">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end pt-4">
        <Button variant="outline" className="rounded-xl px-10 font-bold shadow-sm">
          <CheckCircle2 size={18} className="mr-2" /> Enregistrer l'ordre
        </Button>
      </div>
    </div>
  );
}
