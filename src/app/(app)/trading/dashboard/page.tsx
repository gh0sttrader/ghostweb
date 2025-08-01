
"use client";

import React, { useState, useMemo, Suspense, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Stock, TradeRequest, OrderActionType, TradeMode, OrderSystemType, NewsArticle, Alert } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useTradeHistoryContext } from '@/contexts/TradeHistoryContext';
import { useOpenPositionsContext } from '@/contexts/OpenPositionsContext';
import { useAlertsContext } from '@/contexts/AlertsContext';
import { Button } from "@/components/ui/button";

import { OrderCard } from '@/components/OrderCard';
import { Card } from '@/components/ui/card';
import { InteractiveChartCard } from '@/components/charts/InteractiveChartCard';
import { AboutCard } from '@/components/AboutCard';
import { KeyStatistics } from '@/components/KeyStatistics';
import { AverageAnnualReturn } from '@/components/AverageAnnualReturn';
import { NewsCard } from '@/components/NewsCard';
import { AnalystRatings } from '@/components/AnalystRatings';
import { initialMockStocks } from './mock-data';
import { AlertModal } from '@/components/AlertModal';
import { SectorsCard } from '@/components/SectorsCard';
import { TopHoldingsCard } from '@/components/TopHoldingsCard';
import { TradeHistory } from '@/components/TradeHistory';
import { AddToListModal } from '@/components/AddToListModal';

type Timeframe = '1D' | '5D' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | '5Y' | 'Max' | 'All';

function TradingDashboardPageContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const { addTradeToHistory } = useTradeHistoryContext();
  const { openPositions, addOpenPosition, selectedAccountId } = useOpenPositionsContext();
  const { alerts, addAlert, removeAlert } = useAlertsContext();

  const [syncedTickerSymbol, setSyncedTickerSymbol] = useState<string>('AAPL');
  const [stockForSyncedComps, setStockForSyncedComps] = useState<Stock | null>(null);
  
  const [orderCardActionType, setOrderCardActionType] = useState<OrderActionType | null>(null);
  const [orderCardInitialTradeMode, setOrderCardInitialTradeMode] = useState<TradeMode | undefined>(undefined);
  const [orderCardMiloActionContext, setOrderCardMiloActionContext] = useState<string | null>(null);
  const [orderCardInitialQuantity, setOrderCardInitialQuantity] = useState<string | undefined>(undefined);
  const [orderCardInitialOrderType, setOrderCardInitialOrderType] = useState<OrderSystemType | undefined>(undefined);
  const [orderCardInitialLimitPrice, setOrderCardInitialLimitPrice] = useState<string | undefined>(undefined);
  
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isAddToListModalOpen, setIsAddToListModalOpen] = useState(false);
  const [chartTimeframe, setChartTimeframe] = useState<Timeframe>('1M');
  
  const activeAlert = useMemo(() => {
    return alerts.find(a => a.symbol === syncedTickerSymbol);
  }, [alerts, syncedTickerSymbol]);

  const handleOpenAlertModal = () => {
    setIsAlertModalOpen(true);
  };
  
  const handleCloseAlertModal = () => {
    setIsAlertModalOpen(false);
  };

  const handleSaveAlert = (alert: Alert) => {
    addAlert(alert);
    handleCloseAlertModal();
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

  const isEtf = useMemo(() => !!stockForSyncedComps?.['Index-Tracked'], [stockForSyncedComps]);
  
  return (
    <>
      <main className="w-full h-full flex flex-col bg-background">
        <div className="w-full max-w-6xl mx-auto px-8 2xl:max-w-7xl 2xl:px-16 flex-1 py-4 md:py-6 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
              <div className="flex flex-col gap-6">
                  <div className="h-[640px]">
                      <InteractiveChartCard
                          stock={stockForSyncedComps}
                          onManualTickerSubmit={handleSyncedTickerChange}
                          className="h-full"
                          onAlertClick={handleOpenAlertModal}
                          isAlertActive={!!activeAlert}
                          timeframe={chartTimeframe}
                          onTimeframeChange={setChartTimeframe}
                      />
                  </div>
                  <div className="mt-12">
                      <AboutCard stock={stockForSyncedComps} />
                  </div>
                  <div className="mt-12">
                      <KeyStatistics stock={stockForSyncedComps} />
                  </div>
                  {isEtf && stockForSyncedComps?.sectors && (
                    <div className="mt-12">
                      <SectorsCard stock={stockForSyncedComps} />
                    </div>
                  )}
                  {isEtf && stockForSyncedComps?.topHoldings && (
                      <div className="mt-12">
                          <TopHoldingsCard stock={stockForSyncedComps} />
                      </div>
                  )}
                  <div className="mt-12">
                      <AverageAnnualReturn />
                  </div>
                  <div className="mt-12">
                    <TradeHistory stock={stockForSyncedComps} />
                  </div>
                  <div className="mt-12">
                    <NewsCard stock={stockForSyncedComps} />
                  </div>
                  <div className="mt-12">
                      <AnalystRatings stock={stockForSyncedComps} />
                  </div>
                  <div className="h-16" />
              </div>

              <div className="sticky top-8 flex flex-col gap-5">
                  <div className="h-[640px]">
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
              </div>
          </div>
        </div>
      </main>
      {isAlertModalOpen && stockForSyncedComps && (
        <AlertModal
          isOpen={isAlertModalOpen}
          onClose={handleCloseAlertModal}
          onSave={handleSaveAlert}
          onDelete={removeAlert}
          symbol={stockForSyncedComps.symbol}
          existingAlert={activeAlert}
        />
      )}
      {isAddToListModalOpen && stockForSyncedComps && (
          <AddToListModal
              isOpen={isAddToListModalOpen}
              onClose={() => setIsAddToListModalOpen(false)}
              ticker={stockForSyncedComps.symbol}
          />
      )}
    </>
  );
}

export default function TradingDashboardPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-background text-foreground">Loading Trading Terminal...</div>}>
      <TradingDashboardPageContent />
    </Suspense>
  );
}
