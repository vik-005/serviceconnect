import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ServiConnect - Trouvez votre prestataire de confiance",
  description: "La plateforme de mise en relation clients et prestataires locaux.",
};

import PageAnimatePresence from "@/components/layout/PageAnimatePresence";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <body className={`${inter.className} h-full bg-white flex flex-col`} suppressHydrationWarning>
        <Providers>
          <PageAnimatePresence>
            {children}
          </PageAnimatePresence>
        </Providers>
      </body>
    </html>
  );
}
