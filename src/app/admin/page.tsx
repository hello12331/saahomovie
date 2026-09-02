'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Film, Building2, Calendar, Users, DollarSign, Plus, Trash2, Edit } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function AdminDashboardPage() {
  const { user } = useApp();
  const [stats, setStats] = useState<any>(null);
  const [movies, setMovies] = useState<any[]>([]);
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'MOVIES' | 'CINEMAS'>('OVERVIEW');
  const [loading, setLoading] = useState(true);

  // New Movie Form Modal State
  const [isAddMovieModalOpen, setIsAddMovieModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newGenre, setNewGenre] = useState('');
  const [newLanguage, setNewLanguage] = useState('');

  useEffect(() => {
    async function fetchAdminData() {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
          setMovies(data.movies);
          setCinemas(data.cinemas);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchAdminData();
  }, []);

  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE',
          title: newTitle,
          genre: newGenre,
          language: newLanguage,
          durationMins: 150,
          certification: 'U/A'
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Movie added successfully!");
        setIsAddMovieModalOpen(false);
        setNewTitle('');
        setNewGenre('');
        setNewLanguage('');
        // Refresh list
        const resStats = await fetch('/api/admin/stats');
        const dataStats = await resStats.json();
        if (dataStats.success) setMovies(dataStats.movies);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMovie = async (id: string) => {
    if (!confirm("Are you sure you want to delete this movie?")) return;
    try {
      const res = await fetch('/api/admin/movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE', id })
      });
      const data = await res.json();
      if (data.success) {
        setMovies(prev => prev.filter(m => m.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">Loading admin management console...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#20232D] pb-6">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center space-x-3">
            <Shield className="w-8 h-8 text-amber-400" />
            <span>CineGo Admin Portal</span>
          </h1>
          <p className="text-xs text-[#A8ACB8] mt-1">Full-stack platform control, show scheduling, movies & analytics</p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center space-x-2 bg-[#171A23] p-1.5 rounded-2xl border border-[#20232D]">
          {['OVERVIEW', 'MOVIES', 'CINEMAS'].map((tab: any) => (
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

      {/* OVERVIEW TAB */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-8">
          {/* Analytics Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-[#171A23] border border-[#20232D] space-y-2">
              <span className="text-xs text-[#A8ACB8] block">Total Platform Revenue</span>
              <p className="text-3xl font-black text-emerald-400">₹{stats?.revenue || 0}</p>
            </div>
            <div className="p-6 rounded-3xl bg-[#171A23] border border-[#20232D] space-y-2">
              <span className="text-xs text-[#A8ACB8] block">Total Bookings</span>
              <p className="text-3xl font-black text-white">{stats?.totalBookings || 0}</p>
            </div>
            <div className="p-6 rounded-3xl bg-[#171A23] border border-[#20232D] space-y-2">
              <span className="text-xs text-[#A8ACB8] block">Active Movies</span>
              <p className="text-3xl font-black text-[#FF4D6D]">{stats?.activeMovies || 0}</p>
            </div>
            <div className="p-6 rounded-3xl bg-[#171A23] border border-[#20232D] space-y-2">
              <span className="text-xs text-[#A8ACB8] block">Screen Occupancy Rate</span>
              <p className="text-3xl font-black text-[#7C5CFC]">{stats?.occupancyRate || '78.4%'}</p>
            </div>
          </div>
        </div>
      )}

      {/* MOVIES MANAGEMENT TAB */}
      {activeTab === 'MOVIES' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Movie Catalogue</h2>
            <button
              onClick={() => setIsAddMovieModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#FF4D6D] hover:bg-[#ff3358] text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-[#FF4D6D]/30"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Movie</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {movies.map(m => (
              <div key={m.id} className="p-5 rounded-3xl bg-[#171A23] border border-[#20232D] flex space-x-4 items-center justify-between">
                <img src={m.poster} alt={m.title} className="w-16 h-20 rounded-xl object-cover bg-[#20232D]" />
                <div className="space-y-1 flex-1 px-2">
                  <h3 className="text-sm font-bold text-white leading-tight">{m.title}</h3>
                  <p className="text-[11px] text-[#A8ACB8]">{m.language} • {m.certification}</p>
                </div>
                <button
                  onClick={() => handleDeleteMovie(m.id)}
                  className="p-2 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500/40"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Movie Modal */}
      {isAddMovieModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form onSubmit={handleAddMovie} className="bg-[#171A23] border border-[#20232D] p-6 rounded-3xl max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white">Add New Movie</h3>
            
            <input
              type="text"
              placeholder="Movie Title"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-[#20232D] text-xs text-white p-3 rounded-xl border border-[#20232D] focus:outline-none focus:border-[#FF4D6D]"
            />
            
            <input
              type="text"
              placeholder="Genre (e.g. Action, Drama)"
              required
              value={newGenre}
              onChange={(e) => setNewGenre(e.target.value)}
              className="w-full bg-[#20232D] text-xs text-white p-3 rounded-xl border border-[#20232D] focus:outline-none focus:border-[#FF4D6D]"
            />

            <input
              type="text"
              placeholder="Language (e.g. Telugu, English)"
              required
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              className="w-full bg-[#20232D] text-xs text-white p-3 rounded-xl border border-[#20232D] focus:outline-none focus:border-[#FF4D6D]"
            />

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAddMovieModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#20232D] text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#FF4D6D] text-white text-xs font-bold"
              >
                Save Movie
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
