
"use client";

import React from 'react';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import type { Stock } from '@/types';
import { cn } from '@/lib/utils';

interface AnalystRatingsProps {
    stock: Stock | null;
    className?: string;
}

const RatingBar = ({ label, value, colorClass }: { label: string, value: number, colorClass: string }) => (
    <div>
        <div className="flex justify-between items-center text-sm mb-1.5">
            <span className={cn("font-semibold", colorClass)}>{label}</span>
            <span className="font-mono text-neutral-300">{value.toFixed(1)}%</span>
        </div>
        <Progress value={value} className="h-2 [&>div]:bg-current" color={colorClass} />
    </div>
);

export function AnalystRatings({ stock, className }: AnalystRatingsProps) {
    const ratings = stock?.analystRatings;

    if (!ratings) {
        return null;
    }

    return (
        <div className={cn("bg-transparent", className)}>
            <div className="pb-3">
                <h2 className="text-xl font-bold">Analyst Ratings</h2>
                <Separator className="bg-white/10 mt-2" />
            </div>
            <div className="space-y-4">
                <RatingBar label="Buy" value={ratings.buy} colorClass="text-[hsl(var(--confirm-green))]" />
                <RatingBar label="Hold" value={ratings.hold} colorClass="text-neutral-400" />
                <RatingBar label="Panic" value={ratings.sell} colorClass="text-destructive" />
            </div>
        </div>
    );
}
