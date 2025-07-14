
"use client"
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { initialMockStocks } from '@/app/(app)/trading/dashboard/mock-data';
import { cn } from '@/lib/utils';

interface WatchlistCardProps {
    selectedStockSymbol: string;
    onSelectStock: (symbol: string) => void;
    className?: string;
}

// Using a subset of mock stocks for the watchlist
const watchlistStocks = initialMockStocks.slice(0, 8);

export const WatchlistCard: React.FC<WatchlistCardProps> = ({ selectedStockSymbol, onSelectStock, className }) => {
    return (
        <Card className={cn("h-full flex flex-col", className)}>
            <CardHeader>
                <CardTitle>Watchlist</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full">
                    <Table>
                        <TableBody>
                            {watchlistStocks.map((stock) => (
                                <TableRow
                                    key={stock.id}
                                    className={cn("cursor-pointer", {
                                        "bg-accent text-accent-foreground": selectedStockSymbol === stock.symbol
                                    })}
                                    onClick={() => onSelectStock(stock.symbol)}
                                >
                                    <TableCell className="font-medium">{stock.symbol}</TableCell>
                                    <TableCell className="text-right">{`$${stock.price.toFixed(2)}`}</TableCell>
                                    <TableCell className={cn("text-right", stock.changePercent >= 0 ? "text-[hsl(var(--confirm-green))]" : "text-red-500")}>
                                        {`${stock.changePercent.toFixed(2)}%`}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};
