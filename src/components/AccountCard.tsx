
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Account } from '@/types';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

interface AccountCardProps {
    account: Account;
    isSelected: boolean;
    onClick: () => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({ account, isSelected, onClick }) => {
    const dailyPnl = account.pnl?.daily || 0;
    const isPositive = dailyPnl >= 0;
    
    return (
        <Card 
            className={cn(
                "cursor-pointer transition-all duration-200 border-2",
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
            <CardContent>
                <p className="text-2xl font-bold text-foreground">
                    ${account.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className="flex items-center text-sm mt-1">
                    <span className={cn("flex items-center", isPositive ? "text-[hsl(var(--confirm-green))]" : "text-destructive")}>
                        {isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                        {isPositive ? '+' : ''}
                        ${dailyPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-muted-foreground ml-2">
                        Today
                    </span>
                </div>
            </CardContent>
        </Card>
    );
};
