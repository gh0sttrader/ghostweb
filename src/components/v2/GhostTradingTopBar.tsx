
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Bell, ChevronDown, Maximize2, Minimize2, Plus, ChartBar, Newspaper, ScanSearch, Table2, ShoppingCart, ListOrdered, History } from "lucide-react";
import Link from 'next/link';
import { useOpenPositionsContext } from '@/contexts/OpenPositionsContext';
import { cn } from '@/lib/utils';
import { AlertsOverlay } from './AlertsOverlay';
import { LayoutDropdown } from './LayoutDropdown';
import type { WidgetKey } from '@/types';


const WIDGETS = [
  { key: "chart" as WidgetKey, label: "Chart", icon: ChartBar },
  { key: "order" as WidgetKey, label: "Trading Card", icon: ShoppingCart },
  { key: "positions" as WidgetKey, label: "Positions", icon: Table2 },
  { key: "orders" as WidgetKey, label: "Open Orders", icon: ListOrdered },
  { key: "history" as WidgetKey, label: "History", icon: History },
  { key: "watchlist" as WidgetKey, label: "Watchlist", icon: Table2 },
  { key: "screeners" as WidgetKey, label: "Screeners", icon: ScanSearch },
  { key: "news" as WidgetKey, label: "News", icon: Newspaper },
];

const GhostIcon = (props: React.SVGProps<SVGSVGElement>) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <svg
      viewBox="0 0 40 40"
      fill="white"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Ghost Trading Logo"
      {...props}
    >
      <path d="M20 4C12 4 6 10 6 18v10c0 2 1 3 3 3s2-1 4-1 3 1 5 1 3-1 5-1 3 1 5 1c2 0 3-1 3-3V18c0-8-6-14-14-14zM14 20a2 2 0 110-4 2 2 0 010 4zm12 0a2 2 0 110-4 2 2 0 010 4z" />
    </svg>
  );
};

interface GhostTradingTopBarProps {
    onAddWidget: (widgetKey: WidgetKey) => void;
    currentLayouts: ReactGridLayout.Layout[];
    onLayoutChange: (config: { layouts: ReactGridLayout.Layout[], widgetGroups: Record<string, any> }) => void;
    widgetGroups: Record<string, any[]>;
    onWidgetGroupsChange: (groups: Record<string, any[]>) => void;
}


export function GhostTradingTopBar({ onAddWidget, currentLayouts, onLayoutChange, widgetGroups, onWidgetGroupsChange }: GhostTradingTopBarProps) {
  const { accounts, selectedAccountId, setSelectedAccountId } = useOpenPositionsContext();
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isWidgetDropdownOpen, setIsWidgetDropdownOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const widgetDropdownRef = useRef<HTMLDivElement>(null);

  const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target as Node)) {
            setIsAccountDropdownOpen(false);
        }
        if (widgetDropdownRef.current && !widgetDropdownRef.current.contains(event.target as Node)) {
            setIsWidgetDropdownOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleAccountSelect = (accountId: string) => {
    setSelectedAccountId(accountId);
    setIsAccountDropdownOpen(false);
  };

  const toggleFullscreen = () => {
    const el = document.documentElement as any;
    if (!document.fullscreenElement) {
        if (el.requestFullscreen) {
            el.requestFullscreen();
        } else if (el.mozRequestFullScreen) { // Firefox
            el.mozRequestFullScreen();
        } else if (el.webkitRequestFullscreen) { // Safari
            el.webkitRequestFullscreen();
        } else if (el.msRequestFullscreen) { // IE/Edge
            el.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if ((document as any).mozCancelFullScreen) { // Firefox
            (document as any).mozCancelFullScreen();
        } else if ((document as any).webkitExitFullscreen) { // Safari
            (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) { // IE/Edge
            (document as any).msExitFullscreen();
        }
    }
  };


  return (
    <>
      <header 
        className="absolute top-0 left-0 w-full h-[50px] bg-background/90 backdrop-blur-md flex items-center justify-between z-50 px-6 border-b border-white/10"
        style={{
          WebkitBackdropFilter: 'blur(10px)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="flex items-center">
            <Link href="/accounts" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
                <GhostIcon className="h-8 w-8" />
            </Link>
            <LayoutDropdown 
              currentLayouts={currentLayouts}
              onLayoutChange={onLayoutChange}
              widgetGroups={widgetGroups}
              onWidgetGroupsChange={onWidgetGroupsChange}
            />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative" ref={widgetDropdownRef}>
            <Button 
                variant="ghost"
                className="flex items-center justify-center gap-2 text-white font-medium h-8 px-3 text-sm hover:bg-white/10"
                onClick={() => setIsWidgetDropdownOpen(prev => !prev)}
            >
                <span>Add Widget</span>
                <ChevronDown size={16} className={cn("text-muted-foreground transition-transform shrink-0", isWidgetDropdownOpen && "rotate-180")} />
            </Button>
            {isWidgetDropdownOpen && (
                 <div className="absolute left-0 mt-2 min-w-[220px] z-50 rounded-xl shadow-2xl backdrop-blur-lg bg-transparent py-2 border border-white/10"
                      style={{ background: 'rgba(24, 24, 27, 0.5)' }}>
                    {WIDGETS.map((widget) => (
                        <button
                            key={widget.key}
                            className="w-full flex items-center gap-3 px-4 py-2 text-white text-left hover:bg-white/10 text-sm"
                            onClick={() => {
                                onAddWidget(widget.key);
                                setIsWidgetDropdownOpen(false);
                            }}
                        >
                            <widget.icon className="h-4 w-4 text-muted-foreground" />
                            {widget.label}
                        </button>
                    ))}
                </div>
            )}
          </div>
          <div className="relative" ref={accountDropdownRef}>
            <Button variant="ghost" onClick={() => setIsAccountDropdownOpen(prev => !prev)} className="flex items-center justify-between gap-2 text-white font-medium h-8 px-3 text-sm hover:bg-white/10">
                <span className="truncate">{selectedAccount?.name || 'Select Account'}</span>
                <ChevronDown size={16} className={cn("text-muted-foreground transition-transform shrink-0", isAccountDropdownOpen && "rotate-180")} />
            </Button>
             {isAccountDropdownOpen && (
                 <div className="absolute right-0 mt-2 min-w-[220px] z-50 rounded-xl shadow-2xl backdrop-blur-lg bg-transparent py-2 border border-white/10"
                      style={{ background: 'rgba(24, 24, 27, 0.5)' }}>
                    {accounts.map(acc => (
                         <button
                            key={acc.id}
                            className={cn(
                                "w-full text-sm text-left px-4 py-2 hover:bg-white/10",
                                selectedAccountId === acc.id ? "text-white font-semibold" : "text-white/80"
                            )}
                            onClick={() => handleAccountSelect(acc.id)}
                        >
                            {acc.name}
                        </button>
                    ))}
                </div>
            )}
          </div>

          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10" onClick={() => setIsAlertsOpen(true)}>
              <Bell size={18} fill="hsl(var(--destructive))" className="text-destructive" />
          </Button>
          
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 text-muted-foreground" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </Button>
        </div>
      </header>
      <AlertsOverlay isOpen={isAlertsOpen} onClose={() => setIsAlertsOpen(false)} />
    </>
  );
}
