
"use client";

import React, { useState, useMemo, Suspense, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Stock, TradeRequest, OrderActionType, TradeMode, OrderSystemType, NewsArticle, WidgetKey } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useTradeHistoryContext } from '@/contexts/TradeHistoryContext';
import { useOpenPositionsContext } from '@/contexts/OpenPositionsContext';
import { Button } from "@/components/ui/button";
import { Responsive, WidthProvider } from 'react-grid-layout';
const ResponsiveGridLayout = WidthProvider(Responsive);
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { v4 as uuidv4 } from 'uuid';

import { OrderCardV2 } from '@/components/v2/OrderCardV2';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { X } from 'lucide-react';

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

const initialLayouts: ReactGridLayout.Layout[] = [
    { i: 'chart', x: 0, y: 0, w: 9, h: 10, minW: 6, minH: 8, isResizable: true },
    { i: 'order', x: 9, y: 0, w: 3, h: 10, minW: 3, minH: 10, isResizable: true },
    { i: 'positions', x: 0, y: 10, w: 4, h: 8, minW: 3, minH: 6, isResizable: true },
    { i: 'orders', x: 4, y: 10, w: 4, h: 8, minW: 3, minH: 6, isResizable: true },
    { i: 'history', x: 8, y: 10, w: 4, h: 8, minW: 3, minH: 6, isResizable: true },
    { i: 'watchlist', x: 0, y: 18, w: 4, h: 8, minW: 2, minH: 6, isResizable: true },
    { i: 'screeners', x: 4, y: 18, w: 4, h: 8, minW: 2, minH: 6, isResizable: true },
    { i: 'news', x: 8, y: 18, w: 4, h: 8, minW: 2, minH: 6, isResizable: true },
];

const initialWidgetGroups: Record<string, WidgetKey[]> = {
    'chart': ['chart'],
    'order': ['order'],
    'positions': ['positions'],
    'orders': ['orders'],
    'history': ['history'],
    'watchlist': ['watchlist'],
    'screeners': ['screeners'],
    'news': ['news'],
};


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

  const [layouts, setLayouts] = useState<ReactGridLayout.Layout[]>(initialLayouts);
  const [widgetGroups, setWidgetGroups] = useState<Record<string, WidgetKey[]>>(initialWidgetGroups);
  
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
  
    const WIDGET_COMPONENTS: Record<WidgetKey, Widget> = useMemo(() => ({
      chart: { id: 'chart', label: 'Chart', component: <InteractiveChartCardV2 stock={stockForSyncedComps} onManualTickerSubmit={handleSyncedTickerChange} /> },
      order: { id: 'order', label: 'Trade', component: <OrderCardV2 selectedStock={stockForSyncedComps} initialActionType={orderCardActionType} initialTradeMode={orderCardInitialTradeMode} miloActionContextText={orderCardMiloActionContext} onSubmit={handleTradeSubmit} onClear={handleClearOrderCard} initialQuantity={orderCardInitialQuantity} initialOrderType={orderCardInitialOrderType} initialLimitPrice={orderCardInitialLimitPrice} className="h-full" /> },
      positions: { id: 'positions', label: 'Positions', component: <OpenPositionsCardV2 className="h-full border-0 shadow-none rounded-none bg-transparent" /> },
      orders: { id: 'orders', label: 'Open Orders', component: <OrdersTableV2 className="h-full border-0 shadow-none rounded-none bg-transparent" /> },
      history: { id: 'history', label: 'History', component: <TradeHistoryTableV2 className="h-full border-0 shadow-none rounded-none bg-transparent" syncedTickerSymbol={syncedTickerSymbol} /> },
      watchlist: { id: 'watchlist', label: 'Watchlist', component: <WatchlistCardV2 className="h-full border-0 shadow-none rounded-none bg-transparent" onSymbolSelect={handleSyncedTickerChange} selectedSymbol={syncedTickerSymbol} /> },
      screeners: { id: 'screeners', label: 'Screeners', component: <ScreenerWatchlistV2 className="h-full border-0 shadow-none rounded-none bg-transparent" onSymbolSelect={handleSyncedTickerChange} selectedSymbol={syncedTickerSymbol} /> },
      news: { id: 'news', label: 'News', component: <NewsCardV2 className="h-full border-0 shadow-none rounded-none bg-transparent" onSymbolSelect={handleSyncedTickerChange} selectedSymbol={syncedTickerSymbol} /> },
    }), [stockForSyncedComps, handleSyncedTickerChange, orderCardActionType, orderCardInitialTradeMode, orderCardMiloActionContext, handleTradeSubmit, handleClearOrderCard, orderCardInitialQuantity, orderCardInitialOrderType, orderCardInitialLimitPrice, syncedTickerSymbol]);


  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLayoutChange = (newLayout: ReactGridLayout.Layout[]) => {
      // Prevent empty layout, which can happen on widget deletion race conditions
      if (newLayout.length === 0 && layouts.length > 0) return;
      setLayouts(newLayout);
  };
  
  const handleLayoutConfigChange = (config: { layouts: ReactGridLayout.Layout[], widgetGroups: Record<string, WidgetKey[]> }) => {
      setLayouts(config.layouts);
      setWidgetGroups(config.widgetGroups);
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
  
  const addWidgetToGroup = (groupId: string, widgetKey: WidgetKey) => {
    setWidgetGroups(prev => {
        const allWidgets = Object.values(prev).flat();
        if (allWidgets.includes(widgetKey)) {
          toast({ title: `Widget "${WIDGET_COMPONENTS[widgetKey].label}" is already on the dashboard.` });
          return prev;
        }
        
        const currentGroup = prev[groupId] || [];
        if (currentGroup.includes(widgetKey)) {
            toast({ title: "Widget already in this group." });
            return prev;
        }
        return { ...prev, [groupId]: [...currentGroup, widgetKey] };
    });
  };

  const addWidgetAsNewCard = (widgetKey: WidgetKey) => {
      const allWidgets = Object.values(widgetGroups).flat();
      if (allWidgets.includes(widgetKey)) {
          toast({ title: `Widget "${WIDGET_COMPONENTS[widgetKey].label}" is already on the dashboard.` });
          return;
      }
      
      const newCardId = uuidv4();
      const newLayoutItem: ReactGridLayout.Layout = { i: newCardId, x: 0, y: Infinity, w: 4, h: 8, minW: 3, minH: 6 };

      setLayouts(prev => [...prev, newLayoutItem]);
      setWidgetGroups(prev => ({...prev, [newCardId]: [widgetKey]}));
      toast({ title: "Widget added as a new card." });
  }

  const handleDeleteWidget = useCallback((groupId: string) => {
    setWidgetGroups(prev => {
      const newGroups = {...prev};
      delete newGroups[groupId];
      return newGroups;
    });
    setLayouts(prev => prev.filter(l => l.i !== groupId));
    toast({ title: `Card removed from layout.` });
  }, []);

  const handleSeparateWidget = useCallback((groupId: string, widgetKey: WidgetKey) => {
    setWidgetGroups(prev => {
        const newGroups = { ...prev };
        const group = newGroups[groupId] || [];
        const newGroup = group.filter(wk => wk !== widgetKey);
        
        if (newGroup.length === 0) {
            // If the group is empty, remove the card layout as well
            delete newGroups[groupId];
            setLayouts(layouts => layouts.filter(l => l.i !== groupId));
        } else {
            newGroups[groupId] = newGroup;
        }
        toast({ title: `Widget "${WIDGET_COMPONENTS[widgetKey].label}" removed.` });
        return newGroups;
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
            onAddWidget={addWidgetAsNewCard}
            currentLayouts={layouts}
            onLayoutChange={handleLayoutConfigChange}
            widgetGroups={widgetGroups}
            onWidgetGroupsChange={setWidgetGroups}
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
                    onLayoutChange={(layout) => handleLayoutChange(layout)}
                    isResizable
                    resizeHandles={['se']}
                    margin={[16, 16]}
                    containerPadding={[0, 0]}
                    preventCollision={true}
                    compactType={"vertical"}
                >
                  {layouts.map(layoutItem => {
                       const groupId = layoutItem.i;
                       const widgetsInGroup = widgetGroups[groupId] || [];
                       if (widgetsInGroup.length === 0) return null;
                       
                       const isChart = groupId === 'chart';
                       const isOrder = groupId === 'order';

                       return (
                           <div key={groupId} className="overflow-hidden">
                                <DraggableCard>
                                    {isChart ? (
                                        WIDGET_COMPONENTS['chart'].component
                                    ) : widgetsInGroup.length === 1 ? (
                                        <>
                                            <CardHeader className="py-1 px-3 border-b border-white/10 drag-handle cursor-move h-8 flex-row items-center">
                                                <CardTitle className="text-sm font-semibold text-muted-foreground">
                                                    {WIDGET_COMPONENTS[widgetsInGroup[0]].label}
                                                </CardTitle>
                                                <div className="ml-auto no-drag">
                                                   <CardMenu
                                                        showAddWidget={!isOrder}
                                                        onAddWidget={() => {
                                                            const newWidgetKey = prompt("Enter widget key to add (e.g., news, history):") as WidgetKey | null;
                                                            if (newWidgetKey && WIDGET_COMPONENTS[newWidgetKey]) {
                                                                addWidgetToGroup(groupId, newWidgetKey);
                                                            } else if (newWidgetKey) {
                                                                toast({title: "Invalid widget key", variant: "destructive"})
                                                            }
                                                        }}
                                                        onCustomize={() => toast({ title: `Customize ${widgetsInGroup[0]}`})}
                                                        onDelete={() => handleDeleteWidget(groupId)}
                                                    />
                                                </div>
                                            </CardHeader>
                                            <CardContent className={cn("flex-1 overflow-auto h-full p-3")}>
                                              {WIDGET_COMPONENTS[widgetsInGroup[0]].component}
                                            </CardContent>
                                        </>
                                    ) : (
                                       <Tabs defaultValue={widgetsInGroup[0]} className="flex flex-col h-full">
                                            <CardHeader className="p-0 border-b border-white/10 drag-handle cursor-move h-8 flex-row items-center">
                                                <TabsList className="h-8 p-0 bg-transparent border-none gap-1 px-2">
                                                    {widgetsInGroup.map(widgetKey => (
                                                        <TabsTrigger key={widgetKey} value={widgetKey} className="h-6 text-xs px-2 py-1 rounded-md relative group/tab">
                                                            {WIDGET_COMPONENTS[widgetKey].label}
                                                            <button 
                                                              onClick={(e) => {
                                                                  e.stopPropagation();
                                                                  handleSeparateWidget(groupId, widgetKey);
                                                              }}
                                                              className="absolute -top-1 -right-1 p-0.5 bg-destructive rounded-full text-destructive-foreground opacity-0 group-hover/tab:opacity-100 transition-opacity"
                                                              aria-label={`Separate ${WIDGET_COMPONENTS[widgetKey].label}`}
                                                            >
                                                              <X size={10} />
                                                            </button>
                                                        </TabsTrigger>
                                                    ))}
                                                </TabsList>
                                                <div className="ml-auto no-drag pr-2">
                                                    <CardMenu
                                                        showAddWidget={!isOrder}
                                                        onAddWidget={() => {
                                                            const newWidgetKey = prompt("Enter widget key to add (e.g., news, history):") as WidgetKey | null;
                                                            if (newWidgetKey && WIDGET_COMPONENTS[newWidgetKey]) {
                                                                addWidgetToGroup(groupId, newWidgetKey);
                                                            } else if (newWidgetKey) {
                                                                toast({title: "Invalid widget key", variant: "destructive"})
                                                            }
                                                        }}
                                                        onCustomize={() => toast({ title: `Customize widgets...` })}
                                                        onDelete={() => handleDeleteWidget(groupId)}
                                                    />
                                                </div>
                                            </CardHeader>
                                            {widgetsInGroup.map(widgetKey => (
                                                <TabsContent key={widgetKey} value={widgetKey} className="flex-1 overflow-auto h-full p-3 mt-0">
                                                    {WIDGET_COMPONENTS[widgetKey].component}
                                                </TabsContent>
                                            ))}
                                       </Tabs>
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
