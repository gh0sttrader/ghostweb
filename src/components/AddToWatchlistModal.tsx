
"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  query,
  where,
  deleteDoc,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";
import { GhostIcon } from "./v2/GhostIcon";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "./ui/alert";

interface Watchlist {
  id: string;
  name: string;
}

export default function AddToWatchlistModal({
  ticker,
  isOpen,
  onClose,
  onSave,
}: {
  ticker: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  const { toast } = useToast();
  const [lists, setLists] = useState<Watchlist[]>([]);
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const [newListName, setNewListName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !db) return;

    setError(null); // Reset error on open
    setNewListName('');
    setIsCreating(false);

    const fetchWatchlists = async () => {
      try {
        const watchlistCollection = collection(db, "watchlists");
        const querySnapshot = await getDocs(watchlistCollection);
        const fetchedLists: Watchlist[] = [];
        const initialSelected: string[] = [];

        for (const docSnap of querySnapshot.docs) {
          fetchedLists.push({ id: docSnap.id, name: docSnap.id });
          const symbolsCollection = collection(db, "watchlists", docSnap.id, "symbols");
          const symbolQuery = query(symbolsCollection, where("symbol", "==", ticker));
          const symbolSnapshot = await getDocs(symbolQuery);
          if (!symbolSnapshot.empty) {
            initialSelected.push(docSnap.id);
          }
        }

        setLists(fetchedLists);
        setSelectedLists(initialSelected);
      } catch (error: any) {
        console.error("Error fetching watchlists:", error);
        setError(error.message || "Could not fetch your watchlists.");
      }
    };

    fetchWatchlists();
  }, [isOpen, ticker, db]);
  
  const handleCreateNewList = async () => {
    const name = newListName.trim();
    if (!name) return;

    if (lists.some(l => l.name.toLowerCase() === name.toLowerCase())) {
        toast({ title: "List already exists", variant: "destructive" });
        return;
    }

    try {
        const watchlistRef = doc(db, "watchlists", name);
        await setDoc(watchlistRef, { createdAt: Timestamp.now() });
        
        const symbolsCol = collection(watchlistRef, "symbols");
        await addDoc(symbolsCol, {
          symbol: ticker,
          addedAt: Timestamp.now(),
        });
        
        const newWatchlist = { id: name, name: name };
        setLists(prev => [...prev, newWatchlist]);
        setSelectedLists(prev => [...prev, name]);
        setNewListName("");
        setIsCreating(false);
        toast({ title: `Created and added to "${name}"`, variant: "success" });
    } catch (error: any) {
        console.error("Error creating watchlist:", error);
        setError(error.message || "Could not create new watchlist.");
    }
  };

  const handleSaveChanges = async () => {
    if (!db) return;
    setError(null);
    try {
      const batch = writeBatch(db);

      for (const list of lists) {
        const isSelected = selectedLists.includes(list.id);
        const symbolsCollection = collection(db, "watchlists", list.id, "symbols");
        const symbolQuery = query(symbolsCollection, where("symbol", "==", ticker));
        const symbolSnapshot = await getDocs(symbolQuery);
        const exists = !symbolSnapshot.empty;

        if (isSelected && !exists) {
          const newSymbolRef = doc(symbolsCollection);
          batch.set(newSymbolRef, { symbol: ticker, addedAt: Timestamp.now() });
        } else if (!isSelected && exists) {
          symbolSnapshot.forEach(docToDelete => {
            batch.delete(docToDelete.ref);
          });
        }
      }

      await batch.commit();
      toast({
        title: "Watchlists Updated",
        description: `${ticker} has been updated in your lists.`,
        variant: "success",
      });
      onSave();
      onClose(); // Close only on success
    } catch (error: any) {
      console.error("Error updating watchlists:", error);
      setError(error.message || "Failed to save changes.");
    }
  };

   const handleToggleList = (listId: string) => {
        setSelectedLists(prev => 
            prev.includes(listId) ? prev.filter(id => id !== listId) : [...prev, listId]
        );
    };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-transparent backdrop-blur-lg border-white/10 shadow-none w-[380px] max-w-[92vw] p-5">
        <DialogHeader>
          <DialogTitle className="font-semibold text-white/90 text-lg mb-4 text-left">Add {ticker} to Lists</DialogTitle>
        </DialogHeader>
        <div>
          {error && (
              <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
              </Alert>
          )}
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
              className="w-full flex items-center gap-3 py-3 mb-4 rounded-lg hover:bg-neutral-800/80 transition-colors text-left text-white/80"
              onClick={() => setIsCreating(true)}
            >
              <span className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center text-xl font-light">+</span>
              <span className="font-medium">Create New List</span>
            </button>
          )}
          
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {lists.map(list => (
              <button key={list.id}
                className={cn(`w-full flex items-center gap-3 p-4 rounded-lg transition-all duration-200 text-left border`,
                  selectedLists.includes(list.id) 
                  ? "bg-white/5 border-white/20" 
                  : "border-white/10 hover:bg-white/5"
                )}
                onClick={() => handleToggleList(list.id)}>
                <GhostIcon className="w-7 h-7 text-white/70" />
                <div>
                  <div className="font-medium text-white/90">{list.name}</div>
                </div>
              </button>
            ))}
          </div>
          
          <Button
            onClick={handleSaveChanges}
            disabled={selectedLists.length === 0 && !newListName.trim()}
            className="mt-6 w-full py-3 h-12 bg-black border border-white text-white rounded-full font-semibold text-base
                       hover:bg-white/10
                       disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed disabled:border-transparent"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
