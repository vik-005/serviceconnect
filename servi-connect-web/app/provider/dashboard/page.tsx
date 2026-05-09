'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProfile } from '@/lib/api/auth';
import AnalyticCard from '@/components/dashboard/AnalyticCard';
import OverviewChart from '@/components/dashboard/OverviewChart';
import { MessageSquare, Star, MessageCircle, Eye, Users, Search, Bell, TrendingUp, TrendingDown } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Skeleton from '@/components/ui/Skeleton';
import { AnalyticSkeleton } from '@/components/ui/Skeletons';
import ErrorBoundary from '@/components/ErrorBoundary';

const overviewData = [
  { name: 'Lun', uv: 400, pv: 240 },
  { name: 'Mar', uv: 300, pv: 139 },
  { name: 'Mer', uv: 200, pv: 980 },
  { name: 'Jeu', uv: 278, pv: 390 },
  { name: 'Ven', uv: 189, pv: 480 },
  { name: 'Sam', uv: 239, pv: 380 },
  { name: 'Dim', uv: 349, pv: 430 },
];

const sparkLineData = [
  { value: 10 }, { value: 15 }, { value: 12 }, { value: 25 }, { value: 18 }, { value: 30 }, { value: 28 }
];

export default function ProviderDashboard() {
  const { data: profile, isLoading } = useQuery({ queryKey: ['profile'], queryFn: getProfile });

  if (isLoading) return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div className="space-y-3">
          <Skeleton className="w-32 h-4 rounded-full" />
          <Skeleton className="w-64 h-10 rounded-full" />
        </div>
        <Skeleton className="w-48 h-12 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
        {[...Array(4)].map((_, i) => <AnalyticSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <Skeleton className="xl:col-span-2 h-[400px] rounded-[2.5rem]" />
        <Skeleton className="h-[400px] rounded-[2.5rem]" />
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-1">
             <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] bg-blue-50 px-2 py-0.5 rounded-md">PRESTATAIRE</span>
             <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">ACTUALISÉ IL Y A 5 MIN</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">
            Dashboard <span className="text-blue-600">Analytique</span>
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
              <Search size={18} />
            </div>
            <input type="text" placeholder="Rechercher..." className="bg-transparent border-none outline-none text-sm font-medium w-40" />
          </div>
          <button className="relative w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-600 shadow-sm hover:bg-gray-50 transition-colors">
             <Bell size={20} />
             <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
          </button>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
        <AnalyticCard 
          title="Revenus Mensuels" 
          value="4,250 €" 
          icon={Search} 
          trend={{ value: 12.5, isUp: true, label: "vs mois dernier" }} 
          sparklineData={sparkLineData}
          color="blue"
        />
        <AnalyticCard 
          title="Taux de conversion" 
          value="24.8%" 
          icon={Users} 
          trend={{ value: 4.2, isUp: true, label: "croissance web" }} 
          sparklineData={sparkLineData.map(v => ({ value: v.value * 1.2 }))}
          color="green"
        />
        <AnalyticCard 
          title="Note Moyenne" 
          value="4.9" 
          icon={Star} 
          trend={{ value: 0.1, isUp: true, label: "satisfaction client" }} 
          sparklineData={sparkLineData.map(v => ({ value: 50 - v.value }))}
          color="orange"
        />
        <AnalyticCard 
          title="Temps de réponse" 
          value="12 min" 
          icon={MessageSquare} 
          trend={{ value: 2, isUp: false, label: "temps moyen" }} 
          sparklineData={sparkLineData.slice().reverse()}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Main Chart */}
        <div className="xl:col-span-2">
          <OverviewChart 
            title="Activité de la Plateforme" 
            description="Visualisation des interactions et des nouvelles demandes de services."
            data={overviewData} 
          />
        </div>

        {/* Activity Feed / Top Clients */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Top Clients</h3>
            <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Voir tout</button>
          </div>
          
          <div className="space-y-6 flex-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between group cursor-pointer p-2 -m-2 rounded-2xl hover:bg-gray-50 transition-all">
                <div className="flex items-center space-x-4">
                  <Avatar size="md" alt={`Client ${i}`} className="shadow-sm group-hover:scale-105 transition-transform" />
                  <div>
                    <p className="text-sm font-black text-gray-800">Marc Antoine {i}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Dernière mission hier</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-gray-900">120 €</p>
                  <div className="flex items-center text-[10px] font-bold text-green-500">
                    <TrendingUp size={10} className="mr-0.5" />
                    <span>8%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-blue-600 rounded-3xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Passer à Pro</p>
            <h4 className="text-white text-lg font-black leading-tight mb-4">Gérez plus de 20 missions par mois</h4>
            <button className="w-full py-2.5 bg-white text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:shadow-xl transition-all active:scale-95">Upgrade</button>
          </div>
        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
}
