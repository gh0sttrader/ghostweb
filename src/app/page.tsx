
"use client";

import { useState } from 'react';
import Link from 'next/link';
import GhostFloating from '@/components/GhostFloating';
import { PlatformPreviewPlaceholder } from '@/components/PlatformPreviewPlaceholder';
import { NavBar } from '@/components/NavBar';
import { ReviewsModal } from '@/components/ReviewsModal';

export default function LandingPage() {
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);

  return (
    <>
      <NavBar onReviewClick={() => setIsReviewsOpen(true)} />
      <GhostFloating />
      <div className="flex flex-col items-center justify-start min-h-screen bg-black text-white p-4 pt-24">
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
        <PlatformPreviewPlaceholder />
      </div>
      <ReviewsModal isOpen={isReviewsOpen} onClose={() => setIsReviewsOpen(false)} />
    </>
  );
}
