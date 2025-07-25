
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Stock } from '@/types';
import { cn } from '@/lib/utils';

interface AboutCardProps {
    stock: Stock | null;
    className?: string;
}

const InfoItem = ({ label, value }: { label: string; value: string | number | undefined }) => (
    <div>
        <div className="font-semibold text-sm text-neutral-400">{label}</div>
        <div className="text-base text-neutral-100 mt-1">{value || '—'}</div>
    </div>
);

export function AboutCard({ stock, className }: AboutCardProps) {
    const description = stock?.description || "No description available for this stock.";

    // Get the first 1-2 sentences for the summary.
    const summary = description.split('. ').slice(0, 2).join('. ') + (description.split('. ').length > 2 ? '.' : '');

    return (
        <div className={cn("bg-transparent", className)}>
            <div className="pb-3">
                <h2 className="text-xl font-bold">About</h2>
                <Separator className="bg-white/10 mt-2" />
            </div>
            <div>
                <div className="text-base text-neutral-300">
                    <p>{summary}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 mt-6">
                    <InfoItem label="CEO" value={stock?.ceo} />
                    <InfoItem label="Employees" value={stock?.employees?.toLocaleString()} />
                    <InfoItem label="Headquarters" value={stock?.headquarters} />
                    <InfoItem label="Founded" value={stock?.founded} />
                </div>
            </div>
        </div>
    );
}
