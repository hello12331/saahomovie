import Link from 'next/link';
import { Film } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-[#171A23] border border-[#20232D] text-center space-y-6 shadow-2xl">
      <div className="w-16 h-16 rounded-2xl bg-[#FF4D6D]/20 text-[#FF4D6D] mx-auto flex items-center justify-center font-black text-2xl">
        404
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-white">Page Not Found</h2>
        <p className="text-xs text-[#A8ACB8]">The page you are looking for does not exist or has been moved.</p>
      </div>

      <Link
        href="/"
        className="w-full py-3.5 rounded-xl bg-[#FF4D6D] hover:bg-[#ff3358] text-white text-xs font-bold block text-center shadow-lg shadow-[#FF4D6D]/30"
      >
        Back to Home
      </Link>
    </div>
  );
}
