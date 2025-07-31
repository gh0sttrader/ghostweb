
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
            <table className="w-full text-sm table-fixed">
              <thead>
                <tr className="text-white/60 border-b border-white/10">
                  <th className="text-left py-2 px-4 font-normal">Date</th>
                  <th className="text-left py-2 px-4 font-normal">Action</th>
                  <th className="text-left py-2 px-4 font-normal">Quantity</th>
                  <th className="text-left py-2 px-4 font-normal">Price</th>
                  <th className="text-left py-2 px-4 font-normal">Status</th>
                </tr>
              </thead>
              <tbody>
                {dataToShow.map((item, index) => (
                    <tr key={index} className="border-b border-white/10 last:border-b-0">
                      <td className="py-2 px-4 text-white/80 font-normal">{item.date}</td>
                      <td className="py-2 px-4 text-white/80 font-normal">{item.action}</td>
                      <td className="py-2 px-4 text-white/80 font-normal">{item.quantity}</td>
                      <td className="py-2 px-4 text-white/80 font-normal">{item.price}</td>
                      <td className="py-2 px-4 text-white/60 font-normal">{item.status}</td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
    );
}
