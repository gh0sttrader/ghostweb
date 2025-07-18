
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
import { Responsive, WidthProvider } from 'react-grid-layout';
const ResponsiveGridLayout = WidthProvider(Responsive);


import { OrderCardV2 } from '@/components/v2/OrderCardV2';
import { Card, CardHeader } from '@/components/ui/card';
import { InteractiveChartCardV2 } from '@/components/v2/charts/InteractiveChartCardV2';
import { WatchlistCardV2 } from '@/components/v2/WatchlistCardV2';
import { OpenPositionsCardV2 } from '@/components/v2/OpenPositionsCardV2';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TradeHistoryTableV2 } from '@/components/v2/market/TradeHistoryTableV2';
import { OrdersTableV2 } from '@/components/v2/market/OrdersTableV2';
import { FundamentalsCardV2 } from '@/components/v2/FundamentalsCardV2';
import { initialMockStocks } from '@/app/(app)/trading/dashboard/mock-data';
import { NewsCardV2 } from '@/components/v2/NewsCardV2';
import { cn } from '@/lib/utils';
import { ScreenerWatchlistV2 } from '@/components/v2/ScreenerWatchlistV2';
import { GhostTradingTopBar } from '@/components/v2/GhostTradingTopBar';

const dummyWatchlists = ["My Watchlist", "Tech Stocks", "Growth", "Crypto", "High Volume"];
const dummyScreeners = ["Top Gainers", "High Volume", "Unusual Options"];


const DraggableCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("bg-card border border-white/10 rounded-lg flex flex-col overflow-hidden h-full", className)}>
        {children}
    </div>
);


function TradingDashboardPageContentV2() {
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

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

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
  
  const layout = [
    { i: 'chart', x: 0, y: 0, w: 9, h: 10, minW: 6, minH: 8 },
    { i: 'order', x: 9, y: 0, w: 3, h: 10, minW: 3, minH: 10 },
    { i: 'positions', x: 0, y: 10, w: 6, h: 8, minW: 4, minH: 6 },
    { i: 'watchlist', x: 6, y: 10, w: 3, h: 8, minW: 3, minH: 6 },
    { i: 'screeners', x: 9, y: 10, w: 3, h: 8, minW: 3, minH: 6 },
    { i: 'news', x: 0, y: 18, w: 9, h: 8, minW: 3, minH: 6 },
    { i: 'fundamentals', x: 9, y: 18, w: 3, h: 8, minW: 3, minH: 8 },
  ];

  if (!isMounted) {
    return <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">Loading Trading Terminal...</div>;
  }

  return (
    <main className="w-full h-full flex flex-col bg-background relative bg-dot-grid">
        <GhostTradingTopBar />
        <div className="flex-1 w-full h-full pt-[50px] overflow-hidden">
              <ResponsiveGridLayout 
                  className="layout"
                  layouts={{ lg: layout }}
                  breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                  cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                  rowHeight={32}
                  draggableHandle=".drag-handle"
                  isResizable
                  resizeHandles={['se', 'sw', 'ne', 'nw']}
                  margin={[16, 16]}
                  containerPadding={[0, 0]}
                  preventCollision={true}
                  compactType={"vertical"}
              >
                  <div key="chart" className="overflow-hidden">
                      <DraggableCard>
                          <InteractiveChartCardV2
                              stock={stockForSyncedComps}
                              onManualTickerSubmit={handleSyncedTickerChange}
                              className="drag-handle"
                          />
                      </DraggableCard>
                  </div>

                  <div key="order" className="overflow-hidden">
                      <DraggableCard>
                          <OrderCardV2
                              selectedStock={stockForSyncedComps}
                              initialActionType={orderCardActionType}
                              initialTradeMode={orderCardInitialTradeMode}
                              miloActionContextText={orderCardMiloActionContext}
                              onSubmit={handleTradeSubmit}
                              onClear={handleClearOrderCard}
                              initialQuantity={orderCardInitialQuantity}
                              initialOrderType={orderCardInitialOrderType}
                              initialLimitPrice={orderCardInitialLimitPrice}
                              className="h-full drag-handle"
                          />
                      </DraggableCard>
                  </div>
                  
                  <div key="positions" className="overflow-hidden">
                      <DraggableCard>
                          <Tabs defaultValue="positions" className="flex flex-col h-full">
                              <TabsList className="shrink-0 px-3 pt-2 drag-handle cursor-move">
                                  <TabsTrigger value="positions">Positions</TabsTrigger>
                                  <TabsTrigger value="orders">Open Orders</TabsTrigger>
                                  <TabsTrigger value="history">History</TabsTrigger>
                              </TabsList>
                              <TabsContent value="positions" className="flex-1 overflow-hidden mt-0 p-0">
                                  <OpenPositionsCardV2 className="h-full border-0 shadow-none rounded-none bg-transparent" />
                              </TabsContent>
                              <TabsContent value="orders" className="flex-1 overflow-hidden mt-0 p-0">
                                  <OrdersTableV2 className="h-full border-0 shadow-none rounded-none bg-transparent" />
                              </TabsContent>
                              <TabsContent value="history" className="flex-1 overflow-hidden mt-0 p-0">
                                <TradeHistoryTableV2 className="h-full border-0 shadow-none rounded-none bg-transparent" syncedTickerSymbol={syncedTickerSymbol} />
                              </TabsContent>
                          </Tabs>
                      </DraggableCard>
                  </div>

                  <div key="watchlist" className="overflow-hidden">
                      <DraggableCard>
                          <CardHeader className="drag-handle cursor-move p-3">
                            <CardTitle className="text-base">Watchlist</CardTitle>
                          </CardHeader>
                          <WatchlistCardV2
                            className="h-full border-0 shadow-none rounded-none bg-transparent"
                            onSymbolSelect={handleSyncedTickerChange}
                            selectedSymbol={syncedTickerSymbol}
                          />
                      </DraggableCard>
                  </div>

                  <div key="screeners" className="overflow-hidden">
                      <DraggableCard>
                          <CardHeader className="drag-handle cursor-move p-3">
                              <CardTitle className="text-base">Screeners</CardTitle>
                          </CardHeader>
                          <ScreenerWatchlistV2
                            className="h-full border-0 shadow-none rounded-none bg-transparent"
                            onSymbolSelect={handleSyncedTickerChange}
                            selectedSymbol={syncedTickerSymbol}
                          />
                      </DraggableCard>
                  </div>
                  
                   <div key="news" className="overflow-hidden">
                      <DraggableCard>
                          <CardHeader className="drag-handle cursor-move p-3">
                              <CardTitle className="text-base">News</CardTitle>
                          </CardHeader>
                          <NewsCardV2
                            className="h-full border-0 shadow-none rounded-none bg-transparent"
                            onSymbolSelect={handleSyncedTickerChange}
                            selectedSymbol={syncedTickerSymbol}
                          />
                      </DraggableCard>
                  </div>

                  <div key="fundamentals" className="overflow-hidden">
                      <DraggableCard>
                          <FundamentalsCardV2 
                              stock={stockForSyncedComps}
                              className="h-full drag-handle"
                          />
                      </DraggableCard>
                  </div>
              </ResponsiveGridLayout>
        </div>
    </main>
  );
}

export default function TradingDashboardPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-background text-foreground">Loading Trading Terminal...</div>}>
      <TradingDashboardPageContentV2 />
    </Suspense>
  );
}
