
"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UploadCloud, Columns, Info, ListFilter, Bot, Cog, TrendingUp, TrendingDown, Activity, CalendarCheck2, Star, List, Filter, SlidersHorizontal, Newspaper, Search, Loader2 } from "lucide-react";
import type { Stock, AlertRule, ColumnConfig, SavedScreener } from "@/types";
import { cn } from '@/lib/utils';
import { ChartPreview } from '@/components/ChartPreview';
import { exportToCSV } from '@/lib/exportCSV';
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { mockRules } from '@/app/(app)/trading/rules/page';
import { format } from 'date-fns';
import { ScreenerFilterModal } from '@/components/ScreenerFilterModal';
import type { ActiveScreenerFilters } from '@/components/ScreenerFilterModal';
import { Badge } from '@/components/ui/badge';
import { dummyNewsData } from '@/app/(app)/news/dummy-data';
import { NewsArticleModal } from '@/components/NewsArticleModal';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { initialMockStocks } from '@/app/(app)/trading/dashboard/mock-data';


const MOCK_INITIAL_TIMESTAMP = '2024-07-01T10:00:00.000Z';
const RULES_STORAGE_KEY = 'tradeflow-alert-rules';
const SAVED_SCREENERS_STORAGE_KEY = 'ghost-trading-saved-screeners';

const formatDecimal = (value?: number, places = 2) => (value !== undefined && value !== null ? value.toFixed(places) : 'N/A');

const dummyWatchlistSymbols = ['AAPL', 'MSFT', 'TSLA', 'GOOGL', 'NVDA', 'BCTX', 'SPY', 'AMD', 'AMZN', 'META', 'NFLX', 'JPM', 'TPL'];

const allColumnsConfig: ColumnConfig<Stock>[] = [
    { key: 'symbol', label: 'Symbol', defaultVisible: true, isDraggable: true, align: 'left', description: 'The stock ticker symbol.' },
    { key: 'price', label: 'Price', defaultVisible: true, isDraggable: true, align: 'right', format: (val) => `$${formatDecimal(val)}`, description: 'The last traded price.' },
    { key: 'changePercent', label: '% Change', defaultVisible: true, isDraggable: true, align: 'right', format: (val) => `${val >= 0 ? '+' : ''}${formatDecimal(val)}%`, description: 'The percentage change in price for the current day.' },
    { key: 'float', label: 'Float', defaultVisible: true, isDraggable: true, align: 'left', format: (val) => `${formatDecimal(val)}M`, description: 'The number of shares available for public trading, in millions.' },
    { key: 'volume', label: 'Volume', defaultVisible: true, isDraggable: true, align: 'left', format: (val) => `${formatDecimal(val, 1)}M`, description: 'The number of shares traded today, in millions.' },
    { key: 'marketCap', label: 'Market Cap', defaultVisible: false, isDraggable: true, align: 'right', format: (val) => `${formatDecimal(val / 1e9, 2)}B`, description: 'The total market value of a company\'s outstanding shares.' },
    { key: 'avgVolume', label: 'Avg Volume', defaultVisible: false, isDraggable: true, align: 'right', format: (val) => `${formatDecimal(val, 1)}M`, description: 'The average daily trading volume over a period (e.g., 3 months).' },
    { key: 'peRatio', label: 'P/E Ratio', defaultVisible: false, isDraggable: true, align: 'right', format: (val) => formatDecimal(val, 1), description: 'Price-to-Earnings ratio, a measure of valuation.' },
    { key: 'sector', label: 'Sector', defaultVisible: false, isDraggable: true, align: 'left', description: 'The industry sector the company belongs to.' },
    { key: 'high52', label: '52W High', defaultVisible: false, isDraggable: true, align: 'right', format: (val) => `$${formatDecimal(val)}`, description: 'The highest price in the last 52 weeks.' },
    { key: 'low52', label: '52W Low', defaultVisible: false, isDraggable: true, align: 'right', format: (val) => `$${formatDecimal(val)}`, description: 'The lowest price in the last 52 weeks.' },
    { key: 'shortFloat', label: 'Short Float', defaultVisible: false, isDraggable: true, align: 'right', format: (val) => `${formatDecimal(val, 1)}%`, description: 'The percentage of a company\'s float that is shorted.' },
];

function ScreenerPageContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [stocks, setStocks] = useState<Stock[]>(initialMockStocks);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [savedScreeners, setSavedScreeners] = useState<SavedScreener[]>([]);
  const [selectedRuleId, setSelectedRuleId] = useState<string>('all');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Partial<ActiveScreenerFilters>>({});
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [newsModalContent, setNewsModalContent] = useState<{ articles: any[]; title: string } | null>(null);
  const [showResetToast, setShowResetToast] = useState(false);

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    const initialVisibility: Record<string, boolean> = {};
    allColumnsConfig.forEach(col => {
      initialVisibility[col.key] = col.defaultVisible || false;
    });
    return initialVisibility;
  });

  useEffect(() => {
    if (showResetToast) {
      toast({ title: "Columns reset to default." });
      setShowResetToast(false); // Reset the trigger
    }
  }, [showResetToast, toast]);

  const columnsToDisplay = useMemo(() => {
    return allColumnsConfig.filter(col => visibleColumns[col.key]);
  }, [visibleColumns]);

  const handleColumnVisibilityChange = (key: string, checked: boolean) => {
    setVisibleColumns(prev => ({
      ...prev,
      [key]: checked,
    }));
  };

  const resetColumnsToDefault = () => {
    const defaultVisibility: Record<string, boolean> = {};
    allColumnsConfig.forEach(col => {
      defaultVisibility[col.key] = col.defaultVisible || false;
    });
    setVisibleColumns(defaultVisibility);
    setShowResetToast(true);
  };


  useEffect(() => {
    const loadData = () => {
        try {
            const savedRulesJSON = localStorage.getItem(RULES_STORAGE_KEY);
            setRules(savedRulesJSON ? JSON.parse(savedRulesJSON) : []);

            const savedScreenersJSON = localStorage.getItem(SAVED_SCREENERS_STORAGE_KEY);
            setSavedScreeners(savedScreenersJSON ? JSON.parse(savedScreenersJSON) : []);
        } catch (error) {
            console.error("Failed to load data from localStorage", error);
            setRules([]);
            setSavedScreeners([]);
        }
    };
    loadData();
    window.addEventListener('rules-updated', loadData);
    window.addEventListener('screeners-updated', loadData);
    return () => {
        window.removeEventListener('rules-updated', loadData);
        window.removeEventListener('screeners-updated', loadData);
    };
  }, []);

  const handleSelectedScreenerChange = (value: string) => {
    setSelectedRuleId(value);

    // Reset custom filters when a preset is chosen
    setActiveFilters({});

    const savedScreener = savedScreeners.find(s => s.id === value);
    if (savedScreener) {
        setActiveFilters(savedScreener.filters);
    }
  }

  const activeRules = useMemo(() => rules.filter(rule => rule.isActive), [rules]);
  const activeFilterCount = Object.values(activeFilters).filter(f => f && f.active).length;
  
  const handleShowNewsForStock = (stock: Stock) => {
    const matchingNews = dummyNewsData.filter(news => {
      const stockName = stock.name?.toLowerCase() || '';
      const stockSymbol = stock.symbol.toLowerCase();
      const headline = news.headline.toLowerCase();
      const preview = news.preview.toLowerCase();
      return (headline.includes(stockSymbol) || headline.includes(stockName) || preview.includes(stockSymbol) || preview.includes(stockName));
    });

    setNewsModalContent({
      articles: matchingNews,
      title: `News for ${stock.symbol}`
    });
    setIsNewsModalOpen(true);
  };

  const filteredStocks = useMemo(() => {
    let processedStocks = [...stocks];
    
    // 1. Apply preset rule filter
    if (selectedRuleId !== 'all' && !savedScreeners.some(s => s.id === selectedRuleId)) {
      switch (selectedRuleId) {
        case 'my-watchlist':
          processedStocks = processedStocks.filter(stock => dummyWatchlistSymbols.includes(stock.symbol));
          break;
        case 'top-gainers':
          processedStocks = processedStocks.sort((a, b) => b.changePercent - a.changePercent);
          break;
        case 'top-losers':
          processedStocks = processedStocks.sort((a, b) => a.changePercent - b.changePercent);
          break;
        case 'active':
          processedStocks = processedStocks.sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0));
          break;
        case '52-week':
          processedStocks = processedStocks.filter(stock =>
            stock.price && stock.high52 && stock.low52 &&
            (stock.price >= (stock.high52 * 0.98) || stock.price <= (stock.low52 * 1.02))
          );
          break;
        default:
          const rule = activeRules.find(r => r.id === selectedRuleId);
          if (rule) {
            processedStocks = processedStocks.filter(stock => {
              return rule.criteria.every(criterion => {
                const stockValue = stock[criterion.metric as keyof Stock] as number | undefined;
                if (stockValue === undefined || stockValue === null) return false;
                const ruleValue = criterion.value;
                switch (criterion.operator) {
                  case '>': return stockValue > (ruleValue as number);
                  case '<': return stockValue < (ruleValue as number);
                  case '>=': return stockValue >= (ruleValue as number);
                  case '<=': return stockValue <= (ruleValue as number);
                  case '==': return stockValue === (ruleValue as number);
                  case '!=': return stockValue !== (ruleValue as number);
                  case 'between':
                    if (Array.isArray(ruleValue) && ruleValue.length === 2) {
                      return stockValue >= ruleValue[0] && stockValue <= ruleValue[1];
                    }
                    return false;
                  default: return true;
                }
              });
            });
          }
      }
    }
    
    // 2. Apply advanced custom filters from the modal
    const customFilterEntries = Object.entries(activeFilters).filter(([, filterValue]) => filterValue && filterValue.active);

    if (customFilterEntries.length > 0) {
      processedStocks = processedStocks.filter(stock => {
        return customFilterEntries.every(([key, filter]) => {
            if (!filter) return true;
            const stockValue = stock[key as keyof Stock] as any;
            if (stockValue === undefined || stockValue === null) return false;

            // Handle range filters (min/max)
            const min = filter.min ? parseFloat(filter.min) : undefined;
            const max = filter.max ? parseFloat(filter.max) : undefined;
            
            let checkVal = stockValue;

            if (key === 'marketCap') checkVal = stockValue / 1e9;
            if (key === 'volume' || key === 'floatSize') checkVal = stockValue;
            
            if (min !== undefined && checkVal < min) return false;
            if (max !== undefined && checkVal > max) return false;
            
            // Handle boolean toggle filters
            if (typeof filter.value === 'boolean') {
                 if (!stock.tradingFeatures || stock.tradingFeatures[key as keyof typeof stock.tradingFeatures] === undefined) return false;
                 return stock.tradingFeatures[key as keyof typeof stock.tradingFeatures] === filter.value;
            }

            // Handle select/multi-select filters
            if (typeof filter.value === 'string' && filter.value !== "Any" && stockValue !== filter.value) return false;
            if (Array.isArray(filter.value) && filter.value.length > 0 && !filter.value.includes(stockValue)) return false;

            return true;
        });
      });
    }

    return processedStocks;
  }, [stocks, selectedRuleId, activeRules, activeFilters, savedScreeners]);

  return (
    <>
      <main className="flex flex-col flex-1 h-full overflow-hidden p-4 md:p-6 space-y-4">
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-foreground">Screener</h1>
                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 text-xs">
                                <Columns className="mr-2 h-4 w-4" /> Columns
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-3" align="end">
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm leading-none">Customize Columns</h4>
                                <p className="text-xs text-muted-foreground">Select columns to display.</p>
                            </div>
                            <ScrollArea className="h-64 mt-3">
                                <div className="space-y-2 p-1">
                                    {allColumnsConfig.map(col => (
                                    <div key={col.key} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`col-${col.key}`}
                                            checked={visibleColumns[col.key]}
                                            onCheckedChange={(checked) => handleColumnVisibilityChange(col.key, !!checked)}
                                        />
                                        <Label htmlFor={`col-${col.key}`} className="text-xs font-normal flex-1">{col.label}</Label>
                                        <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Info className="h-3.5 w-3.5 text-muted-foreground" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="text-xs">{col.description}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    ))}
                                </div>
                            </ScrollArea>
                            <div className="flex justify-between items-center mt-3">
                                <Button
                                    variant="link"
                                    className="text-xs text-foreground p-0 h-auto"
                                    onClick={resetColumnsToDefault}
                                >
                                    Reset to Default
                                </Button>
                                 <Button variant="outline" size="sm" onClick={() => exportToCSV('screener_export.csv', filteredStocks, allColumnsConfig)} className="h-7 text-xs">
                                    <UploadCloud className="mr-2 h-3.5 w-3.5" /> Export
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                    <Button variant="outline" size="sm" onClick={() => exportToCSV('screener_export.csv', filteredStocks, allColumnsConfig)} className="h-9 text-xs">
                        <UploadCloud className="mr-2 h-4 w-4" /> Export
                    </Button>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsFilterModalOpen(true)} className="h-9 text-xs">
                    <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                </Button>
                <Select value={selectedRuleId} onValueChange={handleSelectedScreenerChange}>
                    <SelectTrigger id="ruleSelect" className="w-auto h-9 text-xs min-w-[200px]">
                        <SelectValue placeholder="Select a screener or rule..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all" className="text-xs">
                            <span className="flex items-center"><List className="mr-2 h-4 w-4" /> Show All Stocks</span>
                        </SelectItem>
                        <SelectItem value="my-watchlist" className="text-xs">
                            <span className="flex items-center"><Star className="mr-2 h-4 w-4" /> My Watchlist</span>
                        </SelectItem>
                        <SelectItem value="top-gainers" className="text-xs">
                            <span className="flex items-center text-[hsl(var(--confirm-green))]"><TrendingUp className="mr-2 h-4 w-4" /> Top Gainers</span>
                        </SelectItem>
                        <SelectItem value="top-losers" className="text-xs">
                            <span className="flex items-center text-destructive"><TrendingDown className="mr-2 h-4 w-4" /> Top Losers</span>
                        </SelectItem>
                        <SelectItem value="active" className="text-xs">
                            <span className="flex items-center text-primary"><Activity className="mr-2 h-4 w-4" /> Most Active</span>
                        </SelectItem>
                        <SelectItem value="52-week" className="text-xs">
                            <span className="flex items-center text-accent"><CalendarCheck2 className="mr-2 h-4 w-4" /> 52 Week Highs/Lows</span>
                        </SelectItem>
                        {activeRules.length > 0 && <hr className="my-1" />}
                        {activeRules.map(rule => (
                            <SelectItem key={rule.id} value={rule.id} className="text-xs">
                            <span className="flex items-center"><Filter className="mr-2 h-4 w-4" /> {rule.name}</span>
                            </SelectItem>
                        ))}
                         {savedScreeners.length > 0 && <hr className="my-1" />}
                         {savedScreeners.map(screener => (
                            <SelectItem key={screener.id} value={screener.id} className="text-xs">
                            <span className="flex items-center"><Filter className="mr-2 h-4 w-4" /> {screener.name}</span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>

        <div className="flex-1 overflow-auto rounded-lg border border-border/10 bg-card">
          <Table>
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="hover:bg-card">
                {columnsToDisplay.map(col => (
                     <TableHead key={col.key} className={cn("bg-card hover:bg-card", `text-${col.align || 'left'}`)}>
                        {col.label}
                    </TableHead>
                ))}
                <TableHead className="text-right bg-card hover:bg-card">
                    News
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStocks.length > 0 ? (
                filteredStocks.map((stock) => (
                  <TableRow
                    key={stock.id}
                    className="cursor-pointer border-b border-border/5 hover:bg-white/5"
                    onClick={() => handleShowNewsForStock(stock)}
                  >
                    {columnsToDisplay.map(col => {
                        const value = stock[col.key as keyof Stock];
                        return (
                            <TableCell key={col.key} className={cn("font-medium", `text-${col.align || 'left'}`)}>
                                {col.key === 'changePercent' ? (
                                    <span className={cn(Number(value) >= 0 ? "text-[hsl(var(--confirm-green))]" : "text-destructive")}>
                                        {col.format ? col.format(value, stock) : value}
                                    </span>
                                ) : col.format ? (
                                    col.format(value, stock)
                                ) : (
                                    value
                                )}
                            </TableCell>
                        )
                    })}
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-7 w-7"><Newspaper className="h-4 w-4"/></Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columnsToDisplay.length + 1} className="h-24 text-center text-xs text-muted-foreground">
                    No stocks match the selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>
      <ScreenerFilterModal 
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        activeFilters={activeFilters}
        onApplyFilters={setActiveFilters}
      />
      <NewsArticleModal
        isOpen={isNewsModalOpen}
        onClose={() => setIsNewsModalOpen(false)}
        articles={newsModalContent?.articles || null}
        title={newsModalContent?.title || "News"}
      />
    </>
  );
}

export default function ScreenerPage() {
  return (
    <Suspense fallback={<div>Loading Screener...</div>}>
      <ScreenerPageContent />
    </Suspense>
  );
}
