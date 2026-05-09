'use client';

import React from 'react';
import AnalyticCard from '@/components/dashboard/AnalyticCard';
import OverviewChart from '@/components/dashboard/OverviewChart';
import { Users, Briefcase, Search, Bell, AlertTriangle, ShieldCheck, UserPlus, Layers } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { AnalyticSkeleton } from '@/components/ui/Skeletons';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useQuery } from '@tanstack/react-query';
import { getAdminStats } from '@/lib/api/admin';

const adminOverviewData = [
  { name: 'Jan', uv: 4000, pv: 2400 },
  { name: 'Fév', uv: 3000, pv: 1398 },
  { name: 'Mar', uv: 2000, pv: 9800 },
  { name: 'Avr', uv: 2780, pv: 3908 },
  { name: 'Mai', uv: 1890, pv: 4800 },
  { name: 'Juin', uv: 2390, pv: 3800 },
  { name: 'Juil', uv: 3490, pv: 4300 },
];

const sparkLineData = [
  { value: 40 }, { value: 70 }, { value: 45 }, { value: 90 }, { value: 65 }, { value: 85 }, { value: 100 }
];

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({ queryKey: ['adminStats'], queryFn: getAdminStats });

  if (isLoading) return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <Skeleton className="w-64 h-12 rounded-full" />
        <Skeleton className="w-40 h-12 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
        {[...Array(4)].map((_, i) => <AnalyticSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <Skeleton className="xl:col-span-2 h-[500px] rounded-[3rem]" />
        <Skeleton className="h-[500px] rounded-[3rem]" />
      </div>
    </div>
  );

  const summary = stats?.summary || {};
  const growth = stats?.growth || {};

  return (
    <ErrorBoundary>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Admin Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-1">
             <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] bg-secondary/10 px-2 py-0.5 rounded-md">ADMINISTRATION</span>
             <div className="w-1.5 h-1.5 rounded-full bg-border" />
             <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">SÉCURISÉ</span>
          </div>
          <h1 className="text-4xl font-black text-card-foreground tracking-tight leading-tight">
            Console de <span className="text-primary">Contrôle</span>
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
           <button className="px-6 py-3 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all active:scale-95 flex items-center">
             <Layers size={16} className="mr-2" />
             Gérer le site
           </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
        <AnalyticCard 
          title="Utilisateurs Totaux" 
          value={summary.total_users || 0} 
          icon={Users} 
          trend={{ value: growth.new_users_30d || 0, isUp: true, label: "derniers 30j" }} 
          sparklineData={growth.users_series || []}
          color="blue"
        />
        <AnalyticCard 
          title="Prestataires Actifs" 
          value={summary.active_providers || 0} 
          icon={Briefcase} 
          trend={{ value: 10, isUp: true, label: "volume d'affaires" }} 
          sparklineData={growth.users_series?.map((v: any) => ({ value: v.value * 0.5 })) || []}
          color="orange"
        />
        <AnalyticCard 
          title="Conversations" 
          value={summary.total_conversations || 0} 
          icon={AlertTriangle} 
          trend={{ value: growth.new_conversations_30d || 0, isUp: true, label: "échanges récents" }} 
          sparklineData={growth.conversations_series || []}
          color="purple"
        />
        <AnalyticCard 
          title="Vérifications" 
          value="156" 
          icon={ShieldCheck} 
          trend={{ value: 12, isUp: true, label: "prestataires validés" }} 
          sparklineData={growth.users_series?.map((v: any) => ({ value: v.value * 0.8 })) || []}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Main Admin Chart */}
        <div className="xl:col-span-2">
          <OverviewChart 
            title="Croissance des Inscriptions" 
            description="Évolution du nombre d'utilisateurs sur les 30 derniers jours."
            data={growth.users_series || []} 
          />
        </div>

        {/* Pending Actions Feed */}
        <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-[0_20px_50px_rgba(0,0,0,0.02)] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-card-foreground tracking-tight">À valider</h3>
            <Badge variant="danger" className="animate-pulse">Urgent</Badge>
          </div>
          
          <div className="space-y-6 flex-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="group p-4 rounded-2xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer">
                <div className="flex items-center space-x-3 mb-2">
                   <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center">
                     <UserPlus size={16} />
                   </div>
                   <p className="text-xs font-black text-card-foreground uppercase">Prestatation à vérifier</p>
                </div>
                <p className="text-sm font-bold text-muted-foreground mb-3">Service de Plomberie par Jean D.</p>
                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-bold text-muted-foreground">Il y a 2h</span>
                   <button className="px-3 py-1 bg-card border border-border rounded-lg text-[10px] font-black uppercase text-card-foreground hover:bg-muted">Détails</button>
                </div>
              </div>
            ))}
          </div>

          <button className="mt-8 w-full py-4 border-2 border-dashed border-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all">
            Voir tous les signalements
          </button>
        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
}
