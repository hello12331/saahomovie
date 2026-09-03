import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AppProvider } from '@/context/AppContext';
import './globals.css';

export const metadata = {
  title: 'Saaho Movie Counter - Your Entertainment. One Place.',
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
      <body className="min-h-screen flex flex-col bg-[#F4F6F9] text-slate-900 antialiased">
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
