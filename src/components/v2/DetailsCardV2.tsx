
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/button';
import type { Account } from '@/types';

const DetailItem = ({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) => (
    <div className="flex flex-col">
        <span className="text-base text-neutral-400 font-normal">{label}</span>
        <span className={cn("text-lg font-semibold mt-1", valueColor)}>{value}</span>
    </div>
);

interface DetailsCardV2Props {
    account: Account | undefined;
}

export function DetailsCardV2({ account }: DetailsCardV2Props) {
    const formatCurrency = (value: number) => {
        const sign = value > 0 ? '+' : '';
        return `${sign}$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    const formatCurrencyNoSign = (value: number) => {
        return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    const netValue = account?.balance ?? 0;
    const marketValue = account?.marketGains ?? -7372178.80; // Example fallback
    const buyingPower = account?.buyingPower ?? 0;
    const dailyPnl = account?.pnl?.daily ?? 614758.64; // Example fallback

    return (
        <Card className="bg-transparent border-none flex flex-col h-full">
            <CardHeader className="py-1 px-3 border-b border-white/10 h-8 flex-row items-center drag-handle cursor-move">
                <CardTitle className="text-sm font-semibold text-muted-foreground">
                    Details
                </CardTitle>
                <div className="ml-auto no-drag">
                     <Button variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
                        <MoreHorizontal size={16} />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-6 flex flex-col">
                <div>
                    <div className="text-sm text-neutral-400">Net Account Value (USD)</div>
                    <div className="text-4xl font-bold mt-1 text-white">{formatCurrencyNoSign(netValue)}</div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-6">
                    <DetailItem label="Market Value" value={formatCurrency(marketValue)} valueColor={marketValue < 0 ? "text-destructive" : "text-[hsl(var(--confirm-green))]"} />
                    <DetailItem label="Buying Power" value={formatCurrencyNoSign(buyingPower)} />
                    <DetailItem label="Day's P&L" value={formatCurrency(dailyPnl)} valueColor={dailyPnl >= 0 ? "text-[hsl(var(--confirm-green))]" : "text-destructive"} />
                </div>
            </CardContent>
        </Card>
    );
}
