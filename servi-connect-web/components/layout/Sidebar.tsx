'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  MessageSquare, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Bell,
  LineChart,
  Layers,
  Image as ImageIcon
} from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isAdmin = user?.roles.includes('ROLE_ADMIN');
  const isProvider = user?.roles.includes('ROLE_PROVIDER');

  const navItems = isAdmin ? [
    { label: 'Aperçu', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Utilisateurs', href: '/admin/users', icon: Users },
    { label: 'Bannières', href: '/admin/banners', icon: ImageIcon },
    { label: 'Catégories', href: '/admin/categories', icon: Layers },
    { label: 'Rapports', href: '/admin/reports', icon: LineChart },
  ] : [
    { label: 'Dashboard', href: '/provider/dashboard', icon: LayoutDashboard },
    { label: 'Messages', href: '/client/conversations', icon: MessageSquare },
    { label: 'Profil', href: '/provider/profile', icon: Settings },
    { label: 'Portfolio', href: '/provider/portfolio', icon: ImageIcon },
    { label: 'Mon Statut', href: '/provider/status', icon: Bell },
  ];

  return (
    <div 
      className={`h-[calc(100vh-64px)] bg-card border-r border-border flex flex-col transition-all duration-500 ease-in-out relative z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)] ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-4 top-10 bg-card border border-border rounded-full p-2 shadow-xl hover:bg-primary hover:text-white transition-all transform hover:scale-110 z-50 text-muted-foreground"
      >
        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center p-4 rounded-2xl group transition-all duration-300 relative ${
                isActive 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 translate-x-1' 
                  : 'text-muted-foreground hover:bg-muted hover:text-card-foreground'
              }`}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className="flex-shrink-0" />
              {!isCollapsed && (
                <span className={`ml-4 text-sm font-black uppercase tracking-widest transition-opacity duration-300 ${
                  isActive ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'
                }`}>
                  {item.label}
                </span>
              )}
              {isActive && !isCollapsed && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white rounded-r-full shadow-sm" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Area */}
      <div className="p-4 border-t border-border space-y-4">
        <button 
          onClick={logout}
          className={`flex items-center w-full p-4 rounded-2xl text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all font-black uppercase tracking-widest text-[10px] ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!isCollapsed && <span className="ml-4">Déconnexion</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
