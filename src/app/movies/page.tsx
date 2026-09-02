'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Star, Filter, Search, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';

function MoviesContent() {
  const { city } = useApp();
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || '';

  const [activeTab, setActiveTab] = useState<'now' | 'upcoming'>('now');
  const [selectedGenre, setSelectedGenre] = useState<string>('ALL');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ALL');
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovies() {
      try {
        const res = await fetch(`/api/movies?city=${encodeURIComponent(city)}${search ? `&search=${encodeURIComponent(search)}` : ''}`);
        const data = await res.json();
        if (data.success) setMovies(data.movies);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMovies();
  }, [city, search]);

  const filteredMovies = movies.filter(m => {
    if (activeTab === 'now' && m.isUpcoming) return false;
    if (activeTab === 'upcoming' && !m.isUpcoming) return false;
    if (selectedGenre !== 'ALL' && !m.genre.includes(selectedGenre)) return false;
    if (selectedLanguage !== 'ALL' && !m.language.includes(selectedLanguage)) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#20232D] pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Movies in {city}</h1>
          <p className="text-xs text-[#A8ACB8] mt-1">Explore all currently running and upcoming movies</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center space-x-2 bg-[#171A23] p-1.5 rounded-2xl border border-[#20232D]">
          <button
            onClick={() => setActiveTab('now')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'now' ? 'bg-[#FF4D6D] text-white shadow-lg shadow-[#FF4D6D]/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Now Showing
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'upcoming' ? 'bg-[#FF4D6D] text-white shadow-lg shadow-[#FF4D6D]/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            Coming Soon
          </button>
        </div>
      </div>

      {/* Filter Options */}
      <div className="flex flex-wrap items-center gap-3 bg-[#171A23] p-4 rounded-2xl border border-[#20232D]">
        <span className="text-xs font-bold text-[#A8ACB8] flex items-center space-x-1.5 mr-2">
          <Filter className="w-4 h-4 text-[#FF4D6D]" />
          <span>Filters:</span>
        </span>

        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          className="bg-[#20232D] text-xs font-bold text-white px-3 py-2 rounded-xl border border-[#20232D] focus:outline-none focus:border-[#FF4D6D]"
        >
          <option value="ALL">All Genres</option>
          <option value="Action">Action</option>
          <option value="Sci-Fi">Sci-Fi</option>
          <option value="Drama">Drama</option>
          <option value="Thriller">Thriller</option>
          <option value="Crime">Crime</option>
        </select>

        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="bg-[#20232D] text-xs font-bold text-white px-3 py-2 rounded-xl border border-[#20232D] focus:outline-none focus:border-[#FF4D6D]"
        >
          <option value="ALL">All Languages</option>
          <option value="Telugu">Telugu</option>
          <option value="Hindi">Hindi</option>
          <option value="English">English</option>
          <option value="Tamil">Tamil</option>
        </select>
      </div>

      {/* Movies Grid */}
      {filteredMovies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredMovies.map(movie => (
            <div key={movie.id} className="group flex flex-col bg-[#20232D] rounded-2xl overflow-hidden border border-[#20232D] hover:border-[#FF4D6D]/40 transition-all duration-300 hover:-translate-y-1.5 shadow-lg">
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#171A23]">
                <img 
                  src={movie.poster} 
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-amber-400 flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>{movie.rating}</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <Link
                    href={`/movies/${movie.id}/buytickets`}
                    className="w-full py-2.5 rounded-xl bg-[#FF4D6D] text-white text-xs font-bold text-center shadow-lg shadow-[#FF4D6D]/30"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
              <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-[#FF4D6D] transition-colors">{movie.title}</h3>
                  <p className="text-[11px] text-[#A8ACB8] line-clamp-1">{movie.genre}</p>
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#A8ACB8] pt-2 border-t border-[#171A23]">
                  <span>{movie.language}</span>
                  <span className="font-semibold text-slate-300">{movie.certification}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center space-y-3 bg-[#171A23] rounded-3xl border border-[#20232D]">
          <p className="text-base font-bold text-slate-300">No movies found matching selected criteria.</p>
          <button onClick={() => { setSelectedGenre('ALL'); setSelectedLanguage('ALL'); }} className="text-xs text-[#FF4D6D] font-bold hover:underline">
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default function MoviesPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading movies page...</div>}>
      <MoviesContent />
    </Suspense>
  );
}
