'use client';

import React, { useState } from 'react';
import { Search, MapPin, Navigation } from 'lucide-react';
import { useGeolocation } from '../../lib/hooks/useGeolocation';
import Button from '../ui/Button';

interface SearchBarProps {
  onSearch: (params: { category: string; lat?: number; lng?: number; radius: number }) => void;
  initialCategory?: string;
  categories: { name: string; slug: string }[];
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, initialCategory = '', categories }) => {
  const [category, setCategory] = useState(initialCategory);
  const [radius, setRadius] = useState(5);
  const { location, error } = useGeolocation();

  const handleSearch = () => {
    onSearch({
      category,
      lat: location?.lat,
      lng: location?.lng,
      radius,
    });
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 border border-gray-100">
      <div className="flex-1 w-full relative">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 appearance-none text-gray-700"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>{cat.name}</option>
          ))}
        </select>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
      </div>

      <div className="w-full md:w-48 flex flex-col px-2">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
          Rayon: {radius} km
        </label>
        <input
          type="range"
          min="1"
          max="20"
          value={radius}
          onChange={(e) => setRadius(parseInt(e.target.value))}
          className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>

      <div className="flex items-center space-x-2 w-full md:w-auto">
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          title="Ma position"
          className="px-3"
        >
          <Navigation size={20} className={location ? 'text-blue-600' : 'text-gray-400'} />
        </Button>
        <Button 
          className="w-full md:w-auto px-8 py-3 rounded-xl font-bold"
          onClick={handleSearch}
        >
          Rechercher
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;
