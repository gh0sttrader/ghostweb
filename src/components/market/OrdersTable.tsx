
"use client";

import React from 'react';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface OrdersTableProps {
    className?: string;
}

export function OrdersTable({ className }: OrdersTableProps) {
  // Mock data for open orders. In a real app, this would come from context or props.
  const openOrders = [
    { id: 'o1', symbol: 'NVDA', side: 'Buy', quantity: 10, type: 'Limit', price: 895.50, status: 'Working' },
    { id: 'o2', symbol: 'TSLA', side: 'Sell', quantity: 20, type: 'Stop', price: 175.00, status: 'Working' },
  ];

  return (
    <div className={cn("h-full flex flex-col", className)}>
        <ScrollArea className="flex-1">
            <Table>
                <TableBody>
                    {openOrders.length > 0 ? openOrders.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell>{order.symbol}</TableCell>
                            <TableCell>{order.side}</TableCell>
                            <TableCell>{order.quantity}</TableCell>
                            <TableCell>{order.type}</TableCell>
                            <TableCell className="text-right">{`$${order.price.toFixed(2)}`}</TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                No open orders.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </ScrollArea>
    </div>
  );
}
