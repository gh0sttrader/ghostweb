
"use client";

import React, { useState, useEffect } from 'react';
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { dummyNewsData } from '@/app/(app)/news/dummy-data';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNowStrict } from 'date-fns';
import { MoreHorizontal, Newspaper } from 'lucide-react';
import { Button } from '../ui/button';

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
        const intervalId = setInterval(updateRelativeTime, 30000); 
        return () => clearInterval(intervalId);
    }, [isoString]);

    return <>{relativeTime}</>;
};

interface NewsCardProps {
    className?: string;
    onSymbolSelect: (symbol: string) => void;
    selectedSymbol: string | null;
}

export const NewsCardV2: React.FC<NewsCardProps> = ({ className, onSymbolSelect, selectedSymbol }) => {
    return (
        <div className={cn("h-full flex flex-col", className)}>
            <CardHeader className="py-1 px-3 border-b border-white/10 h-8 flex-row items-center drag-handle cursor-move">
                <CardTitle className="text-sm font-semibold text-muted-foreground">
                    News
                </CardTitle>
                <div className="ml-auto no-drag">
                     <Button variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
                        <MoreHorizontal size={16} />
                    </Button>
                </div>
            </CardHeader>
            <div className="flex-1 overflow-y-auto px-3 pb-3">
                <Table>
                    <TableHeader className="sticky top-0 bg-card z-[1]">
                        <TableRow>
                            <TableHead className="text-xs h-7 px-2 text-left text-muted-foreground font-medium w-[80px]">Symbol</TableHead>
                            <TableHead className="text-xs h-7 px-2 text-left text-muted-foreground font-medium">Headline</TableHead>
                            <TableHead className="text-xs h-7 px-2 text-right text-muted-foreground font-medium w-[100px]">Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {dummyNewsData.slice(0, 20).map((item) => (
                            <TableRow
                                key={item.id}
                                className="cursor-pointer"
                                onClick={() => onSymbolSelect(item.symbol)}
                                data-selected={selectedSymbol === item.symbol}
                            >
                                <TableCell className="px-2 py-1.5 w-[80px]">
                                    <Badge variant="outline" className="text-xs">{item.symbol}</Badge>
                                </TableCell>
                                <TableCell className="font-medium text-xs py-1.5 px-2 truncate">{item.headline}</TableCell>
                                <TableCell className="text-right text-xs py-1.5 px-2 text-muted-foreground whitespace-nowrap w-[100px]">
                                    <RelativeTime isoString={item.timestamp} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
