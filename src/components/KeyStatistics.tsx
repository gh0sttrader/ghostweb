
"use client";

import React from 'react';
import { Separator } from '@/components/ui/separator';
import type { Stock } from '@/types';
import { cn } from '@/lib/utils';

interface KeyStatisticsProps {
    stock: Stock | null;
    className?: string;
}

const StatItem = ({ label, value }: { label: string; value: string | number | undefined }) => (
    <div>
        <div className="font-semibold text-sm text-neutral-400">{label}</div>
        <div className="text-base text-neutral-100 mt-1">{value || '—'}</div>
    </div>
);

const formatCompact = (value?: number) => {
    if (value === undefined || value === null || isNaN(value)) return '—';
    if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    return value.toLocaleString();
};

const formatDecimal = (value?: number) => {
    if (value === undefined || value === null || isNaN(value)) return '—';
    return value.toFixed(2);
};

const formatPrice = (value?: number) => {
    if (value === undefined || value === null || isNaN(value)) return '—';
    return `$${value.toFixed(2)}`;
}

export function KeyStatistics({ stock, className }: KeyStatisticsProps) {
    if (!stock) {
        return null; // Or a loading skeleton
    }

    return (
        <div className={cn("bg-transparent", className)}>
            <div className="pb-3">
                <h2 className="text-xl font-bold">Key statistics</h2>
                <Separator className="bg-white/10 mt-2" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-y-6 gap-x-12">
                <StatItem label="Market cap" value={formatCompact(stock.marketCap)} />
                <StatItem label="Price-Earnings ratio" value={formatDecimal(stock.peRatio)} />
                <StatItem label="Dividend yield" value={stock.dividendYield ? `${stock.dividendYield}%` : '—'} />
                <StatItem label="Average volume" value={formatCompact(stock.avgVolume ? stock.avgVolume * 1e6 : undefined)} />

                <StatItem label="High today" value={formatPrice(stock.high)} />
                <StatItem label="Low today" value={formatPrice(stock.low)} />
                <StatItem label="Open price" value={formatPrice(stock.open)} />
                <StatItem label="Volume" value={formatCompact(stock.volume ? stock.volume * 1e6 : undefined)} />

                <StatItem label="52 Week high" value={formatPrice(stock.high52)} />
                <StatItem label="52 Week low" value={formatPrice(stock.low52)} />
            </div>
        </div>
    );
}
