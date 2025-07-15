
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
import { DollarSign, Percent, Layers, Info } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

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

const SummaryItem = ({ label, value, tooltip }: { label: string, value: string, tooltip: string }) => (
    <TooltipProvider delayDuration={100}>
        <Tooltip>
            <div className="flex justify-between items-center text-xs">
                <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 cursor-help">
                        <span className="text-muted-foreground">{label}</span>
                        <Info className="h-3 w-3 text-muted-foreground/70" />
                    </div>
                </TooltipTrigger>
                <span className="font-mono text-foreground">{value}</span>
            </div>
            <TooltipContent side="top" align="center" className="max-w-xs">
                <p>{tooltip}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
);

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
    const [allowExtendedHours, setAllowExtendedHours] = useState(false);
    
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
        setAllowExtendedHours(false);
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
    
    const selectedAccount = useMemo(() => {
        return accounts.find(acc => acc.id === selectedAccountId);
    }, [accounts, selectedAccountId]);

    const estimatedTotal = useMemo(() => {
        const numQuantity = Number(quantity);
        if (!selectedStock || !numQuantity || numQuantity <= 0) return 0;
        
        let price = selectedStock.price;
        if (orderType === 'Limit' && limitPrice) {
            price = Number(limitPrice);
        }
        
        return numQuantity * price;
    }, [quantity, selectedStock, orderType, limitPrice]);


    const handleFormSubmit = () => {
        if (!isFormValid || !selectedStock || !action) return;

        const tradeDetails: TradeRequest = {
            symbol: selectedStock.symbol,
            quantity: Number(quantity),
            action: action,
            orderType: orderType,
            TIF: timeInForce,
            allowExtendedHours: allowExtendedHours,
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
        selectedClassName: 'bg-[hsl(var(--confirm-green))] text-black border-transparent hover:bg-[hsl(var(--confirm-green))]/90',
      },
      'Sell': {
        selectedClassName: 'bg-destructive text-black border-transparent hover:bg-destructive/90',
      },
      'Short': {
        selectedClassName: 'bg-yellow-500 text-black border-transparent hover:bg-yellow-500/90',
      },
    };

    const submitButtonClass = useMemo(() => {
        if (!isFormValid) {
            return "bg-neutral-900 text-neutral-600 border-white/10";
        }
        switch (action) {
            case 'Buy':
                return 'bg-[hsl(var(--confirm-green))] hover:bg-[hsl(var(--confirm-green))]/90 text-black';
            case 'Sell':
                return 'bg-destructive hover:bg-destructive/90 text-black';
            case 'Short':
                return 'bg-yellow-500 hover:bg-yellow-500/90 text-black';
            default:
                return "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-white/10";
        }
    }, [isFormValid, action]);

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
                                    "rounded-md h-9 transition-all duration-200 border-2 font-bold uppercase",
                                    action === act 
                                        ? config.selectedClassName 
                                        : "bg-transparent border-white/50 text-white/80 hover:bg-white/5 hover:border-white/70 hover:text-white"
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
                     <div className="grid grid-cols-2 gap-2">
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
                        <div>
                            <Label className="text-xs text-muted-foreground">Trading Hours</Label>
                            <Select value={allowExtendedHours ? 'extended' : 'regular'} onValueChange={(v) => setAllowExtendedHours(v === 'extended')}>
                                <SelectTrigger className="bg-transparent border-white/10 h-10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="regular">Regular Hours</SelectItem>
                                    <SelectItem value="extended">Extended Hours</SelectItem>
                                </SelectContent>
                            </Select>
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

                <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-md bg-neutral-900/50 border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="tp-switch" className="text-sm font-medium text-foreground">Take Profit</Label>
                            <Switch id="tp-switch" checked={useTakeProfit} onCheckedChange={setUseTakeProfit} />
                        </div>
                        {useTakeProfit && (
                           <Input type="number" placeholder="Profit target price" value={takeProfitPrice} onChange={(e) => setTakeProfitPrice(e.target.value)} className="bg-transparent border-white/10 h-10" />
                        )}
                    </div>
                    <div className="p-3 rounded-md bg-neutral-900/50 border border-white/10 space-y-2">
                         <div className="flex items-center justify-between">
                            <Label htmlFor="sl-switch" className="text-sm font-medium text-foreground">Stop Loss</Label>
                            <Switch id="sl-switch" checked={useStopLoss} onCheckedChange={setUseStopLoss} />
                        </div>
                        {useStopLoss && (
                            <Input type="number" placeholder="Stop loss price" value={stopLossPrice} onChange={(e) => setStopLossPrice(e.target.value)} className="bg-transparent border-white/10 h-10" />
                        )}
                    </div>
                </div>

                <div className="flex-1"></div>

                <div className="mt-auto p-3 rounded-lg bg-black/40 border border-white/10 space-y-1.5">
                    <SummaryItem
                        label="Estimated Total"
                        value={`$${estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        tooltip="The estimated cost or proceeds of your trade, based on the quantity and price. Does not include fees."
                    />
                    <SummaryItem
                        label="Total Cost"
                        value={`$${estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        tooltip="The total dollar amount you are committing in this order. This is the same as the Estimated Total."
                    />
                    <Separator className="my-1.5 bg-white/10" />
                     <SummaryItem
                        label="Buying Power"
                        value={`$${selectedAccount?.buyingPower.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}`}
                        tooltip="The total amount of funds available for purchasing securities, including borrowed money in a margin account."
                    />
                     <SummaryItem
                        label="Settled Cash"
                        value={`$${selectedAccount?.settledCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}`}
                        tooltip="The amount of cash in your account that is fully cleared and available for withdrawal or to purchase securities without creating a margin debit."
                    />
                </div>

                <Button 
                    className={cn(
                        "w-full h-12 text-base font-bold transition-all duration-300",
                        submitButtonClass
                    )}
                    disabled={!isFormValid}
                    onClick={handleFormSubmit}
                >
                   {isFormValid && action && selectedStock ? `${action} ${quantity} ${selectedStock.symbol}` : 'Select Action'}
                </Button>
            </CardContent>
        </Card>
    );
};
