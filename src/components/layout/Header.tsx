'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { MapPin, Search, Film, Calendar, Ticket, Tag, Sparkles, User, Shield, Menu, X, Coins, Heart, LogOut } from 'lucide-react';

const CITIES = ["Hyderabad", "Vijayawada", "Visakhapatnam", "Bengaluru", "Chennai", "Mumbai", "Pune", "Delhi", "Kolkata"];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { city, setCity, user, setUser, isCityModalOpen, setIsCityModalOpen } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0F1117]/90 backdrop-blur-md border-b border-[#20232D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF4D6D] to-[#7C5CFC] flex items-center justify-center font-black text-white text-xl shadow-lg shadow-[#FF4D6D]/30 group-hover:scale-105 transition-transform">
                  C
                </div>
                <div>
                  <span className="text-2xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-[#FF4D6D]">
                    Cine<span className="text-[#FF4D6D]">Go</span>
                  </span>
                  <span className="block text-[9px] uppercase tracking-widest text-[#A8ACB8] -mt-1 font-semibold">
                    Your Entertainment
                  </span>
                </div>
              </Link>

              {/* Location Picker Button */}
              <button
                onClick={() => setIsCityModalOpen(true)}
                className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#171A23] hover:bg-[#20232D] text-sm font-medium border border-[#20232D] transition-colors text-slate-200"
              >
                <MapPin className="w-4 h-4 text-[#FF4D6D]" />
                <span>{city}</span>
                <span className="text-xs text-[#A8ACB8]">▼</span>
              </button>
            </div>

            {/* Global Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden lg:flex flex-1 max-w-md mx-6">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8ACB8]" />
                <input
                  type="text"
                  placeholder="Search movies, events, cinemas, actors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#171A23] text-sm text-white placeholder-[#A8ACB8] pl-10 pr-4 py-2 rounded-xl border border-[#20232D] focus:outline-none focus:border-[#FF4D6D] transition-all"
                />
              </div>
            </form>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/movies" className={`text-sm font-semibold hover:text-[#FF4D6D] transition-colors ${pathname.startsWith('/movies') ? 'text-[#FF4D6D]' : 'text-slate-300'}`}>
                Movies
              </Link>
              <Link href="/events" className={`text-sm font-semibold hover:text-[#FF4D6D] transition-colors ${pathname.startsWith('/events') ? 'text-[#FF4D6D]' : 'text-slate-300'}`}>
                Events
              </Link>
              <Link href="/offers" className={`text-sm font-semibold hover:text-[#FF4D6D] transition-colors ${pathname.startsWith('/offers') ? 'text-[#FF4D6D]' : 'text-slate-300'}`}>
                Offers
              </Link>
              
              {/* Unique Smart Feature Badges */}
              <Link href="/smart-night" className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#FF4D6D]/20 to-[#7C5CFC]/20 border border-[#FF4D6D]/40 text-xs font-bold text-white hover:scale-105 transition-transform">
                <Sparkles className="w-3.5 h-3.5 text-[#FF4D6D]" />
                <span>Smart Night</span>
              </Link>
            </nav>

            {/* Right Action Menu */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-3 px-3 py-1.5 rounded-xl bg-[#171A23] border border-[#20232D] hover:border-[#FF4D6D]/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#FF4D6D] flex items-center justify-center font-bold text-white text-sm">
                      {user.name.charAt(0)}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-xs font-bold text-white">{user.name}</div>
                      <div className="text-[10px] text-[#A8ACB8] flex items-center space-x-1">
                        <Coins className="w-3 h-3 text-amber-400" />
                        <span>{user.cineCoinsBalance} Coins</span>
                      </div>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#171A23] border border-[#20232D] rounded-2xl shadow-2xl py-2 z-50">
                      <div className="px-4 py-2 border-b border-[#20232D]">
                        <p className="text-xs font-bold text-white">{user.name}</p>
                        <p className="text-[11px] text-[#A8ACB8] truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/my-bookings"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2.5 text-xs text-slate-200 hover:bg-[#20232D] hover:text-[#FF4D6D] transition-colors"
                      >
                        <Ticket className="w-4 h-4 text-[#FF4D6D]" />
                        <span>My Bookings</span>
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2.5 text-xs text-slate-200 hover:bg-[#20232D] hover:text-[#FF4D6D] transition-colors"
                      >
                        <User className="w-4 h-4 text-[#7C5CFC]" />
                        <span>Profile & Preferences</span>
                      </Link>
                      <Link
                        href="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2.5 text-xs text-amber-400 hover:bg-[#20232D] transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                      <div className="border-t border-[#20232D] mt-1 pt-1">
                        <button
                          onClick={() => {
                            setUser(null);
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-xs text-rose-400 hover:bg-[#20232D] transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setUser({ id: 'u_demo', name: 'Rahul Sharma', email: 'user@cinego.com', role: 'USER', savedCity: 'Hyderabad', cineCoinsBalance: 120 })}
                  className="px-4 py-2 rounded-xl bg-[#FF4D6D] hover:bg-[#ff3358] text-white text-xs font-bold shadow-lg shadow-[#FF4D6D]/20 transition-transform active:scale-95"
                >
                  Sign In
                </button>
              )}

              {/* Mobile Hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-slate-300 hover:text-white"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* City Selector Modal */}
      {isCityModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171A23] border border-[#20232D] rounded-3xl max-w-lg w-full p-6 space-y-6 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsCityModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-[#20232D]"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-white flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-[#FF4D6D]" />
                <span>Select Your City</span>
              </h3>
              <p className="text-xs text-[#A8ACB8]">Movies and showtimes will update based on your selected city.</p>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {CITIES.map(c => (
                <button
                  key={c}
                  onClick={() => {
                    setCity(c);
                    setIsCityModalOpen(false);
                  }}
                  className={`p-3 rounded-2xl text-xs font-bold border transition-all text-center ${
                    city === c 
                      ? 'bg-[#FF4D6D] border-[#FF4D6D] text-white shadow-lg shadow-[#FF4D6D]/30' 
                      : 'bg-[#20232D] border-[#20232D] text-slate-300 hover:border-[#FF4D6D]/50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
