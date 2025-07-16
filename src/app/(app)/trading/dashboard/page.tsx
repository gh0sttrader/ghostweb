
"use client";

import React, { useState, useMemo, Suspense, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Stock, TradeRequest, OrderActionType, TradeMode, OrderSystemType, NewsArticle } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useTradeHistoryContext } from '@/contexts/TradeHistoryContext';
import { useOpenPositionsContext } from '@/contexts/OpenPositionsContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus } from "lucide-react";

import { OrderCard } from '@/components/OrderCard';
import { Card } from '@/components/ui/card';
import { InteractiveChartCard } from '@/components/charts/InteractiveChartCard';
import { WatchlistCard } from '@/components/WatchlistCard';
import { OpenPositionsCard } from '@/components/OpenPositionsCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TradeHistoryTable } from '@/components/market/TradeHistoryTable';
import { OrdersTable } from '@/components/market/OrdersTable';
import { FundamentalsCard } from '@/components/FundamentalsCard';
import { initialMockStocks } from './mock-data';
import { NewsCard } from '@/components/NewsCard';
import { cn } from '@/lib/utils';
import { ScreenerWatchlist } from '@/components/ScreenerWatchlist';

const dummyWatchlists = ["My Watchlist", "Tech Stocks", "Growth", "Crypto", "High Volume"];
const dummyScreeners = ["Top Gainers", "High Volume", "Unusual Options"];

function TradingDashboardPageContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const { addTradeToHistory } = useTradeHistoryContext();
  const { openPositions, addOpenPosition, selectedAccountId } = useOpenPositionsContext();

  const [syncedTickerSymbol, setSyncedTickerSymbol] = useState<string>('AAPL');
  const [stockForSyncedComps, setStockForSyncedComps] = useState<Stock | null>(null);
  
  const [orderCardActionType, setOrderCardActionType] = useState<OrderActionType | null>(null);
  const [orderCardInitialTradeMode, setOrderCardInitialTradeMode] = useState<TradeMode | undefined>(undefined);
  const [orderCardMiloActionContext, setOrderCardMiloActionContext] = useState<string | null>(null);
  const [orderCardInitialQuantity, setOrderCardInitialQuantity] = useState<string | undefined>(undefined);
  const [orderCardInitialOrderType, setOrderCardInitialOrderType] = useState<OrderSystemType | undefined>(undefined);
  const [orderCardInitialLimitPrice, setOrderCardInitialLimitPrice] = useState<string | undefined>(undefined);
  
  const [isWatchlistDropdownOpen, setIsWatchlistDropdownOpen] = useState(false);
  const [selectedWatchlist, setSelectedWatchlist] = useState("My Watchlist");
  
  const [isScreenerDropdownOpen, setIsScreenerDropdownOpen] = useState(false);
  const [selectedScreener, setSelectedScreener] = useState("Top Gainers");

  const handleClearOrderCard = useCallback(() => {
    setOrderCardActionType(null);
    setOrderCardInitialTradeMode(undefined);
    setOrderCardMiloActionContext(null);
    setOrderCardInitialQuantity(undefined);
    setOrderCardInitialOrderType(undefined);
    setOrderCardInitialLimitPrice(undefined);
  }, []);

  const handleSyncedTickerChange = useCallback((symbol: string) => {
    if (typeof symbol === 'string') {
        setSyncedTickerSymbol(symbol.toUpperCase());
    }
    handleClearOrderCard();
  }, [handleClearOrderCard]);

  useEffect(() => {
    const ticker = searchParams.get('ticker');
    const sentiment = searchParams.get('sentiment') as NewsArticle['sentiment'] | null;
    const action = searchParams.get('action') as OrderActionType | null;
    const quantity = searchParams.get('quantity');
    const entryPrice = searchParams.get('entryPrice');
    const orderType = searchParams.get('orderType') as OrderSystemType | null;

    if (ticker) {
      handleSyncedTickerChange(ticker);

      if (sentiment) {
        const userHasPosition = openPositions.some(p => p.symbol === ticker && p.shares > 0);
        let actionToSet: OrderActionType | null = null;
        switch (sentiment) {
            case 'Positive':
                actionToSet = 'Buy';
                break;
            case 'Negative':
                actionToSet = userHasPosition ? 'Sell' : 'Short';
                break;
            case 'Neutral':
            default:
                actionToSet = null;
                break;
        }
        setOrderCardActionType(actionToSet);
        if(actionToSet) {
          toast({
            title: "Smart Action Suggested",
            description: `Based on news sentiment, '${actionToSet}' has been pre-selected for ${ticker}.`
          });
        }
      } else if (action && quantity && entryPrice && orderType) {
        setOrderCardActionType(action);
        setOrderCardInitialQuantity(quantity);
        setOrderCardInitialOrderType(orderType);
        if (orderType === 'Limit') {
            setOrderCardInitialLimitPrice(entryPrice);
        } else {
            setOrderCardInitialLimitPrice(undefined);
        }
        setOrderCardInitialTradeMode('manual');
        setOrderCardMiloActionContext(`Trade plan loaded from alerts for ${ticker}.`);
        toast({
            title: "Trade Plan Loaded",
            description: `${action} ${quantity} shares of ${ticker} at ~$${entryPrice} loaded into trade panel.`
        });
      }
    }
  }, [searchParams, toast, handleSyncedTickerChange, openPositions]);

  useEffect(() => {
    const stockData = initialMockStocks.find(s => s.symbol.toUpperCase() === syncedTickerSymbol.toUpperCase());
    if (stockData) {
      setStockForSyncedComps(stockData);
    } else {
      setStockForSyncedComps({
        id: syncedTickerSymbol,
        symbol: syncedTickerSymbol,
        name: `Data for ${syncedTickerSymbol}`,
        price: 0,
        changePercent: 0,
        float: 0,
        volume: 0,
        lastUpdated: new Date().toISOString(),
        historicalPrices: []
      });
      toast({
          variant: "destructive",
          title: "Ticker Not Found",
          description: `Could not find data for "${syncedTickerSymbol}". Please check the symbol.`
      })
    }
  }, [syncedTickerSymbol, toast]);
  
  const handleTradeSubmit = (tradeDetails: TradeRequest) => {
    console.log("Trade Submitted via Order Card:", tradeDetails);
    toast({
      title: "Trade Processing",
      description: `${tradeDetails.action} ${tradeDetails.quantity} ${tradeDetails.symbol} (${tradeDetails.orderType}) submitted. Origin: ${tradeDetails.tradeModeOrigin || 'manual'} for account ${tradeDetails.accountId}`,
    });
    const stockInfo = stockForSyncedComps?.symbol === tradeDetails.symbol ? stockForSyncedComps : initialMockStocks.find(s => s.symbol === tradeDetails.symbol);
    addTradeToHistory({
      id: String(Date.now()),
      symbol: tradeDetails.symbol,
      side: tradeDetails.action,
      totalQty: tradeDetails.quantity,
      orderType: tradeDetails.orderType,
      limitPrice: tradeDetails.limitPrice,
      stopPrice: tradeDetails.stopPrice,
      TIF: tradeDetails.TIF || "Day",
      tradingHours: tradeDetails.allowExtendedHours ? "Include Extended Hours" : "Regular Market Hours Only",
      placedTime: new Date().toISOString(),
      filledTime: new Date(Date.now() + Math.random() * 2000 + 500).toISOString(),
      orderStatus: "Filled",
      averagePrice: (tradeDetails.orderType === "Limit" && tradeDetails.limitPrice) ? tradeDetails.limitPrice : (stockInfo?.price || 0),
      tradeModeOrigin: tradeDetails.tradeModeOrigin || 'manual',
      accountId: tradeDetails.accountId || selectedAccountId,
      takeProfit: tradeDetails.takeProfit,
      stopLoss: tradeDetails.stopLoss,
    });
    if (tradeDetails.action === 'Buy' || tradeDetails.action === 'Short') {
        addOpenPosition({
            symbol: tradeDetails.symbol,
            entryPrice: stockInfo?.price || 0,
            shares: tradeDetails.quantity,
            origin: tradeDetails.tradeModeOrigin || 'manual',
            accountId: tradeDetails.accountId || selectedAccountId,
            side: tradeDetails.action === 'Buy' ? 'Long' : 'Short',
        });
    }
  };
  
  return (
    <main className="w-full h-full flex flex-col bg-background">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_428px] gap-1.5 flex-1 overflow-hidden p-4 md:p-8">
            
            <div className="flex flex-col flex-1 min-h-0 gap-1.5">
              <div className="lg:h-[calc(100%-24rem)] flex-shrink-0">
                <InteractiveChartCard
                  stock={stockForSyncedComps}
                  onManualTickerSubmit={handleSyncedTickerChange}
                  className="h-full"
                />
              </div>
              <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-1.5">
                <Card className="h-full flex flex-col overflow-hidden">
                    <Tabs defaultValue="positions" className="flex flex-col h-full">
                        <TabsList className="shrink-0 px-3 pt-2">
                            <TabsTrigger value="positions">Positions</TabsTrigger>
                            <TabsTrigger value="orders">Open Orders</TabsTrigger>
                            <TabsTrigger value="history">History</TabsTrigger>
                        </TabsList>
                        <TabsContent value="positions" className="flex-1 overflow-hidden mt-0 p-0">
                            <OpenPositionsCard className="h-full border-0 shadow-none rounded-none bg-transparent" />
                        </TabsContent>
                        <TabsContent value="orders" className="flex-1 overflow-hidden mt-0 p-0">
                            <OrdersTable className="h-full border-0 shadow-none rounded-none bg-transparent" />
                        </TabsContent>
                        <TabsContent value="history" className="flex-1 overflow-hidden mt-0 p-0">
                           <TradeHistoryTable className="h-full border-0 shadow-none rounded-none bg-transparent" syncedTickerSymbol={syncedTickerSymbol} />
                        </TabsContent>
                    </Tabs>
                </Card>
                <div className="h-full">
                    <Card className="h-full flex flex-col overflow-hidden">
                        <Tabs defaultValue="watchlist" className="flex flex-col h-full">
                            <TabsList className="shrink-0 px-3 pt-2 items-center">
                                <DropdownMenu open={isWatchlistDropdownOpen} onOpenChange={setIsWatchlistDropdownOpen}>
                                    <TabsTrigger value="watchlist" asChild>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="flex items-center text-base p-0 h-auto hover:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium pr-2">
                                                My Watchlist
                                                <ChevronDown className={cn("ml-2 h-4 w-4 text-muted-foreground transition-transform", isWatchlistDropdownOpen && "rotate-180")} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                    </TabsTrigger>
                                     <DropdownMenuContent className="w-56 backdrop-blur-md bg-black/50 border-white/10" style={{ WebkitBackdropFilter: 'blur(10px)', backdropFilter: 'blur(10px)' }}>
                                        {dummyWatchlists.map((list) => (
                                             <DropdownMenuItem key={list} onSelect={() => setSelectedWatchlist(list)} className="text-sm font-medium">
                                                {list}
                                            </DropdownMenuItem>
                                        ))}
                                        <DropdownMenuSeparator className="bg-white/10" />
                                        <DropdownMenuItem onSelect={() => console.log('Create new watchlist')}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            <span>Create new watchlist</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                
                                <DropdownMenu open={isScreenerDropdownOpen} onOpenChange={setIsScreenerDropdownOpen}>
                                    <TabsTrigger value="screener" asChild>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="flex items-center text-base p-0 h-auto hover:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground data-[state=inactive]:font-medium pr-2">
                                                Screeners
                                                <ChevronDown className={cn("ml-2 h-4 w-4 text-muted-foreground transition-transform", isScreenerDropdownOpen && "rotate-180")} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                    </TabsTrigger>
                                     <DropdownMenuContent className="w-56 backdrop-blur-md bg-black/50 border-white/10" style={{ WebkitBackdropFilter: 'blur(10px)', backdropFilter: 'blur(10px)' }}>
                                        {dummyScreeners.map((list) => (
                                             <DropdownMenuItem key={list} onSelect={() => setSelectedScreener(list)} className="text-sm font-medium">
                                                {list}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <TabsTrigger value="news">News</TabsTrigger>
                            </TabsList>
                            <TabsContent value="watchlist" className="flex-1 overflow-hidden mt-0 p-0">
                                <WatchlistCard
                                  className="h-full border-0 shadow-none rounded-none bg-transparent"
                                  onSymbolSelect={handleSyncedTickerChange}
                                  selectedSymbol={syncedTickerSymbol}
                                />
                            </TabsContent>
                            <TabsContent value="screener" className="flex-1 overflow-hidden mt-0 p-0">
                                <ScreenerWatchlist
                                  className="h-full border-0 shadow-none rounded-none bg-transparent"
                                  onSymbolSelect={handleSyncedTickerChange}
                                  selectedSymbol={syncedTickerSymbol}
                                />
                            </TabsContent>
                            <TabsContent value="news" className="flex-1 overflow-hidden mt-0 p-0">
                                <NewsCard
                                  className="h-full border-0 shadow-none rounded-none bg-transparent"
                                  onSymbolSelect={handleSyncedTickerChange}
                                  selectedSymbol={syncedTickerSymbol}
                                />
                            </TabsContent>
                        </Tabs>
                    </Card>
                </div>
              </div>
            </div>

            <div className="flex flex-col min-h-0 gap-1.5">
                <div className="lg:h-[calc(100%-24rem)] flex-shrink-0">
                    <OrderCard
                        selectedStock={stockForSyncedComps}
                        initialActionType={orderCardActionType}
                        initialTradeMode={orderCardInitialTradeMode}
                        miloActionContextText={orderCardMiloActionContext}
                        onSubmit={handleTradeSubmit}
                        onClear={handleClearOrderCard}
                        initialQuantity={orderCardInitialQuantity}
                        initialOrderType={orderCardInitialOrderType}
                        initialLimitPrice={orderCardInitialLimitPrice}
                        className="h-full"
                    />
                </div>
                <div className="flex-1 min-h-0">
                    <FundamentalsCard 
                        stock={stockForSyncedComps}
                        className="h-full"
                    />
                </div>
            </div>
        </div>
    </main>
  );
}

export default function TradingDashboardPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-background text-foreground">Loading Trading Terminal...</div>}>
      <TradingDashboardPageContent />
    </Suspense>
  );
}
