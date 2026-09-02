'use client';

import React from 'react';
import Link from 'next/link';
import { Popcorn, Sparkles, Check } from 'lucide-react';

export default function PlanMyNightPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-500/20 via-[#171A23] to-[#20232D] border border-amber-500/40 text-center space-y-4">
        <Popcorn className="w-16 h-16 text-amber-400 mx-auto" />
        <h1 className="text-3xl font-black text-white">Plan My Night Package</h1>
        <p className="text-xs text-[#A8ACB8] max-w-md mx-auto">
          Get a 15% discount when bundling Movie Tickets + Gourmet Popcorn Combos + After-show Live Comedy/Concert tickets!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-6">
          <div className="p-5 rounded-2xl bg-[#20232D] space-y-2 border border-[#20232D]">
            <span className="text-xs font-bold text-[#FF4D6D]">STEP 1</span>
            <h3 className="text-sm font-bold text-white">Select Blockbuster Movie</h3>
            <p className="text-[11px] text-[#A8ACB8]">Kalki 2898 AD (IMAX 3D)</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#20232D] space-y-2 border border-[#20232D]">
            <span className="text-xs font-bold text-amber-400">STEP 2</span>
            <h3 className="text-sm font-bold text-white">Add Snack Combo</h3>
            <p className="text-[11px] text-[#A8ACB8]">Large Caramel Popcorn + Drinks</p>
          </div>
          <div className="p-5 rounded-2xl bg-[#20232D] space-y-2 border border-[#20232D]">
            <span className="text-xs font-bold text-[#7C5CFC]">STEP 3</span>
            <h3 className="text-sm font-bold text-white">After-Show Stand-up</h3>
            <p className="text-[11px] text-[#A8ACB8]">Zakir Khan Comedy Pass</p>
          </div>
        </div>

        <div className="pt-6">
          <Link href="/movies" className="px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-sm shadow-xl inline-block">
            Start Evening Package Builder
          </Link>
        </div>
      </div>
    </div>
  );
}
