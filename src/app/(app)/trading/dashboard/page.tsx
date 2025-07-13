
"use client";

import React, { useState, useMemo, Suspense, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Stock, TradeRequest, OrderActionType, TradeMode, OrderSystemType } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useTradeHistoryContext } from '@/contexts/TradeHistoryContext';
import { useOpenPositionsContext } from '@/contexts/OpenPositionsContext';

import { OrderCard } from '@/components/OrderCard';
import { Card } from '@/components/ui/card';
import { InteractiveChartCard } from '@/components/InteractiveChartCard';
import { WatchlistCard } from '@/components/WatchlistCard';
import { OpenPositionsCard } from '@/components/OpenPositionsCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TradeHistoryTable } from '@/components/market/TradeHistoryTable';
import { OrdersTable } from '@/components/market/OrdersTable';
import { FundamentalsCard } from '@/components/FundamentalsCard';

const MOCK_INITIAL_TIMESTAMP = '2024-07-01T10:00:00.000Z';

// This file is a placeholder for mock data that was previously in a page component.
export const initialMockStocks: Stock[] = [
  { id: '1', symbol: 'AAPL', name: 'Apple Inc.', price: 170.34, changePercent: 2.5, float: 15000, volume: 90.5, newsSnippet: 'New iPhone announced.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'news', sentiment: 'Positive', newsSentimentPercent: 88, topNewsKeyword: 'iPhone Launch', historicalPrices: [168, 169, 170, 171, 170.5, 172, 170.34], marketCap: 170.34 * 15000 * 1e6, avgVolume: 85.2, atr: 3.4, rsi: 60.1, vwap: 170.25, beta: 1.2, high52: 190.5, low52: 150.2, gapPercent: 0.5, shortFloat: 1.5, instOwn: 65.2, premarketChange: 0.3, peRatio: 28.5, dividendYield: 0.54, sector: 'Technology', earningsDate: '2024-07-28T00:00:00.000Z', open: 169.50, high: 172.50, low: 168.00, prevClose: 166.18, peRatioTTM: 28.5, epsTTM: 5.97, sharesOutstanding: 15.55e9, freeFloatShares: 15.50e9, exDividendDate: '2024-05-10', lotSize: 100, afterHoursPrice: 170.50, afterHoursChange: 0.16, afterHoursChangePercent: 0.09, analystRating: 'Strong Buy' },
  { id: '2', symbol: 'MSFT', name: 'Microsoft Corp.', price: 420.72, changePercent: -1.2, float: 7000, volume: 60.2, newsSnippet: 'AI partnership.', lastUpdated: MOCK_INITIAL_TIMESTAMP, sentiment: 'Positive', newsSentimentPercent: 92, topNewsKeyword: 'AI Partnership', historicalPrices: [425, 422, 423, 420, 421, 419, 420.72], marketCap: 420.72 * 7000 * 1e6, avgVolume: 55.0, atr: 8.1, rsi: 40.5, vwap: 420.80, beta: 1.1, high52: 450.0, low52: 300.0, gapPercent: -0.2, shortFloat: 0.8, instOwn: 70.1, premarketChange: -0.1, peRatio: 35.2, dividendYield: 0.7, sector: 'Technology', earningsDate: '2024-07-22T00:00:00.000Z', analystRating: 'Buy' },
  { id: '3', symbol: 'TSLA', name: 'Tesla, Inc.', price: 180.01, changePercent: 5.8, float: 800, volume: 120.1, newsSnippet: 'Cybertruck deliveries ramp up.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'fire', sentiment: 'Positive', newsSentimentPercent: 75, topNewsKeyword: 'Deliveries', historicalPrices: [170, 172, 175, 173, 178, 181, 180.01], marketCap: 180.01 * 800 * 1e6, avgVolume: 110.5, atr: 5.5, rsi: 75.2, vwap: 179.90, beta: 1.8, high52: 180.01, low52: 150.0, gapPercent: 1.2, shortFloat: 15.3, instOwn: 45.0, premarketChange: 0.8, peRatio: 60.1, dividendYield: 0.0, sector: 'Consumer Discretionary', earningsDate: '2024-07-19T00:00:00.000Z', analystRating: 'Hold' },
  { id: '4', symbol: 'NVDA', name: 'NVIDIA Corporation', price: 900.50, changePercent: 0.5, float: 2500, volume: 75.3, newsSnippet: 'New GPU unveiled.', lastUpdated: MOCK_INITIAL_TIMESTAMP, sentiment: 'Positive', newsSentimentPercent: 85, topNewsKeyword: 'GPU Launch', historicalPrices: [890, 895, 900, 905, 902, 903, 900.50], marketCap: 900.50 * 2500 * 1e6, avgVolume: 70.1, atr: 20.0, rsi: 65.0, vwap: 900.60, beta: 1.5, high52: 950.0, low52: 400.0, gapPercent: 0.1, shortFloat: 2.1, instOwn: 60.5, premarketChange: 0.2, peRatio: 75.0, dividendYield: 0.02, sector: 'Technology', earningsDate: '2024-08-15T00:00:00.000Z', analystRating: 'Strong Buy' },
  { id: '5', symbol: 'GOOGL', name: 'Alphabet Inc. (Class A)', price: 140.22, changePercent: 1.1, float: 6000, volume: 40.8, newsSnippet: 'Search algorithm update.', lastUpdated: MOCK_INITIAL_TIMESTAMP, catalystType: 'news', sentiment: 'Neutral', newsSentimentPercent: 55, topNewsKeyword: 'Algorithm', historicalPrices: [138, 139, 140, 139.5, 141, 140.5, 140.22], marketCap: 140.22 * 6000 * 1e6, avgVolume: 38.0, atr: 2.5, rsi: 55.8, vwap: 140.15, beta: 1.0, high52: 160.0, low52: 120.0, gapPercent: 0.3, shortFloat: 1.0, instOwn: 75.3, premarketChange: 0.1, peRatio: 25.8, dividendYield: 0.0, sector: 'Communication Services', earningsDate: '2024-07-25T00:00:00.000Z', analystRating: 'Buy' },
];

function TradingDashboardPageContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const { addTradeToHistory } = useTradeHistoryContext();
  const { addOpenPosition, selectedAccountId } = useOpenPositionsContext();

  const [syncedTickerSymbol, setSyncedTickerSymbol] = useState<string>('AAPL');
  const [stockForSyncedComps, setStockForSyncedComps] = useState<Stock | null>(null);
  
  const [orderCardActionType, setOrderCardActionType] = useState<OrderActionType | null>(null);
  const [orderCardInitialTradeMode, setOrderCardInitialTradeMode] = useState<TradeMode | undefined>(undefined);
  const [orderCardMiloActionContext, setOrderCardMiloActionContext] = useState<string | null>(null);
  const [orderCardInitialQuantity, setOrderCardInitialQuantity] = useState<string | undefined>(undefined);
  const [orderCardInitialOrderType, setOrderCardInitialOrderType] = useState<OrderSystemType | undefined>(undefined);
  const [orderCardInitialLimitPrice, setOrderCardInitialLimitPrice] = useState<string | undefined>(undefined);

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
    const action = searchParams.get('action') as OrderActionType | null;
    const quantity = searchParams.get('quantity');
    const entryPrice = searchParams.get('entryPrice');
    const orderType = searchParams.get('orderType') as OrderSystemType | null;

    if (ticker) {
      handleSyncedTickerChange(ticker);

      if (action && quantity && entryPrice && orderType) {
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
  }, [searchParams, toast, handleSyncedTickerChange]);

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
            id: `pos${Date.now()}`,
            symbol: tradeDetails.symbol,
            entryPrice: stockInfo?.price || 0,
            shares: tradeDetails.quantity,
            currentPrice: stockInfo?.price || 0,
            origin: tradeDetails.tradeModeOrigin || 'manual',
            accountId: tradeDetails.accountId || selectedAccountId,
        });
    }
  };
  
  return (
    <main className="flex flex-col h-screen overflow-hidden p-1.5 md:p-2.5 gap-1.5 bg-background">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_428px] gap-1.5 flex-1 overflow-hidden">
            
            <div className="flex flex-col flex-1 min-h-0 gap-1.5">
              <div className="lg:h-[60%] flex-shrink-0">
                <InteractiveChartCard
                  stock={stockForSyncedComps}
                  onManualTickerSubmit={handleSyncedTickerChange}
                  className="h-full"
                />
              </div>
              <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-1.5">
                <Card className="h-full flex flex-col overflow-hidden border border-border">
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
                <WatchlistCard
                    className="h-full"
                    selectedStockSymbol={syncedTickerSymbol}
                    onSelectStock={handleSyncedTickerChange}
                />
              </div>
            </div>

            <div className="flex flex-col min-h-0 gap-1.5">
                <div className="lg:h-[60%] flex-shrink-0">
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
