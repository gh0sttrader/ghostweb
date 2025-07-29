
"use client";

import React from 'react';
import { Separator } from '@/components/ui/separator';
import type { Stock } from '@/types';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

interface TopHoldingsCardProps {
    stock: Stock;
    className?: string;
}

export function TopHoldingsCard({ stock, className }: TopHoldingsCardProps) {
    if (!stock.topHoldings || stock.topHoldings.length === 0) {
        return null;
    }

    const totalAssets = stock.topHoldings.reduce((acc, holding) => acc + holding.assets, 0);

    return (
        <div className={cn("bg-transparent", className)}>
            <div className="pb-3">
                <h2 className="text-xl font-bold">
                    Top 10 Holdings 
                    <span className="font-normal text-neutral-400 text-lg ml-2">
                        ({totalAssets.toFixed(2)}% of total assets)
                    </span>
                </h2>
                <Separator className="bg-white/10 mt-2" />
            </div>
            <p className="text-xs text-neutral-500 mb-4">As of July 24, 2025</p>

            <div className="overflow-x-auto rounded-lg border border-white/10">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-white/10 hover:bg-card">
                            <TableHead className="py-3 px-4 font-semibold">Name</TableHead>
                            <TableHead className="py-3 px-4 font-semibold">Symbol</TableHead>
                            <TableHead className="py-3 px-4 font-semibold text-right">% Assets</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {stock.topHoldings.map((holding, index) => (
                            <TableRow 
                                key={holding.symbol} 
                                className={cn(
                                    "border-b-0",
                                    index === 1 && "bg-white/5", // Arqit Quantum highlight
                                )}
                            >
                                <TableCell className={cn("py-2 px-4", index === 0 && "font-bold")}>
                                    {holding.name}
                                </TableCell>
                                <TableCell className={cn("py-2 px-4", index === 0 && "font-bold")}>
                                    {holding.symbol}
                                </TableCell>
                                <TableCell className={cn("py-2 px-4 text-right", index === 0 && "font-bold")}>
                                    {holding.assets.toFixed(2)}%
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
