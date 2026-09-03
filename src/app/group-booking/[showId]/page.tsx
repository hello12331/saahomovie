'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { Users, Share2, Copy } from 'lucide-react';

export default function GroupBookingPage({ params }: { params: Promise<{ showId: string }> }) {
  const resolvedParams = use(params);
  const showId = resolvedParams.showId;

  const shareLink = typeof window !== 'undefined' ? `${window.location.origin}/booking/seats/${showId}?group=true` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Group invitation link copied to clipboard!');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8 text-center">
      <div className="p-8 rounded-3xl bg-gradient-to-br from-[#7C5CFC]/20 via-[#171A23] to-[#20232D] border border-[#7C5CFC]/40 space-y-6">
        <Users className="w-16 h-16 text-[#7C5CFC] mx-auto" />
        <h1 className="text-3xl font-black text-white">Group Booking Sync</h1>
        <p className="text-xs text-[#A8ACB8] max-w-md mx-auto">
          Invite friends to pick their adjacent seats in real-time. Shared links synchronize seat locks across all group members.
        </p>

        <div className="p-4 rounded-2xl bg-[#20232D] flex items-center justify-between space-x-3 text-xs text-slate-300 max-w-lg mx-auto">
          <span className="truncate">{shareLink || 'https://cinego.com/group-booking/...'}</span>
          <button onClick={handleCopy} className="px-4 py-2 rounded-xl bg-[#7C5CFC] text-white font-bold flex-shrink-0">
            Copy Link
          </button>
        </div>

        <Link href={`/booking/seats/${showId}`} className="px-8 py-3.5 rounded-xl bg-[#FF4D6D] text-white font-bold text-sm inline-block shadow-lg">
          Select Seats Now
        </Link>
      </div>
    </div>
  );
}
