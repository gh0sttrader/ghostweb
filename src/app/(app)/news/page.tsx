
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, ChevronDown, Bell, TrendingUp, TrendingDown, Minus, X, Plus, Trash2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { dummyNewsData } from './dummy-data';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNowStrict } from 'date-fns';
import Link from 'next/link';
import { useAlertsContext } from '@/contexts/AlertsContext';
import { AlertModal } from '@/components/AlertModal';
import type { Alert, Stock } from '@/types';
import { initialMockStocks } from '@/app/(app)/trading/dashboard/mock-data';
import { TradingFeaturesBadges } from '@/components/TradingFeaturesBadges';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const sentimentConfig = {
    Positive: { 
        label: 'Positive',
        icon: <TrendingUp className="h-4 w-4 mr-1.5" />, 
        className: 'text-[hsl(var(--confirm-green))]' 
    },
    Negative: { 
        label: 'Negative',
        icon: <TrendingDown className="h-4 w-4 mr-1.5" />, 
        className: 'text-destructive' 
    },
    Neutral: { 
        label: 'Neutral',
        icon: <Minus className="h-4 w-4 mr-1.5" />, 
        className: 'text-muted-foreground' 
    },
};

const initialSuggestedKeywords = [
    "Earnings", "Upgrade", "Downgrade", "Lawsuit", "AI", "FDA", 
    "Partnership", "Buyout", "Innovation", "Guidance"
];

const RelativeTime = ({ isoString }: { isoString: string }) => {
    const [relativeTime, setRelativeTime] = useState('');

    useEffect(() => {
        const updateRelativeTime = () => {
            try {
                const date = new Date(isoString);
                const distance = formatDistanceToNowStrict(date);
                setRelativeTime(`${distance} ago`);
            } catch (e) {
                setRelativeTime('Invalid date');
            }
        };

        updateRelativeTime();
        // Update every 30 seconds to keep it relatively fresh
        const intervalId = setInterval(updateRelativeTime, 30000); 

        return () => clearInterval(intervalId);
    }, [isoString]);

    return <>{relativeTime}</>;
};

export default function NewsPage() {
  const { alerts, addAlert, removeAlert } = useAlertsContext();
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [selectedSymbolForAlert, setSelectedSymbolForAlert] = useState<string | null>(null);
  const [tickerSearchTerm, setTickerSearchTerm] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [isKeywordPopoverOpen, setIsKeywordPopoverOpen] = useState(false);
  const [suggestedKeywords, setSuggestedKeywords] = useState(initialSuggestedKeywords);
  const [newKeyword, setNewKeyword] = useState('');

  const handleOpenAlertModal = (symbol: string) => {
    setSelectedSymbolForAlert(symbol);
    setIsAlertModalOpen(true);
  };

  const handleCloseAlertModal = () => {
    setIsAlertModalOpen(false);
    setSelectedSymbolForAlert(null);
  };

  const handleSaveAlert = (alert: Alert) => {
    addAlert(alert);
    handleCloseAlertModal();
  };

  const getAlertForSymbol = (symbol: string) => {
    return alerts.find(a => a.symbol === symbol);
  };

  const handleKeywordChange = (keyword: string, checked: boolean) => {
    setSelectedKeywords(prev => 
        checked ? [...prev, keyword] : prev.filter(k => k !== keyword)
    );
  };
  
  const handleAddNewKeyword = () => {
    const trimmedKeyword = newKeyword.trim();
    if (trimmedKeyword && !suggestedKeywords.find(k => k.toLowerCase() === trimmedKeyword.toLowerCase())) {
        setSuggestedKeywords(prev => [...prev, trimmedKeyword]);
        setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
      setSuggestedKeywords(prev => prev.filter(k => k !== keywordToRemove));
      setSelectedKeywords(prev => prev.filter(k => k !== keywordToRemove));
  };


  const filteredNewsData = useMemo(() => {
    const lowerCaseTicker = tickerSearchTerm.toLowerCase();
    const lowerCaseKeywords = selectedKeywords.map(k => k.toLowerCase());

    return dummyNewsData.filter(item => {
        const headlineMatchesTicker = !lowerCaseTicker || item.symbol.toLowerCase().includes(lowerCaseTicker);

        const headlineMatchesKeywords = lowerCaseKeywords.length === 0 || 
            lowerCaseKeywords.every(keyword => 
                item.headline.toLowerCase().includes(keyword) || 
                item.preview.toLowerCase().includes(keyword)
            );

        return headlineMatchesTicker && headlineMatchesKeywords;
    });
  }, [tickerSearchTerm, selectedKeywords]);
  
  const getStockBySymbol = (symbol: string): Stock | undefined => {
      return initialMockStocks.find(stock => stock.symbol.toUpperCase() === symbol.toUpperCase());
  }

  return (
    <>
      <main className="flex flex-col flex-1 h-full overflow-hidden p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground">News</h1>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Select defaultValue="all_sources">
                      <SelectTrigger className="w-auto h-9 text-xs">
                          <SelectValue placeholder="Source" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="all_sources">All Sources</SelectItem>
                          <SelectItem value="reuters">Reuters</SelectItem>
                          <SelectItem value="bloomberg">Bloomberg</SelectItem>
                          <SelectItem value="wsj">Wall Street Journal</SelectItem>
                      </SelectContent>
                  </Select>
                  <Select defaultValue="us_market">
                      <SelectTrigger className="w-auto h-9 text-xs">
                          <SelectValue placeholder="Market" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="us_market">US Market</SelectItem>
                          <SelectItem value="global">Global</SelectItem>
                          <SelectItem value="crypto">Crypto</SelectItem>
                      </SelectContent>
                  </Select>
                  <Popover open={isKeywordPopoverOpen} onOpenChange={setIsKeywordPopoverOpen}>
                      <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="h-9 text-xs w-auto">
                              Keywords {selectedKeywords.length > 0 && `(${selectedKeywords.length})`}
                              <ChevronDown className="ml-2 h-4 w-4" />
                          </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-3" align="start">
                          <div className="space-y-2">
                              <h4 className="font-medium text-sm leading-none">Filter by Keyword</h4>
                          </div>
                          <div className="flex items-center gap-2 my-3">
                              <Input 
                                placeholder="Add keyword..." 
                                className="h-8 text-xs" 
                                value={newKeyword}
                                onChange={(e) => setNewKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddNewKeyword()}
                              />
                              <Button size="sm" className="h-8 px-2.5" onClick={handleAddNewKeyword}>
                                <Plus className="h-4 w-4" />
                              </Button>
                          </div>
                          <Separator className="bg-white/10" />
                          <ScrollArea className="h-48 mt-3">
                              <div className="space-y-2 p-1">
                                  {suggestedKeywords.map(keyword => (
                                      <div key={keyword} className="flex items-center justify-between group">
                                          <div className="flex items-center space-x-2">
                                              <Checkbox
                                                  id={`kw-${keyword}`}
                                                  checked={selectedKeywords.includes(keyword)}
                                                  onCheckedChange={(checked) => handleKeywordChange(keyword, !!checked)}
                                              />
                                              <Label htmlFor={`kw-${keyword}`} className="text-xs font-normal">{keyword}</Label>
                                          </div>
                                           <Button 
                                              variant="ghost" 
                                              size="icon" 
                                              className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                              onClick={() => handleRemoveKeyword(keyword)}
                                            >
                                                <X className="h-3 w-3 text-destructive" />
                                            </Button>
                                      </div>
                                  ))}
                              </div>
                          </ScrollArea>
                          {selectedKeywords.length > 0 && (
                            <Button variant="ghost" size="sm" className="w-full mt-2 text-xs" onClick={() => setSelectedKeywords([])}>
                                Clear Filters
                            </Button>
                          )}
                      </PopoverContent>
                  </Popover>
              </div>
              <div className="relative w-full sm:max-w-xs">
                  <Input
                      placeholder="Search ticker..."
                      value={tickerSearchTerm}
                      onChange={(e) => setTickerSearchTerm(e.target.value)}
                      className="h-9 w-full pl-8"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
          </div>

          <div className="rounded-lg overflow-auto flex-1 border border-border/10 bg-card">
              <Table>
                  <TableHeader className="sticky top-0 z-10">
                      <TableRow className="hover:bg-card">
                          <TableHead className="w-[150px] bg-card hover:bg-card">Time</TableHead>
                          <TableHead className="w-[100px] bg-card hover:bg-card">Symbol</TableHead>
                          <TableHead className="bg-card hover:bg-card">Headline</TableHead>
                          <TableHead className="w-[150px] bg-card hover:bg-card">Sentiment</TableHead>
                          <TableHead className="w-[150px] bg-card hover:bg-card">Provider</TableHead>
                          <TableHead className="w-[150px] bg-card hover:bg-card">Trading Capabilities</TableHead>
                          <TableHead className="w-[100px] text-center bg-card hover:bg-card">Alerts</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNewsData.map((item) => {
                        const sentiment = sentimentConfig[item.sentiment];
                        const activeAlert = getAlertForSymbol(item.symbol);
                        const stockData = getStockBySymbol(item.symbol);

                        return (
                            <TableRow key={item.id} className="border-b border-border/5 hover:bg-white/5">
                                <TableCell className="text-muted-foreground font-mono text-sm whitespace-nowrap">
                                    <RelativeTime isoString={item.timestamp} />
                                </TableCell>
                                <TableCell>
                                    <Link href={`/trading/dashboard?ticker=${item.symbol}&sentiment=${item.sentiment}`}>
                                        <Badge variant="outline" className="text-sm cursor-pointer hover:bg-primary/20">{item.symbol}</Badge>
                                    </Link>
                                </TableCell>
                                <TableCell className="font-medium">{item.headline}</TableCell>
                                <TableCell className={cn("flex items-center font-semibold", sentiment.className)}>
                                    {sentiment.icon}
                                    {sentiment.label}
                                </TableCell>
                                <TableCell className="text-muted-foreground">{item.provider}</TableCell>
                                <TableCell>
                                    {stockData?.tradingFeatures && <TradingFeaturesBadges features={stockData.tradingFeatures} />}
                                </TableCell>
                                <TableCell className="text-center">
                                    <button
                                      onClick={() => handleOpenAlertModal(item.symbol)}
                                      aria-label="Toggle alert"
                                      className="p-1 rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-ring"
                                    >
                                      <Bell className={cn("h-4 w-4 transition-colors", activeAlert ? 'text-destructive fill-destructive' : 'text-foreground')} />
                                    </button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                  </TableBody>
              </Table>
          </div>
      </main>
      {isAlertModalOpen && selectedSymbolForAlert && (
        <AlertModal
          isOpen={isAlertModalOpen}
          onClose={handleCloseAlertModal}
          onSave={handleSaveAlert}
          onDelete={removeAlert}
          symbol={selectedSymbolForAlert}
          existingAlert={getAlertForSymbol(selectedSymbolForAlert)}
        />
      )}
    </>
  );
}
