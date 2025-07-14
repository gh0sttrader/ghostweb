
"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useOpenPositionsContext } from '@/contexts/OpenPositionsContext';
import type { Stock, OrderActionType, TradeRequest, TradeMode, OrderSystemType, TimeInForce } from '@/types';
import { cn } from '@/lib/utils';
import { DollarSign, Percent, Target, Shield, Layers } from 'lucide-react';

interface OrderCardProps {
    selectedStock: Stock | null;
    initialActionType?: OrderActionType | null;
    initialTradeMode?: TradeMode;
    miloActionContextText?: string | null;
    initialQuantity?: string;
    initialOrderType?: OrderSystemType;
    initialLimitPrice?: string;
    onSubmit: (tradeDetails: TradeRequest) => void;
    onClear: () => void;
    className?: string;
}

export const OrderCard: React.FC<OrderCardProps> = ({
    selectedStock,
    initialActionType,
    initialTradeMode,
    miloActionContextText,
    initialQuantity,
    initialOrderType,
    initialLimitPrice,
    onSubmit,
    onClear,
    className,
}) => {
    const { accounts, selectedAccountId, setSelectedAccountId } = useOpenPositionsContext();
    const [action, setAction] = useState<OrderActionType | null>(initialActionType || null);
    const [quantity, setQuantity] = useState<string>(initialQuantity || '');
    const [orderType, setOrderType] = useState<OrderSystemType>(initialOrderType || 'Market');
    const [limitPrice, setLimitPrice] = useState<string>(initialLimitPrice || '');
    const [stopPrice, setStopPrice] = useState<string>('');
    const [timeInForce, setTimeInForce] = useState<TimeInForce>('Day');
    
    const [useTakeProfit, setUseTakeProfit] = useState(false);
    const [takeProfitPrice, setTakeProfitPrice] = useState<string>('');
    const [useStopLoss, setUseStopLoss] = useState(false);
    const [stopLossPrice, setStopLossPrice] = useState<string>('');
    const [quantityMode, setQuantityMode] = useState<'Shares' | '$' | '%'>('Shares');


    useEffect(() => {
        if (selectedStock) {
            setAction(initialActionType || null);
            setQuantity(initialQuantity || '');
            setOrderType(initialOrderType || 'Market');
            setLimitPrice(initialLimitPrice || '');
        } else {
            handleClear();
        }
    }, [selectedStock, initialActionType, initialQuantity, initialOrderType, initialLimitPrice]);
    
    const handleClear = () => {
        setAction(null);
        setQuantity('');
        setOrderType('Market');
        setLimitPrice('');
        setStopPrice('');
        setTimeInForce('Day');
        setUseTakeProfit(false);
        setTakeProfitPrice('');
        setUseStopLoss(false);
        setStopLossPrice('');
        onClear();
    }

    const isFormValid = useMemo(() => {
        if (!action || !selectedStock || !quantity || Number(quantity) <= 0) {
            return false;
        }
        if (orderType === 'Limit' && (!limitPrice || Number(limitPrice) <= 0)) {
            return false;
        }
        if (orderType === 'Stop' && (!stopPrice || Number(stopPrice) <= 0)) {
            return false;
        }
        return true;
    }, [action, selectedStock, quantity, orderType, limitPrice, stopPrice]);

    const handleFormSubmit = () => {
        if (!isFormValid || !selectedStock || !action) return;

        const tradeDetails: TradeRequest = {
            symbol: selectedStock.symbol,
            quantity: Number(quantity),
            action: action,
            orderType: orderType,
            TIF: timeInForce,
            accountId: selectedAccountId,
            tradeModeOrigin: initialTradeMode || 'manual',
            limitPrice: orderType === 'Limit' ? Number(limitPrice) : undefined,
            stopPrice: orderType === 'Stop' ? Number(stopPrice) : undefined,
            takeProfit: useTakeProfit ? Number(takeProfitPrice) : undefined,
            stopLoss: useStopLoss ? Number(stopLossPrice) : undefined,
        };
        onSubmit(tradeDetails);
        handleClear();
    };
    
    const actionConfig = {
      'Buy': {
        selectedClassName: 'border-[hsl(var(--confirm-green))] text-[hsl(var(--confirm-green))]',
      },
      'Sell': {
        selectedClassName: 'border-destructive text-destructive',
      },
      'Short': {
        selectedClassName: 'border-yellow-500 text-yellow-500',
      },
    };

    return (
        <Card className={cn("h-full flex flex-col bg-black/50 border-white/10", className)}>
            <CardContent className="flex-1 flex flex-col p-3 space-y-3 overflow-y-auto">
                <Select onValueChange={setSelectedAccountId} defaultValue={selectedAccountId}>
                    <SelectTrigger className="bg-transparent border-white/10 h-10">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {accounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name} (${acc.balance.toLocaleString()})</SelectItem>)}
                    </SelectContent>
                </Select>
                

                {selectedStock && (
                    <div className="flex items-center justify-between">
                        <div >
                            <p className="text-lg font-bold text-foreground">{selectedStock.symbol}</p>
                            <p className="text-xs text-muted-foreground">{selectedStock.name}</p>
                        </div>
                         <div className="text-right">
                             <p className={cn("text-lg font-bold", selectedStock.changePercent >= 0 ? "text-[hsl(var(--confirm-green))]" : "text-destructive")}>
                                ${selectedStock.price.toFixed(2)}
                            </p>
                             <p className={cn("text-xs", selectedStock.changePercent >= 0 ? "text-[hsl(var(--confirm-green))]" : "text-destructive")}>
                                 {selectedStock.changePercent >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%
                             </p>
                         </div>
                    </div>
                )}
                
                <div className="grid grid-cols-3 gap-2">
                    {(['Buy', 'Sell', 'Short'] as OrderActionType[]).map((act) => {
                        const config = actionConfig[act];
                        return (
                            <Button
                                key={act}
                                variant="outline"
                                className={cn(
                                    "rounded-md h-9 transition-all duration-200 border-2 font-bold uppercase bg-transparent hover:bg-white/5",
                                    "border-white/50 text-white/80",
                                    action === act ? config.selectedClassName : "hover:border-white/70 hover:text-white"
                                )}
                                onClick={() => setAction(act)}
                            >
                                {act}
                            </Button>
                        )
                    })}
                </div>

                <Separator className="bg-white/10" />

                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label className="text-xs text-muted-foreground">Order Type</Label>
                            <Select value={orderType} onValueChange={(v) => setOrderType(v as OrderSystemType)}>
                                <SelectTrigger className="bg-transparent border-white/10 h-10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Market">Market</SelectItem>
                                    <SelectItem value="Limit">Limit</SelectItem>
                                    <SelectItem value="Stop">Stop</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-xs text-muted-foreground">Time in Force</Label>
                             <Select value={timeInForce} onValueChange={(v) => setTimeInForce(v as TimeInForce)}>
                                <SelectTrigger className="bg-transparent border-white/10 h-10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Day">Day</SelectItem>
                                    <SelectItem value="GTC">GTC</SelectItem>
                                    <SelectItem value="OPG">OPG</SelectItem>
                                     <SelectItem value="CLS">CLS</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div>
                         <Label className="text-xs text-muted-foreground">Quantity</Label>
                         <div className="relative">
                            <Input
                                type="number"
                                placeholder="0"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="bg-transparent border-white/10 h-10"
                            />
                            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                {(['Shares', '$', '%'] as const).map(mode => (
                                    <Button
                                        key={mode}
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setQuantityMode(mode)}
                                        className={cn(
                                            "h-7 w-auto px-2 text-xs text-white bg-black border border-transparent hover:border-white/20",
                                            quantityMode === mode && "border-white/50"
                                        )}
                                    >
                                        {mode === '$' && <DollarSign className="h-3.5 w-3.5" />}
                                        {mode === '%' && <Percent className="h-3.5 w-3.5" />}
                                        {mode === 'Shares' && <Layers className="h-3.5 w-3.5" />}
                                    </Button>
                                ))}
                            </div>
                         </div>
                    </div>
                    {orderType === 'Limit' && (
                        <div>
                            <Label className="text-xs text-muted-foreground">Limit Price</Label>
                            <Input type="number" placeholder="0.00" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} className="bg-transparent border-white/10 h-10" />
                        </div>
                    )}
                    {orderType === 'Stop' && (
                        <div>
                            <Label className="text-xs text-muted-foreground">Stop Price</Label>
                            <Input type="number" placeholder="0.00" value={stopPrice} onChange={(e) => setStopPrice(e.target.value)} className="bg-transparent border-white/10 h-10" />
                        </div>
                    )}
                </div>
                
                <Separator className="bg-white/10" />

                <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5">
                        <div className="flex items-center">
                             <Target className="h-5 w-5 mr-3 text-[hsl(var(--confirm-green))]" />
                             <Label htmlFor="tp-switch" className="text-sm font-medium text-foreground">Take Profit</Label>
                        </div>
                        <Switch id="tp-switch" checked={useTakeProfit} onCheckedChange={setUseTakeProfit} />
                    </div>
                     {useTakeProfit && <Input type="number" placeholder="Enter profit target price" value={takeProfitPrice} onChange={(e) => setTakeProfitPrice(e.target.value)} className="bg-transparent border-white/10 h-10" />}

                    <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5">
                         <div className="flex items-center">
                             <Shield className="h-5 w-5 mr-3 text-destructive" />
                             <Label htmlFor="sl-switch" className="text-sm font-medium text-foreground">Stop Loss</Label>
                         </div>
                        <Switch id="sl-switch" checked={useStopLoss} onCheckedChange={setUseStopLoss} />
                    </div>
                    {useStopLoss && <Input type="number" placeholder="Enter stop loss price" value={stopLossPrice} onChange={(e) => setStopLossPrice(e.target.value)} className="bg-transparent border-white/10 h-10" />}
                </div>

                <div className="flex-1"></div>

                <Button 
                    className="w-full h-12 text-base font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 disabled:bg-neutral-900 disabled:text-neutral-600 border border-white/10"
                    disabled={!isFormValid}
                    onClick={handleFormSubmit}
                >
                   {isFormValid && action && selectedStock ? `${action} ${quantity} ${selectedStock.symbol}` : 'Select Action'}
                </Button>
            </CardContent>
        </Card>
    );
};
