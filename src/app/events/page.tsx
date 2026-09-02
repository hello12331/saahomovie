'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Tag, ArrowRight } from 'lucide-react';

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch(`/api/meta`);
        const data = await res.json();
        if (data.success) setEvents(data.events || []);
      } catch (e) {
        console.error(e);
      }
    }
    fetchEvents();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-[#20232D] pb-6">
        <h1 className="text-3xl font-black text-white">Live Events, Concerts & Stand-up</h1>
        <p className="text-xs text-[#A8ACB8] mt-1">Book tickets for live music, IPL sports matches, and comedy shows</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(ev => (
          <div key={ev.id} className="p-6 rounded-3xl bg-[#171A23] border border-[#20232D] space-y-4 hover:border-[#7C5CFC]/40 transition-colors flex flex-col justify-between">
            <div className="space-y-3">
              <img src={ev.banner} alt={ev.title} className="w-full h-44 rounded-2xl object-cover bg-[#20232D]" />
              <span className="px-3 py-1 rounded-full bg-[#7C5CFC] text-white text-[10px] font-black uppercase tracking-wider inline-block">
                {ev.category}
              </span>
              <h3 className="text-lg font-bold text-white leading-snug">{ev.title}</h3>
              <p className="text-xs text-[#A8ACB8] flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-[#FF4D6D]" />
                <span>{ev.venue}, {ev.city}</span>
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#20232D]">
              <div>
                <span className="text-[10px] text-[#A8ACB8] block">Price</span>
                <span className="text-base font-black text-white">₹{ev.price}</span>
              </div>
              <button onClick={() => alert(`Booking started for event: ${ev.title}`)} className="px-5 py-2.5 rounded-xl bg-[#7C5CFC] text-white text-xs font-bold shadow-lg shadow-[#7C5CFC]/20">
                Book Event Pass
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
