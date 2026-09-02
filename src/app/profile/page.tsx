'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { User, Mail, Phone, MapPin, Coins, Heart, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { user, setUser, city, wishlist } = useApp();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('9876543210');
  const [pref, setPref] = useState('CENTER');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({
      ...user!,
      name,
      email,
      seatPreference: pref
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-[#20232D] pb-6">
        <h1 className="text-3xl font-black text-white flex items-center space-x-3">
          <User className="w-8 h-8 text-[#7C5CFC]" />
          <span>User Profile & Preferences</span>
        </h1>
        <p className="text-xs text-[#A8ACB8] mt-1">Manage personal details, seating preferences, and CineCoins rewards</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* User Balance Card */}
        <div className="p-6 rounded-3xl bg-[#171A23] border border-[#20232D] space-y-4 text-center">
          <div className="w-20 h-20 rounded-full bg-[#7C5CFC]/20 text-[#7C5CFC] mx-auto flex items-center justify-center font-black text-2xl border-2 border-[#7C5CFC]">
            {user?.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{user?.name}</h3>
            <p className="text-xs text-[#A8ACB8]">{user?.email}</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#20232D] space-y-1">
            <span className="text-[10px] text-[#A8ACB8] font-bold uppercase">CineCoins Balance</span>
            <div className="flex items-center justify-center space-x-2 text-xl font-black text-amber-400">
              <Coins className="w-5 h-5" />
              <span>{user?.cineCoinsBalance || 0} Coins</span>
            </div>
          </div>
        </div>

        {/* Edit Details Form */}
        <div className="md:col-span-2 p-6 rounded-3xl bg-[#171A23] border border-[#20232D] space-y-6">
          <h3 className="text-base font-bold text-white">Personal Information</h3>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-xs text-[#A8ACB8] font-bold block mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#20232D] text-xs text-white p-3 rounded-xl border border-[#20232D] focus:outline-none focus:border-[#FF4D6D]"
              />
            </div>

            <div>
              <label className="text-xs text-[#A8ACB8] font-bold block mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#20232D] text-xs text-white p-3 rounded-xl border border-[#20232D] focus:outline-none focus:border-[#FF4D6D]"
              />
            </div>

            <div>
              <label className="text-xs text-[#A8ACB8] font-bold block mb-1">Seat Preference</label>
              <select
                value={pref}
                onChange={(e) => setPref(e.target.value)}
                className="w-full bg-[#20232D] text-xs text-white p-3 rounded-xl border border-[#20232D] focus:outline-none focus:border-[#FF4D6D]"
              >
                <option value="CENTER">Center Seats</option>
                <option value="BACK">Back Rows</option>
                <option value="VIP">VIP Recliners</option>
              </select>
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#FF4D6D] hover:bg-[#ff3358] text-white text-xs font-bold shadow-lg shadow-[#FF4D6D]/30 transition-transform active:scale-95"
            >
              Save Profile Changes
            </button>

            {saved && (
              <span className="text-xs text-emerald-400 font-bold ml-3">
                Saved successfully!
              </span>
            )}
          </form>
        </div>

      </div>
    </div>
  );
}
