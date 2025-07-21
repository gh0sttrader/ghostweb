
"use client";

import React, { useState, useMemo, useCallback } from 'react';
import type { Stock, Account, Holding } from '@/types';
import { InteractiveChartCard } from '@/components/charts/InteractiveChartCard';
import { cn } from '@/lib/utils';
import { PackageSearch, Calendar as CalendarIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format, addDays } from 'date-fns';
import { AnimatedCounter } from '@/components/AnimatedCounter';


const mockHoldings: Holding[] = [
    { symbol: 'AAPL', name: 'Apple Inc.', shares: 50, marketPrice: 170.34, unrealizedGain: 7340.00, totalValue: 8517, logo: 'https://placehold.co/40x40.png', dayPnl: 105.50, dayPnlPercent: 1.25, openPnlPercent: 17.2, averagePrice: 145.32 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', shares: 20, marketPrice: 900.50, unrealizedGain: 520.00, totalValue: 18010, logo: 'https://placehold.co/40x40.png', dayPnl: -63.10, dayPnlPercent: -0.35, openPnlPercent: 2.8, averagePrice: 875.49 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', shares: 30, marketPrice: 140.22, unrealizedGain: -146.10, totalValue: 4206.60, logo: 'https://placehold.co/40x40.png', dayPnl: 42.30, dayPnlPercent: 1.01, openPnlPercent: -3.4, averagePrice: 145.22 },
    { symbol: 'TSLA', name: 'Tesla, Inc.', shares: 10, marketPrice: 180.01, unrealizedGain: 410.15, totalValue: 1800.10, logo: 'https://placehold.co/40x40.png', dayPnl: 95.60, dayPnlPercent: 5.61, openPnlPercent: 5.0, averagePrice: 171.46 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', shares: 10, marketPrice: 420.72, unrealizedGain: -82.00, totalValue: 4207.20, logo: 'https://placehold.co/40x40.png', dayPnl: -21.00, dayPnlPercent: -0.50, openPnlPercent: -1.2, averagePrice: 425.72 },
    { symbol: 'AMZN', name: 'Amazon.com, Inc.', shares: 5, marketPrice: 183.63, unrealizedGain: 300.30, totalValue: 918.15, logo: 'https://placehold.co/40x40.png', dayPnl: 10.15, dayPnlPercent: 1.12, openPnlPercent: 35.4, averagePrice: 135.63 },
    { symbol: 'META', name: 'Meta Platforms, Inc.', shares: 15, marketPrice: 470.91, unrealizedGain: 1850.00, totalValue: 7063.65, logo: 'https://placehold.co/40x40.png', dayPnl: 150.00, dayPnlPercent: 2.17, openPnlPercent: 9.3, averagePrice: 430.91 },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.', shares: 25, marketPrice: 195.40, unrealizedGain: -50.00, totalValue: 4885, logo: 'https://placehold.co/40x40.png', dayPnl: -12.50, dayPnlPercent: -0.25, openPnlPercent: -2.0, averagePrice: 199.40 },
];

const mockIraHoldings: Holding[] = [
    { symbol: 'MSFT', name: 'Microsoft Corp.', shares: 100, marketPrice: 420.72, unrealizedGain: -500.50, totalValue: 42072, logo: 'https://placehold.co/40x40.png', dayPnl: -210.00, dayPnlPercent: -0.50, openPnlPercent: -1.2, averagePrice: 425.72 },
    { symbol: 'AMZN', name: 'Amazon.com, Inc.', shares: 25, marketPrice: 183.63, unrealizedGain: 1200.00, totalValue: 4590.75, logo: 'https://placehold.co/40x40.png', dayPnl: 50.75, dayPnlPercent: 1.12, openPnlPercent: 35.4, averagePrice: 135.63 },
];

const mockAccounts: Account[] = [
    {
        id: 'acc_1',
        name: 'Margin Account',
        balance: 170000,
        buyingPower: 100000,
        settledCash: 45000,
        pnl: { daily: 1250.75, weekly: 3400.20, percent: 1.2 },
        holdingsCount: 8,
        cash: 12450,
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
        cash: 73337.25,
        ytdReturn: -1.23,
        netContributions: 125000,
        totalGains: -5000,
        marketGains: -5000,
        dividends: 0,
        holdings: mockIraHoldings,
    },
];

const WATCHLIST = [
  { symbol: "TSLA", name: "Tesla Inc.", price: "920.30", change: "+1.54%", volume: "24.2M" },
  { symbol: "AAPL", name: "Apple Inc.", price: "170.34", change: "-0.85%", volume: "90.5M" },
  { symbol: "AMZN", name: "Amazon.com", price: "183.63", change: "+0.50%", volume: "45.7M" },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: "140.22", change: "+1.10%", volume: "40.8M" },
  { symbol: "MSFT", name: "Microsoft Corp.", price: "420.72", change: "-0.15%", volume: "60.2M" },
  { symbol: "META", name: "Meta Platforms", price: "470.91", change: "+2.01%", volume: "22.1M" },
  { symbol: "NVDA", name: "NVIDIA Corp.", price: "900.50", change: "+0.60%", volume: "75.3M" },
];


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

type Timeframe = "1W" | "1M" | "6M" | "YTD" | "1Y" | "Max" | "Custom";

const summaryData: Record<string, Record<Exclude<Timeframe, "Custom">, { gain: number; percent: number; period: string }>> = {
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
};

const AccountSummaryHeader = ({ account, onChartHover, onChartLeave }: { account: Account; onChartHover: (value: number | null) => void; onChartLeave: () => void; }) => {
    const [timeframe, setTimeframe] = useState<Timeframe>("6M");
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(2024, 0, 20),
        to: addDays(new Date(2024, 0, 20), 20),
    });

    // Simulate fetching data for a custom range
    const customRangeData = useMemo(() => {
        if (timeframe === 'Custom' && dateRange?.from && dateRange?.to) {
            // In a real app, you would fetch this data. For now, we generate it.
            const diffTime = Math.abs(dateRange.to.getTime() - dateRange.from.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const randomGain = (Math.random() - 0.5) * 1000 * (diffDays / 30);
            const randomPercent = (randomGain / account.balance) * 100;
            return {
                gain: randomGain,
                percent: randomPercent,
                period: 'Custom Range'
            };
        }
        return null;
    }, [timeframe, dateRange, account.balance]);

    const data = timeframe === 'Custom' ? customRangeData : summaryData[account.id]?.[timeframe] || summaryData.total[timeframe];
    const isPositive = data ? data.gain >= 0 : false;

    const timeframeButtons: { label: Exclude<Timeframe, "Custom">, value: Exclude<Timeframe, "Custom"> }[] = [
        { label: "1W", value: "1W" },
        { label: "1M", value: "1M" },
        { label: "6M", value: "6M" },
        { label: "YTD", value: "YTD" },
        { label: "1Y", value: "1Y" },
        { label: "Max", value: "Max" },
    ];

    const handleTimeframeChange = (value: Timeframe) => {
        setTimeframe(value);
        onChartLeave(); // Reset header value when timeframe changes
    };

    return (
        <div className="mb-8 min-h-[148px]">
            <div className="flex items-end gap-x-6 gap-y-2 flex-wrap">
                <AnimatedCounter value={account.balance} />
                {data && (
                    <div className="flex flex-col items-start pb-1">
                        <span className={cn("text-lg font-semibold", isPositive ? "text-[hsl(var(--confirm-green))]" : "text-destructive")}>
                            {isPositive ? "▲" : "▼"}
                            {formatCurrency(data.gain, true)}
                            &nbsp;({isPositive ? '+' : ''}{data.percent.toFixed(2)}%)
                        </span>
                        <span className="text-sm text-muted-foreground">{data.period}</span>
                    </div>
                )}
            </div>
            <div className="flex mt-8 gap-1 items-center">
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
                        onClick={() => handleTimeframeChange(value)}
                    >
                        {label}
                    </Button>
                ))}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"ghost"}
                            size="sm"
                            onClick={() => handleTimeframeChange("Custom")}
                            className={cn(
                                "w-auto justify-start text-left font-normal px-3 py-1 h-auto rounded-md text-sm transition-colors",
                                timeframe === 'Custom'
                                    ? "bg-neutral-800 font-bold text-white"
                                    : "text-muted-foreground hover:bg-neutral-800/50 hover:text-white"
                            )}
                        >
                            <CalendarIcon className="h-4 w-4" />
                            {timeframe === 'Custom' && dateRange?.from && (
                                <span className="ml-2">
                                    {dateRange.to ? (
                                        <>
                                            {format(dateRange.from, "LLL dd, y")} -{" "}
                                            {format(dateRange.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(dateRange.from, "LLL dd, y")
                                    )}
                                </span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
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

    const formatPercent = (value?: number) => {
        if (value === undefined || value === null) return 'N/A';
        const sign = value >= 0 ? '+' : '';
        return `${sign}${value.toFixed(2)}%`;
    };

    return (
        <div className="overflow-x-auto rounded-2xl bg-card">
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-white/10">
                        <TableHead className="py-3 px-6 text-left font-bold text-sm whitespace-nowrap">Ticker</TableHead>
                        <TableHead className="py-3 px-6 text-center font-bold text-sm whitespace-nowrap">Day’s P&L %</TableHead>
                        <TableHead className="py-3 px-6 text-center font-bold text-sm whitespace-nowrap">Open P&L %</TableHead>
                        <TableHead className="py-3 px-6 text-center font-bold text-sm whitespace-nowrap">Unrealized Gain/Loss</TableHead>
                        <TableHead className="py-3 px-6 text-center font-bold text-sm whitespace-nowrap">Market Value</TableHead>
                        <TableHead className="py-3 px-6 text-center font-bold text-sm whitespace-nowrap">Average Price</TableHead>
                        <TableHead className="py-3 px-6 text-center font-bold text-sm whitespace-nowrap">Current Price</TableHead>
                        <TableHead className="py-3 px-6 text-right font-bold text-sm whitespace-nowrap">Shares</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {holdings.map((holding) => (
                        <TableRow key={holding.symbol} className="transition-colors border-none hover:bg-white/5">
                            <TableCell className="py-3 px-6">
                                <span className="font-semibold">{holding.symbol}</span>
                            </TableCell>
                            <TableCell className={cn("text-center py-3 px-6", (holding.dayPnlPercent || 0) >= 0 ? 'text-[hsl(var(--confirm-green))]' : 'text-destructive')}>
                                {formatPercent(holding.dayPnlPercent)}
                            </TableCell>
                            <TableCell className={cn("text-center py-3 px-6", (holding.openPnlPercent || 0) >= 0 ? 'text-[hsl(var(--confirm-green))]' : 'text-destructive')}>
                                {formatPercent(holding.openPnlPercent)}
                            </TableCell>
                            <TableCell className={cn("text-center py-3 px-6 font-semibold", (holding.unrealizedGain || 0) >= 0 ? 'text-[hsl(var(--confirm-green))]' : 'text-destructive')}>
                                {formatCurrency(holding.unrealizedGain, true)}
                            </TableCell>
                            <TableCell className="text-center py-3 px-6 font-semibold">{formatCurrency(holding.totalValue)}</TableCell>
                            <TableCell className="text-center py-3 px-6">{formatCurrency(holding.averagePrice)}</TableCell>
                            <TableCell className="text-center py-3 px-6">{formatCurrency(holding.marketPrice)}</TableCell>
                            <TableCell className="text-right py-3 px-6">{holding.shares.toFixed(4)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

const AccountSelector = ({ accounts, selected, onSelect }: { accounts: Account[], selected: Account, onSelect: (account: Account) => void }) => {
    return (
        <div className="flex justify-start gap-8 mt-4">
            {accounts.map((acct) => (
                <button
                    key={acct.id}
                    className={cn(
                        "relative px-2 pb-2 text-lg tracking-wide transition-colors",
                        selected.id === acct.id
                            ? "text-white font-semibold after:absolute after:left-0 after:bottom-0 after:w-full after:h-0.5 after:bg-white after:rounded-full after:shadow-[0_0_8px_white]"
                            : "text-neutral-400 font-normal hover:text-white"
                    )}
                    onClick={() => onSelect(acct)}
                >
                    {acct.name}
                </button>
            ))}
        </div>
    );
};

const WatchlistTable = () => (
    <div className="overflow-x-auto rounded-2xl bg-card">
        <Table>
            <TableHeader>
                <TableRow className="border-b border-white/10">
                    <TableHead className="py-3 px-6 text-left font-bold">Symbol</TableHead>
                    <TableHead className="py-3 px-6 text-left font-bold">Name</TableHead>
                    <TableHead className="py-3 px-6 text-left font-bold">Price</TableHead>
                    <TableHead className="py-3 px-6 text-left font-bold">% Change</TableHead>
                    <TableHead className="py-3 px-6 text-right font-bold">Volume</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {WATCHLIST.map((stock) => (
                    <TableRow key={stock.symbol} className="transition-colors border-none hover:bg-white/5">
                        <TableCell className="py-2 px-6 font-semibold">{stock.symbol}</TableCell>
                        <TableCell className="py-2 px-6">{stock.name}</TableCell>
                        <TableCell className="py-2 px-6">{stock.price}</TableCell>
                        <TableCell className={cn("py-2 px-6", stock.change.startsWith('+') ? 'text-[hsl(var(--confirm-green))]' : 'text-destructive')}>
                            {stock.change}
                        </TableCell>
                        <TableCell className="py-2 px-6 text-right">{stock.volume}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
);

export default function AccountsPage() {
    const [selectedAccount, setSelectedAccount] = useState<Account>(mockAccounts[0]);
    const [headerValue, setHeaderValue] = useState<number>(mockAccounts[0].balance);

    const chartData = useMemo(() => accountToStock(selectedAccount), [selectedAccount]);

    const handleTickerSubmit = (symbol: string) => {
        console.log("Account view switched to:", symbol);
    };

    const handleChartHover = useCallback((value: number | null) => {
        if (value !== null) {
            setHeaderValue(value);
        }
    }, []);

    const handleChartLeave = useCallback(() => {
        setHeaderValue(selectedAccount.balance);
    }, [selectedAccount.balance]);

    // Update header value when selectedAccount changes
    React.useEffect(() => {
        setHeaderValue(selectedAccount.balance);
    }, [selectedAccount]);

    const securitiesValue = useMemo(() => {
        return selectedAccount.holdings?.reduce((acc, holding) => acc + holding.totalValue, 0) || 0;
    }, [selectedAccount.holdings]);


    return (
        <main className="flex flex-col w-full max-w-6xl mx-auto px-8 py-4 md:py-6 lg:py-8 2xl:max-w-7xl 2xl:px-16">
            <div className="flex-shrink-0 h-[45vh] min-h-[375px] flex flex-col">
                <AccountSummaryHeader
                    account={{ ...selectedAccount, balance: headerValue }}
                    onChartHover={handleChartHover}
                    onChartLeave={handleChartLeave}
                />
                <InteractiveChartCard
                    stock={chartData}
                    onManualTickerSubmit={handleTickerSubmit}
                    onChartHover={handleChartHover}
                    onChartLeave={handleChartLeave}
                    variant="account"
                    className="flex-1 min-h-0"
                />
            </div>

            <div className="flex-1 flex flex-col mt-4">
                <div className="flex items-center h-16 flex-shrink-0">
                    <AccountSelector accounts={mockAccounts} selected={selectedAccount} onSelect={setSelectedAccount} />
                </div>
                
                <section className="w-full">
                    <Separator className="bg-border/20 mb-6" />
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-white text-xl font-semibold">Holdings</h2>
                      <div className="flex items-center gap-x-6 text-sm text-muted-foreground">
                          <span>
                              Account Value: <span className="font-semibold text-foreground">{formatCurrency(selectedAccount.balance)}</span>
                          </span>
                          <span className="h-4 w-px bg-border/20" />
                          <span>
                              Securities: <span className="font-semibold text-foreground">{formatCurrency(securitiesValue)}</span>
                          </span>
                          <span className="h-4 w-px bg-border/20" />
                          <span>
                              Cash: <span className="font-semibold text-foreground">{formatCurrency(selectedAccount.cash)}</span>
                          </span>
                      </div>
                    </div>
                    <HoldingsTable holdings={selectedAccount.holdings || []} />
                </section>
                <section className="w-full mt-10">
                    <h2 className="text-white text-xl font-semibold mb-4">Watchlist</h2>
                    <WatchlistTable />
                </section>
                
                <div className="h-12 flex-shrink-0" />
            </div>
        </main>
    );
}

    