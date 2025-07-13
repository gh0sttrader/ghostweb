
"use client"
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Stock } from '@/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';

interface FundamentalsCardProps {
    stock: Stock | null;
    className?: string;
}

const FundamentalItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-border/50">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-medium text-foreground">{value ?? 'N/A'}</span>
    </div>
);

export const FundamentalsCard: React.FC<FundamentalsCardProps> = ({ stock, className }) => {
    const formatMarketCap = (mc: number | undefined) => {
        if (!mc) return 'N/A';
        if (mc >= 1e12) return `${(mc / 1e12).toFixed(2)}T`;
        if (mc >= 1e9) return `${(mc / 1e9).toFixed(2)}B`;
        if (mc >= 1e6) return `${(mc / 1e6).toFixed(2)}M`;
        return mc.toString();
    }

    return (
        <Card className={cn("h-full flex flex-col", className)}>
            <CardHeader>
                <CardTitle>Key Fundamentals</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full px-6">
                    <div className="space-y-2 pb-6">
                        <FundamentalItem label="Market Cap" value={formatMarketCap(stock?.marketCap)} />
                        <FundamentalItem label="P/E Ratio" value={stock?.peRatio?.toFixed(2)} />
                        <FundamentalItem label="EPS (TTM)" value={stock?.epsTTM?.toFixed(2)} />
                        <FundamentalItem label="52-Wk High" value={stock?.high52 ? `$${stock.high52.toFixed(2)}` : 'N/A'} />
                        <FundamentalItem label="52-Wk Low" value={stock?.low52 ? `$${stock.low52.toFixed(2)}` : 'N/A'} />
                        <FundamentalItem label="Avg. Volume" value={stock?.avgVolume ? `${stock.avgVolume.toFixed(2)}M` : 'N/A'} />
                        <FundamentalItem label="Dividend Yield" value={stock?.dividendYield ? `${stock.dividendYield.toFixed(2)}%` : 'N/A'} />
                        <FundamentalItem label="Beta" value={stock?.beta?.toFixed(2)} />
                        <FundamentalItem label="Sector" value={stock?.sector} />
                        <FundamentalItem label="Analyst Rating" value={stock?.analystRating} />
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};
