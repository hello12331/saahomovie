'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { 
  MapPin as MapPinIcon, 
  Search as SearchIcon, 
  ChevronDown as ChevronDownIcon, 
  X as XIcon, 
  Menu, 
  Coins, 
  User, 
  Shield, 
  Ticket, 
  LogOut, 
  Sparkles, 
  Navigation 
} from 'lucide-react';

const POPULAR_CITIES = [
  { name: "Mumbai", icon: "🏛️" },
  { name: "Delhi-NCR", icon: "🕌" },
  { name: "Bengaluru", icon: "🏢" },
  { name: "Hyderabad", icon: "🏰" },
  { name: "Chandigarh", icon: "🛣️" },
  { name: "Ahmedabad", icon: "🛕" },
  { name: "Pune", icon: "🌄" },
  { name: "Chennai", icon: "🛕" },
  { name: "Kolkata", icon: "🌉" },
  { name: "Kochi", icon: "🌴" }
];

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
      <header className="sticky top-0 z-40 bg-[#0F1117] border-b border-[#20232D]">
        {/* Top Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Brand Logo & Search Bar */}
            <div className="flex items-center space-x-6 flex-1 max-w-3xl">
              <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF4D6D] to-[#7C5CFC] flex items-center justify-center font-black text-white text-xl shadow-lg shadow-[#FF4D6D]/30">
                  C
                </div>
                <div>
                  <span className="text-2xl font-black tracking-wider text-white">
                    Cine<span className="text-[#FF4D6D]">Go</span>
                  </span>
                  <span className="block text-[8px] uppercase tracking-widest text-[#A8ACB8] -mt-1 font-bold">
                    Your Entertainment
                  </span>
                </div>
              </Link>

              {/* Global Search Bar */}
              <form onSubmit={handleSearchSubmit} className="hidden sm:flex flex-1 max-w-xl">
                <div className="relative w-full">
                  <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8ACB8]" />
                  <input
                    type="text"
                    placeholder="Search for Movies, Events, Plays, Sports and Activities"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#171A23] text-xs text-white placeholder-[#A8ACB8] pl-10 pr-4 py-2.5 rounded-xl border border-[#20232D] focus:outline-none focus:border-[#FF4D6D] transition-all"
                  />
                </div>
              </form>
            </div>

            {/* Right Actions: City & Auth */}
            <div className="flex items-center space-x-4">
              
              {/* Region Selector */}
              <button
                onClick={() => setIsCityModalOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white transition-colors"
              >
                <span>{city}</span>
                <ChevronDownIcon className="w-3.5 h-3.5 text-[#FF4D6D]" />
              </button>

              {/* Sign In / Profile */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#171A23] border border-[#20232D] hover:border-[#FF4D6D]"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#FF4D6D] text-white flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-white hidden md:inline">{user.name}</span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#171A23] border border-[#20232D] rounded-2xl shadow-2xl py-2 z-50">
                      <div className="px-4 py-2 border-b border-[#20232D]">
                        <p className="text-xs font-bold text-white">{user.name}</p>
                        <p className="text-[11px] text-[#A8ACB8] truncate">{user.email}</p>
                      </div>
                      <Link href="/my-bookings" onClick={() => setIsUserMenuOpen(false)} className="flex items-center space-x-2 px-4 py-2.5 text-xs text-slate-200 hover:bg-[#20232D] hover:text-[#FF4D6D]">
                        <Ticket className="w-4 h-4 text-[#FF4D6D]" />
                        <span>My Bookings</span>
                      </Link>
                      <Link href="/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center space-x-2 px-4 py-2.5 text-xs text-slate-200 hover:bg-[#20232D]">
                        <User className="w-4 h-4 text-[#7C5CFC]" />
                        <span>Profile</span>
                      </Link>
                      <Link href="/admin" onClick={() => setIsUserMenuOpen(false)} className="flex items-center space-x-2 px-4 py-2.5 text-xs text-amber-400 hover:bg-[#20232D]">
                        <Shield className="w-4 h-4" />
                        <span>Admin Portal</span>
                      </Link>
                      <div className="border-t border-[#20232D] mt-1 pt-1">
                        <button onClick={() => { setUser(null); setIsUserMenuOpen(false); }} className="w-full flex items-center space-x-2 px-4 py-2 text-xs text-rose-400 hover:bg-[#20232D] text-left">
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="px-4 py-1.5 rounded-lg bg-[#FF4D6D] hover:bg-[#ff3358] text-white text-xs font-bold transition-all shadow-md shadow-[#FF4D6D]/20"
                >
                  Sign in
                </Link>
              )}
            </div>

          </div>
        </div>

        {/* Sub-header Categories Navigation Strip */}
        <div className="bg-[#171A23] border-t border-[#20232D]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs font-semibold h-10 overflow-x-auto scrollbar-none">
            <div className="flex items-center space-x-6">
              <Link href="/movies" className={`hover:text-[#FF4D6D] transition-colors ${pathname.startsWith('/movies') ? 'text-[#FF4D6D] font-bold' : 'text-slate-300'}`}>
                Movies
              </Link>
              <Link href="/events" className={`hover:text-[#FF4D6D] transition-colors ${pathname.startsWith('/events') ? 'text-[#FF4D6D] font-bold' : 'text-slate-[#300]'}`}>
                Stream / Events
              </Link>
              <Link href="/events?cat=THEATRE" className="text-slate-300 hover:text-[#FF4D6D]">
                Plays
              </Link>
              <Link href="/events?cat=SPORTS" className="text-slate-300 hover:text-[#FF4D6D]">
                Sports
              </Link>
              <Link href="/smart-night" className="text-[#FF4D6D] font-bold flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Smart Night</span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-6 text-[#A8ACB8]">
              <Link href="/offers" className="hover:text-white">Offers</Link>
              <Link href="/plan-my-night" className="hover:text-white">Plan My Night</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Popular Cities Region Selector Modal */}
      {isCityModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl max-w-2xl w-full p-6 space-y-6 relative animate-in fade-in zoom-in-95 shadow-2xl">
            
            {/* Modal Header */}
            <div className="relative">
              <div className="relative w-full">
                <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search for your city"
                  className="w-full bg-slate-100 text-xs text-slate-900 placeholder-slate-400 pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#FF4D6D]"
                />
              </div>
              <button
                onClick={() => setIsCityModalOpen(false)}
                className="absolute -top-2 -right-2 p-2 text-slate-400 hover:text-slate-900"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Detect Location */}
            <button
              onClick={() => { setCity('Hyderabad'); setIsCityModalOpen(false); }}
              className="flex items-center space-x-2 text-[#FF4D6D] text-xs font-bold hover:underline"
            >
              <Navigation className="w-4 h-4" />
              <span>Detect my location</span>
            </button>

            {/* Popular Cities Grid */}
            <div className="space-y-4">
              <p className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Popular Cities</p>
              
              <div className="grid grid-cols-5 gap-4">
                {POPULAR_CITIES.map(c => (
                  <button
                    key={c.name}
                    onClick={() => {
                      setCity(c.name);
                      setIsCityModalOpen(false);
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center space-y-1.5 ${
                      city === c.name
                        ? 'border-[#FF4D6D] bg-rose-50 text-[#FF4D6D] font-bold shadow-md'
                        : 'border-slate-100 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span className="text-2xl">{c.icon}</span>
                    <span className="text-[11px] font-semibold">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center pt-2">
              <button onClick={() => setIsCityModalOpen(false)} className="text-xs text-[#FF4D6D] font-bold hover:underline">
                View All Cities
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
