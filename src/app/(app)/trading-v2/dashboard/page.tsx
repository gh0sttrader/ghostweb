
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
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
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
import { CardMenu } from '@/components/v2/CardMenu';

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

  const [visibleWidgets, setVisibleWidgets] = useState({
    chart: true,
    order: true,
    positions: true,
    orders: false,
    history: false,
    watchlist: true,
    screeners: true,
    news: true,
  });

  const handleAddWidget = (widgetKey: keyof typeof visibleWidgets) => {
    if (visibleWidgets[widgetKey]) {
        toast({
            title: "Widget already visible",
            description: "This widget is already on your dashboard.",
        });
        return;
    }
    setVisibleWidgets(prev => ({ ...prev, [widgetKey]: true }));
  };
  
  const handleDeleteWidget = (widgetKey: keyof typeof visibleWidgets) => {
    setVisibleWidgets(prev => ({ ...prev, [widgetKey]: false }));
    toast({
        title: "Widget Removed",
        description: "The widget has been removed from your dashboard.",
    });
  };

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
    { i: 'positions', x: 0, y: 10, w: 12, h: 8, minW: 4, minH: 6 },
    { i: 'orders', x: 0, y: 18, w: 6, h: 8, minW: 4, minH: 6 },
    { i: 'history', x: 6, y: 18, w: 6, h: 8, minW: 4, minH: 6 },
    { i: 'watchlist', x: 0, y: 26, w: 4, h: 8, minW: 3, minH: 6 },
    { i: 'screeners', x: 4, y: 26, w: 4, h: 8, minW: 3, minH: 6 },
    { i: 'news', x: 8, y: 26, w: 4, h: 8, minW: 3, minH: 6 },
  ];

  if (!isMounted) {
    return <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">Loading Trading Terminal...</div>;
  }

  return (
    <main className="w-full h-full flex flex-col bg-background relative bg-dot-grid">
        <GhostTradingTopBar onAddWidget={handleAddWidget} />
        <div className="w-full h-full pt-[50px] overflow-hidden">
             <div className="h-full w-full overflow-hidden">
              <ResponsiveGridLayout 
                  className="layout"
                  layouts={{ lg: layout }}
                  breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                  cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                  rowHeight={32}
                  draggableHandle=".drag-handle"
                  draggableCancel=".no-drag"
                  isResizable
                  resizeHandles={['se', 'sw', 'ne', 'nw']}
                  margin={[16, 16]}
                  containerPadding={[0, 0]}
                  preventCollision={true}
                  compactType={"vertical"}
              >
                  {visibleWidgets.chart && <div key="chart" className="overflow-hidden">
                      <DraggableCard>
                          <InteractiveChartCardV2
                              stock={stockForSyncedComps}
                              onManualTickerSubmit={handleSyncedTickerChange}
                              className="drag-handle"
                          />
                           <div className="absolute top-2 right-2 z-10">
                                <CardMenu
                                    onCustomize={() => toast({ title: "Customize Columns clicked for Chart" })}
                                    onDelete={() => handleDeleteWidget('chart')}
                                />
                            </div>
                      </DraggableCard>
                  </div>}

                  {visibleWidgets.order && <div key="order" className="overflow-hidden">
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
                              className="h-full"
                          />
                          <div className="drag-handle absolute top-0 left-0 w-full h-12 cursor-move"></div>
                          <div className="absolute top-2 right-2 z-10">
                                <CardMenu
                                    onCustomize={() => toast({ title: "Customize Columns clicked for Order Card" })}
                                    onDelete={() => handleDeleteWidget('order')}
                                />
                           </div>
                      </DraggableCard>
                  </div>}
                  
                  {visibleWidgets.positions && <div key="positions" className="overflow-hidden">
                      <DraggableCard>
                          <CardHeader className="drag-handle cursor-move p-3 flex-row items-center justify-between">
                            <CardTitle className="text-base">Positions</CardTitle>
                             <CardMenu
                                onCustomize={() => toast({ title: "Customize Columns clicked for Positions" })}
                                onDelete={() => handleDeleteWidget('positions')}
                            />
                          </CardHeader>
                          <OpenPositionsCardV2 className="h-full border-0 shadow-none rounded-none bg-transparent" />
                      </DraggableCard>
                  </div>}

                  {visibleWidgets.orders && <div key="orders" className="overflow-hidden">
                      <DraggableCard>
                          <CardHeader className="drag-handle cursor-move p-3 flex-row items-center justify-between">
                            <CardTitle className="text-base">Open Orders</CardTitle>
                             <CardMenu
                                onCustomize={() => toast({ title: "Customize Columns clicked for Open Orders" })}
                                onDelete={() => handleDeleteWidget('orders')}
                            />
                          </CardHeader>
                          <OrdersTableV2 className="h-full border-0 shadow-none rounded-none bg-transparent" />
                      </DraggableCard>
                  </div>}

                  {visibleWidgets.history && <div key="history" className="overflow-hidden">
                      <DraggableCard>
                          <CardHeader className="drag-handle cursor-move p-3 flex-row items-center justify-between">
                            <CardTitle className="text-base">History</CardTitle>
                             <CardMenu
                                onCustomize={() => toast({ title: "Customize Columns clicked for History" })}
                                onDelete={() => handleDeleteWidget('history')}
                            />
                          </CardHeader>
                          <TradeHistoryTableV2 className="h-full border-0 shadow-none rounded-none bg-transparent" syncedTickerSymbol={syncedTickerSymbol} />
                      </DraggableCard>
                  </div>}

                  {visibleWidgets.watchlist && <div key="watchlist" className="overflow-hidden">
                      <DraggableCard>
                          <CardHeader className="drag-handle cursor-move p-3 flex-row items-center justify-between">
                            <CardTitle className="text-base">Watchlist</CardTitle>
                             <CardMenu
                                onCustomize={() => toast({ title: "Customize Columns clicked for Watchlist" })}
                                onDelete={() => handleDeleteWidget('watchlist')}
                            />
                          </CardHeader>
                          <WatchlistCardV2
                            className="h-full border-0 shadow-none rounded-none bg-transparent"
                            onSymbolSelect={handleSyncedTickerChange}
                            selectedSymbol={syncedTickerSymbol}
                          />
                      </DraggableCard>
                  </div>}

                  {visibleWidgets.screeners && <div key="screeners" className="overflow-hidden">
                      <DraggableCard>
                          <CardHeader className="drag-handle cursor-move p-3 flex-row items-center justify-between">
                              <CardTitle className="text-base">Screeners</CardTitle>
                               <CardMenu
                                  onCustomize={() => toast({ title: "Customize Columns clicked for Screeners" })}
                                  onDelete={() => handleDeleteWidget('screeners')}
                              />
                          </CardHeader>
                          <ScreenerWatchlistV2
                            className="h-full border-0 shadow-none rounded-none bg-transparent"
                            onSymbolSelect={handleSyncedTickerChange}
                            selectedSymbol={syncedTickerSymbol}
                          />
                      </DraggableCard>
                  </div>}
                  
                   {visibleWidgets.news && <div key="news" className="overflow-hidden">
                      <DraggableCard>
                          <CardHeader className="drag-handle cursor-move p-3 flex-row items-center justify-between">
                              <CardTitle className="text-base">News</CardTitle>
                               <CardMenu
                                  onCustomize={() => toast({ title: "Customize Columns clicked for News" })}
                                  onDelete={() => handleDeleteWidget('news')}
                              />
                          </CardHeader>
                          <NewsCardV2
                            className="h-full border-0 shadow-none rounded-none bg-transparent"
                            onSymbolSelect={handleSyncedTickerChange}
                            selectedSymbol={syncedTickerSymbol}
                          />
                      </DraggableCard>
                  </div>}
              </ResponsiveGridLayout>
            </div>
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
