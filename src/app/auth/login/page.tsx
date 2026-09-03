'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, KeyRound, MapPin, User, ShieldCheck, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function AuthLoginPage() {
  const router = useRouter();
  const { setUser, city, setCity } = useApp();

  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [userLocation, setUserLocation] = useState(city || 'Hyderabad');
  
  // OTP flow state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', isError: false });

  // 1. Send OTP to Email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg({ text: '', isError: false });

    if (!email || !email.includes('@')) {
      setMsg({ text: 'Please enter a valid email address.', isError: true });
      return;
    }

    if (mode === 'SIGNUP' && !fullName.trim()) {
      setMsg({ text: 'Please enter your Full Name.', isError: true });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          purpose: mode === 'SIGNUP' ? 'SIGNUP_OTP' : 'LOGIN_OTP',
          userName: fullName.trim() || 'CineGo User'
        })
      });

      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        if (data.otpCode) setDevOtpHint(data.otpCode);
        setMsg({ text: `OTP sent successfully to ${email}. Check your email or subject line!`, isError: false });
      } else {
        setMsg({ text: data.error || 'Failed to send OTP.', isError: true });
      }
    } catch (err) {
      console.error(err);
      setMsg({ text: 'Error connecting to server. Please try again.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg({ text: '', isError: false });

    if (!otpCode || otpCode.length < 6) {
      setMsg({ text: 'Please enter the 6-digit OTP sent to your email.', isError: true });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otpCode: otpCode.trim(),
          fullName: fullName.trim(),
          location: userLocation
        })
      });

      const data = await res.json();
      if (data.success) {
        setUser({
          id: data.user.id || 'u_' + Date.now(),
          name: data.user.name || fullName || 'Movie Enthusiast',
          email: email.trim(),
          location: userLocation
        });

        if (userLocation) setCity(userLocation);

        setMsg({ text: 'Successfully authenticated! Redirecting...', isError: false });
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } else {
        setMsg({ text: data.error || 'Invalid OTP code. Please check your email.', isError: true });
      }
    } catch (err) {
      console.error(err);
      setMsg({ text: 'Verification failed. Please try again.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#171A23] rounded-3xl border border-[#20232D] shadow-2xl p-8 space-y-6 relative overflow-hidden">
        
        {/* Ambient Glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#FF4D6D]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#7C5CFC]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF4D6D] to-[#7C5CFC] flex items-center justify-center font-black text-white text-2xl mx-auto shadow-lg shadow-[#FF4D6D]/30">
            C
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide">
            {mode === 'LOGIN' ? 'Welcome Back to CineGo' : 'Create Your CineGo Account'}
          </h1>
          <p className="text-xs text-[#A8ACB8]">
            {mode === 'LOGIN' ? 'Sign in seamlessly using Email OTP (No password required)' : 'Register with Name, Email & Location to get digital ticket passes'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#20232D] p-1 rounded-2xl border border-[#20232D]">
          <button
            onClick={() => { setMode('LOGIN'); setOtpSent(false); setMsg({ text: '', isError: false }); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'LOGIN' ? 'bg-[#FF4D6D] text-white shadow-md' : 'text-[#A8ACB8] hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('SIGNUP'); setOtpSent(false); setMsg({ text: '', isError: false }); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'SIGNUP' ? 'bg-[#FF4D6D] text-white shadow-md' : 'text-[#A8ACB8] hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Status Message */}
        {msg.text && (
          <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center space-x-2.5 ${
            msg.isError ? 'bg-rose-500/15 border-rose-500/30 text-rose-400' : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
          }`}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{msg.text}</span>
          </div>
        )}

        {/* OTP Hint Box for instant testing convenience */}
        {devOtpHint && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono text-center">
            🔑 Generated 6-Digit OTP Code: <strong className="text-white text-sm underline">{devOtpHint}</strong>
          </div>
        )}

        {/* Step 1: Request OTP */}
        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            {mode === 'SIGNUP' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8ACB8]" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#20232D] text-xs text-white placeholder-[#A8ACB8] pl-10 pr-4 py-3 rounded-xl border border-[#20232D] focus:outline-none focus:border-[#FF4D6D]"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8ACB8]" />
                <input
                  type="email"
                  required
                  placeholder="e.g. yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#20232D] text-xs text-white placeholder-[#A8ACB8] pl-10 pr-4 py-3 rounded-xl border border-[#20232D] focus:outline-none focus:border-[#FF4D6D]"
                />
              </div>
            </div>

            {mode === 'SIGNUP' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Your Preferred City / Location *</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FF4D6D]" />
                  <select
                    value={userLocation}
                    onChange={(e) => setUserLocation(e.target.value)}
                    className="w-full bg-[#20232D] text-xs text-white pl-10 pr-4 py-3 rounded-xl border border-[#20232D] focus:outline-none focus:border-[#FF4D6D] appearance-none"
                  >
                    {['Hyderabad', 'Mumbai', 'Delhi-NCR', 'Bengaluru', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Kochi'].map(c => (
                      <option key={c} value={c} className="bg-[#171A23] text-white">{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#FF4D6D] hover:bg-[#ff3358] text-white font-extrabold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-[#FF4D6D]/30 transition-transform active:scale-95 disabled:opacity-50"
            >
              <span>{loading ? 'Sending OTP...' : 'Send OTP Email'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Step 2: Verify OTP */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Enter 6-Digit Email OTP *</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FF4D6D]" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="e.g. 849201"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full bg-[#20232D] text-center tracking-[8px] font-black text-lg text-[#FF4D6D] placeholder-[#A8ACB8] pl-10 pr-4 py-3 rounded-xl border border-[#FF4D6D] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#FF4D6D] hover:bg-[#ff3358] text-white font-extrabold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-[#FF4D6D]/30 transition-transform active:scale-95 disabled:opacity-50"
            >
              <span>{loading ? 'Verifying...' : 'Verify OTP & Complete'}</span>
              <ShieldCheck className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setOtpSent(false)}
              className="w-full text-center text-xs text-[#A8ACB8] hover:text-white"
            >
              ← Change Email or Name
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
