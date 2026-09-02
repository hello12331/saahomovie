'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, ChevronRight, Play, Sparkles, Tag, MapPin, Calendar, Clock, Flame, Shield, Users, Popcorn, ChevronLeft } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function HomePage() {
  const { city, toggleWishlist, wishlist } = useApp();
  const [movies, setMovies] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [foodItems, setFoodItems] = useState<any[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [resMovies, resMeta] = await Promise.all([
          fetch(`/api/movies?city=${encodeURIComponent(city)}`),
          fetch(`/api/meta`)
        ]);
        const dataMovies = await resMovies.json();
        const dataMeta = await resMeta.json();

        if (dataMovies.success) setMovies(dataMovies.movies);
        if (dataMeta.success) {
          setEvents(dataMeta.events || []);
          setCoupons(dataMeta.coupons || []);
          setFoodItems(dataMeta.foodItems || []);
        }
      } catch (err) {
        console.error("Error fetching homepage data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [city]);

  const trendingMovies = movies.filter(m => m.isTrending);
  const upcomingMovies = movies.filter(m => m.isUpcoming);

  // Auto carousel effect
  useEffect(() => {
    if (trendingMovies.length === 0) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex(prev => (prev + 1) % trendingMovies.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [trendingMovies.length]);

  const activeBanner = trendingMovies[currentBannerIndex] || movies[0];

  return (
    <div className="space-y-12 pb-16">
      
      {/* 1. HERO CAROUSEL */}
      <section className="relative h-[480px] sm:h-[560px] w-full overflow-hidden bg-[#171A23]">
        {activeBanner ? (
          <div className="relative w-full h-full">
            {/* Background Backdrop Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-all duration-700 transform scale-105"
              style={{ backgroundImage: `url(${activeBanner.backdrop})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#0F1117] via-[#0F1117]/80 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F1117] via-transparent to-transparent" />
            </div>

            {/* Banner Content Container */}
            <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center">
              <div className="max-w-2xl space-y-4 animate-in fade-in slide-in-from-left-6 duration-500">
                <div className="flex items-center space-x-3 text-xs font-bold">
                  <span className="px-3 py-1 rounded-full bg-[#FF4D6D] text-white flex items-center space-x-1">
                    <Flame className="w-3.5 h-3.5 fill-white" />
                    <span>#1 TRENDING IN {city.toUpperCase()}</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-white">
                    {activeBanner.certification}
                  </span>
                  <span className="text-[#A8ACB8]">{activeBanner.durationMins} Mins</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md leading-tight">
                  {activeBanner.title}
                </h1>

                <div className="flex items-center space-x-4 text-xs font-medium text-slate-300">
                  <div className="flex items-center space-x-1 text-amber-400 font-bold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm">{activeBanner.rating}</span>
                    <span className="text-[#A8ACB8] text-[11px]">({activeBanner.ratingCount} votes)</span>
                  </div>
                  <span>•</span>
                  <span>{activeBanner.genre}</span>
                  <span>•</span>
                  <span>{activeBanner.language}</span>
                </div>

                <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed max-w-xl">
                  {activeBanner.description}
                </p>

                {/* Hero CTA Buttons */}
                <div className="flex items-center space-x-4 pt-2">
                  <Link
                    href={`/movies/${activeBanner.id}/buytickets`}
                    className="px-6 py-3.5 rounded-xl bg-[#FF4D6D] hover:bg-[#ff3358] text-white text-sm font-bold shadow-xl shadow-[#FF4D6D]/30 transition-transform active:scale-95 flex items-center space-x-2"
                  >
                    <span>Book Tickets Now</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href={`/movies/${activeBanner.id}`}
                    className="px-5 py-3.5 rounded-xl bg-[#20232D]/90 hover:bg-[#20232D] border border-[#20232D] text-white text-sm font-semibold transition-colors flex items-center space-x-2"
                  >
                    <Play className="w-4 h-4 text-[#FF4D6D]" />
                    <span>View Details</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Carousel Navigation Arrows */}
            {trendingMovies.length > 1 && (
              <div className="absolute bottom-6 right-8 flex items-center space-x-2">
                <button
                  onClick={() => setCurrentBannerIndex(prev => (prev - 1 + trendingMovies.length) % trendingMovies.length)}
                  className="p-2 rounded-full bg-[#20232D]/80 hover:bg-[#FF4D6D] text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentBannerIndex(prev => (prev + 1) % trendingMovies.length)}
                  className="p-2 rounded-full bg-[#20232D]/80 hover:bg-[#FF4D6D] text-white transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        ) : null}
      </section>

      {/* UNIQUE FEATURE BANNER PROMOS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Smart Night Promo */}
          <Link href="/smart-night" className="group p-6 rounded-3xl bg-gradient-to-br from-[#FF4D6D]/20 via-[#171A23] to-[#20232D] border border-[#FF4D6D]/30 hover:border-[#FF4D6D] transition-all hover:scale-[1.02] shadow-xl">
            <div className="flex items-center space-x-3 text-[#FF4D6D] mb-2 font-bold text-xs">
              <Sparkles className="w-5 h-5" />
              <span>CINEGO EXCLUSIVE</span>
            </div>
            <h3 className="text-xl font-black text-white group-hover:text-[#FF4D6D] transition-colors">Smart Night Engine</h3>
            <p className="text-xs text-[#A8ACB8] mt-1">Get instant personalized movie & show recommendations for tonight in 1-click.</p>
          </Link>

          {/* Group Booking Promo */}
          <Link href="/group-booking/show_1" className="group p-6 rounded-3xl bg-gradient-to-br from-[#7C5CFC]/20 via-[#171A23] to-[#20232D] border border-[#7C5CFC]/30 hover:border-[#7C5CFC] transition-all hover:scale-[1.02] shadow-xl">
            <div className="flex items-center space-x-3 text-[#7C5CFC] mb-2 font-bold text-xs">
              <Users className="w-5 h-5" />
              <span>GROUP SAVER</span>
            </div>
            <h3 className="text-xl font-black text-white group-hover:text-[#7C5CFC] transition-colors">Group Seat Share</h3>
            <p className="text-xs text-[#A8ACB8] mt-1">Create a group booking link so friends pick adjacent seats together.</p>
          </Link>

          {/* Plan My Night Promo */}
          <Link href="/plan-my-night" className="group p-6 rounded-3xl bg-gradient-to-br from-amber-500/20 via-[#171A23] to-[#20232D] border border-amber-500/30 hover:border-amber-500 transition-all hover:scale-[1.02] shadow-xl">
            <div className="flex items-center space-x-3 text-amber-400 mb-2 font-bold text-xs">
              <Popcorn className="w-5 h-5" />
              <span>COMBO PACKAGES</span>
            </div>
            <h3 className="text-xl font-black text-white group-hover:text-amber-400 transition-colors">Plan My Night</h3>
            <p className="text-xs text-[#A8ACB8] mt-1">Bundle Movie + Food + Event into a seamless discounted evening itinerary.</p>
          </Link>
        </div>
      </div>

      {/* 2. RECOMMENDED & TRENDING MOVIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
              <span>Trending & Recommended Movies</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FF4D6D]/20 text-[#FF4D6D] font-bold">{city}</span>
            </h2>
            <p className="text-xs text-[#A8ACB8] mt-0.5">Top picks hand-picked for movie enthusiasts in your area</p>
          </div>
          <Link href="/movies" className="text-xs font-bold text-[#FF4D6D] hover:underline flex items-center space-x-1">
            <span>View All ({movies.length})</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.slice(0, 5).map(movie => (
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
      </section>

      {/* 3. POPULAR EVENTS & CONCERTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Popular Events & Live Concerts</h2>
            <p className="text-xs text-[#A8ACB8] mt-0.5">Live music, comedy stand-ups, IPL sports and theater near you</p>
          </div>
          <Link href="/events" className="text-xs font-bold text-[#FF4D6D] hover:underline flex items-center space-x-1">
            <span>Explore Events</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <div key={event.id} className="group bg-[#20232D] rounded-3xl overflow-hidden border border-[#20232D] hover:border-[#7C5CFC]/40 transition-all hover:-translate-y-1 shadow-xl flex flex-col">
              <div className="relative h-48 w-full overflow-hidden">
                <img src={event.banner} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#7C5CFC] text-white text-[10px] font-black uppercase tracking-wider">
                  {event.category}
                </span>
              </div>
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-base group-hover:text-[#7C5CFC] transition-colors">{event.title}</h3>
                  <p className="text-xs text-[#A8ACB8] flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-[#FF4D6D]" />
                    <span>{event.venue}, {event.city}</span>
                  </p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[#171A23]">
                  <div>
                    <span className="text-[10px] text-[#A8ACB8] block">Starting From</span>
                    <span className="text-base font-black text-white">₹{event.price}</span>
                  </div>
                  <Link
                    href={`/events/${event.id}`}
                    className="px-4 py-2 rounded-xl bg-[#7C5CFC] hover:bg-[#6b47fc] text-white text-xs font-bold shadow-lg shadow-[#7C5CFC]/20"
                  >
                    Book Event
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. BEST OFFERS & PROMO CODES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
              <Tag className="w-6 h-6 text-[#FF4D6D]" />
              <span>Exclusive Offers & Promo Codes</span>
            </h2>
            <p className="text-xs text-[#A8ACB8] mt-0.5">Use code at checkout for maximum discounts</p>
          </div>
          <Link href="/offers" className="text-xs font-bold text-[#FF4D6D] hover:underline">
            View All Offers
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {coupons.map(cp => (
            <div key={cp.id} className="p-5 rounded-2xl bg-[#171A23] border border-[#20232D] space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-lg bg-[#FF4D6D]/20 border border-[#FF4D6D]/40 text-[#FF4D6D] text-xs font-black tracking-wider">
                  {cp.code}
                </span>
                <span className="text-[10px] text-[#A8ACB8]">Valid till Dec 2026</span>
              </div>
              <p className="text-xs font-bold text-white leading-snug">{cp.description}</p>
              <p className="text-[11px] text-[#A8ACB8]">Min booking: ₹{cp.minAmount}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
