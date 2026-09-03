'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Star, Filter, Search, ChevronRight, ChevronDown } from 'lucide-react';
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
      
      {/* Banner Strip */}
      <div className="w-full rounded-2xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-[#20232D] shadow-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="px-3 py-1 rounded-md bg-[#FF4D6D] text-white text-[10px] font-black uppercase tracking-wider">
            FEATURED RELEASE
          </span>
          <h2 className="text-3xl font-black text-white">The Stakes Just Got Real!</h2>
          <p className="text-xs text-slate-300">Place your bet in cinemas. Get assured cashback up to ₹100 on tickets.</p>
        </div>
        <Link href="/movies/m1/buytickets" className="px-6 py-3.5 rounded-xl bg-[#FF4D6D] hover:bg-[#ff3358] text-white text-xs font-bold shadow-lg shadow-[#FF4D6D]/30 flex-shrink-0">
          Book Tickets
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column: Sidebar Filters */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white">Filters</h2>
            <button onClick={() => { setSelectedGenre('ALL'); setSelectedLanguage('ALL'); }} className="text-xs text-[#FF4D6D] font-bold hover:underline">
              Clear All
            </button>
          </div>

          {/* Languages Accordion Box */}
          <div className="bg-[#171A23] p-5 rounded-2xl border border-[#20232D] space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span>Languages</span>
              <span className="text-[#FF4D6D] text-[10px]">Clear</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {['Telugu', 'Hindi', 'English', 'Tamil'].map(lang => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(selectedLanguage === lang ? 'ALL' : lang)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    selectedLanguage === lang
                      ? 'bg-[#FF4D6D]/20 border-[#FF4D6D] text-[#FF4D6D]'
                      : 'bg-[#20232D] border-[#20232D] text-slate-300 hover:border-[#FF4D6D]/40'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Genres Accordion Box */}
          <div className="bg-[#171A23] p-5 rounded-2xl border border-[#20232D] space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span>Genres</span>
              <span className="text-[#FF4D6D] text-[10px]">Clear</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {['Action', 'Sci-Fi', 'Drama', 'Thriller', 'Crime'].map(g => (
                <button
                  key={g}
                  onClick={() => setSelectedGenre(selectedGenre === g ? 'ALL' : g)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    selectedGenre === g
                      ? 'bg-[#FF4D6D]/20 border-[#FF4D6D] text-[#FF4D6D]'
                      : 'bg-[#20232D] border-[#20232D] text-slate-300 hover:border-[#FF4D6D]/40'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <Link href="/movies" className="w-full py-3 rounded-xl border border-[#FF4D6D] text-[#FF4D6D] text-xs font-bold text-center block hover:bg-[#FF4D6D] hover:text-white transition-colors">
            Browse by Cinemas
          </Link>
        </div>

        {/* Right Column: Movies Grid & Coming Soon Header */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-white">Movies In {city}</h1>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-[#FF4D6D] px-3 py-1 rounded-full bg-[#FF4D6D]/20 border border-[#FF4D6D]/40">
                {selectedLanguage !== 'ALL' ? selectedLanguage : 'All Languages'}
              </span>
            </div>
          </div>

          {/* Coming Soon Carousel Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#171A23] to-[#20232D] border border-[#20232D] flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Coming Soon</h3>
              <p className="text-xs text-[#A8ACB8]">Explore upcoming releases in {city}</p>
            </div>
            <button onClick={() => setActiveTab('upcoming')} className="text-xs font-bold text-[#FF4D6D] hover:underline flex items-center space-x-1">
              <span>Explore Upcoming Movies</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Movies Cards Grid */}
          {filteredMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {filteredMovies.map(movie => (
                <div key={movie.id} className="group flex flex-col bg-[#20232D] rounded-2xl overflow-hidden border border-[#20232D] hover:border-[#FF4D6D]/40 transition-all duration-300 hover:-translate-y-1.5 shadow-lg">
                  <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#171A23]">
                    <img 
                      src={movie.poster} 
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded-lg bg-black/80 backdrop-blur-md text-[10px] font-bold text-amber-400 flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{movie.rating} / 5</span>
                      </div>
                      <span className="text-white text-[9px]">{movie.ratingCount || '10K+'} Likes</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <Link
                        href={`/movies/${movie.id}/buytickets`}
                        className="w-full py-2.5 rounded-xl bg-[#FF4D6D] text-white text-xs font-bold text-center shadow-lg shadow-[#FF4D6D]/30"
                      >
                        Book Tickets
                      </Link>
                    </div>
                  </div>
                  <div className="p-4 space-y-1 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-[#FF4D6D] transition-colors">{movie.title}</h3>
                      <p className="text-[11px] text-[#A8ACB8]">{movie.certification || 'UA16+'}</p>
                    </div>
                    <p className="text-[11px] text-[#A8ACB8] truncate">{movie.language}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center space-y-3 bg-[#171A23] rounded-3xl border border-[#20232D]">
              <p className="text-base font-bold text-slate-300">No movies found matching filters.</p>
              <button onClick={() => { setSelectedGenre('ALL'); setSelectedLanguage('ALL'); }} className="text-xs text-[#FF4D6D] font-bold hover:underline">
                Reset Filters
              </button>
            </div>
          )}
        </div>

      </div>
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
