'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, KeyRound, ArrowRight, ShieldCheck, RefreshCw, CheckCircle2, Lock } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function AuthPage() {
  const router = useRouter();
  const { setUser } = useApp();

  const [mode, setMode] = useState<'LOGIN_PASSWORD' | 'LOGIN_OTP' | 'SIGNUP'>('LOGIN_OTP');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  
  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', isError: false });

  // Countdown timer effect for Resend OTP
  useEffect(() => {
    if (!otpSent || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [otpSent, countdown]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      setMsg({ text: 'Please enter a valid email address.', isError: true });
      return;
    }

    setLoading(true);
    setMsg({ text: '', isError: false });

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, userName: name || email.split('@')[0], purpose: 'LOGIN' })
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setCountdown(30);
        setMsg({ text: `6-Digit OTP sent to ${email}!`, isError: false });
      } else {
        setMsg({ text: data.error, isError: true });
      }
    } catch (err: any) {
      setMsg({ text: 'Failed to send OTP. Please try again.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setMsg({ text: 'Please enter the 6-digit OTP sent to your email.', isError: true });
      return;
    }

    setLoading(true);
    setMsg({ text: '', isError: false });

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otpCode, purpose: 'LOGIN' })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setMsg({ text: '✓ Email Verified & Signed In!', isError: false });
        setTimeout(() => router.push('/'), 1000);
      } else {
        setMsg({ text: data.error, isError: true });
      }
    } catch (err: any) {
      setMsg({ text: 'Verification failed. Please check the code.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-[#171A23] border border-[#20232D] p-8 rounded-3xl space-y-6 shadow-2xl">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-[#FF4D6D] text-white flex items-center justify-center mx-auto font-black text-xl shadow-lg shadow-[#FF4D6D]/30 mb-3">
            C
          </div>
          <h1 className="text-2xl font-black text-white">Welcome to CineGo</h1>
          <p className="text-xs text-[#A8ACB8]">Sign in to access your digital tickets and CineCoins</p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-[#20232D] p-1 rounded-xl text-xs font-bold text-slate-400">
          <button
            onClick={() => { setMode('LOGIN_OTP'); setOtpSent(false); setMsg({ text: '', isError: false }); }}
            className={`flex-1 py-2 rounded-lg transition-colors ${mode === 'LOGIN_OTP' ? 'bg-[#FF4D6D] text-white' : ''}`}
          >
            Email OTP
          </button>
          <button
            onClick={() => { setMode('LOGIN_PASSWORD'); setMsg({ text: '', isError: false }); }}
            className={`flex-1 py-2 rounded-lg transition-colors ${mode === 'LOGIN_PASSWORD' ? 'bg-[#FF4D6D] text-white' : ''}`}
          >
            Password
          </button>
        </div>

        {msg.text && (
          <div className={`p-3 rounded-xl text-xs font-bold text-center ${msg.isError ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
            {msg.text}
          </div>
        )}

        {/* MODE: EMAIL OTP */}
        {mode === 'LOGIN_OTP' && (
          <div>
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="text-xs text-[#A8ACB8] font-bold block mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8ACB8]" />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#20232D] text-xs text-white placeholder-[#A8ACB8] pl-10 pr-4 py-3 rounded-xl border border-[#20232D] focus:outline-none focus:border-[#FF4D6D]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-[#FF4D6D] hover:bg-[#ff3358] text-white text-xs font-bold shadow-lg shadow-[#FF4D6D]/30 transition-transform active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Sending OTP Email...' : 'Send OTP Email'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-center space-y-1">
                  <span className="text-xs text-slate-300">Enter the 6-digit code sent to:</span>
                  <p className="text-xs font-bold text-[#FF4D6D]">{email}</p>
                </div>

                <div>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="Enter 6-digit OTP"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full bg-[#20232D] text-center text-xl tracking-widest font-black text-white p-3 rounded-xl border border-[#FF4D6D] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-[#FF4D6D] hover:bg-[#ff3358] text-white text-xs font-bold shadow-lg shadow-[#FF4D6D]/30 transition-transform active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Verifying OTP...' : 'Verify OTP & Sign In'}
                </button>

                <div className="text-center pt-2">
                  {countdown > 0 ? (
                    <span className="text-xs text-[#A8ACB8]">Resend OTP in {countdown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      className="text-xs font-bold text-[#7C5CFC] hover:underline"
                    >
                      Resend OTP Now
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        )}

        {/* MODE: PASSWORD */}
        {mode === 'LOGIN_PASSWORD' && (
          <form onSubmit={(e) => { e.preventDefault(); setUser({ id: 'u_demo', name: 'Rahul Sharma', email, role: 'USER', savedCity: 'Hyderabad', cineCoinsBalance: 120 }); router.push('/'); }} className="space-y-4">
            <div>
              <label className="text-xs text-[#A8ACB8] font-bold block mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#20232D] text-xs text-white p-3 rounded-xl border border-[#20232D] focus:outline-none focus:border-[#FF4D6D]"
              />
            </div>
            <div>
              <label className="text-xs text-[#A8ACB8] font-bold block mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#20232D] text-xs text-white p-3 rounded-xl border border-[#20232D] focus:outline-none focus:border-[#FF4D6D]"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#FF4D6D] hover:bg-[#ff3358] text-white text-xs font-bold shadow-lg shadow-[#FF4D6D]/30 transition-transform active:scale-95"
            >
              Sign In with Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
