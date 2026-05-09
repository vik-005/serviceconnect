'use client';

import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8 p-8">
        <div className="relative inline-block">
          <span className="text-9xl font-black text-gray-100 italic">404</span>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-xl rotate-12">
               <Search size={32} className="text-white -rotate-12" />
             </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Perdu dans le service ?</h1>
          <p className="text-gray-500 font-medium">
            La page que vous cherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        <div className="flex flex-col space-y-3 pt-6">
          <Link href="/search">
            <Button className="w-full h-14 rounded-2xl font-bold shadow-lg shadow-blue-600/20 text-lg">
              Chercher un pro
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="w-full h-14 rounded-2xl font-bold text-gray-400 hover:text-gray-600">
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
