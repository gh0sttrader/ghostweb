
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

import { OrderCardV2 } from '@/components/v2/OrderCardV2';
import { CardHeader, CardTitle } from '@/components/ui/card';
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

type WidgetKey = 'chart' | 'order' | 'positions' | 'orders' | 'history' | 'watchlist' | 'screeners' | 'news';

interface Widget {
    id: WidgetKey;
    label: string;
    component: React.ReactNode;
    layout: ReactGridLayout.Layout;
}

const DraggableCard = ({ children, className, isOver }: { children: React.ReactNode, className?: string, isOver?: boolean }) => (
    <div className={cn(
        "bg-card border border-white/10 rounded-lg flex flex-col overflow-hidden h-full transition-all duration-200", 
        className,
        isOver && "ring-2 ring-primary ring-offset-2 ring-offset-background"
        )}>
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
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [widgetGroups, setWidgetGroups] = useState<Record<string, WidgetKey[]>>({
    chart: ['chart'],
    order: ['order'],
    positions: ['positions'],
    watchlist: ['watchlist'],
    screeners: ['screeners'],
    news: ['news'],
  });

  const [activeTabs, setActiveTabs] = useState<Record<string, WidgetKey>>({});
  const [draggedItem, setDraggedItem] = useState<ReactGridLayout.Layout | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  const initialLayouts: Record<WidgetKey, ReactGridLayout.Layout> = {
    chart: { i: 'chart', x: 0, y: 0, w: 9, h: 10, minW: 6, minH: 8 },
    order: { i: 'order', x: 9, y: 0, w: 3, h: 10, minW: 2, minH: 10 },
    positions: { i: 'positions', x: 0, y: 10, w: 12, h: 8, minW: 4, minH: 6 },
    orders: { i: 'orders', x: 0, y: 18, w: 6, h: 8, minW: 4, minH: 6 },
    history: { i: 'history', x: 6, y: 18, w: 6, h: 8, minW: 4, minH: 6 },
    watchlist: { i: 'watchlist', x: 0, y: 26, w: 4, h: 8, minW: 2, minH: 6 },
    screeners: { i: 'screeners', x: 4, y: 26, w: 4, h: 8, minW: 2, minH: 6 },
    news: { i: 'news', x: 8, y: 26, w: 4, h: 8, minW: 2, minH: 6 },
  };
  
  const [layouts, setLayouts] = useState<ReactGridLayout.Layout[]>(Object.values(initialLayouts));

  const handleLayoutChange = (newLayout: ReactGridLayout.Layout[]) => {
      setLayouts(newLayout);
  };
  
  const handleDeleteWidget = (groupKey: string, widgetKey: WidgetKey) => {
      setWidgetGroups(prev => {
          const newGroups = {...prev};
          const group = newGroups[groupKey];

          if (group.length === 1) {
              delete newGroups[groupKey];
          } else {
              newGroups[groupKey] = group.filter(wId => wId !== widgetKey);
              // if the active tab was deleted, reset to the first one
              if (activeTabs[groupKey] === widgetKey) {
                  setActiveTabs(prevTabs => ({...prevTabs, [groupKey]: newGroups[groupKey][0]}));
              }
          }
          return newGroups;
      });
      toast({
        title: "Widget Removed",
        description: "The widget has been removed from your dashboard.",
    });
  };

  const addWidget = (widgetKey: WidgetKey) => {
      const isAlreadyVisible = Object.values(widgetGroups).flat().includes(widgetKey);
      if(isAlreadyVisible) {
          toast({
              title: "Widget already visible",
              description: "This widget is already on your dashboard.",
          });
          return;
      }

      setWidgetGroups(prev => ({
          ...prev,
          [widgetKey]: [widgetKey]
      }));
  }

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

  const onDragStart = (layout: ReactGridLayout.Layout[], oldItem: ReactGridLayout.Layout) => {
      setDraggedItem(oldItem);
  };
  
  const onDragStop = () => {
      setDraggedItem(null);
      setDropTarget(null);
  };

  const onDrop = (layout: ReactGridLayout.Layout[], item: ReactGridLayout.Layout, e: DragEvent) => {
      const targetId = (e.target as HTMLElement).closest('.react-grid-item')?.id;
      if (!targetId || !draggedItem || targetId === draggedItem.i) return;
      
      const sourceGroupKey = draggedItem.i;
      const targetGroupKey = targetId;

      const sourceWidgets = widgetGroups[sourceGroupKey];
      const targetWidgets = widgetGroups[targetGroupKey];
      
      // Prevent combining with chart or order card
      const isTargetProtected = targetGroupKey === 'chart' || targetGroupKey === 'order';
      const isSourceProtected = sourceGroupKey === 'chart' || sourceGroupKey === 'order';

      if (sourceWidgets && targetWidgets && !isTargetProtected && !isSourceProtected) {
          // Combine groups
          const newWidgetGroups = { ...widgetGroups };
          delete newWidgetGroups[sourceGroupKey];
          newWidgetGroups[targetGroupKey] = [...targetWidgets, ...sourceWidgets];
          setWidgetGroups(newWidgetGroups);
      }
  };

  const onDragOver = (e: DragEvent) => {
      const targetElement = (e.target as HTMLElement).closest('.react-grid-item');
      if (targetElement) {
          const targetId = targetElement.id;
          const isTargetProtected = targetId === 'chart' || targetId === 'order';
          const isSourceProtected = draggedItem?.i === 'chart' || draggedItem?.i === 'order';

          if (draggedItem && targetId !== draggedItem.i && !isTargetProtected && !isSourceProtected) {
              setDropTarget(targetId);
          } else {
              setDropTarget(null);
          }
      }
  };
  
  const uncombineGroup = (groupKey: string) => {
      const groupToSplit = widgetGroups[groupKey];
      if (!groupToSplit || groupToSplit.length <= 1) return;

      setWidgetGroups(prev => {
          const newGroups = {...prev};
          delete newGroups[groupKey];
          groupToSplit.forEach(widgetId => {
              newGroups[widgetId] = [widgetId];
          });
          return newGroups;
      });
  };

  const WIDGET_COMPONENTS: Record<WidgetKey, Widget> = {
    chart: { id: 'chart', label: 'Chart', component: <InteractiveChartCardV2 stock={stockForSyncedComps} onManualTickerSubmit={handleSyncedTickerChange} className="drag-handle" />, layout: initialLayouts.chart },
    order: { id: 'order', label: 'Trading Card', component: <OrderCardV2 selectedStock={stockForSyncedComps} initialActionType={orderCardActionType} initialTradeMode={orderCardInitialTradeMode} miloActionContextText={orderCardMiloActionContext} onSubmit={handleTradeSubmit} onClear={handleClearOrderCard} initialQuantity={orderCardInitialQuantity} initialOrderType={orderCardInitialOrderType} initialLimitPrice={orderCardInitialLimitPrice} className="h-full" />, layout: initialLayouts.order },
    positions: { id: 'positions', label: 'Positions', component: <OpenPositionsCardV2 className="h-full border-0 shadow-none rounded-none bg-transparent" />, layout: initialLayouts.positions },
    orders: { id: 'orders', label: 'Open Orders', component: <OrdersTableV2 className="h-full border-0 shadow-none rounded-none bg-transparent" />, layout: initialLayouts.orders },
    history: { id: 'history', label: 'History', component: <TradeHistoryTableV2 className="h-full border-0 shadow-none rounded-none bg-transparent" syncedTickerSymbol={syncedTickerSymbol} />, layout: initialLayouts.history },
    watchlist: { id: 'watchlist', label: 'Watchlist', component: <WatchlistCardV2 className="h-full border-0 shadow-none rounded-none bg-transparent" onSymbolSelect={handleSyncedTickerChange} selectedSymbol={syncedTickerSymbol} />, layout: initialLayouts.watchlist },
    screeners: { id: 'screeners', label: 'Screeners', component: <ScreenerWatchlistV2 className="h-full border-0 shadow-none rounded-none bg-transparent" onSymbolSelect={handleSyncedTickerChange} selectedSymbol={syncedTickerSymbol} />, layout: initialLayouts.screeners },
    news: { id: 'news', label: 'News', component: <NewsCardV2 className="h-full border-0 shadow-none rounded-none bg-transparent" onSymbolSelect={handleSyncedTickerChange} selectedSymbol={syncedTickerSymbol} />, layout: initialLayouts.news },
  };

  const currentLayout = useMemo(() => {
      return Object.keys(widgetGroups).map(groupKey => {
          const correspondingLayout = layouts.find(l => l.i === groupKey);
          return correspondingLayout || WIDGET_COMPONENTS[widgetGroups[groupKey][0]].layout;
      });
  }, [widgetGroups, layouts]);

  if (!isMounted) {
    return <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">Loading Trading Terminal...</div>;
  }

  return (
    <main className="w-full h-full flex flex-col bg-background relative bg-dot-grid" onDragOver={onDragOver}>
        <GhostTradingTopBar onAddWidget={(key) => addWidget(key as WidgetKey)} />
        <div className="w-full h-full pt-[50px] overflow-hidden">
             <div className="h-full w-full overflow-hidden">
              <ResponsiveGridLayout 
                  className="layout"
                  layouts={{ lg: currentLayout }}
                  breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                  cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                  rowHeight={32}
                  draggableHandle=".drag-handle"
                  draggableCancel=".no-drag"
                  isResizable
                  onLayoutChange={handleLayoutChange}
                  onDrop={onDrop}
                  onDragStart={onDragStart}
                  onDragStop={onDragStop}
                  resizeHandles={['se']}
                  margin={[16, 16]}
                  containerPadding={[0, 0]}
                  preventCollision={true}
                  compactType={"vertical"}
              >
                  {Object.entries(widgetGroups).map(([groupKey, widgetIds]) => {
                       const activeWidgetId = activeTabs[groupKey] || widgetIds[0];
                       const activeWidget = WIDGET_COMPONENTS[activeWidgetId];
                       
                       return (
                           <div key={groupKey} id={groupKey} className="overflow-hidden">
                                <DraggableCard isOver={dropTarget === groupKey}>
                                    {widgetIds.length > 1 ? (
                                        <>
                                            <div className="flex items-center border-b border-white/10 px-2 drag-handle cursor-move">
                                                {widgetIds.map(widgetId => (
                                                    <button 
                                                        key={widgetId} 
                                                        className={cn(
                                                            "px-3 py-2 text-sm font-medium border-b-2",
                                                            activeWidgetId === widgetId ? "text-foreground border-primary" : "text-muted-foreground border-transparent hover:text-foreground"
                                                        )}
                                                        onClick={() => setActiveTabs(prev => ({...prev, [groupKey]: widgetId}))}
                                                    >
                                                        {WIDGET_COMPONENTS[widgetId].label}
                                                    </button>
                                                ))}
                                                <Button variant="link" className="ml-auto text-destructive text-xs h-auto py-0 px-2" onClick={() => uncombineGroup(groupKey)}>Separate</Button>
                                                <div className="no-drag ml-2">
                                                    <CardMenu
                                                        onCustomize={() => toast({ title: `Customize ${activeWidget.label}`})}
                                                        onDelete={() => handleDeleteWidget(groupKey, activeWidgetId)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                {activeWidget.component}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <CardHeader className="drag-handle cursor-move p-3 flex-row items-center justify-between">
                                                <CardTitle className="text-base">{activeWidget.label}</CardTitle>
                                                <div className="no-drag">
                                                    <CardMenu
                                                        onCustomize={() => toast({ title: `Customize ${activeWidget.label}` })}
                                                        onDelete={() => handleDeleteWidget(groupKey, activeWidgetId)}
                                                    />
                                                </div>
                                            </CardHeader>
                                            <div className="flex-1 overflow-hidden">
                                                {activeWidget.component}
                                            </div>
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

    