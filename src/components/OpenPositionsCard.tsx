
"use client";

import React from 'react';
import { useOpenPositionsContext } from '@/contexts/OpenPositionsContext';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface OpenPositionsCardProps {
    className?: string;
}

export function OpenPositionsCard({ className }: OpenPositionsCardProps) {
  const { openPositions, closePosition } = useOpenPositionsContext();

  return (
    <div className={cn("h-full flex flex-col", className)}>
        <ScrollArea className="flex-1">
            <Table>
                <TableBody>
                    {openPositions.length > 0 ? (
                        openPositions.map((position) => (
                            <TableRow key={position.id}>
                                <TableCell className="font-medium">{position.symbol}</TableCell>
                                <TableCell>{position.shares}</TableCell>
                                <TableCell>{`@ $${position.entryPrice.toFixed(2)}`}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => closePosition(position.id)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                No open positions.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </ScrollArea>
    </div>
  );
}
