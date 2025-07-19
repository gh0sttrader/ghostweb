
"use client"
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { initialMockStocks } from "@/app/(app)/trading/dashboard/mock-data";

interface WatchlistCardProps {
    className?: string;
    onSymbolSelect: (symbol: string) => void;
    selectedSymbol: string | null;
}

const watchlistStocks = initialMockStocks.slice(0, 15);

const formatVolume = (volume?: number) => {
    if (volume === undefined || volume === null) return '—';
    // The mock data is in millions, so we multiply
    return (volume * 1_000_000).toLocaleString();
}

const formatShortFloat = (shortFloat?: number) => {
    if (shortFloat === undefined || shortFloat === null) return '—';
    return `${shortFloat.toFixed(2)}%`;
}

export const WatchlistCardV2: React.FC<WatchlistCardProps> = ({ className, onSymbolSelect, selectedSymbol }) => {
    return (
        <div className={cn("h-full flex flex-col", className)}>
            <div className="flex-1 overflow-hidden px-3 pb-3 pt-2">
                <div className="h-full flex flex-col">
                    <div className="shrink-0">
                        <Table>
                            <TableHeader className="sticky top-0 bg-card/[.05] backdrop-blur-md z-[1]">
                                <TableRow>
                                    <TableHead className="text-xs h-7 px-2 text-left text-muted-foreground font-medium">Symbol</TableHead>
                                    <TableHead className="text-xs h-7 px-2 text-right text-muted-foreground font-medium">Price</TableHead>
                                    <TableHead className="text-xs h-7 px-2 text-right text-muted-foreground font-medium">Volume</TableHead>
                                    <TableHead className="text-xs h-7 px-2 text-right text-muted-foreground font-medium">Short %</TableHead>
                                    <TableHead className="text-xs h-7 px-2 text-right text-muted-foreground font-medium">% Change</TableHead>
                                </TableRow>
                            </TableHeader>
                        </Table>
                    </div>
                    <ScrollArea className="flex-1">
                        <Table>
                            <TableBody>
                                {watchlistStocks.map((stock) => (
                                    <TableRow
                                        key={stock.id}
                                        className="cursor-pointer"
                                        onClick={() => onSymbolSelect(stock.symbol)}
                                        data-selected={selectedSymbol === stock.symbol}
                                    >
                                        <TableCell className="font-medium text-xs py-1.5 px-2">{stock.symbol}</TableCell>
                                        <TableCell className="text-right text-xs py-1.5 px-2">{`$${stock.price.toFixed(2)}`}</TableCell>
                                        <TableCell className="text-right text-xs py-1.5 px-2">{formatVolume(stock.volume)}</TableCell>
                                        <TableCell className="text-right text-xs py-1.5 px-2">{formatShortFloat(stock.shortFloat)}</TableCell>
                                        <TableCell className={cn("text-right text-xs py-1.5 px-2", stock.changePercent >= 0 ? "text-[hsl(var(--confirm-green))]" : "text-destructive")}>
                                            {`${stock.changePercent.toFixed(2)}%`}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
};
