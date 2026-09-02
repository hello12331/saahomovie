'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Play, Share2, Heart, Clock, Calendar, Shield, X } from 'lucide-react';
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
      {/* Backdrop Header */}
      <div className="relative h-[420px] w-full bg-[#171A23] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center filter blur-sm scale-105 opacity-40"
          style={{ backgroundImage: `url(${movie.backdrop})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1117] via-[#0F1117]/70 to-transparent" />

        {/* Content Box */}
        <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-end pb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-8 w-full">
            {/* Poster */}
            <div className="w-40 sm:w-52 aspect-[2/3] rounded-2xl overflow-hidden border-2 border-[#FF4D6D] shadow-2xl flex-shrink-0 -mb-6 bg-[#20232D]">
              <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
            </div>

            {/* Main Info */}
            <div className="space-y-3 flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start space-x-3 text-xs font-bold">
                <span className="px-2.5 py-1 rounded-md bg-[#FF4D6D] text-white">
                  {movie.certification}
                </span>
                <span className="text-amber-400 font-bold flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{movie.rating} / 5</span>
                </span>
                <span className="text-[#A8ACB8]">• {movie.durationMins} mins</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white">{movie.title}</h1>
              <p className="text-xs text-slate-300 font-medium">{movie.genre} • {movie.language}</p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2">
                <Link
                  href={`/movies/${movie.id}/buytickets`}
                  className="px-8 py-3.5 rounded-xl bg-[#FF4D6D] hover:bg-[#ff3358] text-white font-bold text-sm shadow-xl shadow-[#FF4D6D]/30 transition-transform active:scale-95"
                >
                  Book Tickets
                </Link>

                <button
                  onClick={() => setIsTrailerOpen(true)}
                  className="px-5 py-3.5 rounded-xl bg-[#20232D] hover:bg-[#2a2e3b] text-white font-semibold text-sm border border-[#20232D] flex items-center space-x-2"
                >
                  <Play className="w-4 h-4 text-[#FF4D6D]" />
                  <span>Watch Trailer</span>
                </button>

                <button
                  onClick={() => toggleWishlist(movie.id)}
                  className={`p-3.5 rounded-xl border transition-colors ${
                    isSaved ? 'bg-rose-500/20 border-rose-500 text-rose-500' : 'bg-[#20232D] border-[#20232D] text-slate-400 hover:text-white'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isSaved ? 'fill-rose-500' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Synopsis, Cast, Crew */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[#171A23] p-6 rounded-3xl border border-[#20232D] space-y-3">
            <h3 className="text-lg font-bold text-white">About the Movie</h3>
            <p className="text-sm text-[#A8ACB8] leading-relaxed">{movie.description}</p>
          </div>

          {/* Cast */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Cast</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {movie.cast.map((actor: string, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#171A23] border border-[#20232D] text-center space-y-1">
                  <div className="w-12 h-12 rounded-full bg-[#FF4D6D]/20 text-[#FF4D6D] mx-auto flex items-center justify-center font-bold text-sm">
                    {actor.charAt(0)}
                  </div>
                  <p className="text-xs font-bold text-white truncate">{actor}</p>
                  <p className="text-[10px] text-[#A8ACB8]">Actor</p>
                </div>
              ))}
            </div>
          </div>

          {/* User Reviews */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Audience Reviews</h3>
            <div className="space-y-3">
              {reviews.length > 0 ? reviews.map((r: any) => (
                <div key={r.id} className="p-4 rounded-2xl bg-[#171A23] border border-[#20232D] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{r.userName}</span>
                    <div className="flex items-center space-x-1 text-amber-400 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{r.rating}/5</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#A8ACB8]">{r.comment}</p>
                </div>
              )) : (
                <p className="text-xs text-[#A8ACB8]">No user reviews yet. Be the first to review after watching!</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Quick Booking Widget */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#171A23] border border-[#20232D] space-y-6 sticky top-28">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Book Tickets in {city}</h3>
              <p className="text-xs text-[#A8ACB8]">Choose date & showtimes</p>
            </div>
            
            <Link
              href={`/movies/${movie.id}/buytickets`}
              className="w-full py-4 rounded-2xl bg-[#FF4D6D] hover:bg-[#ff3358] text-white font-extrabold text-sm text-center block shadow-lg shadow-[#FF4D6D]/30 transition-transform active:scale-95"
            >
              Select Showtimes & Cinemas
            </Link>

            <div className="space-y-3 pt-4 border-t border-[#20232D] text-xs text-[#A8ACB8]">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-[#FF4D6D]" />
                <span>100% Instant QR Ticket Confirmation</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-[#7C5CFC]" />
                <span>Easy 1-click Cancellation & Refund</span>
              </div>
            </div>
          </div>
        </div>
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
