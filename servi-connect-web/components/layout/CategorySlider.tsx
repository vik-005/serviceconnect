'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string;
}

interface CategorySliderProps {
  categories: Category[];
}

const CategorySlider: React.FC<CategorySliderProps> = ({ categories }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group">
      {/* Navigation Buttons */}
      <button 
        onClick={() => scroll('left')}
        className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-blue-500/10 text-gray-400 hover:text-blue-600 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 hidden md:flex"
      >
        <ChevronLeft size={24} />
      </button>

      <div 
        ref={scrollRef}
        className="flex space-x-6 overflow-x-auto pb-8 scrollbar-hide snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((category) => (
          <motion.div
            key={category.id}
            whileHover={{ y: -8, scale: 1.02 }}
            className="flex-shrink-0 w-44 snap-start"
          >
            <Link
              href={`/search?category=${category.slug}`}
              className="block bg-white border border-gray-100 p-8 rounded-[2.5rem] text-center hover:shadow-2xl hover:border-blue-100 transition-all duration-300 relative overflow-hidden group/item"
            >
              <div className="absolute inset-0 bg-blue-50/0 group-hover/item:bg-blue-50/50 transition-colors duration-300" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover/item:bg-blue-600 transition-colors duration-300 shadow-inner">
                  {category.iconUrl ? (
                    <img src={category.iconUrl} alt={category.name} className="w-10 h-10 object-contain group-hover/item:scale-125 transition-transform duration-300" />
                  ) : (
                    <span className="text-3xl group-hover/item:scale-125 transition-transform duration-300 transform-gpu">
                      🛠️
                    </span>
                  )}
                </div>
                <h3 className="font-black text-gray-900 text-sm tracking-tight group-hover/item:text-blue-700 transition-colors">
                  {category.name}
                </h3>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <button 
        onClick={() => scroll('right')}
        className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-blue-500/10 text-gray-400 hover:text-blue-600 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 hidden md:flex"
      >
        <ChevronRight size={24} />
      </button>

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default CategorySlider;
