"use client";

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="text-center">
        <h1 
          className="font-extrabold font-headline uppercase text-white"
          style={{ 
            fontSize: 'clamp(3rem, 12vw, 9rem)',
            textShadow: '0 0 15px rgba(255, 255, 255, 0.2)' 
          }}
        >
          Ghost Trading
        </h1>
        <p 
          className="text-[#aaa] font-semibold mt-4"
          style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)' }}
        >
          see how deep the rabbit hole goes...
        </p>
      </div>
    </div>
  );
}
