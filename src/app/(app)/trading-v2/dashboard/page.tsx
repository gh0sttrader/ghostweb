
"use client";

import React, { useState, useMemo, Suspense, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Stock, TradeRequest, OrderActionType, TradeMode, OrderSystemType, NewsArticle } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useTradeHistoryContext } from '@/contexts/TradeHistoryContext';
import { useOpenPositionsContext } from '@/contexts/OpenPositionsContext';
import { Button } from "@/components/ui/button";
import { Responsive, WidthProvider } from 'react-grid-layout';
const ResponsiveGridLayout = WidthProvider(Responsive);
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { OrderCardV2 } from '@/components/v2/OrderCardV2';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { InteractiveChartCardV2 } from '@/components/v2/charts/InteractiveChartCardV2';
import { WatchlistCardV2 } from '@/components/v2/WatchlistCardV2';
import { OpenPositionsCardV2 } from '@/components/v2/OpenPositionsCardV2';
import { TradeHistoryTableV2 } from '@/components/v2/market/TradeHistoryTableV2';
import { OrdersTableV2 } from '@/components/v2/market/OrdersTableV2';
import { initialMockStocks } from '@/app/(app)/trading/dashboard/mock-data';
import { NewsCardV2 } from '@/components/v2/NewsCardV2';
import { cn } from '@/lib/utils';
import { ScreenerWatchlistV2 } from '@/components/v2/ScreenerWatchlistV2';
import { GhostTradingTopBar } from '@/components/v2/GhostTradingTopBar';
import { CardMenu } from '@/components/v2/CardMenu';
import { SplashScreen } from '@/components/v2/SplashScreen';
import { FundamentalsCardV2 } from '@/components/v2/FundamentalsCardV2';

type WidgetKey = 'chart' | 'order' | 'positions' | 'orders' | 'history' | 'watchlist' | 'screeners' | 'news';

interface Widget {
    id: WidgetKey;
    label: string;
    component: React.ReactNode;
    isProtected?: boolean;
}

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
  
  const [isMounted, setIsMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const initialLayouts = [
    { i: 'chart', x: 0, y: 0, w: 9, h: 10, minW: 6, minH: 8, isResizable: true },
    { i: 'order', x: 9, y: 0, w: 3, h: 10, minW: 3, minH: 10, isResizable: true },
    { i: 'positions', x: 0, y: 10, w: 4, h: 8, minW: 3, minH: 6, isResizable: true },
    { i: 'orders', x: 4, y: 10, w: 4, h: 8, minW: 3, minH: 6, isResizable: true },
    { i: 'history', x: 8, y: 10, w: 4, h: 8, minW: 3, minH: 6, isResizable: true },
    { i: 'watchlist', x: 0, y: 18, w: 4, h: 8, minW: 2, minH: 6, isResizable: true },
    { i: 'screeners', x: 4, y: 18, w: 4, h: 8, minW: 2, minH: 6, isResizable: true },
    { i: 'news', x: 8, y: 18, w: 4, h: 8, minW: 2, minH: 6, isResizable: true },
  ];

  const [layouts, setLayouts] = useState(initialLayouts);
  
  useEffect(() => {
    setIsMounted(true);
    try {
        const savedLayout = localStorage.getItem("ghostLayout");
        if (savedLayout) {
            setLayouts(JSON.parse(savedLayout));
        }
    } catch (error) {
        console.error("Could not parse saved layout:", error);
        setLayouts(initialLayouts);
    }
  }, []);

  const handleLayoutChange = (newLayout: ReactGridLayout.Layout[]) => {
      setLayouts(newLayout);
      localStorage.setItem("ghostLayout", JSON.stringify(newLayout));
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

  const WIDGET_COMPONENTS: Record<WidgetKey, Widget> = {
    chart: { id: 'chart', label: 'Chart', component: <InteractiveChartCardV2 stock={stockForSyncedComps} onManualTickerSubmit={handleSyncedTickerChange} /> },
    order: { id: 'order', label: 'Trade', component: <OrderCardV2 selectedStock={stockForSyncedComps} initialActionType={orderCardActionType} initialTradeMode={orderCardInitialTradeMode} miloActionContextText={orderCardMiloActionContext} onSubmit={handleTradeSubmit} onClear={handleClearOrderCard} initialQuantity={orderCardInitialQuantity} initialOrderType={orderCardInitialOrderType} initialLimitPrice={orderCardInitialLimitPrice} className="h-full" /> },
    positions: { id: 'positions', label: 'Positions', component: <OpenPositionsCardV2 className="h-full border-0 shadow-none rounded-none bg-transparent" /> },
    orders: { id: 'orders', label: 'Open Orders', component: <OrdersTableV2 className="h-full border-0 shadow-none rounded-none bg-transparent" /> },
    history: { id: 'history', label: 'History', component: <TradeHistoryTableV2 className="h-full border-0 shadow-none rounded-none bg-transparent" syncedTickerSymbol={syncedTickerSymbol} /> },
    watchlist: { id: 'watchlist', label: 'Watchlist', component: <WatchlistCardV2 className="h-full border-0 shadow-none rounded-none bg-transparent" onSymbolSelect={handleSyncedTickerChange} selectedSymbol={syncedTickerSymbol} /> },
    screeners: { id: 'screeners', label: 'Screeners', component: <ScreenerWatchlistV2 className="h-full border-0 shadow-none rounded-none bg-transparent" onSymbolSelect={handleSyncedTickerChange} selectedSymbol={syncedTickerSymbol} /> },
    news: { id: 'news', label: 'News', component: <NewsCardV2 className="h-full border-0 shadow-none rounded-none bg-transparent" onSymbolSelect={handleSyncedTickerChange} selectedSymbol={syncedTickerSymbol} /> },
  };

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
  

  const addWidget = (widgetKey: WidgetKey) => {
    // This function will be needed if we add widgets dynamically
    toast({ title: `Adding ${widgetKey} is not implemented yet.` });
  }

  const handleDeleteWidget = useCallback((widgetId: string) => {
    const widgetKey = widgetId as WidgetKey;
    const widgetLabel = WIDGET_COMPONENTS[widgetKey]?.label || 'Widget';
    setLayouts(prev => prev.filter(l => l.i !== widgetId));
    toast({
        title: `${widgetLabel} Removed`,
        description: `The ${widgetLabel.toLowerCase()} widget has been removed from your layout.`,
    });
  }, [WIDGET_COMPONENTS]);


  if (!isMounted) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }
  
  if (showSplash) {
      return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <main className="w-full h-full flex flex-col bg-background relative bg-dot-grid">
        <GhostTradingTopBar
            onAddWidget={(key) => addWidget(key as WidgetKey)}
            currentLayouts={layouts}
            onLayoutChange={({ layouts: newLayouts }) => setLayouts(newLayouts)}
            widgetGroups={{}}
            onWidgetGroupsChange={() => {}}
        />
        <div className="w-full h-full pt-[50px] overflow-hidden">
             <div className="h-full w-full overflow-hidden">
                <ResponsiveGridLayout
                    className="layout"
                    layouts={{ lg: layouts }}
                    breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                    cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                    rowHeight={32}
                    draggableHandle=".drag-handle"
                    onLayoutChange={(layout, allLayouts) => handleLayoutChange(layout)}
                    isResizable
                    resizeHandles={['se']}
                    margin={[16, 16]}
                    containerPadding={[0, 0]}
                    preventCollision={true}
                    compactType={"vertical"}
                >
                  {layouts.map(layoutItem => {
                       const widgetKey = layoutItem.i as WidgetKey;
                       const widget = WIDGET_COMPONENTS[widgetKey];
                       if (!widget) return null;
                       
                       const isChart = widget.id === 'chart';
                       const isOrder = widget.id === 'order';

                       return (
                           <div key={widgetKey} className="overflow-hidden">
                                <DraggableCard>
                                    {isChart ? (
                                        widget.component
                                    ) : (
                                        <>
                                            <CardHeader className="py-1 px-3 border-b border-white/10 drag-handle cursor-move h-8 flex-row items-center">
                                                <CardTitle className="text-sm font-semibold text-muted-foreground">
                                                    {widget.label}
                                                </CardTitle>
                                                <div className="ml-auto no-drag">
                                                   <CardMenu
                                                        showAddWidget={!isOrder}
                                                        onAddWidget={() => toast({ title: `Add to ${widget.label}`})}
                                                        onCustomize={() => toast({ title: `Customize ${widget.label}`})}
                                                        onDelete={() => handleDeleteWidget(widgetKey)}
                                                    />
                                                </div>
                                            </CardHeader>
                                            <CardContent className={cn("flex-1 overflow-auto h-full p-3")}>
                                              {widget.component}
                                            </CardContent>
                                        </>
                                    )}
                               </DraggableCard>
                           </div>
                       )
                  })}
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
