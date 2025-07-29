
"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Input } from './ui/input';

const GhostIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      viewBox="0 0 40 40"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Ghost Trading Logo"
      {...props}
    >
      <path d="M20 4C12 4 6 10 6 18v10c0 2 1 3 3 3s2-1 4-1 3 1 5 1 3-1 5-1 3 1 5 1c2 0 3-1 3-3V18c0-8-6-14-14-14zM14 20a2 2 0 110-4 2 2 0 010 4zm12 0a2 2 0 110-4 2 2 0 010 4z" />
    </svg>
);

const WATCHLISTS_STORAGE_KEY = 'ghost-trading-watchlists';

interface Watchlist {
    id: string;
    name: string;
    items: string[];
}

const initialWatchlists: Watchlist[] = [
    { id: '1', name: 'Main Watchlist', items: ['TSLA', 'AAPL', 'AMZN', 'GOOGL', 'MSFT', 'META', 'NVDA'] },
    { id: '2', name: 'Tech Stocks', items: ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMD', 'CRM'] },
    { id: '3', name: 'Dividend Picks', items: ['JPM', 'KO', 'PFE', 'XOM'] },
];

interface AddToListModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticker: string;
}

export function AddToListModal({ isOpen, onClose, ticker }: AddToListModalProps) {
    const { toast } = useToast();
    const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
    const [selectedLists, setSelectedLists] = useState<string[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newListName, setNewListName] = useState('');

    useEffect(() => {
        try {
            const saved = localStorage.getItem(WATCHLISTS_STORAGE_KEY);
            const loaded = saved ? JSON.parse(saved) : initialWatchlists;
            setWatchlists(loaded);

            const initialSelected = loaded
                .filter((list: Watchlist) => list.items.includes(ticker))
                .map((list: Watchlist) => list.id);
            setSelectedLists(initialSelected);
        } catch (error) {
            console.error("Failed to load watchlists:", error);
            setWatchlists(initialWatchlists);
        }
    }, [isOpen, ticker]);

    const handleToggleList = (listId: string) => {
        setSelectedLists(prev => 
            prev.includes(listId) ? prev.filter(id => id !== listId) : [...prev, listId]
        );
    };
    
    const handleCreateNewList = () => {
        if (!newListName.trim()) return;
        const newList: Watchlist = {
            id: `list_${Date.now()}`,
            name: newListName.trim(),
            items: [],
        };
        const updatedWatchlists = [...watchlists, newList];
        setWatchlists(updatedWatchlists);
        localStorage.setItem(WATCHLISTS_STORAGE_KEY, JSON.stringify(updatedWatchlists));
        setNewListName('');
        setIsCreating(false);
        handleToggleList(newList.id);
    };

    const handleSaveChanges = () => {
        const updatedWatchlists = watchlists.map(list => {
            const isSelected = selectedLists.includes(list.id);
            const hasTicker = list.items.includes(ticker);

            if (isSelected && !hasTicker) {
                return { ...list, items: [...list.items, ticker] };
            }
            if (!isSelected && hasTicker) {
                return { ...list, items: list.items.filter(item => item !== ticker) };
            }
            return list;
        });
        setWatchlists(updatedWatchlists);
        localStorage.setItem(WATCHLISTS_STORAGE_KEY, JSON.stringify(updatedWatchlists));
        toast({
            title: "Watchlists Updated",
            description: `${ticker} has been updated in your lists.`,
            variant: "success",
        });
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <Dialog open={isOpen} onOpenChange={onClose}>
                    <DialogPortal>
                         <DialogOverlay className="bg-black/70 backdrop-blur-sm" />
                         <DialogContent
                            className="bg-neutral-900 border-white/10 p-6 sm:p-8 rounded-2xl w-[380px] max-w-[92vw]"
                         >
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <h2 className="font-semibold text-xl mb-6 text-center">Add {ticker} to Lists</h2>
                                
                                {isCreating ? (
                                    <div className="flex items-center gap-2 mb-4">
                                        <Input 
                                            placeholder="New list name..."
                                            value={newListName}
                                            onChange={(e) => setNewListName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleCreateNewList()}
                                            className="h-10"
                                        />
                                        <Button size="sm" onClick={handleCreateNewList}>Create</Button>
                                        <Button size="sm" variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
                                    </div>
                                ) : (
                                    <button 
                                      className="w-full flex items-center gap-3 py-3 mb-4 rounded-lg hover:bg-neutral-800/80 transition-colors text-left"
                                      onClick={() => setIsCreating(true)}
                                    >
                                        <span className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center text-2xl text-white font-light">+</span>
                                        <span className="font-medium">Create New List</span>
                                    </button>
                                )}
                                
                                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                                    {watchlists.map(list => (
                                      <button key={list.id}
                                        className={cn(`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left`,
                                          selectedLists.includes(list.id) 
                                          ? "bg-primary/20 ring-2 ring-primary" 
                                          : "hover:bg-neutral-800/80"
                                        )}
                                        onClick={() => handleToggleList(list.id)}>
                                        <GhostIcon className="w-7 h-7 text-white/80" />
                                        <div>
                                          <div className="font-medium">{list.name}</div>
                                          <div className="text-xs text-white/50">{list.items.length} items</div>
                                        </div>
                                      </button>
                                    ))}
                                </div>
                                
                                <Button
                                  disabled={selectedLists.length === 0}
                                  onClick={handleSaveChanges}
                                  className="mt-6 w-full py-3 h-12 bg-[hsl(var(--confirm-green))] text-black rounded-full font-semibold text-base
                                             hover:bg-[hsl(var(--confirm-green))]/90
                                             disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed"
                                >
                                  Save Changes
                                </Button>
                            </motion.div>
                        </DialogContent>
                    </DialogPortal>
                </Dialog>
            )}
        </AnimatePresence>
    );
}
