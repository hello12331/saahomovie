'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Minus, Popcorn, ChevronRight, ArrowLeft } from 'lucide-react';

export default function FoodSelectionPage({ params }: { params: { showId: string } }) {
  const router = useRouter();
  const [foodItems, setFoodItems] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<{ [id: string]: number }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFood() {
      try {
        const res = await fetch(`/api/meta`);
        const data = await res.json();
        if (data.success) {
          setFoodItems(data.foodItems || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchFood();
  }, []);

  const handleUpdateQty = (id: string, delta: number) => {
    setSelectedFood(prev => {
      const current = prev[id] || 0;
      const updated = Math.max(0, current + delta);
      if (updated === 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: updated };
    });
  };

  const handleProceed = (skip = false) => {
    const existing = JSON.parse(sessionStorage.getItem(`booking_${params.showId}`) || '{}');

    const foodOrdersList = skip ? [] : Object.keys(selectedFood).map(id => {
      const item = foodItems.find(f => f.id === id);
      return {
        id,
        name: item.name,
        price: item.price,
        quantity: selectedFood[id]
      };
    });

    sessionStorage.setItem(`booking_${params.showId}`, JSON.stringify({
      ...existing,
      foodOrders: foodOrdersList
    }));

    router.push(`/booking/checkout/${params.showId}`);
  };

  let totalFoodPrice = 0;
  Object.keys(selectedFood).forEach(id => {
    const item = foodItems.find(f => f.id === id);
    if (item) totalFoodPrice += item.price * selectedFood[id];
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#20232D] pb-6">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center space-x-3">
            <Popcorn className="w-8 h-8 text-[#FF4D6D]" />
            <span>Add Cinema Snacks & Combos</span>
          </h1>
          <p className="text-xs text-[#A8ACB8] mt-1">Pre-order snacks and get them served right at your seat!</p>
        </div>

        <button
          onClick={() => handleProceed(true)}
          className="px-5 py-2.5 rounded-xl bg-[#20232D] hover:bg-[#2a2e3b] text-slate-300 text-xs font-bold transition-colors"
        >
          Skip Food
        </button>
      </div>

      {/* Food Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {foodItems.map(item => {
          const qty = selectedFood[item.id] || 0;
          return (
            <div key={item.id} className="p-5 rounded-3xl bg-[#171A23] border border-[#20232D] flex items-center space-x-4 hover:border-[#FF4D6D]/40 transition-colors">
              <img src={item.image} alt={item.name} className="w-24 h-24 rounded-2xl object-cover flex-shrink-0 bg-[#20232D]" />
              <div className="space-y-1 flex-1">
                <h3 className="text-sm font-bold text-white leading-tight">{item.name}</h3>
                <p className="text-[11px] text-[#A8ACB8] line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-black text-white">₹{item.price}</span>

                  {/* Quantity Counter */}
                  <div className="flex items-center space-x-2 bg-[#20232D] p-1 rounded-xl border border-[#20232D]">
                    {qty > 0 && (
                      <>
                        <button
                          onClick={() => handleUpdateQty(item.id, -1)}
                          className="w-6 h-6 rounded-lg bg-[#171A23] text-white flex items-center justify-center font-bold text-xs hover:bg-[#FF4D6D]"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold px-1 text-white">{qty}</span>
                      </>
                    )}
                    <button
                      onClick={() => handleUpdateQty(item.id, 1)}
                      className="w-6 h-6 rounded-lg bg-[#FF4D6D] text-white flex items-center justify-center font-bold text-xs hover:bg-[#ff3358]"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#171A23]/95 backdrop-blur-md border-t border-[#20232D] p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-xs text-[#A8ACB8] block">Food Subtotal</span>
            <span className="text-lg font-black text-white">₹{totalFoodPrice}</span>
          </div>

          <button
            onClick={() => handleProceed(false)}
            className="px-8 py-3.5 rounded-2xl bg-[#FF4D6D] hover:bg-[#ff3358] text-white font-extrabold text-sm flex items-center space-x-2 shadow-xl shadow-[#FF4D6D]/30 transition-transform active:scale-95"
          >
            <span>Proceed to Checkout</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
