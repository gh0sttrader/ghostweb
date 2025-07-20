
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

type WidgetKey = 'chart' | 'order' | 'positions' | 'orders' | 'history' | 'watchlist' | 'screeners' | 'news';

interface Widget {
    id: WidgetKey;
    label: string;
    component: React.ReactNode;
}

const DraggableCard = ({ children, className, isOver, isActive }: { children: React.ReactNode, className?: string, isOver?: boolean, isActive?: boolean }) => (
    <div className={cn(
        "bg-card border border-white/10 rounded-lg flex flex-col overflow-hidden h-full transition-all duration-200 relative",
        className,
        isOver && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        isActive && "border-white shadow-[0_0_12px_2px_rgba(255,255,255,0.25)]"
        )}>
        {children}
    </div>
);

const LAYOUTS_STORAGE_KEY = 'ghost-trading-layouts';

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

  const initialLayouts: ReactGridLayout.Layout[] = [
    { i: 'chart', x: 0, y: 0, w: 9, h: 10, minW: 6, minH: 8 },
    { i: 'order', x: 9, y: 0, w: 3, h: 10, minW: 2, minH: 10 },
    { i: 'positions', x: 0, y: 10, w: 4, h: 8, minW: 3, minH: 6 },
    { i: 'orders', x: 4, y: 10, w: 4, h: 8, minW: 3, minH: 6 },
    { i: 'history', x: 8, y: 10, w: 4, h: 8, minW: 3, minH: 6 },
    { i: 'watchlist', x: 0, y: 18, w: 4, h: 8, minW: 2, minH: 6 },
    { i: 'screeners', x: 4, y: 18, w: 4, h: 8, minW: 2, minH: 6 },
    { i: 'news', x: 8, y: 18, w: 4, h: 8, minW: 2, minH: 6 },
  ];
  const initialWidgetGroups: Record<string, WidgetKey[]> = {
    chart: ['chart'], order: ['order'], positions: ['positions'], orders: ['orders'], history: ['history'], watchlist: ['watchlist'], screeners: ['screeners'], news: ['news'],
  };
  
  const [layouts, setLayouts] = useState<ReactGridLayout.Layout[]>(initialLayouts);
  const [widgetGroups, setWidgetGroups] = useState<Record<string, WidgetKey[]>>(initialWidgetGroups);
  
  useEffect(() => {
    setIsMounted(true);
    const savedLayoutsRaw = localStorage.getItem(LAYOUTS_STORAGE_KEY);
    if (savedLayoutsRaw) {
      try {
        const savedLayouts = JSON.parse(savedLayoutsRaw);
        const activeLayoutName = savedLayouts.activeLayout || 'Default';
        const activeLayout = savedLayouts.layouts[activeLayoutName];
        if (activeLayout) {
          setLayouts(activeLayout.layouts);
          setWidgetGroups(activeLayout.widgetGroups);
        }
      } catch (e) {
        console.error("Failed to parse layouts from localStorage", e);
      }
    }
  }, []);

  const handleLayoutConfigChange = (config: { layouts: ReactGridLayout.Layout[], widgetGroups: Record<string, WidgetKey[]> }) => {
    setLayouts(config.layouts);
    setWidgetGroups(config.widgetGroups);
  };
  

  const [activeTabs, setActiveTabs] = useState<Record<string, WidgetKey>>({});
  const [draggedItem, setDraggedItem] = useState<ReactGridLayout.Layout | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [popoverState, setPopoverState] = useState<{ open: boolean; groupKey: string | null }>({ open: false, groupKey: null });
  const [draggedWidgetKey, setDraggedWidgetKey] = useState<string | null>(null);

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
      
      const newLayoutItem = initialLayouts.find(l => l.i === widgetKey) || { i: widgetKey, x: 0, y: Infinity, w: 4, h: 8 };
      
      setLayouts(prev => [...prev, newLayoutItem]);
      setWidgetGroups(prev => ({
          ...prev,
          [widgetKey]: [widgetKey]
      }));
  }

  const handleAddWidgetAsTab = (widgetKey: WidgetKey) => {
      if (!popoverState.groupKey) return;
      
      const targetGroupKey = popoverState.groupKey;
      
      setWidgetGroups(prev => {
          const newGroups = {...prev};
          const targetGroup = newGroups[targetGroupKey] || [];
          if (!targetGroup.includes(widgetKey)) {
              newGroups[targetGroupKey] = [...targetGroup, widgetKey];
          }
          // Remove the widget from its own group if it existed as a single card
          const sourceGroupKey = Object.keys(newGroups).find(key => newGroups[key].length === 1 && newGroups[key][0] === widgetKey);
          if (sourceGroupKey) {
              delete newGroups[sourceGroupKey];
          }
          return newGroups;
      });

      setActiveTabs(prev => ({ ...prev, [targetGroupKey]: widgetKey }));
      setPopoverState({ open: false, groupKey: null });
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

  const onDragStart = (layout: ReactGridLayout.Layout[], oldItem: ReactGridLayout.Layout) => {
      setDraggedItem(oldItem);
      setDraggedWidgetKey(oldItem.i);
  };
  
  const onDragStop = () => {
      setDraggedItem(null);
      setDropTarget(null);
      setDraggedWidgetKey(null);
  };

  const onDrop = (layout: ReactGridLayout.Layout[], item: ReactGridLayout.Layout, e: DragEvent) => {
      const targetId = (e.target as HTMLElement).closest('.react-grid-item')?.id;
      if (!targetId || !draggedItem || targetId === draggedItem.i) return;
      
      const sourceGroupKey = draggedItem.i;
      const targetGroupKey = targetId;

      const sourceWidgets = widgetGroups[sourceGroupKey];
      const targetWidgets = widgetGroups[targetGroupKey];
      
      const isTargetProtected = targetGroupKey === 'chart';
      const isSourceProtected = sourceGroupKey === 'chart';

      if (sourceWidgets && targetWidgets && !isTargetProtected && !isSourceProtected) {
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
          const isTargetProtected = targetId === 'chart';
          const isSourceProtected = draggedItem?.i === 'chart';

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
  
  const allPossibleWidgets = Object.values(WIDGET_COMPONENTS);
  const availableWidgetsForPopover = useMemo(() => {
    if (!popoverState.groupKey) return [];
    const currentGroupWidgets = widgetGroups[popoverState.groupKey] || [];
    const allVisibleWidgets = Object.values(widgetGroups).flat();
    return allPossibleWidgets.filter(widget => 
      !allVisibleWidgets.includes(widget.id) &&
      !currentGroupWidgets.includes(widget.id) &&
      widget.id !== 'chart'
    );
  }, [popoverState.groupKey, widgetGroups]);

  const currentLayout = useMemo(() => {
    return Object.keys(widgetGroups).map(groupKey => {
        const correspondingLayout = layouts.find(l => l.i === groupKey);
        // Fallback to initial layout if not found, this handles newly added widgets.
        return correspondingLayout || initialLayouts.find(l => l.i === groupKey) || { i: groupKey, x: 0, y: Infinity, w: 4, h: 8 };
    });
  }, [widgetGroups, layouts]);

  if (!isMounted) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }
  
  if (showSplash) {
      return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <main className="w-full h-full flex flex-col bg-background relative bg-dot-grid" onDragOver={onDragOver}>
        <GhostTradingTopBar
            onAddWidget={(key) => addWidget(key as WidgetKey)}
            currentLayouts={layouts}
            onLayoutChange={handleLayoutConfigChange}
            widgetGroups={widgetGroups}
            onWidgetGroupsChange={setWidgetGroups}
        />
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
                       
                       const isChart = groupKey === 'chart';
                       const isProtectedForMerging = isChart;

                       return (
                           <div key={groupKey} id={groupKey} className="overflow-hidden">
                                <DraggableCard isOver={dropTarget === groupKey && !isProtectedForMerging} isActive={draggedWidgetKey === groupKey}>
                                    {isChart ? (
                                        <div className="flex-1 overflow-hidden h-full">
                                            {activeWidget.component}
                                        </div>
                                    ) : widgetIds.length > 1 ? (
                                        <>
                                            <div className="flex items-center border-b border-white/10 h-8 px-1.5 drag-handle cursor-move">
                                                {widgetIds.map(widgetId => (
                                                    <button 
                                                        key={widgetId} 
                                                        className={cn(
                                                            "px-2 py-1 text-xs font-medium rounded-md",
                                                            activeWidgetId === widgetId ? "text-foreground bg-white/10" : "text-muted-foreground hover:text-foreground"
                                                        )}
                                                        onClick={() => setActiveTabs(prev => ({...prev, [groupKey]: widgetId}))}
                                                    >
                                                        {WIDGET_COMPONENTS[widgetId].label}
                                                    </button>
                                                ))}
                                                <Button variant="link" className="ml-auto text-destructive text-xs h-auto py-0 px-2" onClick={() => uncombineGroup(groupKey)}>Separate</Button>
                                                <div className="no-drag ml-2">
                                                    <CardMenu
                                                        showAddWidget={true}
                                                        onAddWidget={() => setPopoverState({ open: true, groupKey })}
                                                        onCustomize={() => toast({ title: `Customize ${activeWidget.label}`})}
                                                        onDelete={() => handleDeleteWidget(groupKey, activeWidgetId)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex-1 overflow-auto">
                                                {activeWidget.component}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <CardHeader className="py-1 px-3 border-b border-white/10 drag-handle cursor-move h-8 flex-row items-center">
                                                <CardTitle className="text-sm font-semibold text-muted-foreground">
                                                    {activeWidget.label}
                                                </CardTitle>
                                                <div className="ml-auto no-drag">
                                                    <CardMenu
                                                        showAddWidget={true}
                                                        onAddWidget={() => setPopoverState({ open: true, groupKey })}
                                                        onCustomize={() => toast({ title: `Customize ${activeWidget.label}`})}
                                                        onDelete={() => handleDeleteWidget(groupKey, activeWidgetId)}
                                                    />
                                                </div>
                                            </CardHeader>
                                            <div className="flex-1 overflow-auto h-full">
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
        <Popover open={popoverState.open} onOpenChange={(open) => setPopoverState(p => ({ ...p, open }))}>
            <PopoverTrigger asChild>
                <button aria-hidden="true" style={{ display: 'none' }}>Trigger</button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2">
                <div className="space-y-1">
                    <h4 className="font-medium text-sm px-2 pb-1">Add to Tab Group</h4>
                    {availableWidgetsForPopover.map(widget => (
                        <Button 
                            key={widget.id}
                            variant="ghost"
                            className="w-full justify-start font-normal"
                            onClick={() => handleAddWidgetAsTab(widget.id)}
                        >
                            {widget.label}
                        </Button>
                    ))}
                    {availableWidgetsForPopover.length === 0 && (
                        <p className="text-xs text-muted-foreground p-2">No more widgets to add.</p>
                    )}
                </div>
            </PopoverContent>
        </Popover>
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
