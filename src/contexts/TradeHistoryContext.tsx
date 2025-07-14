
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { TradeHistoryEntry } from '@/types';

const initialHistory: TradeHistoryEntry[] = [
    { id: 'hist_aapl', symbol: 'AAPL', side: 'Buy', totalQty: 100, averagePrice: 168.30, orderType: 'Market', TIF: 'Day', tradingHours: 'Regular Market Hours Only', placedTime: '2024-07-29T13:10:22Z', filledTime: '2024-07-29T13:10:22Z', orderStatus: 'Filled', tradeModeOrigin: 'manual', accountId: 'acc_1' },
    { id: 'hist_msft', symbol: 'MSFT', side: 'Buy', totalQty: 50, averagePrice: 415.00, orderType: 'Limit', TIF: 'Day', tradingHours: 'Regular Market Hours Only', placedTime: '2024-07-29T13:15:41Z', filledTime: '2024-07-29T13:15:41Z', orderStatus: 'Filled', tradeModeOrigin: 'manual', accountId: 'acc_1' },
    { id: 'hist_tsla', symbol: 'TSLA', side: 'Sell', totalQty: 10, averagePrice: 179.00, orderType: 'Market', TIF: 'Day', tradingHours: 'Regular Market Hours Only', placedTime: '2024-07-29T13:25:33Z', filledTime: '2024-07-29T13:25:33Z', orderStatus: 'Filled', tradeModeOrigin: 'manual', accountId: 'acc_1' },
    { id: 'hist_nvda', symbol: 'NVDA', side: 'Buy', totalQty: 10, averagePrice: 898.00, orderType: 'Market', TIF: 'Day', tradingHours: 'Regular Market Hours Only', placedTime: '2024-07-29T13:30:19Z', filledTime: '2024-07-29T13:30:19Z', orderStatus: 'Filled', tradeModeOrigin: 'manual', accountId: 'acc_1' },
];

interface TradeHistoryContextType {
    tradeHistory: TradeHistoryEntry[];
    addTradeToHistory: (trade: TradeHistoryEntry) => void;
}

const TradeHistoryContext = createContext<TradeHistoryContextType | undefined>(undefined);

export const TradeHistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [tradeHistory, setTradeHistory] = useState<TradeHistoryEntry[]>(initialHistory);

    const addTradeToHistory = (trade: TradeHistoryEntry) => {
        setTradeHistory(prevHistory => [trade, ...prevHistory]);
    };

    return (
        <TradeHistoryContext.Provider value={{ tradeHistory, addTradeToHistory }}>
            {children}
        </TradeHistoryContext.Provider>
    );
};

export const useTradeHistoryContext = () => {
    const context = useContext(TradeHistoryContext);
    if (context === undefined) {
        throw new Error('useTradeHistoryContext must be used within a TradeHistoryProvider');
    }
    return context;
};
