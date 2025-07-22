
"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ChartBar, Newspaper, ScanSearch, Table2, ShoppingCart, ListOrdered, History, Plus, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogPortal,
  DialogClose
} from "@/components/ui/dialog";

const WIDGETS = [
  { key: "chart", label: "Chart", icon: ChartBar },
  { key: "order", label: "Trading Card", icon: ShoppingCart },
  { key: "positions", label: "Positions", icon: Table2 },
  { key: "orders", label: "Open Orders", icon: ListOrdered },
  { key: "history", label: "History", icon: History },
  { key: "watchlist", label: "Watchlist", icon: Table2 },
  { key: "screeners", label: "Screeners", icon: ScanSearch },
  { key: "news", label: "News", icon: Newspaper },
];

interface AddWidgetDropdownProps {
  onAddWidget: (widgetKey: string) => void;
}

export function AddWidgetDropdown({ onAddWidget }: AddWidgetDropdownProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button 
        variant="ghost"
        className="flex items-center justify-center gap-2 text-white font-medium h-8 px-3 text-sm hover:bg-white/10"
        onClick={() => setOpen(true)}
      >
        <span>Add Widget</span>
        <ChevronDown size={16} className={cn("text-muted-foreground transition-transform shrink-0", open && "rotate-180")} />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogPortal>
          <DialogOverlay className="bg-transparent backdrop-blur-lg" />
          <DialogContent className="bg-black/70 border-white/10 rounded-2xl shadow-2xl p-8 sm:p-12 max-w-xl w-full flex flex-col items-center">
            <DialogHeader>
              <DialogTitle className="text-4xl font-bold text-center mb-8">Add Widget</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {WIDGETS.map((widget) => {
                const Icon = widget.icon;
                return (
                  <button
                    key={widget.key}
                    className="w-full flex items-center px-4 py-3 rounded-xl text-left text-white transition font-medium cursor-pointer hover:bg-white/10 border border-white/10"
                    onClick={() => {
                      setOpen(false);
                      onAddWidget(widget.key);
                    }}
                  >
                    <Icon className="mr-3 h-4 w-4 text-muted-foreground" />
                    {widget.label}
                  </button>
                )
              })}
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </>
  );
}
