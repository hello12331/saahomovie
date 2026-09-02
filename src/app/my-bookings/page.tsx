'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Ticket, Calendar, MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function UserBookingsPage() {
  const { user } = useApp();
  const [bookings, setBookings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'COMPLETED' | 'CANCELLED'>('UPCOMING');
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserBookings() {
      try {
        const res = await fetch(`/api/user/bookings?userId=${user?.id || 'u_demo'}`);
        const data = await res.json();
        if (data.success) {
          setBookings(data.bookings);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchUserBookings();
  }, [user]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking? A 15% cancellation fee applies and 85% will be refunded.")) {
      return;
    }
    setCancellingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b));
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCancellingId(null);
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'CANCELLED') return b.status === 'CANCELLED';
    if (activeTab === 'UPCOMING') return b.status === 'CONFIRMED';
    return b.status === 'COMPLETED';
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#20232D] pb-6">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center space-x-3">
            <Ticket className="w-8 h-8 text-[#FF4D6D]" />
            <span>My Bookings</span>
          </h1>
          <p className="text-xs text-[#A8ACB8] mt-1">View, download tickets, or manage refunds</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-2 bg-[#171A23] p-1.5 rounded-2xl border border-[#20232D]">
          {['UPCOMING', 'CANCELLED'].map((tab: any) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab ? 'bg-[#FF4D6D] text-white shadow-lg shadow-[#FF4D6D]/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map(b => (
            <div key={b.id} className="p-6 rounded-3xl bg-[#171A23] border border-[#20232D] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#FF4D6D]/30 transition-colors">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#FF4D6D]/20 text-[#FF4D6D] text-[10px] font-bold">
                    {b.bookingCode}
                  </span>
                  <span className="text-xs text-[#A8ACB8]">{new Date(b.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="text-xl font-bold text-white">{b.movieTitle || b.eventTitle}</h3>
                <p className="text-xs text-[#A8ACB8] flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-[#FF4D6D]" />
                  <span>{b.cinemaName || b.eventVenue}, {b.cinemaCity}</span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="text-left sm:text-right">
                  <span className="text-xs text-[#A8ACB8] block">Amount Paid</span>
                  <span className="text-lg font-black text-white">₹{b.totalAmount}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Link
                    href={`/booking/confirmation/${b.id}`}
                    className="px-4 py-2.5 rounded-xl bg-[#20232D] hover:bg-[#2a2e3b] text-white text-xs font-bold transition-colors"
                  >
                    View Pass
                  </Link>
                  {b.status === 'CONFIRMED' && (
                    <button
                      disabled={cancellingId === b.id}
                      onClick={() => handleCancelBooking(b.id)}
                      className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 text-xs font-bold border border-rose-500/30 transition-colors"
                    >
                      {cancellingId === b.id ? 'Cancelling...' : 'Cancel & Refund'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-[#171A23] rounded-3xl border border-[#20232D] space-y-2">
          <p className="text-sm font-bold text-slate-300">No {activeTab.toLowerCase()} bookings found.</p>
          <Link href="/movies" className="text-xs text-[#FF4D6D] font-bold hover:underline">
            Book movie tickets now
          </Link>
        </div>
      )}
    </div>
  );
}
