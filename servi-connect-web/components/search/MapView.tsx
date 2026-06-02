'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { Provider } from '../../lib/types/provider';

// Need to safely import Leaflet since it uses window
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then((mod) => mod.Circle), { ssr: false });

// Helper component to handle smooth panning/zooming via Leaflet map hook
const MapController = dynamic(() => Promise.resolve(({ center, activeCoords }: { center: [number, number]; activeCoords: [number, number] | null }) => {
  const { useMap } = require('react-leaflet');
  const map = useMap();

  useEffect(() => {
    if (activeCoords) {
      map.flyTo(activeCoords, 14, {
        animate: true,
        duration: 1.2,
      });
    } else if (center) {
      map.setView(center, 12);
    }
  }, [map, center, activeCoords]);

  return null;
}), { ssr: false });

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
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }) : null;

  const providerIconAvailable = L ? new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }) : null;

  const providerIconBusy = L ? new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }) : null;

  const activeProviderIcon = L ? new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [32, 48],
    iconAnchor: [16, 48],
    popupAnchor: [1, -38],
    shadowSize: [41, 41]
  }) : null;

  if (typeof window === 'undefined') {
    return (
      <div className="h-full w-full bg-slate-100 flex flex-col items-center justify-center font-bold text-slate-400 text-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-300 border-t-blue-600 mb-4" />
        Chargement de la carte interactive...
      </div>
    );
  }

  const defaultCenter: [number, number] = [48.8566, 2.3522]; // Paris default
  const center: [number, number] = userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter;

  // Find active provider coordinates to trigger the flyTo controller
  let activeCoords: [number, number] | null = null;
  if (activeProviderId) {
    const activeProvider = providers.find((p) => Number(p.id) === activeProviderId);
    if (activeProvider && activeProvider.location) {
      activeCoords = [activeProvider.location.lat, activeProvider.location.lng];
    }
  }

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={center} 
        zoom={12} 
        className="h-full w-full outline-none"
        zoomControl={false} // Clean look, no defaults
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" // Modern elegant light map style
        />
        
        {/* Dynamic flyTo/zoom handler */}
        <MapController center={center} activeCoords={activeCoords} />

        {userLocation && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng] as [number, number]} icon={userIcon}>
              <Popup>
                <div className="font-bold text-slate-800 text-xs text-center">Ma position actuelle</div>
              </Popup>
            </Marker>
            <Circle 
              center={[userLocation.lat, userLocation.lng] as [number, number]} 
              radius={radius * 1000} 
              pathOptions={{ 
                fillColor: '#3b82f6', 
                fillOpacity: 0.08, 
                color: '#3b82f6', 
                weight: 1.5,
                dashArray: '5, 8' 
              }}
            />
          </>
        )}

        {providers.map((p) => {
          if (!p.location) return null;
          const isActive = Number(p.id) === activeProviderId;
          const isAvailable = p.status === 'available';
          const icon = isActive 
            ? activeProviderIcon 
            : (isAvailable ? providerIconAvailable : providerIconBusy);

          return (
            <Marker 
              key={p.id} 
              position={[p.location.lat, p.location.lng] as [number, number]} 
              icon={icon}
            >
              <Popup className="premium-popup">
                <div className="p-1 min-w-[150px]">
                  <div className="font-extrabold text-slate-800 text-sm">{p.firstName} {p.lastName}</div>
                  <div className="text-[10px] text-slate-400 font-semibold mb-2">{p.location.city || p.city}</div>
                  
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-blue-600">
                      {p.distance ? `${p.distance.toFixed(1)} km` : 'À proximité'}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                      isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {isAvailable ? 'Disponible' : 'Occupé'}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;
