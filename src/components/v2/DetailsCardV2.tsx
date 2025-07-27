
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';
import type { Account, WidgetKey } from '@/types';
import { CardMenu } from './CardMenu';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

const WIDGETS = [
  { key: "chart" as WidgetKey, label: "Chart" },
  { key: "order" as WidgetKey, label: "Trading Card" },
  { key: "positions" as WidgetKey, label: "Positions" },
  { key: "orders" as WidgetKey, label: "Open Orders" },
  { key: "history" as WidgetKey, label: "History" },
  { key: "watchlist" as WidgetKey, label: "Watchlist" },
  { key: "screeners" as WidgetKey, label: "Screeners" },
  { key: "news" as WidgetKey, label: "News" },
  { key: "details" as WidgetKey, label: "Details" },
];

const StatItem = ({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) => (
    <div className="flex flex-col">
        <span className={cn("text-sm font-semibold", valueColor)}>{value}</span>
        <span className="text-xs text-neutral-400 font-normal mt-0.5">{label}</span>
    </div>
);

interface DetailsCardV2Props {
    account: Account | undefined;
    onDelete: () => void;
    onAddWidget: (widgetKey: WidgetKey) => void;
}

export function DetailsCardV2({ account, onDelete, onAddWidget }: DetailsCardV2Props) {
    const { toast } = useToast();
    const formatCurrency = (value: number) => {
        const sign = value >= 0 ? '+' : '-';
        return `${sign}$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    const formatCurrencyNoSign = (value: number) => {
        return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    const netValue = account?.balance ?? 0;
    const marketValue = account?.marketGains ?? 0;
    const buyingPower = account?.buyingPower ?? 0;
    const dailyPnl = account?.pnl?.daily ?? 0;

    const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();
    }

    return (
        <Card className="bg-transparent border-none flex flex-col h-full">
            <CardHeader className="py-1 px-3 border-b border-white/10 h-8 flex-row items-center drag-handle cursor-move">
                <CardTitle className="text-sm font-semibold text-muted-foreground">
                    Details
                </CardTitle>
                <div className="ml-auto flex items-center gap-1 no-drag">
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground" onMouseDown={handleInteraction} onTouchStart={handleInteraction}>
                                <Plus size={16} />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-1" onMouseDown={handleInteraction} onTouchStart={handleInteraction}>
                            <div className="flex flex-col">
                                {WIDGETS.map(w => (
                                    <Button 
                                        key={w.key}
                                        variant="ghost" 
                                        className="w-full justify-start text-xs h-8"
                                        onClick={() => onAddWidget(w.key)}
                                        disabled={Object.values(w).flat().includes(w.key)}
                                    >
                                        {w.label} {Object.values(w).flat().includes(w.key) && "(Added)"}
                                    </Button>
                                ))}
                            </div>
                        </PopoverContent>
                     </Popover>
                    <CardMenu onCustomize={() => toast({title: "Customize Details..."})} onDelete={onDelete} />
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-4 flex flex-col items-start justify-start">
                <div className="flex flex-col items-start w-full">
                    <div className="text-xs text-neutral-400">Net Account Value (USD)</div>
                    <div className="text-2xl font-semibold mt-1 text-white">{formatCurrencyNoSign(netValue)}</div>
                    
                    <div className="flex flex-row gap-8 mt-4">
                        <StatItem 
                            label="Market Value" 
                            value={formatCurrency(marketValue)}
                            valueColor={marketValue < 0 ? 'text-destructive' : 'text-white'}
                        />
                        <StatItem 
                            label="Buying Power" 
                            value={formatCurrencyNoSign(buyingPower)}
                            valueColor="text-white"
                        />
                        <StatItem 
                            label="Day's P&L" 
                            value={formatCurrency(dailyPnl)}
                            valueColor={dailyPnl < 0 ? 'text-destructive' : 'text-[hsl(var(--confirm-green))]'}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
