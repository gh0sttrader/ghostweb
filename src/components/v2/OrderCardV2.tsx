

"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useOpenPositionsContext } from '@/contexts/OpenPositionsContext';
import type { Stock, OrderActionType, TradeRequest, TradeMode, OrderSystemType, TimeInForce, WidgetKey } from '@/types';
import { cn } from '@/lib/utils';
import { DollarSign, Percent, Layers, MoreHorizontal, Plus } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { TradingFeaturesBadges } from '../TradingFeaturesBadges';
import { CardMenu } from './CardMenu';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

const WIDGETS = [
  { key: "chart" as WidgetKey, label: "Chart" },
  { key: "order" as WidgetKey, label: "Trading Card" },
  { key: "positions" as WidgetKey, label: "Positions" },
  { key: "orders" as WidgetKey, label: "Open Orders" },
  { key: "history" as WidgetKey, label: "History" },
  { key: "watchlist" as WidgetKey, label: "Watchlist" },
  { key: "screeners" as WidgetKey, label: "Screeners" },
  { key: "news" as WidgetKey, label: "News" },
  { key: "details" as WidgetKey, label: "Details" },
];

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
    onDelete: () => void;
    onAddWidget: (widgetKey: WidgetKey) => void;
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

export const OrderCardV2: React.FC<OrderCardProps> = ({
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
    onDelete,
    onAddWidget,
}) => {
    const { accounts, selectedAccountId, setSelectedAccountId } = useOpenPositionsContext();
    const { toast } = useToast();
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

    const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();
    }

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
        <Card className={cn("h-full flex flex-col bg-transparent border-none", className)}>
            <CardHeader className="py-1 px-3 border-b border-white/10 h-8 flex-row items-center drag-handle cursor-move">
                <CardTitle className="text-sm font-semibold text-muted-foreground">
                    Trade
                </CardTitle>
                <div className="ml-auto flex items-center gap-1 no-drag">
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground" onMouseDown={handleInteraction} onTouchStart={handleInteraction}>
                                <Plus size={16} />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-1" onMouseDown={handleInteraction} onTouchStart={handleInteraction}>
                            <div className="flex flex-col">
                                {WIDGETS.map(w => (
                                    <Button 
                                        key={w.key}
                                        variant="ghost" 
                                        className="w-full justify-start text-xs h-8"
                                        onClick={() => onAddWidget(w.key)}
                                    >
                                        {w.label}
                                    </Button>
                                ))}
                            </div>
                        </PopoverContent>
                     </Popover>
                    <CardMenu onCustomize={() => toast({title: "Customize Trade Card..."})} onDelete={onDelete} />
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-3 space-y-3 overflow-y-auto">
                
                {selectedStock && (
                    <div className="flex justify-between items-start py-2 mb-2">
                        <div>
                            <div className="text-xl font-bold">{selectedStock.symbol}</div>
                            <div className="text-sm text-muted-foreground">{selectedStock.name}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-bold">${selectedStock.price.toFixed(2)}</div>
                            <div className={cn("text-sm font-semibold", selectedStock.changePercent >= 0 ? "text-[hsl(var(--confirm-green))]" : "text-destructive")}>
                                {selectedStock.changePercent >= 0 ? '+' : ''}
                                {selectedStock.changePercent.toFixed(2)}%
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="no-drag">
                    <div className="flex items-center justify-between mb-1">
                        <Label className="text-xs text-muted-foreground">Side</Label>
                        {selectedStock?.tradingFeatures && <TradingFeaturesBadges features={selectedStock.tradingFeatures} />}
                    </div>
                    <Select value={action || ''} onValueChange={(v) => setAction(v as OrderActionType)}>
                        <SelectTrigger className="bg-transparent border-white/10 h-10">
                            <SelectValue placeholder="Select Side" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Buy">Buy</SelectItem>
                            <SelectItem value="Sell">Sell</SelectItem>
                            <SelectItem value="Short">Short</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-3 no-drag">
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
                                    className="bg-transparent border-white/10 h-10 pr-10"
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

                <div className="flex-1"></div>

                <div className="space-y-0 p-3 mt-auto rounded-lg bg-black/40 border border-white/10 no-drag">
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
                    <Separator className="my-1 bg-white/10" />
                     <DetailItem
                        label="Cash"
                        value={`$${formatNumber(selectedAccount?.settledCash)}`}
                        description="The amount of settled cash in your account available for trading."
                    />
                </div>

                <Button 
                    className={cn(
                        "w-full h-12 text-base font-bold transition-all duration-300 no-drag",
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
