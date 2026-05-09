'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import { AlertTriangle, RefreshCw, Home, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Error caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 text-center border border-gray-100"
      >
        <div className="w-20 h-20 bg-red-50 flex items-center justify-center rounded-3xl mx-auto mb-8">
          <AlertTriangle size={40} className="text-red-500" />
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Oups ! Une erreur est survenue</h1>
        <p className="text-gray-500 font-medium mb-10 leading-relaxed">
          Un problème technique est survenu. Nous mettons tout en œuvre pour rétablir la situation.
        </p>

        <div className="space-y-4">
          <Button onClick={() => reset()} className="w-full h-14 rounded-2xl font-bold bg-blue-600 shadow-lg shadow-blue-600/20">
            <RefreshCw size={20} className="mr-3" /> Réessayer
          </Button>

          <div className="grid grid-cols-2 gap-4">
            <Link href="/">
              <Button variant="outline" className="w-full h-12 rounded-xl border-gray-100">
                <Home size={18} className="mr-2" /> Accueil
              </Button>
            </Link>
            <Button variant="ghost" onClick={() => window.history.back()} className="w-full h-12 rounded-xl text-gray-400">
              <ChevronLeft size={18} className="mr-1" /> Retour
            </Button>
          </div>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-50 rounded-2xl text-left border border-gray-100 overflow-auto max-h-32">
            <code className="text-[10px] text-red-500">{error.message}</code>
          </div>
        )}
      </motion.div>
    </div>
  );
}
