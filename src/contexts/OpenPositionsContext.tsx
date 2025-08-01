
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { OpenPosition, Account, OrderActionType } from '@/types';
import { useToast } from '@/hooks/use-toast';

// Mock accounts data
const initialAccounts: Account[] = [
    { id: 'acc_1', name: 'Individual', balance: 50000, buyingPower: 100000, settledCash: 45000 },
    { id: 'acc_2', name: 'Margin Account', balance: 120000, buyingPower: 120000, settledCash: 120000 },
];

const initialPositions: OpenPosition[] = [
    { id: 'pos_aapl', symbol: 'AAPL', entryPrice: 168.30, shares: 100, currentPrice: 170.34, origin: 'manual', accountId: 'acc_1', side: 'Long' },
    { id: 'pos_msft', symbol: 'MSFT', entryPrice: 415.00, shares: 50, currentPrice: 420.72, origin: 'manual', accountId: 'acc_1', side: 'Long' },
    { id: 'pos_tsla', symbol: 'TSLA', entryPrice: 181.01, shares: 20, currentPrice: 180.01, origin: 'manual', accountId: 'acc_1', side: 'Short' },
    { id: 'pos_nvda', symbol: 'NVDA', entryPrice: 898.00, shares: 10, currentPrice: 900.50, origin: 'manual', accountId: 'acc_1', side: 'Long' },
    { id: 'pos_qtum', symbol: 'QTUM', entryPrice: 63.00, shares: 100, currentPrice: 63.55, origin: 'manual', accountId: 'acc_1', side: 'Long' },
];

interface OpenPositionsContextType {
    openPositions: OpenPosition[];
    addOpenPosition: (position: Omit<OpenPosition, 'id' | 'currentPrice'>) => void;
    closePosition: (positionId: string) => void;
    accounts: Account[];
    selectedAccountId: string;
    setSelectedAccountId: (id: string) => void;
}

const OpenPositionsContext = createContext<OpenPositionsContextType | undefined>(undefined);

const ghostMessages = [
    "You just ghosted that position—boo yeah!",
    "Ghosted that trade—no strings attached!",
];

export const OpenPositionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [openPositions, setOpenPositions] = useState<OpenPosition[]>(initialPositions);
    const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
    const [selectedAccountId, setSelectedAccountId] = useState<string>(initialAccounts[0].id);
    const { toast } = useToast();

    const addOpenPosition = (position: Omit<OpenPosition, 'id' | 'currentPrice'>) => {
        const newPosition: OpenPosition = {
            ...position,
            id: `pos_${position.symbol}_${Date.now()}`,
            currentPrice: position.entryPrice,
        };
        setOpenPositions(prevPositions => [...prevPositions, newPosition]);
    };

    const closePosition = (positionId: string) => {
        const positionToClose = openPositions.find(p => p.id === positionId);
        if (positionToClose) {
            setOpenPositions(prevPositions => prevPositions.filter(p => p.id !== positionId));
            const randomMessage = ghostMessages[Math.floor(Math.random() * ghostMessages.length)];
            toast({
                title: `Closed ${positionToClose.symbol} Position`,
                description: randomMessage,
                duration: 2000,
                variant: 'success',
            });
        }
    };

    return (
        <OpenPositionsContext.Provider value={{ openPositions, addOpenPosition, closePosition, accounts, selectedAccountId, setSelectedAccountId }}>
            {children}
        </OpenPositionsContext.Provider>
    );
};

export const useOpenPositionsContext = () => {
    const context = useContext(OpenPositionsContext);
    if (context === undefined) {
        throw new Error('useOpenPositionsContext must be used within an OpenPositionsProvider');
    }
    return context;
};
