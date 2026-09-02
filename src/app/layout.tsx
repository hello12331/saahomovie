'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AppProvider } from '@/context/AppContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#0F1117] text-white antialiased">
        <AppProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
