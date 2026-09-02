'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, QrCode, Download, Printer, Calendar, Ticket, MapPin, Share2 } from 'lucide-react';

export default function BookingConfirmationPage({ params }: { params: { bookingId: string } }) {
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBooking() {
      try {
        const res = await fetch(`/api/bookings/${params.bookingId}`);
        const data = await res.json();
        if (data.success) {
          setBooking(data.booking);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [params.bookingId]);

  if (loading || !booking) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">Loading digital ticket...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Success Badge */}
      <div className="text-center space-y-2">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
        <h1 className="text-3xl font-black text-white">Booking Confirmed!</h1>
        <p className="text-xs text-[#A8ACB8]">Your ticket has been sent to your email and registered under My Bookings.</p>
      </div>

      {/* Digital Ticket Card */}
      <div className="bg-gradient-to-br from-[#171A23] to-[#20232D] rounded-3xl border border-[#20232D] shadow-2xl overflow-hidden">
        {/* Ticket Header Strip */}
        <div className="bg-[#FF4D6D] p-4 text-center text-white space-y-0.5">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-80">CINEGO DIGITAL PASS</p>
          <p className="text-sm font-extrabold">BOOKING CODE: {booking.bookingCode}</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-[#20232D]">
            <div className="space-y-2 text-center sm:text-left">
              <h2 className="text-2xl font-black text-white">{booking.movieTitle || booking.eventTitle}</h2>
              <p className="text-xs text-[#A8ACB8] flex items-center justify-center sm:justify-start space-x-1">
                <MapPin className="w-4 h-4 text-[#FF4D6D]" />
                <span>{booking.cinemaName || booking.eventVenue}, {booking.cinemaCity}</span>
              </p>
              <p className="text-xs text-slate-300 font-semibold">
                {booking.screenName} • {booking.format}
              </p>
            </div>

            {/* QR Code Graphic Placeholder */}
            <div className="w-28 h-28 bg-white p-2 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <QrCode className="w-full h-full text-black" />
            </div>
          </div>

          {/* Details Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[#A8ACB8] block">Date</span>
              <span className="font-bold text-white">
                {new Date(booking.startTime || booking.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[#A8ACB8] block">Time</span>
              <span className="font-bold text-white">
                {new Date(booking.startTime || booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[#A8ACB8] block">Seats ({booking.seats?.length})</span>
              <span className="font-bold text-[#FF4D6D]">
                {booking.seats?.map((s: any) => `${s.rowLabel}${s.seatNumber}`).join(', ') || 'General Admission'}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[#A8ACB8] block">Total Paid</span>
              <span className="font-bold text-emerald-400">₹{booking.totalAmount}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-6 border-t border-[#20232D]">
            <button onClick={() => window.print()} className="px-5 py-2.5 rounded-xl bg-[#20232D] hover:bg-[#2a2e3b] text-white text-xs font-bold flex items-center space-x-2">
              <Printer className="w-4 h-4 text-[#FF4D6D]" />
              <span>Print Pass</span>
            </button>
            <Link href="/my-bookings" className="px-5 py-2.5 rounded-xl bg-[#FF4D6D] hover:bg-[#ff3358] text-white text-xs font-bold flex items-center space-x-2">
              <Ticket className="w-4 h-4" />
              <span>View All Bookings</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
