import React from 'react';
import { Metadata } from 'next';
import { getProviderById } from '@/lib/api/providers';
import { getBanners } from '@/lib/api/banners';
import ProviderProfileView from '@/components/provider/ProviderProfileView';
import ErrorBoundary from '@/components/ErrorBoundary';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const provider = await getProviderById(params.id);
    return {
      title: `${provider.firstName} ${provider.lastName} - ${provider.categories?.[0]?.name || 'Prestataire'} | ServiConnect`,
      description: provider.bio?.substring(0, 160) || `Découvrez le profil de ${provider.firstName} sur ServiConnect.`,
      openGraph: {
        images: [provider.avatarUrl || ''],
      },
    };
  } catch (error) {
    return { title: 'Profil Prestataire | ServiConnect' };
  }
}

export default async function ProviderProfilePage({ params }: { params: { id: string } }) {
  const [provider, banners] = await Promise.all([
    getProviderById(params.id),
    getBanners('profile')
  ]);

  if (!provider) {
    return <div className="text-center py-20 font-black text-2xl">Prestataire introuvable</div>;
  }

  return (
    <ErrorBoundary>
      <ProviderProfileView provider={provider} bottomBanner={banners} />
    </ErrorBoundary>
  );
}
