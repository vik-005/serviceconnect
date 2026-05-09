'use client';

import React from 'react';
import { PortfolioItem } from '../../lib/types/provider';
import { Play, Maximize2, Trash2 } from 'lucide-react';

interface PortfolioGridProps {
  items: PortfolioItem[];
  isEditable?: boolean;
  onDeleteItem?: (id: number) => void;
}

const PortfolioGrid: React.FC<PortfolioGridProps> = ({ items, isEditable, onDeleteItem }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <div key={item.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-xl transition-all">
          <img 
            src={item.type === 'video' ? (item.thumbnailUrl || '/api/placeholder/400/400') : item.url} 
            alt={item.title || 'Portfolio item'} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
            {item.type === 'video' ? (
              <button className="p-3 bg-white text-black rounded-full hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110">
                <Play size={24} fill="currentColor" />
              </button>
            ) : (
              <button className="p-3 bg-white text-black rounded-full hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110">
                <Maximize2 size={24} />
              </button>
            )}
            
            {isEditable && (
              <button 
                onClick={() => onDeleteItem?.(item.id)}
                className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all transform hover:scale-110"
              >
                <Trash2 size={24} />
              </button>
            )}
          </div>
          
          {item.title && (
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-xs font-bold truncate">{item.title}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PortfolioGrid;
