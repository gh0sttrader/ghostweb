
"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';
import type { TradingFeatures } from '@/types';
import { cn } from '@/lib/utils';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

export type ActiveFilterValue = {
    active: boolean;
    min?: number;
    max?: number;
    value?: string | number | boolean | string[] | DateRange;
};

export type ActiveScreenerFilters = {
    price?: ActiveFilterValue;
    marketCap?: ActiveFilterValue;
    volume?: ActiveFilterValue;
    changePercent?: ActiveFilterValue;
    sector?: ActiveFilterValue;
    analystRating?: ActiveFilterValue;
    shortFloat?: ActiveFilterValue;
    dividendYield?: ActiveFilterValue;
    peRatio?: ActiveFilterValue;
    // Expanded filters
    exchange?: ActiveFilterValue;
    floatSize?: ActiveFilterValue;
    high52?: ActiveFilterValue;
    low52?: ActiveFilterValue;
    rsi?: ActiveFilterValue;
    macd?: ActiveFilterValue;
    instOwn?: ActiveFilterValue;
    insiderOwn?: ActiveFilterValue;
    industry?: ActiveFilterValue;
    ipoDate?: ActiveFilterValue;
    country?: ActiveFilterValue;
    currency?: ActiveFilterValue;
    pegRatio?: ActiveFilterValue;
    beta?: ActiveFilterValue;
    movingAverageCrossover?: ActiveFilterValue;
    volatility?: ActiveFilterValue;
    chartPattern?: ActiveFilterValue;
    esgScore?: ActiveFilterValue;
} & {
    [K in keyof TradingFeatures]?: ActiveFilterValue;
};


const initialFilters: ActiveScreenerFilters = {
    price: { active: false, min: 0, max: 5000 },
    marketCap: { active: false, min: 0, max: 2000 }, // in Billions
    volume: { active: false, min: 100000, max: 500000000 },
    changePercent: { active: false, min: -50, max: 50 },
    sector: { active: false, value: "Any" },
    analystRating: { active: false, value: "Any" },
    shortFloat: { active: false, min: 0, max: 100 },
    dividendYield: { active: false, min: 0, max: 15 },
    peRatio: { active: false, min: 0, max: 200 },
    exchange: { active: false, value: "Any" },
    floatSize: { active: false, min: 0, max: 1000 }, // in Millions
    high52: { active: false, min: 0, max: 5000 },
    low52: { active: false, min: 0, max: 5000 },
    rsi: { active: false, min: 0, max: 100 },
    macd: { active: false, value: "Any" },
    instOwn: { active: false, min: 0, max: 100 },
    insiderOwn: { active: false, min: 0, max: 100 },
    industry: { active: false, value: "Any" },
    ipoDate: { active: false, value: undefined },
    country: { active: false, value: 'Any' },
    currency: { active: false, value: 'USD' },
    pegRatio: { active: false, min: 0, max: 5 },
    beta: { active: false, min: 0, max: 3 },
    movingAverageCrossover: { active: false, value: 'Any' },
    volatility: { active: false, min: 0, max: 10 },
    chartPattern: { active: false, value: 'Any' },
    esgScore: { active: false, min: 0, max: 100 },
    marginable: { active: false, value: false },
    shortable: { active: false, value: false },
    overnight: { active: false, value: false },
    fractional: { active: false, value: false },
    nasdaqTotalView: { active: false, value: false },
    optionsAvailable: { active: false, value: false },
    preAfterMarket: { active: false, value: false },
    commissionFree: { active: false, value: true },
    drip: { active: false, value: false },
};

const formatNumber = (value: number) => {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value.toString();
};

const sectors = ["Any", "Technology", "Healthcare", "Financial Services", "Consumer Discretionary", "Communication Services", "Industrials", "Consumer Staples", "Energy", "Utilities", "Real Estate", "Materials"];
const industries = ["Any", "Software", "Biotechnology", "Banks", "Automobiles", "Semiconductors", "Retail", "Media"];
const exchanges = ["Any", "NASDAQ", "NYSE", "AMEX", "OTC"];
const ratings = ["Any", "Strong Buy", "Buy", "Hold", "Sell", "Strong Sell"];
const macdOptions = ["Any", "Bullish Crossover", "Bearish Crossover", "Neutral"];
const countries = ["Any", "USA", "Canada", "UK", "Germany", "Japan", "China"];
const currencies = ["USD", "CAD", "EUR", "GBP", "JPY"];
const maCrossovers = ["Any", "Golden Cross", "Death Cross"];
const chartPatterns = ["Any", "Breakout", "Reversal", "Momentum", "Continuation"];

interface ScreenerFilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    activeFilters: Partial<ActiveScreenerFilters>;
    onApplyFilters: (filters: Partial<ActiveScreenerFilters>) => void;
}

export function ScreenerFilterModal({ isOpen, onClose, activeFilters: initialActiveFilters, onApplyFilters }: ScreenerFilterModalProps) {
    const [filters, setFilters] = useState<ActiveScreenerFilters>(() => ({
        ...initialFilters,
        ...initialActiveFilters
    }));

    useEffect(() => {
        setFilters(current => ({ ...current, ...initialActiveFilters }));
    }, [initialActiveFilters, isOpen]);

    const handleFilterChange = (key: keyof ActiveScreenerFilters, field: keyof ActiveFilterValue, value: any) => {
        setFilters(prev => {
            const newFilterState = {
                ...prev[key],
                [field]: value,
                active: true,
            };
            return { ...prev, [key]: newFilterState };
        });
    };
    
    const handleSliderChange = (key: keyof ActiveScreenerFilters, value: [number, number]) => {
        setFilters(prev => ({
            ...prev,
            [key]: { ...prev[key], min: value[0], max: value[1], active: true },
        }));
    };

    const handleSwitchChange = (key: keyof ActiveScreenerFilters, checked: boolean) => {
        setFilters(prev => ({
            ...prev,
            [key]: { ...prev[key], value: checked, active: checked },
        }));
    };
    
    const handleSelectChange = (key: keyof ActiveScreenerFilters, value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: { ...prev[key], value, active: value !== "Any" },
        }));
    };
    
    const resetFilters = () => {
        setFilters(initialFilters);
        onApplyFilters({});
    };
    
    const applyFilters = () => {
        onApplyFilters(filters);
        onClose();
    };

    const FilterSectionCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
        <Card className={cn("bg-white/5 border-white/10 flex-1", className)}>
            <CardHeader><CardTitle className="text-base font-semibold">{title}</CardTitle></CardHeader>
            <CardContent className="space-y-4">{children}</CardContent>
        </Card>
    );

    const RangeFilter: React.FC<{
        label: string;
        filterKey: keyof ActiveScreenerFilters;
        min: number; max: number; step: number;
        formatVal: (val: number) => string | number;
    }> = ({ label, filterKey, min, max, step, formatVal }) => {
        const filterState = filters[filterKey] as Required<ActiveFilterValue>;
        return (
            <div>
                <Label className="text-sm font-medium">{label}</Label>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{formatVal(filterState.min ?? min)}</span>
                    <span>{formatVal(filterState.max ?? max)}</span>
                </div>
                <Slider
                    value={[filterState.min ?? min, filterState.max ?? max]}
                    onValueChange={(val) => handleSliderChange(filterKey, val)}
                    min={min} max={max} step={step}
                />
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-7xl w-full bg-transparent border-0 shadow-none p-0">
                <div 
                  className="relative bg-transparent border border-white/10 rounded-2xl shadow-2xl"
                  style={{
                      backdropFilter: 'blur(24px)',
                      WebkitBackdropFilter: 'blur(24px)',
                  }}
                >
                    <DialogHeader className="p-6 border-b border-white/10">
                        <DialogTitle className="text-2xl font-bold">Advanced Screener Filters</DialogTitle>
                        <DialogDescription>
                            Refine your search with powerful market, fundamental, and technical criteria.
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="h-[60vh]">
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            
                            <FilterSectionCard title="Market">
                                <RangeFilter label="Price" filterKey="price" min={0} max={5000} step={1} formatVal={(v) => `$${v}`} />
                                <RangeFilter label="Market Cap ($B)" filterKey="marketCap" min={0} max={2000} step={10} formatVal={(v) => `$${v}B`} />
                                <RangeFilter label="Volume (M)" filterKey="volume" min={0} max={500} step={1} formatVal={(v) => `${v}M`} />
                                <RangeFilter label="Float Size (M)" filterKey="floatSize" min={0} max={1000} step={10} formatVal={(v) => `${v}M`} />
                                <div>
                                    <Label className="text-sm font-medium">Exchange</Label>
                                    <Select value={filters.exchange?.value as string} onValueChange={(v) => handleSelectChange('exchange', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{exchanges.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Country</Label>
                                    <Select value={filters.country?.value as string} onValueChange={(v) => handleSelectChange('country', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">IPO Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn("w-full justify-start text-left font-normal", !filters.ipoDate?.value && "text-muted-foreground")}
                                        >
                                            {filters.ipoDate?.value && (filters.ipoDate.value as DateRange).from ? (
                                                (filters.ipoDate.value as DateRange).to ? (
                                                    <>{format((filters.ipoDate.value as DateRange).from!, "LLL dd, y")} - {format((filters.ipoDate.value as DateRange).to!, "LLL dd, y")}</>
                                                ) : (
                                                    format((filters.ipoDate.value as DateRange).from!, "LLL dd, y")
                                                )
                                                ) : (
                                                <span>Pick a date range</span>
                                            )}
                                        </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                initialFocus
                                                mode="range"
                                                defaultMonth={(filters.ipoDate?.value as DateRange)?.from}
                                                selected={filters.ipoDate?.value as DateRange}
                                                onSelect={(date) => handleFilterChange('ipoDate', 'value', date)}
                                                numberOfMonths={2}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </FilterSectionCard>

                            <FilterSectionCard title="Valuation & Technicals">
                                <RangeFilter label="% Change" filterKey="changePercent" min={-50} max={50} step={1} formatVal={(v) => `${v}%`} />
                                <RangeFilter label="P/E Ratio" filterKey="peRatio" min={0} max={200} step={1} formatVal={(v) => v} />
                                <RangeFilter label="Dividend Yield (%)" filterKey="dividendYield" min={0} max={20} step={0.5} formatVal={(v) => `${v}%`} />
                                <RangeFilter label="RSI" filterKey="rsi" min={0} max={100} step={1} formatVal={(v) => v} />
                                <RangeFilter label="PEG Ratio" filterKey="pegRatio" min={0} max={5} step={0.1} formatVal={(v) => v.toFixed(1)} />
                                <RangeFilter label="Beta" filterKey="beta" min={0} max={3} step={0.1} formatVal={(v) => v.toFixed(1)} />
                                <div>
                                    <Label className="text-sm font-medium">MACD</Label>
                                    <Select value={filters.macd?.value as string} onValueChange={(v) => handleSelectChange('macd', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{macdOptions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                 <div>
                                    <Label className="text-sm font-medium">Moving Average</Label>
                                    <Select value={filters.movingAverageCrossover?.value as string} onValueChange={(v) => handleSelectChange('movingAverageCrossover', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{maCrossovers.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                 <div>
                                    <Label className="text-sm font-medium">Chart Pattern</Label>
                                    <Select value={filters.chartPattern?.value as string} onValueChange={(v) => handleSelectChange('chartPattern', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{chartPatterns.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </FilterSectionCard>
                            
                             <FilterSectionCard title="Ownership & Vitals">
                                <RangeFilter label="Short Interest (%)" filterKey="shortFloat" min={0} max={100} step={1} formatVal={(v) => `${v}%`} />
                                <RangeFilter label="Institutional Own (%)" filterKey="instOwn" min={0} max={100} step={1} formatVal={(v) => `${v}%`} />
                                <RangeFilter label="Insider Own (%)" filterKey="insiderOwn" min={0} max={100} step={1} formatVal={(v) => `${v}%`} />
                                <div>
                                    <Label className="text-sm font-medium">Analyst Rating</Label>
                                    <Select value={filters.analystRating?.value as string} onValueChange={(v) => handleSelectChange('analystRating', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{ratings.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Sector</Label>
                                    <Select value={filters.sector?.value as string} onValueChange={(v) => handleSelectChange('sector', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{sectors.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Industry</Label>
                                    <Select value={filters.industry?.value as string} onValueChange={(v) => handleSelectChange('industry', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{industries.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                 <RangeFilter label="ESG Score" filterKey="esgScore" min={0} max={100} step={1} formatVal={(v) => v} />
                            </FilterSectionCard>

                            <FilterSectionCard title="Trading Features">
                               <div className="flex flex-col space-y-3 pt-2">
                                {[
                                    {key: 'marginable', label: 'Marginable'},
                                    {key: 'shortable', label: 'Shortable'},
                                    {key: 'overnight', label: 'Overnight Trading'},
                                    {key: 'fractional', label: 'Fractional Shares'},
                                    {key: 'nasdaqTotalView', label: 'NASDAQ TotalView'},
                                    {key: 'optionsAvailable', label: 'Options Trading'},
                                    {key: 'preAfterMarket', label: 'Pre/After-Market'},
                                    {key: 'commissionFree', label: 'Commission-Free'},
                                    {key: 'drip', label: 'DRIP Available'},
                                ].map(({key, label}) => (
                                    <div key={key} className="flex items-center justify-between">
                                        <Label htmlFor={key} className="text-sm font-medium">{label}</Label>
                                        <Switch 
                                            id={key}
                                            checked={!!filters[key as keyof ActiveScreenerFilters]?.value} 
                                            onCheckedChange={(c) => handleSwitchChange(key as keyof ActiveScreenerFilters, c)}
                                        />
                                    </div>
                                ))}
                               </div>
                            </FilterSectionCard>
                        </div>
                    </ScrollArea>
                    
                    <DialogFooter className="p-6 flex justify-between w-full border-t border-white/10">
                        <Button variant="outline" onClick={resetFilters}>Reset All</Button>
                        <div className="flex gap-2">
                            <Button variant="secondary" onClick={onClose}>Cancel</Button>
                            <Button className="bg-foreground text-background hover:bg-foreground/90" onClick={applyFilters}>Apply Filters</Button>
                        </div>
                    </DialogFooter>

                    <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </DialogClose>
                </div>
            </DialogContent>
        </Dialog>
    );
}
