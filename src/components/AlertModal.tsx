
"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Alert, AlertCondition, AlertMetric, AlertOperator } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (alert: Alert) => void;
    onDelete: (alertId: string) => void;
    symbol: string;
    existingAlert?: Alert;
}

export function AlertModal({ isOpen, onClose, onSave, onDelete, symbol, existingAlert }: AlertModalProps) {
    const { toast } = useToast();
    const [alertType, setAlertType] = useState<AlertMetric>(existingAlert?.condition.metric || 'price');
    const [operator, setOperator] = useState<AlertOperator>(existingAlert?.condition.operator || 'above');
    const [value, setValue] = useState<string>(existingAlert?.condition.value?.toString() || '');
    
    useEffect(() => {
        if (existingAlert) {
            setAlertType(existingAlert.condition.metric);
            setOperator(existingAlert.condition.operator);
            setValue(existingAlert.condition.value.toString());
        } else {
            // Reset to default when opening for a new alert
            setAlertType('price');
            setOperator('above');
            setValue('');
        }
    }, [existingAlert, isOpen]);

    const handleSave = () => {
        if (!value) {
            toast({
                title: "Validation Error",
                description: "Please enter a value for the alert.",
                variant: "destructive",
            });
            return;
        }

        const newAlert: Alert = {
            id: existingAlert?.id || `${symbol}-${Date.now()}`,
            symbol: symbol,
            condition: {
                metric: alertType,
                operator: operator,
                value: alertType === 'news' ? value : Number(value),
            },
            status: 'active',
            createdAt: existingAlert?.createdAt || new Date().toISOString(),
        };
        onSave(newAlert);
        toast({
            title: "Alert Saved",
            description: `Alert for ${symbol} has been set.`,
        });
    };

    const handleDelete = () => {
        if (existingAlert) {
            onDelete(existingAlert.id);
            toast({
                title: "Alert Deleted",
                description: `Alert for ${symbol} has been removed.`,
                variant: 'destructive'
            });
            onClose();
        }
    }

    const renderValueInput = () => {
        switch (alertType) {
            case 'price':
                return (
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input id="value" type="number" value={value} onChange={e => setValue(e.target.value)} className="pl-6" placeholder="150.00" />
                    </div>
                );
            case 'changePercent':
                 return (
                    <div className="relative">
                        <Input id="value" type="number" value={value} onChange={e => setValue(e.target.value)} className="pr-6" placeholder="5" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                    </div>
                );
            case 'volume':
                return <Input id="value" type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="1000000" />;
            case 'news':
                return <Input id="value" type="text" value={value} onChange={e => setValue(e.target.value)} placeholder="e.g. 'FDA approval', 'product launch'" />;
            default:
                return null;
        }
    };
    
    const isNewsAlert = alertType === 'news';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Set Alert for {symbol}</DialogTitle>
                    <DialogDescription>
                        Get notified when your conditions are met for this symbol.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="alertType" className="text-right">Alert me on</Label>
                        <Select value={alertType} onValueChange={(v) => { setAlertType(v as AlertMetric); setValue(''); }}>
                            <SelectTrigger id="alertType" className="col-span-3">
                                <SelectValue placeholder="Select an alert type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="price">Price</SelectItem>
                                <SelectItem value="changePercent">% Change</SelectItem>
                                <SelectItem value="volume">Volume</SelectItem>
                                <SelectItem value="news">News Keyword</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    {!isNewsAlert && (
                      <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="operator" className="text-right">Is</Label>
                          <Select value={operator} onValueChange={(v) => setOperator(v as AlertOperator)}>
                              <SelectTrigger id="operator" className="col-span-3">
                                  <SelectValue placeholder="Select a condition" />
                              </SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="above">Above</SelectItem>
                                  <SelectItem value="below">Below</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="value" className="text-right">
                           {isNewsAlert ? 'Containing' : 'Value'}
                        </Label>
                        <div className="col-span-3">
                            {renderValueInput()}
                        </div>
                    </div>
                </div>
                <DialogFooter className="sm:justify-between">
                    <div>
                        {existingAlert && (
                            <Button variant="ghost" size="icon" onClick={handleDelete}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Delete Alert</span>
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleSave} className="bg-black/70 text-white hover:bg-black/90">Save Alert</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
