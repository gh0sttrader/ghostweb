
"use client"

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useOpenPositionsContext } from '@/contexts/OpenPositionsContext';
import type { Stock, OrderActionType, TradeRequest, TradeMode, OrderSystemType } from '@/types';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  symbol: z.string().min(1),
  quantity: z.coerce.number().positive(),
  action: z.enum(['Buy', 'Sell', 'Short', 'Cover']),
  orderType: z.enum(['Market', 'Limit', 'Stop']),
  limitPrice: z.coerce.number().optional(),
  stopPrice: z.coerce.number().optional(),
  TIF: z.enum(['Day', 'GTC']).default('Day'),
  allowExtendedHours: z.boolean().default(false),
  accountId: z.string(),
});

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
    const [actionType, setActionType] = useState<OrderActionType>(initialActionType || 'Buy');
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            symbol: selectedStock?.symbol || '',
            quantity: initialQuantity ? Number(initialQuantity) : 100,
            action: initialActionType || 'Buy',
            orderType: initialOrderType || 'Market',
            limitPrice: initialLimitPrice ? Number(initialLimitPrice) : undefined,
            stopPrice: undefined,
            TIF: 'Day',
            allowExtendedHours: false,
            accountId: selectedAccountId,
        },
    });

    useEffect(() => {
        if (selectedStock) {
            form.setValue('symbol', selectedStock.symbol);
        }
        if(initialActionType) setActionType(initialActionType);
        form.setValue('action', initialActionType || 'Buy');
        form.setValue('quantity', initialQuantity ? Number(initialQuantity) : 100);
        form.setValue('orderType', initialOrderType || 'Market');
        form.setValue('limitPrice', initialOrderType === 'Limit' && initialLimitPrice ? Number(initialLimitPrice) : undefined);
        form.setValue('accountId', selectedAccountId);
    }, [selectedStock, initialActionType, initialQuantity, initialOrderType, initialLimitPrice, selectedAccountId, form]);

    const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit({ ...values, tradeModeOrigin: initialTradeMode || 'manual' });
        form.reset();
        onClear();
    };

    return (
        <Card className={cn("h-full flex flex-col", className)}>
            <CardHeader>
                <CardTitle>Trade Panel</CardTitle>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex flex-col flex-1">
                    <CardContent className="flex-1 space-y-4 overflow-y-auto">
                        <FormField
                            control={form.control}
                            name="accountId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Account</FormLabel>
                                    <Select onValueChange={(value) => { field.onChange(value); setSelectedAccountId(value); }} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {accounts.map(acc => <SelectItem key={acc.id} value={acc.id}>{acc.name} (${acc.balance.toLocaleString()})</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="symbol"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Symbol</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="action"
                            render={({ field }) => (
                                <FormItem>
                                <RadioGroup
                                    onValueChange={(val) => { field.onChange(val); setActionType(val as OrderActionType); }}
                                    defaultValue={field.value}
                                    className="grid grid-cols-4 gap-2"
                                >
                                    {['Buy', 'Sell', 'Short', 'Cover'].map((action) => (
                                        <FormItem key={action}>
                                            <FormControl>
                                                <RadioGroupItem value={action} id={action} className="sr-only" />
                                            </FormControl>
                                            <Label htmlFor={action} className={cn(
                                                "block w-full text-center p-2 rounded-md cursor-pointer border",
                                                field.value === action ? "bg-primary text-primary-foreground border-primary" : "bg-secondary"
                                            )}>{action}</Label>
                                        </FormItem>
                                    ))}
                                </RadioGroup>
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Quantity</FormLabel>
                                    <FormControl><Input type="number" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="orderType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Order Type</FormLabel>
                                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Market">Market</SelectItem>
                                            <SelectItem value="Limit">Limit</SelectItem>
                                            <SelectItem value="Stop">Stop</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                        {form.watch('orderType') === 'Limit' && (
                            <FormField
                                control={form.control}
                                name="limitPrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Limit Price</FormLabel>
                                        <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                                    </FormItem>
                                )}
                            />
                        )}
                        <div className="flex items-center space-x-2">
                             <FormField
                                control={form.control}
                                name="allowExtendedHours"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm flex-1">
                                        <div className="space-y-0.5">
                                            <FormLabel>Extended Hours</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                    </CardContent>
                    <CardFooter className="flex flex-col gap-2 !p-3">
                        {miloActionContextText && (
                            <div className="w-full p-2 text-xs text-center bg-accent/20 text-accent-foreground rounded-md">{miloActionContextText}</div>
                        )}
                        <Button type="submit" className="w-full h-12 text-lg">
                            {actionType} {form.watch('quantity')} {form.watch('symbol')}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
};
