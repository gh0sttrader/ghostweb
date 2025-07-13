
"use client";

import React, { useMemo } from 'react';
import { useTradeHistoryContext } from '@/contexts/TradeHistoryContext';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TradeHistoryTableProps {
    className?: string;
    syncedTickerSymbol?: string;
}

export function TradeHistoryTable({ className, syncedTickerSymbol }: TradeHistoryTableProps) {
  const { tradeHistory } = useTradeHistoryContext();

  const filteredHistory = useMemo(() => {
    if (!syncedTickerSymbol) return tradeHistory;
    return tradeHistory.filter(trade => trade.symbol === syncedTickerSymbol);
  }, [tradeHistory, syncedTickerSymbol]);

  return (
    <div className={cn("h-full flex flex-col", className)}>
        <ScrollArea className="flex-1">
            <Table>
                <TableBody>
                    {filteredHistory.length > 0 ? filteredHistory.map((trade) => (
                        <TableRow key={trade.id}>
                            <TableCell>
                                <Badge variant={trade.side === 'Buy' ? 'default' : 'destructive'} className={cn(trade.side === 'Buy' ? 'bg-green-500' : 'bg-red-500')}>{trade.side}</Badge>
                            </TableCell>
                            <TableCell>{trade.totalQty}</TableCell>
                            <TableCell>{`@ $${trade.averagePrice.toFixed(2)}`}</TableCell>
                            <TableCell className="text-right text-muted-foreground">{format(new Date(trade.filledTime), 'HH:mm:ss')}</TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                {syncedTickerSymbol ? `No trades for ${syncedTickerSymbol}.` : 'No trade history.'}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </ScrollArea>
    </div>
  );
}
