
"use client";

import React, { useState, useMemo, useCallback } from 'react';
import type { Stock, Account, Holding } from '@/types';
import { InteractiveChartCard } from '@/components/charts/InteractiveChartCard';
import { cn } from '@/lib/utils';
import { PackageSearch, Calendar as CalendarIcon, ChevronDown, Search, TrendingUp } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format, addDays, parse } from 'date-fns';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


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

const WATCHLISTS = {
  "Main Watchlist": [
    { symbol: "TSLA", name: "Tesla Inc.", price: "920.30", change: "+1.54%", volume: "24.2M" },
    { symbol: "AAPL", name: "Apple Inc.", price: "170.34", change: "-0.85%", volume: "90.5M" },
    { symbol: "AMZN", name: "Amazon.com", price: "183.63", change: "+0.50%", volume: "45.7M" },
    { symbol: "GOOGL", name: "Alphabet Inc.", price: "140.22", change: "+1.10%", volume: "40.8M" },
    { symbol: "MSFT", name: "Microsoft Corp.", price: "420.72", change: "-0.15%", volume: "60.2M" },
    { symbol: "META", name: "Meta Platforms", price: "470.91", change: "+2.01%", volume: "22.1M" },
    { symbol: "NVDA", name: "NVIDIA Corp.", price: "900.50", change: "+0.60%", volume: "75.3M" },
  ],
  "Tech Stocks": [
    { symbol: "AAPL", name: "Apple Inc.", price: "170.34", change: "-0.85%", volume: "90.5M" },
    { symbol: "MSFT", name: "Microsoft Corp.", price: "420.72", change: "-0.15%", volume: "60.2M" },
    { symbol: "NVDA", name: "NVIDIA Corp.", price: "900.50", change: "+0.60%", volume: "75.3M" },
    { symbol: "GOOGL", name: "Alphabet Inc.", price: "140.22", change: "+1.10%", volume: "40.8M" },
    { symbol: "AMD", name: "AMD", price: "160.25", change: "+1.50%", volume: "55.8M" },
    { symbol: "CRM", name: "Salesforce", price: "242.00", change: "-2.50%", volume: "7.8M" },
  ],
  "Dividend Picks": [
    { symbol: "JPM", name: "JPMorgan Chase", price: "195.40", change: "-0.25%", volume: "15.3M" },
    { symbol: "KO", name: "Coca-Cola", price: "62.75", change: "+0.10%", volume: "14.9M" },
    { symbol: "PFE", name: "Pfizer Inc.", price: "28.50", change: "-0.90%", volume: "35.1M" },
    { symbol: "XOM", name: "Exxon Mobil", price: "113.20", change: "-2.10%", volume: "20.3M" },
  ],
};


const TRANSACTIONS = [
    { date: "07/22/2025", type: "Buy", symbol: "AAPL", name: "Apple Inc.", shares: "10", price: "$170.34", amount: "$1,703.40" },
    { date: "07/21/2025", type: "Dividend", symbol: "MSFT", name: "Microsoft Corp.", shares: "—", price: "—", amount: "$25.00" },
    { date: "07/20/2025", type: "Sell", symbol: "AMD", name: "AMD Inc.", shares: "15", price: "$162.10", amount: "$2,431.50" },
    { date: "07/19/2025", type: "Transfer", symbol: "—", name: "Deposit", shares: "—", price: "—", amount: "$5,000.00" },
    { date: "07/18/2025", type: "Buy", symbol: "GOOGL", name: "Alphabet Inc.", shares: "5", price: "$139.80", amount: "$699.00" },
    { date: "07/17/2025", type: "Withdrawal", symbol: "—", name: "ACH Transfer", shares: "—", price: "—", amount: "-$1,000.00" },
    { date: "07/16/2025", type: "Buy", symbol: "TSLA", name: "Tesla, Inc.", shares: "2", price: "$178.50", amount: "$357.00" },
    { date: "07/15/2025", type: "Dividend", symbol: "JPM", name: "JPMorgan Chase & Co.", shares: "—", price: "—", amount: "$15.75" },
    { date: "07/14/2025", type: "Buy", symbol: "NVDA", name: "NVIDIA Corp.", shares: "1", price: "$899.10", amount: "$899.10" },
    { date: "07/13/2025", type: "Transfer", symbol: "—", name: "Wire Transfer In", shares: "—", price: "—", amount: "$10,000.00" },
    { date: "07/12/2025", type: "Sell", symbol: "META", name: "Meta Platforms, Inc.", shares: "5", price: "$475.00", amount: "$2,375.00" },
    { date: "07/11/2025", type: "Buy", symbol: "AMZN", name: "Amazon.com, Inc.", shares: "3", price: "$182.50", amount: "$547.50" },
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
    if (value === undefined || value === null) return 'N/A';
    const sign = value < 0 ? '-' : (showSign ? '+' : '');
    const formattedValue = Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${sign}$${formattedValue}`;
}

const AccountStat = ({ label, value, valueColor = 'text-white' }: { label: string; value: string; valueColor?: string; }) => (
    <div className="flex flex-col text-right md:text-left">
        <span className="text-xs text-neutral-400 uppercase tracking-wider">{label}</span>
        <p className={cn("text-xl font-semibold", valueColor)}>{value}</p>
    </div>
);


const AccountSummaryHeader = ({ account, onChartHover, onChartLeave }: { account: Account; onChartHover: (value: number | null) => void; onChartLeave: () => void; }) => {
    
    const allTimeGains = (account.totalGains || 0);
    const allTimePercent = account.netContributions ? (allTimeGains / account.netContributions) * 100 : 0;
    const isPositive = allTimeGains >= 0;

    return (
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-8">
            {/* Left Side: Main Balance and Gain/Loss */}
            <div className="flex flex-col">
                <h1 className="text-6xl font-bold text-white">
                    <AnimatedCounter value={account.balance} />
                </h1>
                <div className="flex items-center gap-2 mt-2">
                    {isPositive ? <TrendingUp className="text-green-500" size={20} /> : <TrendingUp className="text-destructive rotate-180" size={20} />}
                    <span className={cn("text-xl font-semibold", isPositive ? "text-green-500" : "text-destructive")}>
                        {formatCurrency(allTimeGains, true)} ({isPositive ? '+' : ''}{allTimePercent.toFixed(2)}%)
                    </span>
                    <span className="text-lg text-neutral-400">All time</span>
                </div>
            </div>

            {/* Right Side: Detailed stats */}
            <div className="flex flex-row flex-wrap justify-end gap-x-8 gap-y-4">
                <AccountStat label="Cash Balance" value={formatCurrency(account.cash)} />
                <AccountStat label="Net Contributions" value={formatCurrency(account.netContributions)} />
                <AccountStat label="Total Gains" value={formatCurrency(account.totalGains)} valueColor={(account.totalGains || 0) >= 0 ? "text-green-400" : "text-destructive"} />
                <AccountStat label="Market Gains" value={formatCurrency(account.marketGains)} valueColor={(account.marketGains || 0) >= 0 ? "text-green-400" : "text-destructive"} />
                <AccountStat label="Dividends" value={formatCurrency(account.dividends)} valueColor={(account.dividends || 0) >= 0 ? "text-green-400" : "text-destructive"} />
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
                            ? "text-white font-semibold"
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

const WatchlistTable = ({ list }: { list: typeof WATCHLISTS[keyof typeof WATCHLISTS] }) => (
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
                {list.map((stock) => (
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

const TransactionsTable = ({ transactions }: { transactions: typeof TRANSACTIONS }) => (
    <div className="overflow-x-auto rounded-2xl bg-card">
        <Table>
            <TableHeader>
                <TableRow className="border-b border-white/10">
                    <TableHead className="py-3 px-6 text-left font-bold">Date</TableHead>
                    <TableHead className="py-3 px-6 text-left font-bold">Type</TableHead>
                    <TableHead className="py-3 px-6 text-left font-bold">Symbol</TableHead>
                    <TableHead className="py-3 px-6 text-left font-bold">Name</TableHead>
                    <TableHead className="py-3 px-6 text-right font-bold">Shares</TableHead>
                    <TableHead className="py-3 px-6 text-right font-bold">Price</TableHead>
                    <TableHead className="py-3 px-6 text-right font-bold">Amount</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {transactions.map((tx, index) => (
                    <TableRow key={index} className="transition-colors border-none hover:bg-white/5">
                        <TableCell className="py-2 px-6">{tx.date}</TableCell>
                        <TableCell className="py-2 px-6">{tx.type}</TableCell>
                        <TableCell className="py-2 px-6 font-semibold">{tx.symbol}</TableCell>
                        <TableCell className="py-2 px-6">{tx.name}</TableCell>
                        <TableCell className="py-2 px-6 text-right">{tx.shares}</TableCell>
                        <TableCell className="py-2 px-6 text-right">{tx.price}</TableCell>
                        <TableCell className={cn("py-2 px-6 text-right font-semibold", tx.amount.startsWith('$') && !tx.amount.startsWith('-$') ? 'text-[hsl(var(--confirm-green))]' : 'text-destructive')}>{tx.amount}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
);


export default function AccountsPage() {
    const [selectedAccount, setSelectedAccount] = useState<Account>(mockAccounts[0]);
    const [headerValue, setHeaderValue] = useState<number>(mockAccounts[0].balance);

    const [transactionType, setTransactionType] = useState('all');
    const [transactionDate, setTransactionDate] = useState<DateRange | undefined>();
    const [transactionSearch, setTransactionSearch] = useState('');
    const [isTransactionsExpanded, setIsTransactionsExpanded] = useState(false);
    
    const [selectedWatchlist, setSelectedWatchlist] = useState<keyof typeof WATCHLISTS>("Main Watchlist");
    const [isWatchlistPopoverOpen, setIsWatchlistPopoverOpen] = useState(false);

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
    
    const transactionTypes = useMemo(() => ['all', ...Array.from(new Set(TRANSACTIONS.map(tx => tx.type)))], []);

    const filteredTransactions = useMemo(() => {
        return TRANSACTIONS.filter(tx => {
            const typeMatch = transactionType === 'all' || tx.type.toLowerCase() === transactionType.toLowerCase();

            const dateMatch = !transactionDate?.from || (
                new Date(parse(tx.date, 'MM/dd/yyyy', new Date())) >= transactionDate.from &&
                (!transactionDate.to || new Date(parse(tx.date, 'MM/dd/yyyy', new Date())) <= transactionDate.to)
            );

            const searchMatch = !transactionSearch ||
                Object.values(tx).some(val =>
                    String(val).toLowerCase().includes(transactionSearch.toLowerCase())
                );

            return typeMatch && dateMatch && searchMatch;
        });
    }, [transactionType, transactionDate, transactionSearch]);

    const displayedTransactions = useMemo(() => {
        return isTransactionsExpanded ? filteredTransactions : filteredTransactions.slice(0, 7);
    }, [filteredTransactions, isTransactionsExpanded]);


    return (
        <main className="flex flex-col w-full max-w-6xl mx-auto px-8 py-4 md:py-6 lg:py-8 2xl:max-w-7xl 2xl:px-16">
            <div className="flex-shrink-0 flex flex-col">
                <AccountSummaryHeader
                    account={{ ...selectedAccount, balance: headerValue }}
                    onChartHover={handleChartHover}
                    onChartLeave={handleChartLeave}
                />
                <div className="h-[420px]">
                    <InteractiveChartCard
                        stock={chartData}
                        onManualTickerSubmit={handleTickerSubmit}
                        onChartHover={handleChartHover}
                        onChartLeave={handleChartLeave}
                        variant="account"
                        className="h-full"
                    />
                </div>
            </div>

            <div className="flex-1 flex flex-col mt-4">
                <div className="flex items-center h-16 flex-shrink-0">
                    <AccountSelector accounts={mockAccounts} selected={selectedAccount} onSelect={setSelectedAccount} />
                </div>
                
                <Separator className="bg-border/20 mb-6" />
                
                <section className="w-full mb-12">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-white text-xl font-semibold">Holdings</h2>
                    </div>
                    <HoldingsTable holdings={selectedAccount.holdings || []} />
                </section>
                <section className="w-full mt-12 mb-12">
                    <Popover open={isWatchlistPopoverOpen} onOpenChange={setIsWatchlistPopoverOpen}>
                        <PopoverTrigger asChild>
                            <button className="flex items-center gap-2 mb-4 group">
                                <h2 className="text-white text-xl font-semibold">{selectedWatchlist}</h2>
                                <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform group-hover:text-white group-data-[state=open]:rotate-180" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-2">
                           <div className="flex flex-col">
                                {Object.keys(WATCHLISTS).map(listName => (
                                    <button
                                        key={listName}
                                        onClick={() => {
                                            setSelectedWatchlist(listName as keyof typeof WATCHLISTS);
                                            setIsWatchlistPopoverOpen(false);
                                        }}
                                        className={cn(
                                            "text-left px-3 py-1.5 rounded-md text-sm transition-colors hover:bg-white/10",
                                            selectedWatchlist === listName ? "font-semibold text-white bg-white/5" : "text-neutral-300"
                                        )}
                                    >
                                        {listName}
                                    </button>
                                ))}
                                <Separator className="my-2 bg-white/10" />
                                <button
                                     onClick={() => setIsWatchlistPopoverOpen(false)}
                                     className="text-left px-3 py-1.5 rounded-md text-sm transition-colors text-primary hover:bg-white/10"
                                >
                                    + Create New Watchlist
                                </button>
                           </div>
                        </PopoverContent>
                    </Popover>
                    <WatchlistTable list={WATCHLISTS[selectedWatchlist]} />
                </section>
                <section className="w-full mt-12">
                    <div className="flex w-full items-center justify-between mb-4 gap-4">
                        <h2 className="text-white text-xl font-semibold">Transactions</h2>
                        <div className="flex items-center gap-2">
                            <Select value={transactionType} onValueChange={setTransactionType}>
                                <SelectTrigger className="w-auto h-9 text-xs">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {transactionTypes.map(type => (
                                        <SelectItem key={type} value={type}>{type === 'all' ? 'All Types' : type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="date"
                                        variant={"outline"}
                                        size="sm"
                                        className="w-auto justify-start text-left font-normal h-9 text-xs"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {transactionDate?.from ? (
                                            transactionDate.to ? (
                                                <>
                                                    {format(transactionDate.from, "LLL dd, y")} -{" "}
                                                    {format(transactionDate.to, "LLL dd, y")}
                                                </>
                                            ) : (
                                                format(transactionDate.from, "LLL dd, y")
                                            )
                                        ) : (
                                            <span>All Dates</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                    <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={transactionDate?.from}
                                        selected={transactionDate}
                                        onSelect={setTransactionDate}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>
                             <div className="relative sm:max-w-xs">
                                <Input
                                    placeholder="Search transactions..."
                                    value={transactionSearch}
                                    onChange={(e) => setTransactionSearch(e.target.value)}
                                    className="h-9 w-full pl-8"
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                    </div>
                    <TransactionsTable transactions={displayedTransactions} />
                    {filteredTransactions.length > 7 && (
                        <div className="flex justify-center mt-4">
                            <Button
                                variant="outline"
                                onClick={() => setIsTransactionsExpanded(!isTransactionsExpanded)}
                            >
                                {isTransactionsExpanded ? 'See Less' : 'See More'}
                            </Button>
                        </div>
                    )}
                </section>
                
                <div className="h-12 flex-shrink-0" />
            </div>
        </main>
    );
}

    
