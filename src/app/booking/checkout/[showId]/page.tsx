'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tag, Shield, CreditCard, Check, AlertCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function CheckoutPage({ params }: { params: { showId: string } }) {
  const router = useRouter();
  const { user } = useApp();

  const [bookingData, setBookingData] = useState<any>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponMsg, setCouponMsg] = useState({ text: '', isError: false });
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(`booking_${params.showId}`);
    if (!raw) {
      router.push(`/movies`);
      return;
    }
    setBookingData(JSON.parse(raw));
  }, [params.showId, router]);

  if (!bookingData) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">Loading checkout summary...</div>;
  }

  const { show, seatIds, seatPrices, foodOrders = [] } = bookingData;

  let ticketSubtotal = 0;
  seatIds.forEach((sid: string) => {
    ticketSubtotal += (seatPrices[sid] || 250);
  });

  let foodSubtotal = 0;
  foodOrders.forEach((fo: any) => {
    foodSubtotal += (fo.price * fo.quantity);
  });

  const subtotal = ticketSubtotal + foodSubtotal;
  const convenienceFee = Math.round(subtotal * 0.08);
  const taxAmount = Math.round((subtotal + convenienceFee) * 0.18);

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'PERCENTAGE') {
      discountAmount = Math.round((subtotal * appliedCoupon.discountVal) / 100);
      if (appliedCoupon.maxDiscount && discountAmount > appliedCoupon.maxDiscount) {
        discountAmount = appliedCoupon.maxDiscount;
      }
    } else if (appliedCoupon.discountType === 'FLAT') {
      discountAmount = appliedCoupon.discountVal;
    }
  }

  const grandTotal = Math.max(0, subtotal + convenienceFee + taxAmount - discountAmount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res = await fetch(`/api/meta`);
      const data = await res.json();
      if (data.success) {
        const found = data.coupons.find((c: any) => c.code.toUpperCase() === couponCode.trim().toUpperCase());
        if (found && subtotal >= found.minAmount) {
          setAppliedCoupon(found);
          setCouponMsg({ text: `Coupon ${found.code} applied successfully!`, isError: false });
        } else {
          setAppliedCoupon(null);
          setCouponMsg({ text: `Invalid coupon or minimum amount ₹${found?.minAmount || 300} not met.`, isError: true });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          showId: params.showId,
          userId: user?.id || 'u_demo',
          seatIds,
          seatPrices,
          foodOrders,
          couponCode: appliedCoupon?.code || null,
          paymentMethod
        })
      });

      const resData = await res.json();
      if (resData.success) {
        sessionStorage.removeItem(`booking_${params.showId}`);
        router.push(`/booking/confirmation/${resData.bookingId}`);
      } else {
        alert(resData.error || 'Payment failed');
        setIsProcessing(false);
      }
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h1 className="text-3xl font-black text-white">Checkout & Payment</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Coupon & Payment Gateway Choice */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Apply Coupon Box */}
          <div className="p-6 rounded-3xl bg-[#171A23] border border-[#20232D] space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Tag className="w-4 h-4 text-[#FF4D6D]" />
              <span>Apply Promo Code / Coupon</span>
            </h3>

            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="Enter promo code (e.g. CINE20)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 bg-[#20232D] text-xs text-white placeholder-[#A8ACB8] px-4 py-3 rounded-xl border border-[#20232D] focus:outline-none focus:border-[#FF4D6D]"
              />
              <button
                onClick={handleApplyCoupon}
                className="px-5 py-3 rounded-xl bg-[#FF4D6D] hover:bg-[#ff3358] text-white text-xs font-bold transition-colors"
              >
                Apply
              </button>
            </div>

            {couponMsg.text && (
              <p className={`text-xs font-bold ${couponMsg.isError ? 'text-rose-400' : 'text-emerald-400'}`}>
                {couponMsg.text}
              </p>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="p-6 rounded-3xl bg-[#171A23] border border-[#20232D] space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-[#7C5CFC]" />
              <span>Select Payment Method</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'UPI', label: 'UPI / GPay / PhonePe' },
                { id: 'CREDIT_CARD', label: 'Credit / Debit Card' },
                { id: 'NET_BANKING', label: 'Net Banking' },
                { id: 'WALLET', label: 'CineCoins Wallet' }
              ].map(pm => (
                <button
                  key={pm.id}
                  onClick={() => setPaymentMethod(pm.id)}
                  className={`p-4 rounded-2xl border text-xs font-bold text-left transition-all ${
                    paymentMethod === pm.id
                      ? 'bg-[#FF4D6D]/20 border-[#FF4D6D] text-white'
                      : 'bg-[#20232D] border-[#20232D] text-slate-400 hover:border-[#FF4D6D]/50'
                  }`}
                >
                  {pm.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Final Price Summary & Pay CTA */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#171A23] border border-[#20232D] space-y-6 sticky top-28">
            <h3 className="text-base font-bold text-white border-b border-[#20232D] pb-3">Payment Breakdown</h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-[#A8ACB8]">
                <span>Tickets ({seatIds.length} seats)</span>
                <span className="font-bold text-white">₹{ticketSubtotal}</span>
              </div>

              {foodSubtotal > 0 && (
                <div className="flex justify-between text-[#A8ACB8]">
                  <span>Food & Beverages</span>
                  <span className="font-bold text-white">₹{foodSubtotal}</span>
                </div>
              )}

              <div className="flex justify-between text-[#A8ACB8]">
                <span>Convenience Fee (8%)</span>
                <span>₹{convenienceFee}</span>
              </div>

              <div className="flex justify-between text-[#A8ACB8]">
                <span>GST Taxes (18%)</span>
                <span>₹{taxAmount}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Discount Applied</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#20232D] flex justify-between items-center">
              <span className="text-xs text-[#A8ACB8]">Final Amount:</span>
              <span className="text-2xl font-black text-white">₹{grandTotal}</span>
            </div>

            <button
              disabled={isProcessing}
              onClick={handlePayment}
              className="w-full py-4 rounded-2xl bg-[#FF4D6D] hover:bg-[#ff3358] text-white font-extrabold text-sm shadow-xl shadow-[#FF4D6D]/30 transition-transform active:scale-95 disabled:opacity-50"
            >
              {isProcessing ? 'Processing Payment...' : `Pay ₹${grandTotal} & Confirm`}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
