'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { createConversation } from '@/lib/api/conversations';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import StarRating from '@/components/ui/StarRating';
import PortfolioGrid from '@/components/provider/PortfolioGrid';
import { MapPin, Calendar, CheckCircle2, MessageSquare, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProviderProfileViewProps {
  provider: any;
  bottomBanner: any;
}

export default function ProviderProfileView({ provider, bottomBanner }: ProviderProfileViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'bio' | 'services' | 'portfolio' | 'reviews'>('bio');

  const mutation = useMutation({
    mutationFn: () => createConversation(provider.id),
    onSuccess: (data) => {
      router.push(`/conversations/${data.id}`);
    },
    onError: () => {
      toast.error('Erreur', { description: 'Impossible de démarrer la conversation.' });
    }
  });

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Cover / Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8">
            <Avatar src={provider.avatarUrl} alt={`${provider.firstName} ${provider.lastName}`} size="xl" className="ring-4 ring-blue-50 ring-offset-4 mb-6 md:mb-0" />
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full">
                <div>
                  <div className="flex items-center justify-center md:justify-start space-x-2">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">{provider.firstName} {provider.lastName}</h1>
                    {provider.isVerified && <CheckCircle2 className="text-blue-600" size={24} />}
                  </div>
                  <div className="flex items-center justify-center md:justify-start text-gray-500 font-medium space-x-4 mt-2">
                    <span className="flex items-center"><MapPin size={18} className="mr-1" /> {provider.location?.city}</span>
                    <span className="flex items-center"><Calendar size={18} className="mr-1" /> {provider.experienceYears} ans d'exp.</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 mt-6 md:mt-0">
                  <Button variant="outline" className="w-full sm:w-auto rounded-xl">
                    <Share2 size={18} className="mr-2" /> Partager
                  </Button>
                  <Button 
                    className="w-full sm:w-auto px-10 rounded-xl font-bold" 
                    onClick={() => mutation.mutate()}
                    isLoading={mutation.isPending}
                  >
                    <MessageSquare size={18} className="mr-2" /> Contacter
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center md:justify-start pt-4">
                <StarRating rating={provider.averageRating} size={20} />
                <span className="ml-2 text-gray-500 font-bold">({provider.reviewCount} avis)</span>
                <div className="ml-6 pl-6 border-l border-gray-100">
                  <Badge variant={provider.status === 'available' ? 'success' : 'warning'}>
                    {provider.status === 'available' ? 'Disponible' : 'Occupé'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tabs Nav */}
          <div className="flex border-b border-gray-100 bg-gray-50/50">
            {['bio', 'services', 'portfolio', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-8 py-5 text-sm font-black uppercase tracking-widest transition-all ${
                  activeTab === tab 
                    ? 'text-blue-600 bg-white border-b-2 border-blue-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab === 'bio' ? 'Bio' : tab === 'services' ? 'Services' : tab === 'portfolio' ? 'Portfolio' : 'Avis'}
              </button>
            ))}
          </div>

          <div className="p-8">
            {activeTab === 'bio' && (
              <div className="animate-in fade-in duration-300 max-w-3xl">
                <h3 className="text-2xl font-black text-gray-900 mb-4">À propos de moi</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap font-medium">
                  {provider.bio || "Aucune description fournie."}
                </p>
              </div>
            )}
            {/* ... other tab contents simplified for the example ... */}
            {activeTab === 'services' && (
               <div className="animate-in fade-in duration-300 grid md:grid-cols-2 gap-6">
                {provider.services.map((service: any) => (
                  <div key={service.id} className="p-6 bg-gray-50 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-white transition-all space-y-2">
                    <h4 className="text-lg font-bold text-gray-900">{service.name}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed font-medium">{service.description || "Pas de description détaillée."}</p>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'portfolio' && (
              <div className="animate-in fade-in duration-300">
                <PortfolioGrid items={provider.portfolio} />
              </div>
            )}
             {activeTab === 'reviews' && (
              <div className="animate-in fade-in duration-300 space-y-8">
                {provider.reviews.length > 0 ? provider.reviews.map((review: any) => (
                  <div key={review.id} className="flex space-x-4 border-b border-gray-50 pb-8 last:border-0 last:pb-0">
                    <Avatar src={review.author.avatarUrl} alt={review.author.firstName} size="md" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-gray-900">{review.author.firstName}</h4>
                        <span className="text-xs text-gray-400 font-medium">{new Date(review.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <StarRating rating={review.rating} size={14} />
                      <p className="text-gray-600 text-sm mt-2 leading-relaxed font-medium">{review.comment}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-gray-400 py-10 italic">Aucun avis pour le moment.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {bottomBanner?.[0] && (
          <div className="mt-12">
            <Link href={bottomBanner[0].targetUrl || '#'}>
              <div className="w-full h-32 rounded-3xl overflow-hidden relative group cursor-pointer shadow-lg">
                <img src={bottomBanner[0].imageUrl} alt="Ad" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-blue-600/20 group-hover:bg-blue-600/10 transition-colors" />
                <div className="absolute inset-0 flex items-center px-10">
                  <h2 className="text-2xl font-black text-white tracking-tight">{bottomBanner[0].title}</h2>
                </div>
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
