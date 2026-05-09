'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { Provider } from '../../lib/types/provider';

// Need to safely import Leaflet since it uses window
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then((mod) => mod.Circle), { ssr: false });

interface MapViewProps {
  providers: Provider[];
  userLocation: { lat: number; lng: number } | null;
  radius: number;
  activeProviderId?: number | null;
}

const MapView: React.FC<MapViewProps> = ({ providers, userLocation, radius, activeProviderId }) => {
  // Fix for Leaflet icons in Next.js
  const L = typeof window !== 'undefined' ? require('leaflet') : null;
  const userIcon = L ? new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  }) : null;

  const providerIconBase = L ? new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  }) : null;

  const activeProviderIcon = L ? new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
    iconSize: [30, 46],
    iconAnchor: [15, 46],
  }) : null;

  if (typeof window === 'undefined') return <div className="h-full w-full bg-gray-100 flex items-center justify-center">Chargement de la carte...</div>;

  const center = userLocation || { lat: 48.8566, lng: 2.3522 }; // default to Paris

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={[center.lat, center.lng] as [number, number]} 
        zoom={13} 
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {userLocation && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng] as [number, number]} icon={userIcon}>
              <Popup>Ma position</Popup>
            </Marker>
            <Circle 
              center={[userLocation.lat, userLocation.lng] as [number, number]} 
              radius={radius * 1000} 
              pathOptions={{ fillColor: 'blue', fillOpacity: 0.1, color: 'blue', weight: 1 }}
            />
          </>
        )}

        {providers.map((p) => {
          if (!p.location) return null;
          const isActive = activeProviderId === p.id;
          return (
            <Marker 
              key={p.id} 
              position={[p.location.lat, p.location.lng] as [number, number]} 
              icon={isActive ? activeProviderIcon : providerIconBase}
            >
              <Popup>
                <div className="font-bold">{p.firstName} {p.lastName}</div>
                <div className="text-xs">{p.location.city}</div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;
