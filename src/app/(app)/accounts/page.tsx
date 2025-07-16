
"use client";

import { useState, useMemo } from 'react';
import type { Stock, Account } from '@/types';
import { InteractiveChartCard } from '@/components/charts/InteractiveChartCard';
import { AccountCard } from '@/components/AccountCard';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

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
        netContributions: 150000,
        totalGains: 20000,
        marketGains: 18500,
        dividends: 1500,
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
        netContributions: 125000,
        totalGains: -5000,
        marketGains: -5000,
        dividends: 0,
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
    netContributions: mockAccounts.reduce((acc, curr) => acc + (curr.netContributions || 0), 0),
    totalGains: mockAccounts.reduce((acc, curr) => acc + (curr.totalGains || 0), 0),
    marketGains: mockAccounts.reduce((acc, curr) => acc + (curr.marketGains || 0), 0),
    dividends: mockAccounts.reduce((acc, curr) => acc + (curr.dividends || 0), 0),
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

const formatCurrency = (value?: number) => {
    if (value === undefined) return 'N/A';
    const sign = value < 0 ? '-' : '';
    return `${sign}$${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const AccountSummaryHeader = ({ account }: { account: Account }) => {
    const dailyPnl = account.pnl?.daily || 0;
    const isPositivePnl = dailyPnl >= 0;

    return (
        <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground">
                {formatCurrency(account.balance)}
            </h1>
            <div className="flex items-center text-base mt-2">
                <span className={cn("flex items-center", isPositivePnl ? "text-[hsl(var(--confirm-green))]" : "text-destructive")}>
                    {isPositivePnl ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                    {isPositivePnl ? '+' : ''}
                    {formatCurrency(dailyPnl)}
                </span>
                <span className={cn("ml-2 font-semibold", isPositivePnl ? "text-[hsl(var(--confirm-green))]" : "text-destructive")}>
                    ({isPositivePnl ? '+' : ''}{(account.pnl?.percent || 0).toFixed(2)}%)
                </span>
                <span className="text-muted-foreground ml-2">
                    Today
                </span>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 text-sm">
                <div className="flex flex-col">
                    <span className="text-muted-foreground">Net Contributions</span>
                    <span className="font-semibold text-foreground">{formatCurrency(account.netContributions)}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-muted-foreground">Total Gains/Losses</span>
                    <span className={cn("font-semibold", (account.totalGains || 0) >= 0 ? "text-[hsl(var(--confirm-green))]" : "text-destructive")}>{formatCurrency(account.totalGains)}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-muted-foreground">Market Gains</span>
                    <span className={cn("font-semibold", (account.marketGains || 0) >= 0 ? "text-[hsl(var(--confirm-green))]" : "text-destructive")}>{formatCurrency(account.marketGains)}</span>
                </div>
                 <div className="flex flex-col">
                    <span className="text-muted-foreground">Dividends</span>
                    <span className="font-semibold text-foreground">{formatCurrency(account.dividends)}</span>
                </div>
            </div>
        </div>
    );
};


export default function AccountsPage() {
    const [selectedAccount, setSelectedAccount] = useState<Account>(totalAccount);

    const chartData = useMemo(() => accountToStock(selectedAccount), [selectedAccount]);

    const handleTickerSubmit = (symbol: string) => {
        // This will be used in the future to switch between different account views
        console.log("Account view switched to:", symbol);
    };

    return (
        <main className="flex flex-col flex-1 h-full overflow-hidden p-4 md:p-6 lg:p-8 gap-4">
             <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
                 <div className="flex flex-col">
                    <AccountSummaryHeader account={selectedAccount} />
                    <InteractiveChartCard
                        stock={chartData}
                        onManualTickerSubmit={handleTickerSubmit}
                        variant="account"
                        className="flex-1 min-h-[400px]"
                    />
                 </div>
                 <div className="flex flex-col gap-4">
                    {allAccounts.map((account) => (
                            <AccountCard 
                                key={account.id}
                                account={account}
                                isSelected={selectedAccount.id === account.id}
                                onClick={() => setSelectedAccount(account)}
                            />
                    ))}
                 </div>
             </div>
        </main>
    );
}
