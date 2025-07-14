
"use client";

import React from 'react';
import { useOpenPositionsContext } from '@/contexts/OpenPositionsContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PackageSearch } from 'lucide-react';
import type { OpenPosition } from '@/types';

interface OpenPositionsCardProps {
    className?: string;
}

const PositionRow = ({ position, onClose }: { position: OpenPosition; onClose: (id: string) => void; }) => {
    const pnl = (position.currentPrice - position.entryPrice) * position.shares;
    const pnlPercent = ((position.currentPrice - position.entryPrice) / position.entryPrice) * 100;
    const pnlColor = pnl >= 0 ? 'text-[hsl(var(--confirm-green))]' : 'text-destructive';

    return (
        <TableRow key={position.id} className="text-xs hover:bg-white/5">
            <TableCell className="px-2 py-1.5 text-center">
                <Button 
                    variant="destructive" 
                    size="sm" 
                    className="h-6 px-2.5 text-xs font-bold rounded-md" 
                    onClick={() => onClose(position.id)}
                >
                    CLOSE
                </Button>
            </TableCell>
            <TableCell className="px-2 py-1.5 font-bold text-left">{position.symbol}</TableCell>
            <TableCell className="px-2 py-1.5 text-right font-bold">{position.shares}</TableCell>
            <TableCell className="px-2 py-1.5 text-right font-bold">${position.entryPrice.toFixed(2)}</TableCell>
            <TableCell className="px-2 py-1.5 text-right font-bold">${position.currentPrice.toFixed(2)}</TableCell>
            <TableCell className={cn("px-2 py-1.5 text-right font-bold", pnlColor)}>
                {pnlPercent.toFixed(2)}%
            </TableCell>
        </TableRow>
    );
};

export function OpenPositionsCard({ className }: OpenPositionsCardProps) {
    const { openPositions, closePosition } = useOpenPositionsContext();

    return (
        <div className={cn("h-full flex flex-col", className)}>
            <div className="p-0 flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                    <Table className="table-fixed">
                        <TableHeader className="sticky top-0 bg-card/[.05] backdrop-blur-md z-[1]">
                            <TableRow>
                                <TableHead className="text-xs h-7 px-2 text-center text-muted-foreground font-medium w-20">Action</TableHead>
                                <TableHead className="text-xs h-7 px-2 text-left text-muted-foreground font-medium">Symbol</TableHead>
                                <TableHead className="text-xs h-7 px-2 text-right text-muted-foreground font-medium">Qty</TableHead>
                                <TableHead className="text-xs h-7 px-2 text-right text-muted-foreground font-medium">Avg Price</TableHead>
                                <TableHead className="text-xs h-7 px-2 text-right text-muted-foreground font-medium">Last Price</TableHead>
                                <TableHead className="text-xs h-7 px-2 text-right text-muted-foreground font-medium">Open P&L</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {openPositions.length > 0 ? (
                                openPositions.map((position) => (
                                    <PositionRow key={position.id} position={position} onClose={closePosition} />
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        <div className="flex flex-col items-center justify-center text-xs py-8 px-3">
                                            <PackageSearch className="mx-auto h-8 w-8 mb-2 opacity-50 text-muted-foreground" />
                                            <p className="text-muted-foreground text-center">No open positions.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </div>
        </div>
    );
}
