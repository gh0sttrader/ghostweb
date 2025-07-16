
"use client";

import { useState, useMemo } from 'react';
import type { Stock, Account } from '@/types';
import { InteractiveChartCard } from '@/components/charts/InteractiveChartCard';
import { AccountCard } from '@/components/AccountCard';

const mockAccounts: Account[] = [
    { 
        id: 'acc_1', 
        name: 'Margin Account', 
        balance: 170000, 
        buyingPower: 100000, 
        settledCash: 45000, 
        pnl: { daily: 1250.75, weekly: 3400.20, percent: 1.2 },
        holdingsCount: 15,
        cash: 5000,
        ytdReturn: 4.56,
    },
    { 
        id: 'acc_2', 
        name: 'IRA Account', 
        balance: 120000, 
        buyingPower: 120000, 
        settledCash: 120000, 
        pnl: { daily: -500.50, weekly: 1200.00, percent: -0.4 },
        holdingsCount: 8,
        cash: 120000,
        ytdReturn: -1.23,
    },
];

const totalAccount: Account = {
    id: 'total',
    name: 'Total',
    balance: mockAccounts.reduce((acc, curr) => acc + curr.balance, 0),
    buyingPower: mockAccounts.reduce((acc, curr) => acc + curr.buyingPower, 0),
    settledCash: mockAccounts.reduce((acc, curr) => acc + curr.settledCash, 0),
    pnl: {
        daily: mockAccounts.reduce((acc, curr) => acc + (curr.pnl?.daily || 0), 0),
        weekly: mockAccounts.reduce((acc, curr) => acc + (curr.pnl?.weekly || 0), 0),
        percent: 0.75
    },
    holdingsCount: mockAccounts.reduce((acc, curr) => acc + (curr.holdingsCount || 0), 0),
    cash: mockAccounts.reduce((acc, curr) => acc + (curr.cash || 0), 0),
    ytdReturn: mockAccounts.reduce((acc, curr) => acc + (curr.ytdReturn || 0), 0) / mockAccounts.length, // Average return for total
};

const allAccounts = [totalAccount, ...mockAccounts];

const accountToStock = (account: Account): Stock => ({
    id: account.id,
    symbol: account.name.toUpperCase().replace(' ', '_'),
    price: account.balance,
    changePercent: account.pnl?.percent || 0,
    // Generate some mock historical data based on the balance
    historicalPrices: Array.from({ length: 30 }, (_, i) => {
        let price = account.balance;
        for (let j = 0; j < 30 - i; j++) {
            price /= (1 + (Math.random() - 0.49) * 0.01);
        }
        return price;
    }),
});


export default function AccountsPage() {
    const [selectedAccount, setSelectedAccount] = useState<Account>(totalAccount);

    const chartData = useMemo(() => accountToStock(selectedAccount), [selectedAccount]);

    const handleTickerSubmit = (symbol: string) => {
        // This will be used in the future to switch between different account views
        console.log("Account view switched to:", symbol);
    };

    return (
        <main className="flex flex-col flex-1 h-full overflow-hidden p-4 md:p-6 gap-4">
             <InteractiveChartCard
                stock={chartData}
                onManualTickerSubmit={handleTickerSubmit}
                variant="account"
                className="h-[64vh]"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {allAccounts.map((account) => (
                    <AccountCard 
                        key={account.id}
                        account={account}
                        isSelected={selectedAccount.id === account.id}
                        onClick={() => setSelectedAccount(account)}
                    />
               ))}
            </div>
        </main>
    );
}
