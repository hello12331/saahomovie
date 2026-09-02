'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  savedCity: string;
  cineCoinsBalance: number;
  seatPreference?: string;
}

interface AppContextType {
  city: string;
  setCity: (city: string) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  wishlist: string[];
  toggleWishlist: (movieId: string) => void;
  isCityModalOpen: boolean;
  setIsCityModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [city, setCity] = useState<string>('Hyderabad');
  const [user, setUser] = useState<User | null>({
    id: 'u_demo',
    name: 'Rahul Sharma',
    email: 'user@cinego.com',
    role: 'USER',
    savedCity: 'Hyderabad',
    cineCoinsBalance: 120,
    seatPreference: 'CENTER'
  });
  const [wishlist, setWishlist] = useState<string[]>(['m1', 'm3']);
  const [isCityModalOpen, setIsCityModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem('cinego_city');
    if (saved) setCity(saved);
  }, []);

  const handleSetCity = (newCity: string) => {
    setCity(newCity);
    localStorage.setItem('cinego_city', newCity);
  };

  const toggleWishlist = (movieId: string) => {
    setWishlist(prev => 
      prev.includes(movieId) ? prev.filter(id => id !== movieId) : [...prev, movieId]
    );
  };

  return (
    <AppContext.Provider value={{
      city,
      setCity: handleSetCity,
      user,
      setUser,
      wishlist,
      toggleWishlist,
      isCityModalOpen,
      setIsCityModalOpen
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
