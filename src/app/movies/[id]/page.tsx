'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Play, Share2, Heart, Clock, Calendar, Shield, X, ThumbsUp } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function MovieDetailsPage({ params }: { params: { id: string } }) {
  const { city, toggleWishlist, wishlist } = useApp();
  const [movie, setMovie] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovieDetails() {
      try {
        const res = await fetch(`/api/movies/${params.id}`);
        const data = await res.json();
        if (data.success) {
          setMovie(data.movie);
          setReviews(data.reviews || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMovieDetails();
  }, [params.id]);

  if (loading || !movie) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">Loading movie details...</div>;
  }

  const isSaved = wishlist.includes(movie.id);

  return (
    <div className="space-y-12 pb-16">
      
      {/* Movie Details Backdrop Hero Header (matching Screenshot 5) */}
      <div className="relative min-h-[460px] w-full bg-[#0F1117] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center filter blur-md scale-110 opacity-30"
          style={{ backgroundImage: `url(${movie.backdrop || movie.poster})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F1117] via-[#0F1117]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1117] via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 py-10 flex items-center">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 w-full">
            
            {/* Poster with In Cinemas & Trailers Badge */}
            <div className="relative w-48 sm:w-64 aspect-[2/3] rounded-3xl overflow-hidden border-2 border-[#20232D] shadow-2xl flex-shrink-0 bg-[#20232D]">
              <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
              <button
                onClick={() => setIsTrailerOpen(true)}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-bold flex items-center space-x-1.5 hover:bg-[#FF4D6D] transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Trailers ({movie.trailerCount || 4})</span>
              </button>
              <div className="absolute bottom-0 inset-x-0 bg-black/90 py-1 text-center text-[10px] font-bold text-slate-300">
                In cinemas
              </div>
            </div>

            {/* Main Info Stack */}
            <div className="space-y-6 flex-1 text-center md:text-left">
              <div className="space-y-2">
                <div className="flex items-center justify-center md:justify-between">
                  <h1 className="text-3xl sm:text-5xl font-black text-white">{movie.title}</h1>
                  <button className="hidden md:flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#20232D] text-slate-300 hover:text-white text-xs font-bold">
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Likes & Rating Widget Box (Matching Screenshot 5) */}
              <div className="p-4 rounded-2xl bg-[#171A23] border border-[#20232D] max-w-lg flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <ThumbsUp className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black text-white">72.4K+ are interested</p>
                    <p className="text-[10px] text-[#A8ACB8]">Rating will appear once reviews come in.</p>
                  </div>
                </div>

                <button className="px-4 py-2 rounded-xl bg-[#20232D] hover:bg-[#2a2e3b] text-white text-xs font-bold flex-shrink-0">
                  Rate now
                </button>
              </div>

              {/* Duration, Genre, Release Date Tags */}
              <div className="space-y-2 text-xs font-medium text-slate-300">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <span className="font-bold text-white">{movie.durationMins}m</span>
                  <span>•</span>
                  <span>{movie.genre}</span>
                  <span>•</span>
                  <span className="px-2 py-0.5 rounded bg-[#20232D] text-slate-300 font-bold">{movie.certification || 'UA16+'}</span>
                  <span>•</span>
                  <span>3 Sep, 2026</span>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                  <span className="px-3 py-1 rounded-lg bg-[#20232D] text-[11px] font-bold text-white">2D, DOLBY CINEMA 2D, EPIQ</span>
                  <span className="px-3 py-1 rounded-lg bg-[#20232D] text-[11px] font-bold text-white">{movie.language}</span>
                </div>
              </div>

              {/* Book Tickets CTA Button */}
              <div className="pt-2">
                <Link
                  href={`/movies/${movie.id}/buytickets`}
                  className="px-10 py-4 rounded-2xl bg-[#FF4D6D] hover:bg-[#ff3358] text-white font-black text-base shadow-xl shadow-[#FF4D6D]/30 transition-transform active:scale-95 inline-block"
                >
                  Book tickets
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* About the movie Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <h2 className="text-2xl font-black text-white border-b border-[#20232D] pb-3">About the movie</h2>
        <p className="text-sm text-[#A8ACB8] leading-relaxed max-w-3xl">{movie.description}</p>
      </div>

      {/* Trailer Modal */}
      {isTrailerOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setIsTrailerOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <iframe
              src={movie.trailerUrl}
              title={`${movie.title} Trailer`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
