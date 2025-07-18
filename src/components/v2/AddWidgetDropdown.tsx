
"use client";

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ChartBar, Newspaper, ScanSearch, Table2, ShoppingCart } from 'lucide-react';

const WIDGETS = [
  { key: "chart", label: "Chart", icon: ChartBar },
  { key: "order", label: "Trading Card", icon: ShoppingCart },
  { key: "positions", label: "Positions", icon: Table2 },
  { key: "watchlist", label: "Watchlist", icon: Table2 },
  { key: "screeners", label: "Screeners", icon: ScanSearch },
  { key: "news", label: "News", icon: Newspaper },
];

interface AddWidgetDropdownProps {
  onAddWidget: (widgetKey: string) => void;
}

export function AddWidgetDropdown({ onAddWidget }: AddWidgetDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={ref}>
      <Button 
        className="bg-white text-black font-semibold rounded-full h-8 px-5 text-sm hover:bg-neutral-200 w-32 justify-center"
        onClick={() => setOpen(!open)}
      >
        Add Widget
      </Button>
      {open && (
        <div
          className="
            absolute z-50 mt-2 w-56
            rounded-2xl shadow-xl
            bg-transparent
            backdrop-blur-2xl
            border border-white/15
            p-1
          "
          style={{
            background: "rgba(24, 24, 27, 0.5)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
          }}
        >
          {WIDGETS.map((widget) => {
            const Icon = widget.icon;
            return (
              <button
                key={widget.key}
                className="w-full flex items-center px-4 py-3 rounded-xl text-left hover:bg-white/5 text-white transition font-medium"
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
      )}
    </div>
  );
}
