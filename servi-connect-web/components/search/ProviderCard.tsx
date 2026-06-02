'use client';

import React from 'react';
import { Provider } from '../../lib/types/provider';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import StarRating from '../ui/StarRating';
import Button from '../ui/Button';
import Link from 'next/link';
import { MapPin, ArrowRight, ShieldCheck } from 'lucide-react';

interface ProviderCardProps {
  provider: Provider;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider }) => {
  const isAvailable = provider.status === 'available';

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 hover:shadow-xl hover:shadow-slate-100/50 hover:border-slate-200/60 transition-all duration-300 flex flex-col h-full group relative overflow-hidden">
      {/* Background radial highlight */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/30 rounded-full blur-2xl group-hover:bg-blue-100/40 transition-colors duration-500 -z-10" />

      {/* Card Header */}
      <div className="flex items-start justify-between mb-4 gap-4">
        <Link href={`/providers/${provider.id}`} className="flex items-center space-x-4 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <Avatar 
              src={provider.avatarUrl} 
              alt={`${provider.firstName} ${provider.lastName}`} 
              size="lg" 
              className="ring-4 ring-slate-50 group-hover:ring-blue-50 transition-all duration-300" 
            />
            {provider.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-full border-2 border-white shadow-sm" title="Profil vérifié">
                <ShieldCheck size={10} className="stroke-[3]" />
              </div>
            )}
          </div>
          
          <div className="overflow-hidden flex-1">
            <h3 className="font-extrabold text-base text-slate-800 truncate group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
              {provider.firstName} {provider.lastName}
            </h3>
            <div className="flex items-center text-xs text-slate-400 font-semibold mt-1">
              <MapPin size={12} className="mr-1 text-slate-400" /> 
              <span className="truncate">{provider.location?.city || provider.city || 'À proximité'}</span>
              {provider.distance !== undefined && (
                <span className="ml-1.5 text-blue-600 font-bold bg-blue-50/50 px-1.5 py-0.5 rounded">
                  {provider.distance.toFixed(1)} km
                </span>
              )}
            </div>
          </div>
        </Link>
        
        <div className="flex-shrink-0">
          <Badge 
            variant={isAvailable ? 'success' : 'warning'}
            className={`font-black text-[10px] px-2.5 py-1 rounded-lg ${
              isAvailable 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                : 'bg-amber-50 text-amber-700 border border-amber-100'
            }`}
          >
            {isAvailable ? 'Disponible' : 'Occupé'}
          </Badge>
        </div>
      </div>

      {/* Ratings Section */}
      <div className="flex items-center space-x-2 mb-4 bg-slate-50/80 p-2 rounded-xl border border-slate-100/50">
        <StarRating rating={provider.averageRating || 0} size={14} />
        <span className="text-[11px] text-slate-500 font-bold">
          {provider.averageRating ? provider.averageRating.toFixed(1) : 'Nouveau'}
        </span>
        <span className="text-[10px] text-slate-400 font-medium">
          ({provider.reviewCount || 0} avis)
        </span>
      </div>

      {/* Bio excerpt */}
      {provider.bio && (
        <p className="text-xs text-slate-500 line-clamp-2 mb-4 font-medium leading-relaxed">
          {provider.bio}
        </p>
      )}

      {/* Services badging */}
      <div className="flex flex-wrap gap-1.5 mb-6 flex-grow items-start content-start">
        {provider.services?.slice(0, 3).map((service) => (
          <span 
            key={service.id} 
            className="text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-100 px-2 py-0.5 rounded-lg group-hover:bg-blue-50/30 group-hover:text-blue-600 group-hover:border-blue-100/30 transition-all duration-300"
          >
            {service.name}
          </span>
        ))}
        {provider.services && provider.services.length > 3 && (
          <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg">
            +{provider.services.length - 3}
          </span>
        )}
      </div>

      {/* Card CTA Footer */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-50">
        <Link href={`/providers/${provider.id}`} className="w-full">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full rounded-2xl border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 font-bold text-xs shadow-sm h-10"
          >
            Voir profil
          </Button>
        </Link>
        <Link href={`/client/conversations?new=${provider.id}`} className="w-full">
          <Button 
            size="sm" 
            className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/10 h-10 flex items-center justify-center gap-1 group/btn"
          >
            <span>Contacter</span>
            <ArrowRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ProviderCard;
