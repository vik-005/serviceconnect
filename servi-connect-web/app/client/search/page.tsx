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
import Spinner from '@/components/ui/Spinner';
import { Filter, Map as MapIcon, List as ListIcon } from 'lucide-react';

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
    router.push(`/search?${query.toString()}`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* Header / Search Controls */}
      <div className="bg-white border-b border-gray-100 p-4 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="flex-1 max-w-3xl">
            <SearchBar 
              categories={categories} 
              onSearch={handleSearch} 
              initialCategory={category} 
            />
          </div>
          <div className="flex items-center space-x-2 md:ml-4">
            <div className="bg-gray-100 p-1 rounded-xl flex">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg flex items-center space-x-2 text-sm font-bold transition-all ${
                  viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ListIcon size={18} />
                <span className="hidden sm:inline">Liste</span>
              </button>
              <button 
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-lg flex items-center space-x-2 text-sm font-bold transition-all ${
                  viewMode === 'map' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <MapIcon size={18} />
                <span className="hidden sm:inline">Carte</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* List View */}
        <div className={`flex-1 overflow-y-auto bg-gray-50 transition-all duration-300 ${
          viewMode === 'map' ? 'hidden md:block md:w-1/3 md:flex-none border-r border-gray-100' : 'w-full'
        }`}>
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-gray-900 tracking-tight">
                {isLoading ? 'Recherche...' : `${providers.length} prestataires trouvés`}
              </h2>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-white rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : providers.length > 0 ? (
              <>
                <div className={`grid gap-6 ${
                  viewMode === 'map' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                }`}>
                  {providers.map((provider, index) => (
                    <div key={provider.id}>
                      <ProviderCard provider={provider} />
                      {/* Insert Banner every 5 cards */}
                      {(index + 1) % 5 === 0 && (
                        <div className="col-span-full my-4 h-32 bg-blue-600 rounded-3xl flex items-center justify-center text-white font-black text-xl">
                          PUBLICITÉ
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {hasNextPage && (
                  <div className="mt-12 flex justify-center">
                    <Button 
                      variant="outline" 
                      onClick={() => fetchNextPage()} 
                      isLoading={isFetchingNextPage}
                      className="px-10 rounded-xl"
                    >
                      Charger plus
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-400 font-medium italic">Aucun prestataire ne correspond à votre recherche.</p>
              </div>
            )}
          </div>
        </div>

        {/* Map View */}
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
    </div>
  );
}
