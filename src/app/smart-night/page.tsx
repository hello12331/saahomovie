'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Film, Clock, MapPin, ChevronRight, Star } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function SmartNightPage() {
  const { city } = useApp();
  const [genre, setGenre] = useState('ALL');
  const [maxBudget, setMaxBudget] = useState(500);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/movies?city=${encodeURIComponent(city)}`);
      const data = await res.json();
      if (data.success) {
        let list = data.movies;
        if (genre !== 'ALL') {
          list = list.filter((m: any) => m.genre.includes(genre));
        }
        setRecommendations(list);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGenerate();
  }, [city]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="bg-gradient-to-r from-[#FF4D6D]/20 via-[#171A23] to-[#7C5CFC]/20 p-8 rounded-3xl border border-[#FF4D6D]/30 space-y-4 text-center">
        <span className="px-3 py-1 rounded-full bg-[#FF4D6D] text-white text-[10px] font-black uppercase tracking-wider inline-flex items-center space-x-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI SMART RECOMMENDATION</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Smart Night Assistant</h1>
        <p className="text-xs text-[#A8ACB8] max-w-lg mx-auto">
          "I want a movie tonight" — select your preferred mood, budget, and location to get instant showtime recommendations.
        </p>

        {/* Wizard Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 max-w-xl mx-auto">
          <div className="flex items-center space-x-2 bg-[#20232D] px-4 py-2 rounded-xl border border-[#20232D]">
            <span className="text-xs text-[#A8ACB8]">Mood / Genre:</span>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none"
            >
              <option value="ALL">Surprise Me</option>
              <option value="Action">High Action</option>
              <option value="Sci-Fi">Sci-Fi & Fantasy</option>
              <option value="Drama">Emotional Drama</option>
            </select>
          </div>

          <button
            onClick={handleGenerate}
            className="px-6 py-2.5 rounded-xl bg-[#FF4D6D] hover:bg-[#ff3358] text-white text-xs font-bold shadow-lg shadow-[#FF4D6D]/30 transition-transform active:scale-95"
          >
            Find Shows Tonight
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-white">Top Recommendations Tonight in {city}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map(m => (
            <div key={m.id} className="p-6 rounded-3xl bg-[#171A23] border border-[#20232D] flex space-x-5 hover:border-[#FF4D6D]/40 transition-colors">
              <img src={m.poster} alt={m.title} className="w-28 aspect-[2/3] rounded-2xl object-cover bg-[#20232D]" />
              <div className="space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-amber-400 font-bold text-xs flex items-center space-x-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{m.rating}</span>
                    </span>
                    <span className="text-xs text-[#A8ACB8]">• {m.certification}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">{m.title}</h3>
                  <p className="text-xs text-[#A8ACB8] line-clamp-1">{m.genre}</p>
                </div>

                <Link
                  href={`/movies/${m.id}/buytickets`}
                  className="w-full py-2.5 rounded-xl bg-[#FF4D6D] hover:bg-[#ff3358] text-white text-xs font-bold text-center shadow-lg shadow-[#FF4D6D]/20 block"
                >
                  Book Show Tonight
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
