import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AppProvider } from '@/context/AppContext';
import './globals.css';

export const metadata = {
  title: 'CineGo - Your Entertainment. One Place.',
  description: 'Book movie tickets, live concerts, sports events, and cinema snacks with instant digital pass & OTP auth.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/globals.css" />
      </head>
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
