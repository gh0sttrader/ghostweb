
"use client";

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Account } from '@/types';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Separator } from './ui/separator';

interface AccountCardProps {
    account: Account;
    isSelected: boolean;
    onClick: () => void;
}

const formatCurrency = (value: number) => {
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export const AccountCard: React.FC<AccountCardProps> = ({ account, isSelected, onClick }) => {
    const dailyPnl = account.pnl?.daily || 0;
    const isPositivePnl = dailyPnl >= 0;
    const isPositiveReturn = (account.ytdReturn || 0) >= 0;
    
    return (
        <Card 
            className={cn(
                "cursor-pointer transition-all duration-200 border-2 flex flex-col justify-between flex-1",
                isSelected 
                    ? "border-white shadow-lg shadow-white/20" 
                    : "border-white/10 hover:border-white/30 hover:bg-white/5"
            )}
            onClick={onClick}
        >
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold flex items-center justify-between">
                    {account.name}
                    {isSelected && <ArrowRight className="h-4 w-4 text-primary" />}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 pb-4">
                <p className="text-2xl font-bold text-foreground">
                    ${formatCurrency(account.balance)}
                </p>
                <div className="flex items-center text-sm mt-1">
                    <span className={cn("flex items-center", isPositivePnl ? "text-[hsl(var(--confirm-green))]" : "text-destructive")}>
                        {isPositivePnl ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                        {isPositivePnl ? '+' : ''}
                        ${formatCurrency(dailyPnl)}
                    </span>
                    <span className="text-muted-foreground ml-2">
                        Today
                    </span>
                </div>

                <div className="mt-4 space-y-2">
                    <div className="flex justify-between items-baseline text-lg">
                        <span className="text-muted-foreground">Holdings</span>
                        <span className="font-bold text-foreground">{account.holdingsCount || 0}</span>
                    </div>
                     <div className="flex justify-between items-baseline text-lg">
                        <span className="text-muted-foreground">Cash</span>
                        <span className="font-bold text-foreground">${formatCurrency(account.cash || 0)}</span>
                    </div>
                     <div className="flex justify-between items-baseline text-lg">
                        <span className="text-muted-foreground">YTD Return</span>
                        <span className={cn("font-bold", isPositiveReturn ? "text-[hsl(var(--confirm-green))]" : "text-destructive")}>
                           {account.ytdReturn ? `${account.ytdReturn.toFixed(2)}%` : 'N/A'}
                        </span>
                    </div>
                </div>
                
                <div className="flex-1"></div>

            </CardContent>
        </Card>
    );
};
