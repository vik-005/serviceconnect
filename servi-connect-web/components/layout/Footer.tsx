import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2">
            <span className="text-2xl font-black text-blue-600 tracking-tighter">ServiConnect</span>
            <p className="mt-4 text-gray-500 max-w-xs leading-relaxed">
              La plateforme de mise en relation de confiance entre prestataires qualifiés et clients exigeants.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Plateforme</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/search" className="text-gray-500 hover:text-blue-600">Chercher un pro</Link></li>
              <li><Link href="/register" className="text-gray-500 hover:text-blue-600">Devenir prestataire</Link></li>
              <li><Link href="/categories" className="text-gray-500 hover:text-blue-600">Toutes les catégories</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Légal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms" className="text-gray-500 hover:text-blue-600">CGU / CGV</Link></li>
              <li><Link href="/privacy" className="text-gray-500 hover:text-blue-600">Confidentialité</Link></li>
              <li><Link href="/cookies" className="text-gray-500 hover:text-blue-600">Cookies</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} ServiConnect. Tous droits réservés.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span>Fait avec  pour les pros</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
