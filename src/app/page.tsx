
"use client";

import { useState } from 'react';
import Link from 'next/link';
import GhostFloating from '@/components/GhostFloating';
import { PlatformPreviewPlaceholder } from '@/components/PlatformPreviewPlaceholder';
import { NavBar } from '@/components/NavBar';
import { ReviewsModal } from '@/components/ReviewsModal';
import Image from 'next/image';
import { Github, Twitter, Linkedin } from 'lucide-react';

export default function LandingPage() {
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);

  return (
    <>
      <NavBar onReviewClick={() => setIsReviewsOpen(true)} />
      <GhostFloating />
      <div className="flex flex-col items-center justify-start min-h-screen bg-black text-white p-4 pt-24">
        <div className="text-center">
          <h1 
            className="font-extrabold font-headline uppercase text-white leading-none"
            style={{ 
              fontSize: 'clamp(3.5rem, 13.5vw, 9.7rem)',
              lineHeight: 1,
            }}
          >
            GHOST TRADING
          </h1>
          <p className="mt-2 text-xl font-medium text-center text-neutral-400">
            Stay in the market when others get spooked.
          </p>
        </div>
        
        {/* Container for both image previews */}
        <div className="mt-32 w-full flex flex-col items-center space-y-32">
          <PlatformPreviewPlaceholder />
          
           <div className="w-full md:w-[65%] min-h-[320px] aspect-[16/9] bg-[#181818] rounded-[24px] shadow-[0_0_25px_rgba(255,255,255,0.2)] flex items-center justify-center p-8 relative overflow-hidden">
            <Image
                src="https://firebasestorage.googleapis.com/v0/b/ghost-trading.firebasestorage.app/o/News.png?alt=media&token=54be3d5e-b463-4bad-9cb5-c009d2c7283a"
                alt="Ghost Trading Platform News Preview"
                layout="fill"
                objectFit="cover"
                className="rounded-xl"
                data-ai-hint="platform mobile"
                priority
            />
        </div>
        </div>

        <footer className="w-full mt-32 py-12">
            <div className="container mx-auto px-4 text-center">
                <div className="flex justify-center space-x-6">
                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                        <Twitter className="h-6 w-6" />
                    </Link>
                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                        <Github className="h-6 w-6" />
                    </Link>
                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                        <Linkedin className="h-6 w-6" />
                    </Link>
                </div>
                <p className="text-sm text-muted-foreground mt-6">
                    © {new Date().getFullYear()} Ghost Trading. All rights reserved.
                </p>
            </div>
        </footer>
      </div>
      <ReviewsModal isOpen={isReviewsOpen} onClose={() => setIsReviewsOpen(false)} />
    </>
  );
}
