'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBanners } from '@/lib/api/banners';
import { getCategories } from '@/lib/api/providers';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/ui/Spinner';
import dynamic from 'next/dynamic';
import ClientLayout from "./client/layout";
import CategorySlider from '@/components/layout/CategorySlider';
import { ChevronRight, Shield, Star, Clock, MapPin, Zap, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import SearchBar from '@/components/search/SearchBar';

const DynamicBannerSlider = dynamic(() => import('@/components/layout/BannerSlider'), { ssr: false });

export default function HomePage() {
  const router = useRouter();
  const { data: banners = [], isLoading: bannersLoading } = useQuery({
    queryKey: ['banners', 'home'],
    queryFn: () => getBanners('home'),
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const handleSearch = (params: any) => {
    const query = new URLSearchParams();
    if (params.category) query.set('category', params.category);
    if (params.lat) query.set('lat', params.lat.toString());
    if (params.lng) query.set('lng', params.lng.toString());
    query.set('radius', params.radius.toString());
    router.push(`/search?${query.toString()}`);
  };

  return (
    <ClientLayout>
      <div className="space-y-24 pb-20 overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-20">
          {/* Animated Background Orbs */}
          <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-secondary/10 blur-[100px] rounded-full animate-pulse delay-1000" />

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center space-y-10 mb-16 relative z-10"
          >
            <div className="inline-flex items-center space-x-2 bg-muted px-4 py-2 rounded-full border border-border shadow-sm mb-4">
              <span className="flex h-2 w-2 rounded-full bg-secondary animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">+2,500 experts disponibles</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black text-card-foreground tracking-tight leading-[0.9] lg:max-w-4xl mx-auto">
              Le service <span className="text-primary italic">pro</span><br/> à portée de <span className="text-secondary underline decoration-8 decoration-secondary/20 underline-offset-8">clic</span>.
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
              Découvrez la nouvelle façon de trouver des prestataires de confiance au Bénin. Simple, instantané et ultra-qualitatif.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-4xl w-full mx-auto relative z-20"
          >
            <div className="bg-card/80 backdrop-blur-xl p-3 rounded-[3rem] border border-border shadow-2xl">
              <SearchBar categories={categories} onSearch={handleSearch} />
            </div>
            
            {/* Quick Stats Under Search */}
            <div className="flex flex-wrap justify-center gap-8 mt-10">
              {[
                { icon: Shield, label: 'Vérifiés' },
                { icon: Star, label: 'Top-Notch' },
                { icon: Clock, label: 'Dispo 24/7' },
                { icon: MapPin, label: 'Proximité' }
              ].map((item, i) => (
                <div key={i} className="flex items-center space-x-2 text-muted-foreground opacity-60">
                  <item.icon size={16} />
                  <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Banner Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[3rem] shadow-2xl border border-border"
          >
            {bannersLoading ? (
              <div className="h-[400px] w-full bg-muted flex items-center justify-center">
                <Spinner size="lg" />
              </div>
            ) : (
              <DynamicBannerSlider banners={banners} />
            )}
          </motion.div>
        </section>

        {/* Categories Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 space-y-6 md:space-y-0">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                 <div className="w-10 h-1 bg-primary rounded-full" />
                 <span className="text-primary font-black tracking-widest text-[10px] uppercase">
                   Catégories Populaires
                 </span>
              </div>
              <h2 className="text-5xl font-black text-card-foreground tracking-tight">Ce que nous faisons <span className="text-secondary">mieux</span>.</h2>
            </div>
            <Link href="/categories" className="inline-flex items-center px-8 py-4 bg-muted hover:bg-primary hover:text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all group">
              Voir tout <ChevronRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="relative">
            {categoriesLoading ? (
              <div className="flex space-x-6 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-44 h-48 bg-muted rounded-[2.5rem] animate-pulse" />
                ))}
              </div>
            ) : (
              <CategorySlider categories={categories} />
            )}
          </div>
        </section>

        {/* Features / Why Us */}
        <section className="bg-card py-32 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-10">
                <h2 className="text-5xl font-black text-card-foreground tracking-tight leading-none">
                  Pourquoi choisir <br/><span className="text-primary">ServiConnect ?</span>
                </h2>
                <div className="space-y-8">
                  {[
                    { title: 'Qualité Certifiée', desc: 'Chaque prestataire passe un processus de vérification rigoureux.', color: 'bg-blue-100 text-blue-600' },
                    { title: 'Rapidité Éclatante', desc: 'Trouvez et réservez un pro en moins de 2 minutes chrono.', color: 'bg-orange-100 text-orange-600' },
                    { title: 'Sécurité Totale', desc: 'Vos transactions et données sont protégées par les meilleurs standards.', color: 'bg-purple-100 text-purple-600' }
                  ].map((feat, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ x: 10 }}
                      className="flex space-x-6 group"
                    >
                      <div className={`flex-shrink-0 w-16 h-16 rounded-2xl ${feat.color} flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform`}>
                        <Zap size={28} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-card-foreground">{feat.title}</h3>
                        <p className="text-muted-foreground leading-relaxed font-medium">{feat.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square bg-gradient-to-tr from-primary to-secondary rounded-[4rem] rotate-3 shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700" />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <span className="text-white font-black text-9xl opacity-10">SC</span>
                  </div>
                </div>
                {/* Floating card decor */}
                <div className="absolute -bottom-10 -left-10 bg-card p-8 rounded-3xl border border-border shadow-2xl animate-bounce duration-[3000ms]">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white">
                       <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase text-muted-foreground">Succès</p>
                      <p className="text-lg font-bold text-card-foreground">Mission accomplie !</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="bg-primary p-16 rounded-[4rem] text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-1000" />
            
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-10 relative z-10">
              Prêt à lancer <br/>votre projet ?
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
              <Link href="/register" className="px-10 py-5 bg-white text-primary rounded-[2rem] font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all shadow-xl">
                Rejoignez-nous
              </Link>
              <Link href="/categories" className="px-10 py-5 bg-primary-foreground/10 text-white border border-white/20 rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-white/10 transition-all">
                Voir les services
              </Link>
            </div>
          </div>
        </section>
      </div>
    </ClientLayout>
  );
}
