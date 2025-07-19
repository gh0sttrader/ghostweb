
"use client";

import { useState, useMemo } from 'react';
import type { Stock, Account, Holding } from '@/types';
import { InteractiveChartCard } from '@/components/charts/InteractiveChartCard';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, PackageSearch } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

const mockHoldings: Holding[] = [
    { symbol: 'AAPL', name: 'Apple Inc.', shares: 50, marketPrice: 170.34, unrealizedGain: 1250.75, totalValue: 8517, logo: 'https://placehold.co/40x40.png' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', shares: 20, marketPrice: 900.50, unrealizedGain: 500.20, totalValue: 18010, logo: 'https://placehold.co/40x40.png' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', shares: 30, marketPrice: 140.22, unrealizedGain: -150.10, totalValue: 4206.60, logo: 'https://placehold.co/40x40.png' },
    { symbol: 'TSLA', name: 'Tesla, Inc.', shares: 10, marketPrice: 180.01, unrealizedGain: 85.50, totalValue: 1800.10, logo: 'https://placehold.co/40x40.png' },
];

const mockIraHoldings: Holding[] = [
    { symbol: 'MSFT', name: 'Microsoft Corp.', shares: 100, marketPrice: 420.72, unrealizedGain: -500.50, totalValue: 42072, logo: 'https://placehold.co/40x40.png' },
    { symbol: 'AMZN', name: 'Amazon.com, Inc.', shares: 25, marketPrice: 183.63, unrealizedGain: 1200.00, totalValue: 4590.75, logo: 'https://placehold.co/40x40.png' },
];

const mockAccounts: Account[] = [
    { 
        id: 'acc_1', 
        name: 'Margin Account', 
        balance: 170000, 
        buyingPower: 100000, 
        settledCash: 45000, 
        pnl: { daily: 1250.75, weekly: 3400.20, percent: 1.2 },
        holdingsCount: 4,
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
        holdingsCount: 2,
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

type Timeframe = "1W" | "1M" | "6M" | "YTD" | "1Y" | "Max";

const summaryData: Record<string, Record<Timeframe, { gain: number; percent: number; period: string }>> = {
    total: {
        "1W": { gain: -1817.62, percent: -0.63, period: "Past week" },
        "1M": { gain: 2000, percent: 0.70, period: "Past month" },
        "6M": { gain: 15000, percent: 5.45, period: "Past 6 months" },
        "YTD": { gain: 18500, percent: 6.81, period: "Year to date" },
        "1Y": { gain: 35000, percent: 13.83, period: "Past year" },
        "Max": { gain: 75000, percent: 34.88, period: "All time" },
    },
    acc_1: {
        "1W": { gain: -1000, percent: -0.58, period: "Past week" },
        "1M": { gain: 1500, percent: 0.88, period: "Past month" },
        "6M": { gain: 8000, percent: 4.93, period: "Past 6 months" },
        "YTD": { gain: 10000, percent: 6.25, period: "Year to date" },
        "1Y": { gain: 20000, percent: 13.33, period: "Past year" },
        "Max": { gain: 40000, percent: 30.77, period: "All time" },
    },
    acc_2: {
        "1W": { gain: -817.62, percent: -0.68, period: "Past week" },
        "1M": { gain: 500, percent: 0.42, period: "Past month" },
        "6M": { gain: 7000, percent: 6.19, period: "Past 6 months" },
        "YTD": { gain: 8500, percent: 7.56, period: "Year to date" },
        "1Y": { gain: 15000, percent: 14.28, period: "Past year" },
        "Max": { gain: 35000, percent: 41.18, period: "All time" },
    }
}

const AccountSummaryHeader = ({ account }: { account: Account }) => {
    const [timeframe, setTimeframe] = useState<Timeframe>("6M");
    const data = summaryData[account.id]?.[timeframe] || summaryData.total[timeframe];
    const isPositive = data.gain >= 0;

    const timeframeButtons: { label: Timeframe, value: Timeframe }[] = [
        { label: "1W", value: "1W" },
        { label: "1M", value: "1M" },
        { label: "6M", value: "6M" },
        { label: "YTD", value: "YTD" },
        { label: "1Y", value: "1Y" },
        { label: "Max", value: "Max" },
    ];

    return (
        <div className="mb-8 min-h-[148px]">
            <div className="flex items-end gap-x-6 gap-y-2 flex-wrap">
                <h1 className="text-5xl font-bold text-white">
                    {formatCurrency(account.balance)}
                </h1>
                <div className="flex flex-col items-start pb-1">
                     <span className={cn("text-lg font-semibold", isPositive ? "text-[hsl(var(--confirm-green))]" : "text-destructive")}>
                        {isPositive ? "▲" : "▼"}
                        {formatCurrency(data.gain, true)}
                        &nbsp;({isPositive ? '+' : ''}{data.percent.toFixed(2)}%)
                    </span>
                    <span className="text-sm text-muted-foreground">{data.period}</span>
                </div>
            </div>
            <div className="flex mt-8 gap-1">
                 {timeframeButtons.map(({ label, value }) => (
                    <Button
                        key={value}
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "px-3 py-1 h-auto rounded-md text-sm transition-colors",
                            timeframe === value
                                ? "bg-neutral-800 font-bold text-white"
                                : "text-muted-foreground hover:bg-neutral-800/50 hover:text-white"
                        )}
                        onClick={() => setTimeframe(value)}
                    >
                        {label}
                    </Button>
                ))}
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
                            <TableCell className="py-3 px-6">
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

const AccountSelector = ({ accounts, selected, onSelect }: { accounts: Account[], selected: Account, onSelect: (account: Account) => void }) => {
  return (
    <div className="flex items-center gap-2 mt-6 mb-3 p-1 rounded-full bg-neutral-900 border border-neutral-800 w-min">
      {accounts.map((acct) => (
        <Button
          key={acct.id}
          variant="ghost"
          size="sm"
          className={cn(
            "px-5 py-1.5 h-auto rounded-full text-sm font-medium transition-all duration-300",
            selected.id === acct.id
              ? "bg-foreground text-background shadow-md shadow-white/10"
              : "bg-transparent text-muted-foreground hover:bg-neutral-800 hover:text-foreground"
          )}
          onClick={() => onSelect(acct)}
        >
          {acct.name}
        </Button>
      ))}
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
        <main className="flex flex-col flex-1 h-full p-4 md:p-6 lg:p-8">
            {/* Top Section (Fixed Height) */}
            <div className="flex-shrink-0 h-[60vh] min-h-[500px] flex flex-col">
                <AccountSummaryHeader account={selectedAccount} />
                <InteractiveChartCard
                    stock={chartData}
                    onManualTickerSubmit={handleTickerSubmit}
                    variant="account"
                    className="flex-1 min-h-0"
                />
            </div>

            {/* Bottom Section (Scrollable) */}
            <div className="flex-1 flex flex-col min-h-0 mt-4">
                <div className="flex items-center h-16 flex-shrink-0">
                    <AccountSelector accounts={allAccounts} selected={selectedAccount} onSelect={setSelectedAccount} />
                </div>
                <ScrollArea className="flex-1">
                    <section className="w-full pr-4">
                        <Separator className="bg-border/20 mb-6" />
                        <h2 className="text-white text-xl font-semibold mb-4">Holdings</h2>
                        <HoldingsTable holdings={selectedAccount.holdings || []} />
                    </section>
                </ScrollArea>
            </div>
        </main>
    );
}

    