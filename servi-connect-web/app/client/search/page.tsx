'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/lib/api/providers';
import { useProviderSearch } from '@/lib/hooks/useProviderSearch';
import SearchBar from '@/components/search/SearchBar';
import ProviderCard from '@/components/search/ProviderCard';
import MapView from '@/components/search/MapView';
import Button from '@/components/ui/Button';
import { Map as MapIcon, List as ListIcon, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [activeProviderId, setActiveProviderId] = useState<number | null>(null);

  const category = searchParams.get('category') || '';
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');
  const radius = parseInt(searchParams.get('radius') || '5');

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading 
  } = useProviderSearch({ category, lat, lng, radius });

  const providers = data?.pages.flatMap(page => page.data) || [];

  const handleSearch = (params: any) => {
    const query = new URLSearchParams();
    if (params.category) query.set('category', params.category);
    if (params.lat) query.set('lat', params.lat.toString());
    if (params.lng) query.set('lng', params.lng.toString());
    query.set('radius', params.radius.toString());
    // Fixed: Routing path is /client/search, not /search
    router.push(`/client/search?${query.toString()}`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-50/50">
      {/* Header / Search Controls */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 max-w-3xl">
            <SearchBar 
              categories={categories} 
              onSearch={handleSearch} 
              initialCategory={category} 
            />
          </div>
          
          {/* Desktop view controls */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="bg-slate-100 p-1 rounded-xl flex border border-slate-200/50">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 px-4 rounded-lg flex items-center space-x-2 text-xs font-bold transition-all ${
                  viewMode === 'list' 
                    ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <ListIcon size={14} />
                <span>Liste</span>
              </button>
              <button 
                onClick={() => setViewMode('map')}
                className={`p-2 px-4 rounded-lg flex items-center space-x-2 text-xs font-bold transition-all ${
                  viewMode === 'map' 
                    ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <MapIcon size={14} />
                <span>Carte</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* List View Container */}
        <div className={`flex-1 overflow-y-auto bg-slate-50/30 transition-all duration-300 ${
          viewMode === 'map' ? 'hidden md:block md:w-1/3 lg:w-[400px] md:flex-none border-r border-slate-100' : 'w-full'
        }`}>
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <Compass className="text-blue-600" size={20} />
                  {isLoading ? 'Recherche en cours...' : `${providers.length} prestataires trouvés`}
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-medium">Recherche dans un rayon de {radius} km</p>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-white rounded-3xl animate-pulse border border-slate-100 shadow-sm" />
                ))}
              </div>
            ) : providers.length > 0 ? (
              <>
                <motion.div 
                  layout
                  className={`grid gap-6 ${
                    viewMode === 'map' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  }`}
                >
                  <AnimatePresence>
                    {providers.map((provider, index) => (
                      <motion.div 
                        key={provider.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
                        onMouseEnter={() => setActiveProviderId(Number(provider.id))}
                        onMouseLeave={() => setActiveProviderId(null)}
                      >
                        <ProviderCard provider={provider} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
                
                {hasNextPage && (
                  <div className="mt-12 flex justify-center pb-8">
                    <Button 
                      variant="outline" 
                      onClick={() => fetchNextPage()} 
                      isLoading={isFetchingNextPage}
                      className="px-10 rounded-2xl border-slate-200 hover:bg-slate-50 font-bold text-sm shadow-sm"
                    >
                      Charger plus de prestataires
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 max-w-lg mx-auto mt-8 shadow-sm">
                <div className="h-16 w-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <Compass size={28} />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">Aucun prestataire à proximité</h3>
                <p className="text-slate-400 text-sm max-w-xs mx-auto mt-2 font-medium">
                  Essayez d'agrandir votre rayon de recherche ou de choisir une autre catégorie.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Map View Container */}
        <div className={`flex-1 h-full transition-all duration-300 ${
          viewMode === 'list' ? 'hidden md:block md:w-1/2 lg:w-3/5' : 'w-full'
        }`}>
          <MapView 
            providers={providers} 
            userLocation={lat && lng ? { lat, lng } : null} 
            radius={radius}
            activeProviderId={activeProviderId}
          />
        </div>
      </div>

      {/* Premium Glassmorphic Floating Switch on Mobile */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:hidden z-30 shadow-2xl">
        <div className="bg-slate-900/90 backdrop-blur-md text-white p-1 rounded-2xl flex border border-slate-800/80 shadow-slate-900/30">
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2.5 px-6 rounded-xl flex items-center space-x-2 text-xs font-black transition-all ${
              viewMode === 'list' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListIcon size={14} />
            <span>Liste</span>
          </button>
          <button 
            onClick={() => setViewMode('map')}
            className={`p-2.5 px-6 rounded-xl flex items-center space-x-2 text-xs font-black transition-all ${
              viewMode === 'map' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapIcon size={14} />
            <span>Carte</span>
          </button>
        </div>
      </div>
    </div>
  );
}
