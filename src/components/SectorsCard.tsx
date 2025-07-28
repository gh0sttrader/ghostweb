
"use client";

import React from 'react';
import { Separator } from '@/components/ui/separator';
import type { Stock } from '@/types';
import { cn } from '@/lib/utils';

interface SectorsCardProps {
    stock: Stock;
    className?: string;
}

export function SectorsCard({ stock, className }: SectorsCardProps) {
    if (!stock.sectors || stock.sectors.length === 0) {
        return null;
    }

    return (
        <div className={cn("bg-transparent", className)}>
            <div className="pb-3">
                <h2 className="text-xl font-bold">Sectors</h2>
                <Separator className="bg-white/10 mt-2" />
            </div>
            <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                    <div className="flex justify-between items-baseline mb-4">
                        <h3 className="font-semibold text-white">Sectors</h3>
                        <p className="text-xs text-neutral-500">As of June 30, 2025</p>
                    </div>
                    <ul className="space-y-3">
                        {stock.sectors.map((sector) => (
                            <li key={sector.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center">
                                    <span
                                        className="h-3 w-3 rounded-sm mr-3"
                                        style={{ backgroundColor: sector.color }}
                                    />
                                    <span className="text-neutral-200">{sector.name}</span>
                                </div>
                                <span className="font-mono text-neutral-100">{sector.pct.toFixed(2)}%</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                    <div className="w-full h-8 bg-neutral-800 rounded-md flex overflow-hidden shadow-inner" title="Sector allocation">
                        {stock.sectors.map((sector) => (
                            <div
                                key={sector.name}
                                className="h-full"
                                style={{
                                    width: `${sector.pct}%`,
                                    backgroundColor: sector.color
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
