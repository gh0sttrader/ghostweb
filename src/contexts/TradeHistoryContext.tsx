
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { TradeHistoryEntry } from '@/types';

interface TradeHistoryContextType {
    tradeHistory: TradeHistoryEntry[];
    addTradeToHistory: (trade: TradeHistoryEntry) => void;
}

const TradeHistoryContext = createContext<TradeHistoryContextType | undefined>(undefined);

export const TradeHistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [tradeHistory, setTradeHistory] = useState<TradeHistoryEntry[]>([]);

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
