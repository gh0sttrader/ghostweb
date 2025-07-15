"use client";

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-black text-white p-4 pt-48">
      <div className="text-center">
        <h1 
          className="font-extrabold font-headline uppercase text-white"
          style={{ 
            fontSize: 'clamp(3.5rem, 15vw, 12rem)',
            textShadow: '0 0 15px rgba(255, 255, 255, 0.2)' 
          }}
        >
          Ghost Trading
        </h1>
        <p className="mt-4 text-2xl font-semibold text-center text-neutral-300">
          Stay in when others get spooked.
        </p>
      </div>
    </div>
  );
}
