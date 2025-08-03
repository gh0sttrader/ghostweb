

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
import { TradingFeaturesBadges } from './TradingFeaturesBadges';

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

const DetailItem: React.FC<{ label: string; value?: string | number | null; unit?: string; valueClass?: string; description?: string }> = ({ label, value, unit, valueClass, description }) => (
    <TooltipProvider delayDuration={200}>
        <Tooltip>
            <TooltipTrigger asChild>
                 <div className="flex justify-between items-baseline py-0.5">
                    <span className="text-[11px] uppercase tracking-wider text-neutral-400 whitespace-nowrap pr-2">
                        {label}
                    </span>
                    <span className={cn("text-xs font-bold text-neutral-50 text-right", valueClass)}>
                        {value !== undefined && value !== null ? `${value}${unit || ''}` : <span className="text-neutral-500">-</span>}
                    </span>
                </div>
            </TooltipTrigger>
            {description && (
                <TooltipContent side="right">
                    <p>{description}</p>
                </TooltipContent>
            )}
        </Tooltip>
    </TooltipProvider>
);

const formatNumber = (value?: number, decimals = 2) => value?.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

const quantityModes = ['Shares', '$', '%'] as const;
type QuantityMode = typeof quantityModes[number];

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
    const [action, setAction] = useState<OrderActionType | null>(initialActionType || 'Buy');
    const [quantity, setQuantity] = useState<string>(initialQuantity || '');
    const [orderType, setOrderType] = useState<OrderSystemType>(initialOrderType || 'Market');
    const [limitPrice, setLimitPrice] = useState<string>(initialLimitPrice || '');
    const [stopPrice, setStopPrice] = useState<string>('');
    const [timeInForce, setTimeInForce] = useState<TimeInForce>('Day');
    const [allowExtendedHours, setAllowExtendedHours] = useState(false);
    const [quantityMode, setQuantityMode] = useState<QuantityMode>('Shares');


    useEffect(() => {
        if (selectedStock) {
            setAction(initialActionType || 'Buy');
            setQuantity(initialQuantity || '');
            setOrderType(initialOrderType || 'Market');
            setLimitPrice(initialLimitPrice || '');
        } else {
            handleClear();
        }
    }, [selectedStock, initialActionType, initialQuantity, initialOrderType, initialLimitPrice]);
    
    const handleClear = () => {
        setAction('Buy');
        setQuantity('');
        setOrderType('Market');
        setLimitPrice('');
        setStopPrice('');
        setTimeInForce('Day');
        setAllowExtendedHours(false);
        onClear();
    }
    
    const selectedAccount = useMemo(() => {
        return accounts.find(acc => acc.id === selectedAccountId);
    }, [accounts, selectedAccountId]);

    const estimatedTotal = useMemo(() => {
        const numQuantity = Number(quantity);
        if (!selectedStock || isNaN(numQuantity) || numQuantity <= 0) return 0;
    
        const buyingPower = selectedAccount?.buyingPower || 0;
        let price = selectedStock.price;
        if (orderType === 'Limit' && limitPrice) {
            price = Number(limitPrice);
        }
    
        switch (quantityMode) {
            case '$':
                return numQuantity;
            case '%':
                return buyingPower * (numQuantity / 100);
            case 'Shares':
            default:
                return numQuantity * price;
        }
    }, [quantity, quantityMode, selectedStock, orderType, limitPrice, selectedAccount]);

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
        if (estimatedTotal > (selectedAccount?.buyingPower || 0)) {
            return false; // Not enough buying power
        }
        return true;
    }, [action, selectedStock, quantity, orderType, limitPrice, stopPrice, estimatedTotal, selectedAccount]);
    
    const quantityInShares = useMemo(() => {
        const numQuantity = Number(quantity);
        if (!selectedStock || isNaN(numQuantity) || numQuantity <= 0) return 0;
        
        const price = (orderType === 'Limit' && limitPrice) ? Number(limitPrice) : selectedStock.price;
        if (price <= 0) return 0;

        switch (quantityMode) {
            case '$':
                return numQuantity / price;
            case '%':
                const totalValue = (selectedAccount?.buyingPower || 0) * (numQuantity / 100);
                return totalValue / price;
            case 'Shares':
            default:
                return numQuantity;
        }
    }, [quantity, quantityMode, selectedStock, orderType, limitPrice, selectedAccount]);

    const handleFormSubmit = () => {
        if (!isFormValid || !selectedStock || !action) return;

        const finalShares = Math.floor(quantityInShares); // Ensure whole shares
        if(finalShares <= 0) return;

        const tradeDetails: TradeRequest = {
            symbol: selectedStock.symbol,
            quantity: finalShares,
            action: action,
            orderType: orderType,
            TIF: timeInForce,
            allowExtendedHours: allowExtendedHours,
            accountId: selectedAccountId,
            tradeModeOrigin: initialTradeMode || 'manual',
            limitPrice: orderType === 'Limit' ? Number(limitPrice) : undefined,
            stopPrice: orderType === 'Stop' ? Number(stopPrice) : undefined,
        };
        onSubmit(tradeDetails);
        handleClear();
    };
    
    const submitButtonClass = useMemo(() => {
        if (!action || !selectedStock || !isFormValid) {
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
    }, [isFormValid, action, selectedStock]);

    const submitButtonText = useMemo(() => {
        if (!action || !selectedStock) return 'Select Action';
        if (!isFormValid) {
             if (estimatedTotal > (selectedAccount?.buyingPower || 0)) {
                return 'Insufficient Buying Power';
            }
            return `Enter Order Details`;
        }
        const sharesText = quantityInShares.toFixed(2).replace(/\.00$/, '');
        return `${action} ${sharesText} ${selectedStock.symbol}`;

    }, [action, selectedStock, isFormValid, quantityInShares, estimatedTotal, selectedAccount]);

    const handleCycleQuantityMode = () => {
        const currentIndex = quantityModes.indexOf(quantityMode);
        const nextIndex = (currentIndex + 1) % quantityModes.length;
        setQuantityMode(quantityModes[nextIndex]);
    };

    const QuantityIcon = useMemo(() => {
        switch (quantityMode) {
            case '$': return DollarSign;
            case '%': return Percent;
            case 'Shares':
            default: return Layers;
        }
    }, [quantityMode]);


    return (
        <Card className={cn("h-full flex flex-col bg-black/50 border-white/10", className)}>
            <CardContent className="flex-1 flex flex-col p-3 space-y-3 overflow-y-auto">
                <Select onValueChange={setSelectedAccountId} defaultValue={selectedAccountId}>
                    <SelectTrigger className="bg-transparent border-white/10 h-9">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {accounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name} (${acc.balance.toLocaleString()})</SelectItem>)}
                    </SelectContent>
                </Select>
                
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium text-muted-foreground">Side</Label>
                        {selectedStock?.tradingFeatures && <TradingFeaturesBadges features={selectedStock.tradingFeatures} />}
                    </div>
                    <div className="w-32">
                        <Select value={action || ''} onValueChange={(v) => setAction(v as OrderActionType)}>
                            <SelectTrigger className="bg-transparent border-white/10 h-9">
                                <SelectValue placeholder="Select Side" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Buy">Buy</SelectItem>
                                <SelectItem value="Sell">Sell</SelectItem>
                                <SelectItem value="Short">Short</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-muted-foreground">Order Type</Label>
                        <div className="w-32">
                            <Select value={orderType} onValueChange={(v) => setOrderType(v as OrderSystemType)}>
                                <SelectTrigger className="bg-transparent border-white/10 h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Market">Market</SelectItem>
                                    <SelectItem value="Limit">Limit</SelectItem>
                                    <SelectItem value="Stop">Stop</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-muted-foreground">Time in Force</Label>
                        <div className="w-32">
                             <Select value={timeInForce} onValueChange={(v) => setTimeInForce(v as TimeInForce)}>
                                <SelectTrigger className="bg-transparent border-white/10 h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Day">Day</SelectItem>
                                    <SelectItem value="GTC">GTC</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="flex items-center justify-between">
                         <Label className="text-sm font-medium text-muted-foreground">Quantity</Label>
                         <div className="relative w-32">
                            <Input
                                type="number"
                                placeholder="0"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="bg-transparent border-white/10 h-9 pr-10"
                            />
                            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={handleCycleQuantityMode}
                                                className="h-7 w-7 text-white bg-black border border-transparent hover:border-white/20"
                                            >
                                                <QuantityIcon className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Cycle quantity input mode (Shares, $, %)</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                         </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-muted-foreground">Trading Hours</Label>
                        <div className="w-32">
                            <Select value={allowExtendedHours ? 'extended' : 'regular'} onValueChange={(v) => setAllowExtendedHours(v === 'extended')}>
                                <SelectTrigger className="bg-transparent border-white/10 h-9">
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
                            <Input type="number" placeholder="0.00" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} className="bg-transparent border-white/10 h-9" />
                        </div>
                    )}
                    {orderType === 'Stop' && (
                        <div>
                            <Label className="text-xs text-muted-foreground">Stop Price</Label>
                            <Input type="number" placeholder="0.00" value={stopPrice} onChange={(e) => setStopPrice(e.target.value)} className="bg-transparent border-white/10 h-9" />
                        </div>
                    )}
                </div>
                
                <Separator className="bg-white/10" />

                <div className="flex-1"></div>

                <div className="space-y-0 p-3 mt-auto rounded-lg bg-black/40 border border-white/10">
                     <DetailItem
                        label="Est. Total"
                        value={`$${formatNumber(estimatedTotal)}`}
                        description="The estimated cost or proceeds of your trade, based on the quantity and price. Does not include fees."
                    />
                    <Separator className="my-1 bg-white/10" />
                     <DetailItem
                        label="Buying Power"
                        value={`$${formatNumber(selectedAccount?.buyingPower)}`}
                        description="The total amount of funds available for purchasing securities, including borrowed money in a margin account."
                    />
                </div>
                <Button 
                    className={cn(
                        "w-full h-12 text-base font-bold transition-all duration-300 mt-2",
                        submitButtonClass
                    )}
                    disabled={!isFormValid}
                    onClick={handleFormSubmit}
                >
                   {submitButtonText}
                </Button>
            </CardContent>
        </Card>
    );
};
