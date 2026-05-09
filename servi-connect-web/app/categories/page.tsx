'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/lib/api/providers';
import Link from 'next/link';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center text-gray-400 hover:text-blue-600 mb-6 font-bold transition-colors">
            <ArrowLeft size={20} className="mr-2" /> Retour à l'accueil
          </Link>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Toutes les catégories</h1>
          <p className="text-gray-500 mt-2 text-lg font-medium">Parcourez l'ensemble des services disponibles sur ServiConnect.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-400 font-medium tracking-widest uppercase text-xs">Chargement des catégories...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/search?category=${category.slug}`}
                className="group bg-white border border-gray-100 p-8 rounded-[2.5rem] flex flex-col items-center text-center hover:shadow-2xl hover:border-blue-100 transition-all duration-300"
              >
                <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                  {category.iconUrl ? (
                    <img src={category.iconUrl} alt={category.name} className="w-12 h-12 object-contain group-hover:scale-110 transition-transform duration-300" />
                  ) : (
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                      🛠️
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-400 font-medium">
                  {/* Placeholder for service count if available */}
                  Découvrez nos professionnels
                </p>
                
                <div className="mt-6 flex items-center text-blue-600 font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  Voir <ChevronRight size={16} className="ml-1" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && categories.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
            <p className="text-gray-400 font-medium italic">Aucune catégorie n'est disponible pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
