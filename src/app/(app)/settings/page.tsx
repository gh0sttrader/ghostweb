
"use client";

import React, { useState, useCallback, useMemo } from 'react';
import type { Stock, TradeRequest, OrderActionType, TradeMode, OrderSystemType } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useTradeHistoryContext } from '@/contexts/TradeHistoryContext';
import { useOpenPositionsContext } from '@/contexts/OpenPositionsContext';

import { OrderCard } from '@/components/OrderCard';
import { initialMockStocks } from '@/app/(app)/trading/dashboard/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
    const { toast } = useToast();
    const { addTradeToHistory } = useTradeHistoryContext();
    const { addOpenPosition, selectedAccountId } = useOpenPositionsContext();

    // Basic state to make OrderCard functional
    const [selectedStock, setSelectedStock] = useState<Stock | null>(initialMockStocks[0]);
    const [orderCardActionType, setOrderCardActionType] = useState<OrderActionType | null>(null);

    const handleTradeSubmit = (tradeDetails: TradeRequest) => {
        toast({
            title: "Trade Submitted from Settings",
            description: `${tradeDetails.action} ${tradeDetails.quantity} ${tradeDetails.symbol} submitted.`,
        });

        const stockInfo = selectedStock?.symbol === tradeDetails.symbol ? selectedStock : initialMockStocks.find(s => s.symbol === tradeDetails.symbol);
        
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

    const handleClearOrderCard = useCallback(() => {
        setOrderCardActionType(null);
    }, []);

    return (
        <main className="w-full h-full flex bg-background relative">
            <div className="flex-1 p-4 md:p-6 lg:p-8">
                {/* Placeholder for future settings content */}
                <div className="w-full max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-foreground mb-6">Settings</h1>
                    <Card>
                        <CardHeader>
                            <CardTitle>Coming Soon</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Settings and user preferences will be available here in a future update.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <div className="fixed top-20 right-8 w-[380px] hidden lg:block">
                 <div className="h-[640px]">
                     <OrderCard
                        selectedStock={selectedStock}
                        initialActionType={orderCardActionType}
                        onSubmit={handleTradeSubmit}
                        onClear={handleClearOrderCard}
                        className="h-full"
                    />
                 </div>
            </div>
        </main>
    );
}
