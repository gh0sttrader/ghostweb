
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PackageSearch, XCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import type { OrderActionType, OrderSystemType } from '@/types';

interface OpenOrder {
    id: string;
    action: 'Buy' | 'Sell' | 'Short' | 'Cover';
    symbol: string;
    side: 'Buy' | 'Sell';
    quantity: number;
    orderType: OrderSystemType;
    limitPrice?: number;
    status: 'Pending' | 'Executed' | 'Canceled';
    time: string;
}

const dummyOpenOrders: OpenOrder[] = [
    { id: 'ord_1', action: 'Buy', symbol: 'GOOGL', side: 'Buy', quantity: 10, orderType: 'Limit', limitPrice: 140.00, status: 'Pending', time: '09:42:11 AM' },
    { id: 'ord_2', action: 'Sell', symbol: 'AAPL', side: 'Sell', quantity: 50, orderType: 'Stop', limitPrice: 168.00, status: 'Pending', time: '10:02:30 AM' },
    { id: 'ord_3', action: 'Short', symbol: 'TSLA', side: 'Sell', quantity: 10, orderType: 'Market', status: 'Pending', time: '10:15:50 AM' },
];


interface OrdersTableProps {
  className?: string;
}

const getSideBadgeClass = (side: OpenOrder['side']) => {
    switch(side) {
        case 'Buy': return 'bg-[hsl(var(--confirm-green))] text-[hsl(var(--confirm-green-foreground))] hover:bg-[hsl(var(--confirm-green))]/90';
        case 'Sell': return 'bg-destructive text-destructive-foreground hover:bg-destructive/90';
        default: return 'bg-secondary';
    }
}

export function OrdersTableV2({ className }: OrdersTableProps) {
  const [openOrders, setOpenOrders] = React.useState(dummyOpenOrders);

  const cancelOrder = (id: string) => {
      setOpenOrders(prev => prev.filter(order => order.id !== id));
  }

  return (
    <div className={cn("h-full flex flex-col", className)}>
      <div className="p-0 flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="shrink-0">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-[1]">
                <TableRow>
                  <TableHead className="text-xs h-7 px-2 text-center text-muted-foreground font-medium w-16">Action</TableHead>
                  <TableHead className="text-xs h-7 px-2 text-left text-muted-foreground font-medium">Symbol</TableHead>
                  <TableHead className="text-xs h-7 px-2 text-left text-muted-foreground font-medium">Side</TableHead>
                  <TableHead className="text-xs h-7 px-2 text-right text-muted-foreground font-medium">Qty</TableHead>
                  <TableHead className="text-xs h-7 px-2 text-left text-muted-foreground font-medium">Order Type</TableHead>
                  <TableHead className="text-xs h-7 px-2 text-right text-muted-foreground font-medium">Limit/Stop</TableHead>
                  <TableHead className="text-xs h-7 px-2 text-left text-muted-foreground font-medium">Status</TableHead>
                  <TableHead className="text-xs h-7 px-2 text-left text-muted-foreground font-medium">Time</TableHead>
                </TableRow>
              </TableHeader>
            </Table>
          </div>
          <ScrollArea className="flex-1">
            <Table>
              <TableBody>
                {openOrders.length > 0 ? (
                  openOrders.map((order) => (
                      <TableRow key={order.id} className="text-xs hover:bg-white/5">
                          <TableCell className="px-2 py-1.5 text-center w-16">
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => cancelOrder(order.id)}>
                                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                          </TableCell>
                          <TableCell className="px-2 py-1.5 font-bold text-left">{order.symbol}</TableCell>
                          <TableCell className="px-2 py-1.5 text-left">
                              <Badge className={cn("border-transparent text-xs px-1.5 py-px h-auto", getSideBadgeClass(order.side))}>
                                  {order.side}
                              </Badge>
                          </TableCell>
                          <TableCell className="px-2 py-1.5 text-right font-bold">{order.quantity}</TableCell>
                          <TableCell className="px-2 py-1.5 text-left font-bold">{order.orderType}</TableCell>
                          <TableCell className="px-2 py-1.5 text-right font-bold">{order.limitPrice ? `$${order.limitPrice.toFixed(2)}` : '—'}</TableCell>
                          <TableCell className="px-2 py-1.5 text-left font-bold text-yellow-400">{order.status}</TableCell>
                          <TableCell className="px-2 py-1.5 text-left font-bold">{order.time}</TableCell>
                      </TableRow>
                  ))
                ) : (
                  <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                         <div className="flex flex-col items-center justify-center text-xs py-8 px-3">
                          <PackageSearch className="mx-auto h-8 w-8 mb-2 opacity-50 text-muted-foreground" />
                          <p className="text-muted-foreground text-center">No open orders currently.</p>
                        </div>
                      </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
