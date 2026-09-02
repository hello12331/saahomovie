'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Copy, Check } from 'lucide-react';

export default function OffersPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOffers() {
      try {
        const res = await fetch(`/api/meta`);
        const data = await res.json();
        if (data.success) setCoupons(data.coupons || []);
      } catch (e) {
        console.error(e);
      }
    }
    fetchOffers();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-[#20232D] pb-6">
        <h1 className="text-3xl font-black text-white flex items-center space-x-3">
          <Tag className="w-8 h-8 text-[#FF4D6D]" />
          <span>Exclusive Offers & Discount Coupons</span>
        </h1>
        <p className="text-xs text-[#A8ACB8] mt-1">Copy coupon codes to redeem at checkout for movie & event ticket bookings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {coupons.map(cp => (
          <div key={cp.id} className="p-6 rounded-3xl bg-[#171A23] border border-[#20232D] space-y-4 hover:border-[#FF4D6D]/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="px-4 py-1.5 rounded-xl bg-[#FF4D6D]/20 border border-[#FF4D6D]/40 text-[#FF4D6D] font-black text-sm tracking-wider">
                {cp.code}
              </span>
              <button
                onClick={() => handleCopy(cp.code)}
                className="px-4 py-2 rounded-xl bg-[#20232D] hover:bg-[#FF4D6D] text-white text-xs font-bold transition-colors flex items-center space-x-1.5"
              >
                {copiedCode === cp.code ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-sm font-bold text-white leading-relaxed">{cp.description}</p>
            <div className="text-[11px] text-[#A8ACB8] flex items-center justify-between pt-2 border-t border-[#20232D]">
              <span>Min Amount: ₹{cp.minAmount}</span>
              <span>Valid till Dec 2026</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
