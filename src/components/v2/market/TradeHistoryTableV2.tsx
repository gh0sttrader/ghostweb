
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTradeHistoryContext } from "@/contexts/TradeHistoryContext";
import { format, parseISO } from 'date-fns';
import type { TradeHistoryEntry } from '@/types';
import { History } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TradeHistoryTableProps {
  className?: string;
  syncedTickerSymbol: string | null;
}

export function TradeHistoryTableV2({ className, syncedTickerSymbol }: TradeHistoryTableProps) {
  const { tradeHistory } = useTradeHistoryContext();
  
  const filteredHistory = React.useMemo(() => {
    const sortedHistory = [...tradeHistory].sort((a, b) => parseISO(b.filledTime).getTime() - parseISO(a.filledTime).getTime());
    if (syncedTickerSymbol) {
      return sortedHistory.filter(t => t.symbol === syncedTickerSymbol).slice(0, 20); // Show top 20 for symbol
    }
    return sortedHistory.slice(0, 20); // Show latest 20 overall
  }, [tradeHistory, syncedTickerSymbol]);

  return (
    <div className={cn("h-full flex flex-col", className)}>
      <div className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <Table className="table-fixed">
            <TableHeader className="sticky top-0 bg-card/[.05] backdrop-blur-md z-[1]">
              <TableRow>
                <TableHead className="text-xs h-7 px-2 text-left text-muted-foreground font-medium">Symbol</TableHead>
                <TableHead className="text-xs h-7 px-2 text-left text-muted-foreground font-medium">Side</TableHead>
                <TableHead className="text-xs h-7 px-2 text-right text-muted-foreground font-medium">Qty</TableHead>
                <TableHead className="text-xs h-7 px-2 text-right text-muted-foreground font-medium">Avg Price</TableHead>
                <TableHead className="text-xs h-7 px-2 text-left text-muted-foreground font-medium">Type</TableHead>
                <TableHead className="text-xs h-7 px-2 text-left text-muted-foreground font-medium">Time</TableHead>
                <TableHead className="text-xs h-7 px-2 text-left text-muted-foreground font-medium">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.length > 0 ? (
                  filteredHistory.map((trade) => (
                    <TableRow key={trade.id} className="text-xs hover:bg-white/5">
                      <TableCell className="px-2 py-1.5 font-bold text-left">{trade.symbol}</TableCell>
                      <TableCell className="px-2 py-1.5 font-bold text-left">{trade.side}</TableCell>
                      <TableCell className="px-2 py-1.5 text-right font-bold">{trade.totalQty}</TableCell>
                      <TableCell className="px-2 py-1.5 text-right font-bold">${trade.averagePrice.toFixed(2)}</TableCell>
                      <TableCell className="px-2 py-1.5 font-bold text-left">{trade.orderType}</TableCell>
                      <TableCell className="px-2 py-1.5 font-bold text-left">{format(parseISO(trade.filledTime), "HH:mm:ss")}</TableCell>
                      <TableCell className="px-2 py-1.5 font-bold text-left">{trade.orderStatus}</TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center text-xs py-8 px-3">
                            <History className="mx-auto h-8 w-8 mb-2 opacity-50 text-muted-foreground" />
                            <p className="text-muted-foreground text-center">
                                No trade history {syncedTickerSymbol ? `for ${syncedTickerSymbol}` : 'available'}.
                            </p>
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
