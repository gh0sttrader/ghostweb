
"use client"
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { initialMockStocks } from '@/app/(app)/trading/dashboard/mock-data';
import { ScrollArea } from './ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';


interface WatchlistCardProps {
    className?: string;
}

const dummyWatchlists = ["My Watchlist", "Tech Stocks", "Growth", "Crypto", "High Volume"];
const watchlistStocks = initialMockStocks.slice(0, 15);


export const WatchlistCard: React.FC<WatchlistCardProps> = ({ className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedWatchlist, setSelectedWatchlist] = useState("My Watchlist");

    const handleSelect = (watchlist: string) => {
        setSelectedWatchlist(watchlist);
    };

    return (
        <div className={cn("h-full flex flex-col p-3", className)}>
            <div className="flex items-center mb-2">
                <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="flex items-center text-foreground font-bold text-base p-0 h-auto hover:bg-transparent"
                        >
                            {selectedWatchlist}
                            <ChevronDown
                                className={cn(
                                    "ml-2 h-4 w-4 text-muted-foreground transition-transform",
                                    isOpen && "rotate-180"
                                )}
                            />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-56 backdrop-blur-md bg-black/50 border-white/10"
                        style={{
                            WebkitBackdropFilter: 'blur(10px)',
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        {dummyWatchlists.map((list) => (
                             <DropdownMenuItem key={list} onSelect={() => handleSelect(list)} className="text-sm font-medium">
                                {list}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem onSelect={() => console.log('Create new watchlist')}>
                            <Plus className="mr-2 h-4 w-4" />
                            <span>Create new watchlist</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            
            <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                    <Table>
                        <TableHeader className="sticky top-0 bg-background/[.05] backdrop-blur-md z-[1]">
                            <TableRow>
                                <TableHead className="text-xs h-7 px-2 text-left text-muted-foreground font-medium">Symbol</TableHead>
                                <TableHead className="text-xs h-7 px-2 text-right text-muted-foreground font-medium">Price</TableHead>
                                <TableHead className="text-xs h-7 px-2 text-right text-muted-foreground font-medium">% Change</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {watchlistStocks.map((stock) => (
                                <TableRow
                                    key={stock.id}
                                    className="cursor-pointer"
                                >
                                    <TableCell className="font-medium text-xs py-1.5 px-2">{stock.symbol}</TableCell>
                                    <TableCell className="text-right text-xs py-1.5 px-2">{`$${stock.price.toFixed(2)}`}</TableCell>
                                    <TableCell className={cn("text-right text-xs py-1.5 px-2", stock.changePercent >= 0 ? "text-[hsl(var(--confirm-green))]" : "text-destructive")}>
                                        {`${stock.changePercent.toFixed(2)}%`}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </div>
        </div>
    );
};
