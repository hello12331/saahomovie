'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-md mx-auto my-16 p-8 rounded-3xl bg-[#171A23] border border-[#20232D] text-center space-y-6 shadow-2xl">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-500 mx-auto flex items-center justify-center">
        <AlertCircle className="w-8 h-8" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-white">Something went wrong</h2>
        <p className="text-xs text-[#A8ACB8]">{error.message || 'Unable to load content right now.'}</p>
      </div>

      <button
        onClick={() => reset()}
        className="w-full py-3.5 rounded-xl bg-[#FF4D6D] hover:bg-[#ff3358] text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-lg shadow-[#FF4D6D]/30"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Reload Section</span>
      </button>
    </div>
  );
}
