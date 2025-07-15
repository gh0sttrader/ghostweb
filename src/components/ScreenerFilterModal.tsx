
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

export type ActiveFilterValue = {
    active: boolean;
    min?: number;
    max?: number;
    value?: string | number | boolean | string[];
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
    marginable?: ActiveFilterValue;
    shortable?: ActiveFilterValue;
    overnight?: ActiveFilterValue;
    fractional?: ActiveFilterValue;
    nasdaqTotalView?: ActiveFilterValue;
};

const initialFilters: ActiveScreenerFilters = {
    price: { active: false, min: 0, max: 1000 },
    marketCap: { active: false, min: 0, max: 2000 },
    volume: { active: false, min: 100000, max: 500000000 },
    changePercent: { active: false, min: -50, max: 50 },
    sector: { active: false, value: "Any" },
    analystRating: { active: false, value: "Any" },
    shortFloat: { active: false, min: 0, max: 100 },
    dividendYield: { active: false, min: 0, max: 15 },
    peRatio: { active: false, min: 0, max: 100 },
    marginable: { active: false, value: false },
    shortable: { active: false, value: false },
    overnight: { active: false, value: false },
    fractional: { active: false, value: false },
    nasdaqTotalView: { active: false, value: false },
};

const formatNumber = (value: number) => {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value;
};

const sectors = ["Any", "Technology", "Healthcare", "Financial Services", "Consumer Discretionary", "Communication Services", "Industrials", "Consumer Staples", "Energy", "Utilities", "Real Estate", "Materials"];
const ratings = ["Any", "Strong Buy", "Buy", "Hold", "Sell", "Strong Sell"];

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
    }, [initialActiveFilters]);

    const handleFilterChange = (key: keyof ActiveScreenerFilters, field: keyof ActiveFilterValue, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [field]: value,
                active: true, 
            },
        }));
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
        onApplyFilters({}); // Also clear parent state
    };
    
    const applyFilters = () => {
        onApplyFilters(filters);
        onClose();
    };
    
    const FilterSectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
        <Card className="bg-white/5 border-white/10 flex-1">
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
            <DialogContent className="max-w-4xl w-full bg-transparent border-0 shadow-none p-0">
                <div className="relative bg-black/50 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-2xl">
                    <DialogHeader className="p-6 border-b border-white/10">
                        <DialogTitle className="text-2xl font-bold">Screener Filters</DialogTitle>
                        <DialogDescription>
                            Refine your search with advanced market, fundamental, and technical criteria.
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="h-[60vh]">
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            
                            <FilterSectionCard title="Market">
                                <RangeFilter label="Price" filterKey="price" min={0} max={1000} step={1} formatVal={(v) => `$${v}`} />
                                <RangeFilter label="Market Cap ($B)" filterKey="marketCap" min={0} max={2000} step={10} formatVal={(v) => `$${v}B`} />
                                <RangeFilter label="Volume" filterKey="volume" min={0} max={500000000} step={1000000} formatVal={formatNumber} />
                            </FilterSectionCard>

                            <FilterSectionCard title="Valuation & Technicals">
                                <RangeFilter label="% Change" filterKey="changePercent" min={-50} max={50} step={1} formatVal={(v) => `${v}%`} />
                                <RangeFilter label="P/E Ratio" filterKey="peRatio" min={0} max={100} step={1} formatVal={(v) => v} />
                                <RangeFilter label="Dividend Yield (%)" filterKey="dividendYield" min={0} max={20} step={0.5} formatVal={(v) => `${v}%`} />
                            </FilterSectionCard>
                            
                             <FilterSectionCard title="Ownership & Vitals">
                                <RangeFilter label="Short Interest (%)" filterKey="shortFloat" min={0} max={100} step={1} formatVal={(v) => `${v}%`} />
                                <div>
                                    <Label className="text-sm font-medium">Sector</Label>
                                    <Select value={filters.sector?.value as string} onValueChange={(v) => handleSelectChange('sector', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{sectors.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Analyst Rating</Label>
                                    <Select value={filters.analystRating?.value as string} onValueChange={(v) => handleSelectChange('analystRating', v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>{ratings.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </FilterSectionCard>
                        </div>
                    </ScrollArea>
                    
                    <div className="p-6 border-t border-white/10">
                        <Card className="bg-white/5 border-white/10">
                             <CardHeader><CardTitle className="text-base font-semibold">Trading Features</CardTitle></CardHeader>
                             <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                <div className="flex items-center space-x-2">
                                    <Switch id="marginable" checked={!!filters.marginable?.value} onCheckedChange={(c) => handleSwitchChange('marginable', c)} />
                                    <Label htmlFor="marginable">Marginable</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch id="shortable" checked={!!filters.shortable?.value} onCheckedChange={(c) => handleSwitchChange('shortable', c)} />
                                    <Label htmlFor="shortable">Shortable</Label>
                                </div>
                                 <div className="flex items-center space-x-2">
                                    <Switch id="overnight" checked={!!filters.overnight?.value} onCheckedChange={(c) => handleSwitchChange('overnight', c)} />
                                    <Label htmlFor="overnight">Overnight</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch id="fractional" checked={!!filters.fractional?.value} onCheckedChange={(c) => handleSwitchChange('fractional', c)} />
                                    <Label htmlFor="fractional">Fractional</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch id="nasdaq" checked={!!filters.nasdaqTotalView?.value} onCheckedChange={(c) => handleSwitchChange('nasdaqTotalView', c)} />
                                    <Label htmlFor="nasdaq">TotalView</Label>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <DialogFooter className="p-6 flex justify-between w-full">
                        <Button variant="outline" onClick={resetFilters}>Reset Filters</Button>
                        <div className="flex gap-2">
                            <Button variant="secondary" onClick={onClose}>Cancel</Button>
                            <Button className="bg-primary hover:bg-primary/90" onClick={applyFilters}>Apply Filters</Button>
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
