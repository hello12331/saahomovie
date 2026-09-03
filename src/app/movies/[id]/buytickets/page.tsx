'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Sparkles, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function BuyTicketsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const movieId = resolvedParams.id;

  const { city } = useApp();
  const [movie, setMovie] = useState<any>(null);
  const [shows, setShows] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  // Generate next 5 dates
  const dates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      full: d.toISOString().split('T')[0],
      dayName: i === 0 ? 'TODAY' : i === 1 ? 'TOMORROW' : d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      dayNum: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
    };
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [resM, resS] = await Promise.all([
          fetch(`/api/movies/${movieId}`),
          fetch(`/api/shows?movieId=${movieId}&city=${encodeURIComponent(city)}`)
        ]);
        const dataM = await resM.json();
        const dataS = await resS.json();

        if (dataM.success) setMovie(dataM.movie);
        if (dataS.success) setShows(dataS.shows);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [movieId, city]);

  if (loading || !movie) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">Loading showtimes...</div>;
  }

  // Group shows by cinema
  const cinemaMap = new Map();
  shows.forEach(s => {
    if (!cinemaMap.has(s.cinemaId)) {
      cinemaMap.set(s.cinemaId, {
        id: s.cinemaId,
        name: s.cinemaName,
        address: s.cinemaAddress,
        facilities: s.cinemaFacilities,
        shows: []
      });
    }
    cinemaMap.get(s.cinemaId).shows.push(s);
  });

  const cinemaList = Array.from(cinemaMap.values());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Movie Banner Strip */}
      <div className="bg-[#171A23] p-6 rounded-3xl border border-[#20232D] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-white">{movie.title}</h1>
          <p className="text-xs text-[#A8ACB8]">{movie.language} • {movie.genre} • {movie.certification} • {movie.durationMins} mins</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-[#A8ACB8]">City:</span>
          <span className="text-xs font-bold text-[#FF4D6D] px-3 py-1 rounded-lg bg-[#FF4D6D]/10 border border-[#FF4D6D]/30">{city}</span>
        </div>
      </div>

      {/* Date Picker Bar */}
      <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-none">
        {dates.map((d) => (
          <button
            key={d.full}
            onClick={() => setSelectedDate(d.full)}
            className={`flex-shrink-0 w-24 py-3 rounded-2xl border text-center transition-all ${
              selectedDate === d.full
                ? 'bg-[#FF4D6D] border-[#FF4D6D] text-white shadow-lg shadow-[#FF4D6D]/30'
                : 'bg-[#171A23] border-[#20232D] text-slate-300 hover:border-[#FF4D6D]/50'
            }`}
          >
            <div className="text-[10px] font-bold tracking-wider opacity-80">{d.dayName}</div>
            <div className="text-xl font-black my-0.5">{d.dayNum}</div>
            <div className="text-[10px] font-semibold opacity-80">{d.month}</div>
          </button>
        ))}
      </div>

      {/* Legend Bar */}
      <div className="flex flex-wrap items-center gap-6 text-xs text-[#A8ACB8] bg-[#171A23] px-6 py-3 rounded-2xl border border-[#20232D]">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          <span>Fast Filling</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-rose-500" />
          <span>Almost Full</span>
        </div>
      </div>

      {/* Cinema & Showtimes List */}
      <div className="space-y-6">
        {cinemaList.length > 0 ? (
          cinemaList.map(cinema => (
            <div key={cinema.id} className="bg-[#171A23] p-6 rounded-3xl border border-[#20232D] space-y-4 hover:border-[#FF4D6D]/30 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#20232D] pb-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-[#FF4D6D]" />
                    <span>{cinema.name}</span>
                  </h3>
                  <p className="text-xs text-[#A8ACB8]">{cinema.address}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cinema.facilities.map((fac: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-[#20232D] text-[10px] text-slate-300">
                      {fac}
                    </span>
                  ))}
                </div>
              </div>

              {/* Showtimes Grid */}
              <div className="flex flex-wrap gap-3 pt-2">
                {cinema.shows.map((show: any) => {
                  const startTimeStr = new Date(show.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <Link
                      key={show.id}
                      href={`/booking/seats/${show.id}`}
                      className="px-5 py-3 rounded-2xl bg-[#20232D] hover:bg-[#FF4D6D] border border-[#20232D] text-white transition-all group flex flex-col items-center shadow-md"
                    >
                      <span className="text-sm font-black group-hover:text-white">{startTimeStr}</span>
                      <span className="text-[10px] text-[#A8ACB8] group-hover:text-white/80 font-bold">{show.format}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="py-16 text-center bg-[#171A23] rounded-3xl border border-[#20232D] space-y-2">
            <p className="text-sm font-bold text-slate-300">No showtimes available for selected date in {city}.</p>
            <p className="text-xs text-[#A8ACB8]">Try selecting a different date or city.</p>
          </div>
        )}
      </div>
    </div>
  );
}
