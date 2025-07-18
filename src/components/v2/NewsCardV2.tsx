
"use client";

import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { dummyNewsData } from '@/app/(app)/news/dummy-data';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNowStrict } from 'date-fns';
import { Newspaper } from 'lucide-react';

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
            <div className="flex-1 overflow-auto px-3 pb-3">
                <div className="h-full overflow-x-auto">
                    <Table className="min-w-[400px]">
                        <TableHeader className="sticky top-0 bg-card/[.05] backdrop-blur-md z-[1]">
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
                                    <TableCell className="px-2 py-1.5">
                                        <Badge variant="outline" className="text-xs">{item.symbol}</Badge>
                                    </TableCell>
                                    <TableCell className="font-medium text-xs py-1.5 px-2 truncate">{item.headline}</TableCell>
                                    <TableCell className="text-right text-xs py-1.5 px-2 text-muted-foreground whitespace-nowrap">
                                        <RelativeTime isoString={item.timestamp} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
};
