
"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Review {
    name: string;
    quote: string;
    source: string;
}

const reviews: Review[] = [
    {
        name: "Alex B.",
        quote: "Whoever created Ghost Trading is a genius. If you ever get the chance to use this platform, do it!",
        source: "— Ghost Trading Review"
    },
    {
        name: "Jamie L.",
        quote: "Ghost Trading has completely transformed the way I trade. The tools are next-level—nothing else comes close!",
        source: "— Ghost Trading Review"
    },
    {
        name: "Priya S.",
        quote: "The analytics, the speed, the intelligence—Ghost Trading is lightyears ahead of any trading platform out there. Game-changing!",
        source: "— Ghost Trading Review"
    },
    {
        name: "Chris T.",
        quote: "If I could give Ghost Trading 10 stars, I would. It’s like having an entire team of experts in one platform. Simply phenomenal.",
        source: "— Ghost Trading Review"
    },
];

interface ReviewsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => (
    <div className="flex flex-col text-center items-center">
        <p className="font-bold text-lg text-white">{review.name}</p>
        <blockquote className="mt-2 text-base italic text-neutral-300">
            "{review.quote}"
        </blockquote>
        <p className="mt-3 text-sm text-neutral-500">{review.source}</p>
    </div>
);


export function ReviewsModal({ isOpen, onClose }: ReviewsModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <Dialog open={isOpen} onOpenChange={onClose}>
                    <DialogPortal>
                         <DialogOverlay className="bg-transparent" />
                         <DialogContent
                            className="bg-transparent border-white/10 p-8 sm:p-12 rounded-3xl max-w-4xl w-full"
                         >
                            <DialogHeader>
                                <DialogTitle className="text-center text-4xl font-bold mb-8">
                                    What People Are Saying
                                </DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                               {reviews.map(review => (
                                   <ReviewCard key={review.name} review={review} />
                               ))}
                            </div>
                        </DialogContent>
                    </DialogPortal>
                </Dialog>
            )}
        </AnimatePresence>
    );
}
