'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Shield, Sparkles, AlertCircle, ChevronRight, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function SeatSelectionPage({ params }: { params: Promise<{ showId: string }> }) {
  const resolvedParams = use(params);
  const showId = resolvedParams.showId;

  const router = useRouter();
  const { user } = useApp();
  
  const [show, setShow] = useState<any>(null);
  const [seats, setSeats] = useState<any[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [timerSeconds, setTimerSeconds] = useState<number>(300); // 5 min lock timer
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function fetchSeats() {
      try {
        const res = await fetch(`/api/shows/${showId}/seats`);
        const data = await res.json();
        if (data.success) {
          setShow(data.show);
          setSeats(data.seats);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSeats();
  }, [showId]);

  // Countdown timer effect
  useEffect(() => {
    if (selectedSeatIds.length === 0) return;
    const interval = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setSelectedSeatIds([]);
          alert('Seat lock expired! Please re-select your seats.');
          return 300;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedSeatIds.length]);

  if (loading || !show) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">Loading interactive seat layout...</div>;
  }

  // Group seats by row
  const rowsMap = new Map();
  seats.forEach(s => {
    if (!rowsMap.has(s.rowLabel)) rowsMap.set(s.rowLabel, []);
    rowsMap.get(s.rowLabel).push(s);
  });
  const rowLabels = Array.from(rowsMap.keys()).sort();

  const handleSeatClick = async (seat: any) => {
    if (seat.status === 'BOOKED' || (seat.status === 'LOCKED' && seat.lockedBy !== user?.id)) {
      return;
    }

    const isSelected = selectedSeatIds.includes(seat.id);
    let newSelected = isSelected
      ? selectedSeatIds.filter(id => id !== seat.id)
      : [...selectedSeatIds, seat.id];

    if (newSelected.length > 10) {
      setErrorMsg('You can select a maximum of 10 seats per booking.');
      return;
    }

    setErrorMsg('');
    setSelectedSeatIds(newSelected);

    // Call API to lock seats temporarily
    try {
      if (!isSelected) {
        const res = await fetch(`/api/shows/${showId}/seats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seatIds: [seat.id], userId: user?.id || 'u_demo', action: 'LOCK' })
        });
        const resData = await res.json();
        if (!resData.success) {
          setErrorMsg(resData.error);
          setSelectedSeatIds(prev => prev.filter(id => id !== seat.id));
        }
      } else {
        await fetch(`/api/shows/${showId}/seats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seatIds: [seat.id], userId: user?.id || 'u_demo', action: 'UNLOCK' })
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Calculate ticket pricing
  let totalTicketPrice = 0;
  selectedSeatIds.forEach(sid => {
    const st = seats.find(s => s.id === sid);
    if (st) {
      if (st.category === 'VIP') totalTicketPrice += show.vipPrice;
      else if (st.category === 'PREMIUM') totalTicketPrice += show.premiumPrice;
      else if (st.category === 'EXECUTIVE') totalTicketPrice += show.execPrice;
      else totalTicketPrice += show.regularPrice;
    }
  });

  const handleContinue = () => {
    if (selectedSeatIds.length === 0) return;
    
    // Save selected state to session storage
    const seatPricesObj: any = {};
    selectedSeatIds.forEach(sid => {
      const st = seats.find(s => s.id === sid);
      if (st) {
        let price = show.regularPrice;
        if (st.category === 'VIP') price = show.vipPrice;
        else if (st.category === 'PREMIUM') price = show.premiumPrice;
        else if (st.category === 'EXECUTIVE') price = show.execPrice;
        seatPricesObj[sid] = price;
      }
    });

    sessionStorage.setItem(`booking_${showId}`, JSON.stringify({
      showId: showId,
      seatIds: selectedSeatIds,
      seatPrices: seatPricesObj,
      show
    }));

    router.push(`/booking/food/${showId}`);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Info */}
      <div className="bg-[#171A23] p-6 rounded-3xl border border-[#20232D] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">{show.movieTitle}</h1>
          <p className="text-xs text-[#A8ACB8]">{show.cinemaName} • {show.screenName} ({show.format})</p>
        </div>

        {selectedSeatIds.length > 0 && (
          <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold animate-pulse">
            <Clock className="w-4 h-4" />
            <span>Seats Locked: {formatTimer(timerSeconds)}</span>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-bold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Seat Map Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Visual Seat Map */}
        <div className="lg:col-span-2 bg-[#171A23] p-6 rounded-3xl border border-[#20232D] space-y-8 flex flex-col items-center overflow-x-auto">
          
          {/* Cinema Screen Curve */}
          <div className="w-full max-w-md text-center space-y-2">
            <div className="h-2 w-full bg-gradient-to-r from-transparent via-[#FF4D6D] to-transparent rounded-full shadow-lg shadow-[#FF4D6D]/50" />
            <p className="text-[10px] font-black uppercase tracking-widest text-[#A8ACB8]">SCREEN THIS WAY</p>
          </div>

          {/* Seat Grid */}
          <div className="space-y-3 py-4 min-w-[500px]">
            {rowLabels.map(rowLabel => {
              const rowSeats = rowsMap.get(rowLabel);
              return (
                <div key={rowLabel} className="flex items-center space-x-3 justify-center">
                  <span className="w-6 text-xs font-bold text-[#A8ACB8] text-right">{rowLabel}</span>
                  <div className="flex items-center space-x-2">
                    {rowSeats.map((st: any) => {
                      const isSelected = selectedSeatIds.includes(st.id);
                      const isBooked = st.status === 'BOOKED';
                      const isLocked = st.status === 'LOCKED' && st.lockedBy !== user?.id;

                      let btnClass = "bg-[#20232D] border-[#20232D] text-slate-300 hover:border-[#FF4D6D]";
                      if (isSelected) {
                        btnClass = "bg-[#FF4D6D] border-[#FF4D6D] text-white shadow-md shadow-[#FF4D6D]/40 scale-105 font-black";
                      } else if (isBooked || isLocked) {
                        btnClass = "bg-slate-800 border-slate-800 text-slate-600 cursor-not-allowed opacity-50";
                      } else if (st.category === 'VIP') {
                        btnClass = "bg-[#7C5CFC]/20 border-[#7C5CFC]/40 text-[#7C5CFC] hover:bg-[#7C5CFC] hover:text-white";
                      }

                      return (
                        <button
                          key={st.id}
                          disabled={isBooked || isLocked}
                          onClick={() => handleSeatClick(st)}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-bold border transition-all flex items-center justify-center ${btnClass}`}
                        >
                          {st.seatNumber}
                        </button>
                      );
                    })}
                  </div>
                  <span className="w-6 text-xs font-bold text-[#A8ACB8]">{rowLabel}</span>
                </div>
              );
            })}
          </div>

          {/* Seat Legend */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-[#20232D] text-xs text-[#A8ACB8]">
            <div className="flex items-center space-x-2">
              <span className="w-4 h-4 rounded bg-[#20232D] border border-[#20232D]" />
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-4 h-4 rounded bg-[#FF4D6D]" />
              <span>Selected</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-4 h-4 rounded bg-slate-800 opacity-50" />
              <span>Occupied</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-4 h-4 rounded bg-[#7C5CFC]/20 border border-[#7C5CFC]" />
              <span>VIP Category</span>
            </div>
          </div>
        </div>

        {/* Right Side Summary Panel */}
        <div className="space-y-6">
          <div className="bg-[#171A23] p-6 rounded-3xl border border-[#20232D] space-y-6 sticky top-28">
            <h3 className="text-lg font-bold text-white">Booking Summary</h3>

            <div className="space-y-3 text-xs border-b border-[#20232D] pb-4">
              <div className="flex justify-between">
                <span className="text-[#A8ACB8]">Movie:</span>
                <span className="font-bold text-white">{show.movieTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A8ACB8]">Cinema:</span>
                <span className="font-bold text-white">{show.cinemaName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A8ACB8]">Seats Selected:</span>
                <span className="font-bold text-[#FF4D6D]">
                  {selectedSeatIds.length > 0 ? selectedSeatIds.length : '0 Seats'}
                </span>
              </div>
            </div>

            {selectedSeatIds.length > 0 && (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between font-bold text-white">
                  <span>Ticket Subtotal:</span>
                  <span>₹{totalTicketPrice}</span>
                </div>
              </div>
            )}

            <button
              disabled={selectedSeatIds.length === 0}
              onClick={handleContinue}
              className={`w-full py-4 rounded-2xl font-extrabold text-sm flex items-center justify-center space-x-2 shadow-xl transition-all ${
                selectedSeatIds.length > 0
                  ? 'bg-[#FF4D6D] hover:bg-[#ff3358] text-white shadow-[#FF4D6D]/30 active:scale-95'
                  : 'bg-[#20232D] text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Continue to Food & Beverages</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
