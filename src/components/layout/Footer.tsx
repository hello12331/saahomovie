'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#171A23] border-t border-[#20232D] pt-12 pb-8 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#FF4D6D] to-[#7C5CFC] flex items-center justify-center font-black text-white text-lg">
                C
              </div>
              <span className="text-xl font-extrabold text-white">Cine<span className="text-[#FF4D6D]">Go</span></span>
            </div>
            <p className="text-xs text-[#A8ACB8] leading-relaxed max-w-sm">
              CineGo is your all-in-one entertainment destination for movie tickets, live concerts, sports events, comedy shows, and cinema dining.
            </p>
            <p className="text-[11px] text-[#A8ACB8]">
              © 2026 CineGo Platform. All rights reserved. Designed for premium experience.
            </p>
          </div>

          {/* Movies Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Movies</h4>
            <ul className="space-y-2">
              <li><Link href="/movies?tab=now" className="hover:text-white transition-colors">Now Showing</Link></li>
              <li><Link href="/movies?tab=upcoming" className="hover:text-white transition-colors">Coming Soon</Link></li>
              <li><Link href="/movies?genre=Action" className="hover:text-white transition-colors">Action Blockbusters</Link></li>
              <li><Link href="/movies?genre=Sci-Fi" className="hover:text-white transition-colors">Sci-Fi & IMAX</Link></li>
              <li><Link href="/smart-night" className="text-[#FF4D6D] font-bold hover:underline">⚡ Smart Night Recommendation</Link></li>
            </ul>
          </div>

          {/* Events Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Events & Sports</h4>
            <ul className="space-y-2">
              <li><Link href="/events?cat=CONCERT" className="hover:text-white transition-colors">Live Concerts</Link></li>
              <li><Link href="/events?cat=COMEDY" className="hover:text-white transition-colors">Stand-Up Comedy</Link></li>
              <li><Link href="/sports" className="hover:text-white transition-colors">IPL & Cricket Matches</Link></li>
              <li><Link href="/plan-my-night" className="text-[#7C5CFC] font-bold hover:underline">🍿 Plan My Night Package</Link></li>
            </ul>
          </div>

          {/* Help & Support */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Support & Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/my-bookings" className="hover:text-white transition-colors">My Bookings</Link></li>
              <li><Link href="/offers" className="hover:text-white transition-colors">Best Offers & Coupons</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
