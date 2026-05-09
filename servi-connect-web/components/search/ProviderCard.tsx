'use client';

import React from 'react';
import { Provider } from '../../lib/types/provider';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import StarRating from '../ui/StarRating';
import Button from '../ui/Button';
import Link from 'next/link';
import { MapPin, Briefcase } from 'lucide-react';

interface ProviderCardProps {
  provider: Provider;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all flex flex-col h-full group">
      <div className="flex items-start justify-between mb-4">
        <Link href={`/providers/${provider.id}`} className="flex items-center space-x-4">
          <Avatar src={provider.avatarUrl} alt={`${provider.firstName} ${provider.lastName}`} size="lg" className="ring-2 ring-gray-50 ring-offset-2" />
          <div className="overflow-hidden">
            <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {provider.firstName} {provider.lastName}
            </h3>
            <div className="flex items-center text-sm text-gray-500">
              <MapPin size={14} className="mr-1" /> {provider.location?.city} • {provider.distance ? `${provider.distance.toFixed(1)} km` : 'À proximité'}
            </div>
          </div>
        </Link>
        <Badge variant={provider.status === 'available' ? 'success' : 'warning'}>
          {provider.status === 'available' ? 'Disponible' : 'Occupé'}
        </Badge>
      </div>

      <div className="mb-4">
        <StarRating rating={provider.averageRating} size={16} />
        <span className="text-xs text-gray-400 ml-1">({provider.reviewCount} avis)</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 flex-grow">
        {provider.services.slice(0, 3).map((service) => (
          <span key={service.id} className="text-[11px] font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg">
            {service.name}
          </span>
        ))}
        {provider.services.length > 3 && (
          <span className="text-[11px] font-semibold bg-gray-50 text-gray-500 px-2.5 py-1 rounded-lg">
            +{provider.services.length - 3}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link href={`/providers/${provider.id}`} className="w-full">
          <Button variant="outline" size="sm" className="w-full rounded-xl">Profil</Button>
        </Link>
        <Button size="sm" className="rounded-xl">Contacter</Button>
      </div>
    </div>
  );
};

export default ProviderCard;
