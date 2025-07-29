
"use client";

import React from 'react';
import type { Stock } from '@/types';
import { cn } from '@/lib/utils';

interface TradeHistoryProps {
    stock: Stock | null;
    className?: string;
}

const historyData: { [key: string]: any[] } = {
    'AAPL': [
        { date: '07/29/2025', action: 'Buy', quantity: 10, price: '$170.10', status: 'Completed' },
        { date: '07/15/2025', action: 'Sell', quantity: 5, price: '$168.40', status: 'Completed' },
        { date: '07/01/2025', action: 'Buy', quantity: 20, price: '$165.00', status: 'Completed' },
        { date: '06/15/2025', action: 'Sell', quantity: 5, price: '$163.55', status: 'Completed' },
        { date: '06/01/2025', action: 'Buy', quantity: 10, price: '$160.70', status: 'Completed' },
    ],
    'QTUM': [
        { date: '07/28/2025', action: 'Buy', quantity: 100, price: '$63.50', status: 'Completed' },
        { date: '07/12/2025', action: 'Buy', quantity: 50, price: '$62.10', status: 'Completed' },
        { date: '06/25/2025', action: 'Sell', quantity: 75, price: '$64.00', status: 'Completed' },
        { date: '06/05/2025', action: 'Buy', quantity: 150, price: '$61.80', status: 'Completed' },
    ]
};

export function TradeHistory({ stock, className }: TradeHistoryProps) {
    const dataToShow = stock?.symbol ? historyData[stock.symbol] || historyData['AAPL'] : historyData['AAPL'];

    return (
        <section className={cn("bg-transparent", className)}>
          <h2 className="text-xl font-bold mb-4">History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm font-mono">
              <thead>
                <tr className="text-white/60">
                  <th className="text-left pb-2 pr-8 font-medium min-w-[100px]">Date</th>
                  <th className="text-left pb-2 pr-8 font-medium min-w-[80px]">Action</th>
                  <th className="text-left pb-2 pr-8 font-medium min-w-[80px]">Quantity</th>
                  <th className="text-left pb-2 pr-8 font-medium min-w-[100px]">Price</th>
                  <th className="text-left pb-2 font-medium min-w-[120px]">Status</th>
                </tr>
              </thead>
              <tbody className="text-white/80">
                {dataToShow.map((item, index) => (
                    <tr key={index} className="border-b border-white/10 last:border-b-0">
                      <td className="py-2 pr-8">{item.date}</td>
                      <td className="py-2 pr-8">{item.action}</td>
                      <td className="py-2 pr-8">{item.quantity}</td>
                      <td className="py-2 pr-8">{item.price}</td>
                      <td className="py-2 text-white/60">{item.status}</td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
    );
}
