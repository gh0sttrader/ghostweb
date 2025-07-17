
"use client";

import { useState, useMemo } from 'react';
import type { Stock, Account, Holding } from '@/types';
import { InteractiveChartCard } from '@/components/charts/InteractiveChartCard';
import { AccountCard } from '@/components/AccountCard';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, PackageSearch } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from '@/components/ui/separator';

const mockHoldings: Holding[] = [
    { symbol: 'AAPL', name: 'Apple Inc.', logo: 'https://placehold.co/40x40.png', shares: 50, marketPrice: 170.34, unrealizedGain: 1250.75, totalValue: 8517 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', logo: 'https://placehold.co/40x40.png', shares: 20, marketPrice: 900.50, unrealizedGain: 500.20, totalValue: 18010 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', logo: 'https://placehold.co/40x40.png', shares: 30, marketPrice: 140.22, unrealizedGain: -150.10, totalValue: 4206.60 },
    { symbol: 'TSLA', name: 'Tesla, Inc.', logo: 'https://placehold.co/40x40.png', shares: 10, marketPrice: 180.01, unrealizedGain: 85.50, totalValue: 1800.10 },
];

const mockIraHoldings: Holding[] = [
    { symbol: 'MSFT', name: 'Microsoft Corp.', logo: 'https://placehold.co/40x40.png', shares: 100, marketPrice: 420.72, unrealizedGain: -500.50, totalValue: 42072 },
    { symbol: 'AMZN', name: 'Amazon.com, Inc.', logo: 'https://placehold.co/40x40.png', shares: 25, marketPrice: 183.63, unrealizedGain: 1200.00, totalValue: 4590.75 },
];

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
        holdings: mockHoldings,
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
        holdings: mockIraHoldings,
    },
];

const totalHoldings = [...mockHoldings, ...mockIraHoldings].reduce((acc, holding) => {
    const existing = acc.find(h => h.symbol === holding.symbol);
    if (existing) {
        existing.shares += holding.shares;
        existing.unrealizedGain += holding.unrealizedGain;
        existing.totalValue += holding.totalValue;
    } else {
        acc.push({ ...holding });
    }
    return acc;
}, [] as Holding[]);


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
    holdings: totalHoldings,
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

const formatCurrency = (value?: number, showSign = false) => {
    if (value === undefined) return 'N/A';
    const sign = value < 0 ? '-' : (showSign ? '+' : '');
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
                    {formatCurrency(dailyPnl, true)}
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

const HoldingsTable = ({ holdings }: { holdings: Holding[] }) => {
    if (!holdings || holdings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-16 text-muted-foreground rounded-2xl bg-card">
                <PackageSearch className="h-12 w-12 mb-4 opacity-30" />
                <p className="font-semibold">No holdings to display.</p>
                <p className="text-sm">Your portfolio positions will appear here.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-2xl bg-card">
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-white/10">
                        <TableHead className="py-3 px-6 text-left font-bold">Company</TableHead>
                        <TableHead className="py-3 px-6 text-center font-bold">Shares</TableHead>
                        <TableHead className="py-3 px-6 text-center font-bold">Market Price</TableHead>
                        <TableHead className="py-3 px-6 text-center font-bold">Unrealized Gain</TableHead>
                        <TableHead className="py-3 px-6 text-right font-bold">Total Value</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {holdings.map((holding) => (
                        <TableRow key={holding.symbol} className="transition-colors border-none hover:bg-white/5">
                            <TableCell className="flex items-center gap-4 py-3 px-6">
                                <Avatar>
                                    <AvatarImage src={holding.logo} alt={`${holding.name} logo`} />
                                    <AvatarFallback>{holding.symbol.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="font-semibold">{holding.symbol}</span>
                            </TableCell>
                            <TableCell className="text-center py-3 px-6">{holding.shares.toFixed(4)}</TableCell>
                            <TableCell className="text-center py-3 px-6">{formatCurrency(holding.marketPrice)}</TableCell>
                            <TableCell className={cn("text-center py-3 px-6", holding.unrealizedGain >= 0 ? 'text-[hsl(var(--confirm-green))]' : 'text-destructive')}>
                                {formatCurrency(holding.unrealizedGain, true)}
                            </TableCell>
                            <TableCell className="text-right py-3 px-6 font-semibold">{formatCurrency(holding.totalValue)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};


export default function AccountsPage() {
    const [selectedAccount, setSelectedAccount] = useState<Account>(totalAccount);

    const chartData = useMemo(() => accountToStock(selectedAccount), [selectedAccount]);

    const handleTickerSubmit = (symbol: string) => {
        console.log("Account view switched to:", symbol);
    };

    return (
        <main className="flex flex-col flex-1 h-full p-4 md:p-6 lg:p-8 space-y-8">
             <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8">
                 <div className="flex flex-col flex-1 min-h-0">
                    <AccountSummaryHeader account={selectedAccount} />
                    <InteractiveChartCard
                        stock={chartData}
                        onManualTickerSubmit={handleTickerSubmit}
                        variant="account"
                        className="flex-1"
                    />
                 </div>
                 <div className="flex flex-col gap-4 w-full max-w-sm">
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

             <section className="w-full">
                <Separator className="bg-border/20 mb-6" />
                <h2 className="text-white text-xl font-semibold mb-4">Holdings</h2>
                <HoldingsTable holdings={selectedAccount.holdings || []} />
             </section>
        </main>
    );
}
