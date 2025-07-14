
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2, TrendingUp, TrendingDown, Minus, Bell } from 'lucide-react';
import { cn } from "@/lib/utils";
import { dummyNewsData } from './dummy-data';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNowStrict } from 'date-fns';

const sentimentConfig = {
    Positive: { 
        label: 'Bullish',
        icon: <TrendingUp className="h-4 w-4 mr-1.5" />, 
        className: 'text-[hsl(var(--confirm-green))]' 
    },
    Negative: { 
        label: 'Bearish',
        icon: <TrendingDown className="h-4 w-4 mr-1.5" />, 
        className: 'text-destructive' 
    },
    Neutral: { 
        label: 'Neutral',
        icon: <Minus className="h-4 w-4 mr-1.5" />, 
        className: 'text-muted-foreground' 
    },
};

const RelativeTime = ({ isoString }: { isoString: string }) => {
    const [relativeTime, setRelativeTime] = useState('');

    useEffect(() => {
        const updateRelativeTime = () => {
            try {
                const date = new Date(isoString);
                const distance = formatDistanceToNowStrict(date);
                setRelativeTime(`${distance} ago`);
            } catch (e) {
                setRelativeTime('Invalid date');
            }
        };

        updateRelativeTime();
        // Update every 30 seconds to keep it relatively fresh
        const intervalId = setInterval(updateRelativeTime, 30000); 

        return () => clearInterval(intervalId);
    }, [isoString]);

    return <>{relativeTime}</>;
};

export default function NewsPage() {
  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">News</h1>
        </div>
        
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <Select defaultValue="all_sources">
                    <SelectTrigger className="w-auto h-9 text-xs">
                        <SelectValue placeholder="Source" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all_sources">All Sources</SelectItem>
                        <SelectItem value="reuters">Reuters</SelectItem>
                        <SelectItem value="bloomberg">Bloomberg</SelectItem>
                        <SelectItem value="wsj">Wall Street Journal</SelectItem>
                    </SelectContent>
                </Select>
                <Select defaultValue="us_market">
                    <SelectTrigger className="w-auto h-9 text-xs">
                        <SelectValue placeholder="Market" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="us_market">US Market</SelectItem>
                        <SelectItem value="global">Global</SelectItem>
                        <SelectItem value="crypto">Crypto</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="relative w-full max-w-xs">
                <Input
                    placeholder="Search symbol..."
                    className="h-9 w-full pl-8 rounded-full"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
        </div>

        <div className="rounded-lg overflow-auto flex-1 border border-border/10 bg-card">
            <Table>
                <TableHeader className="sticky top-0 z-10">
                    <TableRow className="hover:bg-card">
                        <TableHead className="w-[150px] bg-card hover:bg-card">Time</TableHead>
                        <TableHead className="w-[100px] bg-card hover:bg-card">Symbol</TableHead>
                        <TableHead className="bg-card hover:bg-card">Headline</TableHead>
                        <TableHead className="w-[150px] bg-card hover:bg-card">Sentiment</TableHead>
                        <TableHead className="w-[150px] bg-card hover:bg-card">Provider</TableHead>
                        <TableHead className="w-[100px] text-center bg-card hover:bg-card">Alerts</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                   {dummyNewsData.map((item, index) => {
                       const sentiment = sentimentConfig[item.sentiment];
                       return (
                           <TableRow key={index} className="border-b border-border/5 hover:bg-white/5">
                               <TableCell className="text-muted-foreground font-mono text-sm whitespace-nowrap">
                                   <RelativeTime isoString={item.timestamp} />
                               </TableCell>
                               <TableCell>
                                   <Badge variant="outline" className="text-sm">{item.symbol}</Badge>
                               </TableCell>
                               <TableCell className="font-medium">{item.headline}</TableCell>
                               <TableCell className={cn("flex items-center font-semibold", sentiment.className)}>
                                   {sentiment.icon}
                                   {sentiment.label}
                               </TableCell>
                               <TableCell className="text-muted-foreground">{item.provider}</TableCell>
                               <TableCell className="text-center">
                                   {item.hasAlert && <Bell className="h-4 w-4 mx-auto text-primary" />}
                               </TableCell>
                           </TableRow>
                       );
                   })}
                </TableBody>
            </Table>
        </div>
    </main>
  );
}
