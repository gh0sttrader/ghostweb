
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { OpenPosition, Account } from '@/types';

// Mock accounts data
const initialAccounts: Account[] = [
    { id: 'acc_1', name: 'Margin Account', balance: 50000 },
    { id: 'acc_2', name: 'IRA Account', balance: 120000 },
];

interface OpenPositionsContextType {
    openPositions: OpenPosition[];
    addOpenPosition: (position: OpenPosition) => void;
    closePosition: (positionId: string) => void;
    accounts: Account[];
    selectedAccountId: string;
    setSelectedAccountId: (id: string) => void;
}

const OpenPositionsContext = createContext<OpenPositionsContextType | undefined>(undefined);

export const OpenPositionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [openPositions, setOpenPositions] = useState<OpenPosition[]>([]);
    const [accounts] = useState<Account[]>(initialAccounts);
    const [selectedAccountId, setSelectedAccountId] = useState<string>(initialAccounts[0].id);

    const addOpenPosition = (position: OpenPosition) => {
        setOpenPositions(prevPositions => [...prevPositions, position]);
    };

    const closePosition = (positionId: string) => {
        setOpenPositions(prevPositions => prevPositions.filter(p => p.id !== positionId));
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
