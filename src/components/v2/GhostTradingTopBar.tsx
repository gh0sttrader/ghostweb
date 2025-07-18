
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, ChevronDown, Maximize2 } from "lucide-react";
import Link from 'next/link';
import { useOpenPositionsContext } from '@/contexts/OpenPositionsContext';
import { cn } from '@/lib/utils';
import { AlertsOverlay } from './AlertsOverlay';
import { AddWidgetDropdown } from './AddWidgetDropdown';

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
    onAddWidget: (widgetKey: string) => void;
}


export function GhostTradingTopBar({ onAddWidget }: GhostTradingTopBarProps) {
  const { accounts, selectedAccountId, setSelectedAccountId } = useOpenPositionsContext();
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAccountDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleAccountSelect = (accountId: string) => {
    setSelectedAccountId(accountId);
    setIsAccountDropdownOpen(false);
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
        </div>
        
        <div className="flex items-center gap-4">
          <AddWidgetDropdown onAddWidget={onAddWidget} />
          <div className="relative" ref={dropdownRef}>
            <Button variant="ghost" onClick={() => setIsAccountDropdownOpen(o => !o)} className="flex items-center justify-between gap-1.5 text-white font-medium h-8 px-3 text-sm hover:bg-white/10 w-40">
                <span className="truncate">{selectedAccount?.name || 'Select Account'}</span>
                <ChevronDown size={16} className={cn("text-muted-foreground transition-transform shrink-0", isAccountDropdownOpen && "rotate-180")} />
            </Button>
            {isAccountDropdownOpen && (
              <div className="absolute top-full mt-2 right-0 min-w-[180px] bg-[#181818e6] rounded-lg shadow-2xl p-1 z-[101] border border-white/10">
                {accounts.map(acc => (
                  <div
                    key={acc.id}
                    className={cn(
                      "text-white/90 p-2 text-sm rounded-md cursor-pointer font-medium transition-colors hover:bg-white/10",
                      selectedAccountId === acc.id && "bg-white/20"
                    )}
                    onClick={() => handleAccountSelect(acc.id)}
                  >
                    {acc.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10" onClick={() => setIsAlertsOpen(true)}>
              <Bell size={18} fill="hsl(var(--destructive))" className="text-destructive" />
          </Button>
          
          <Avatar className="h-8 w-8 border-2 border-neutral-700">
              <AvatarImage src="https://placehold.co/40x40.png" alt="User Avatar" data-ai-hint="person" />
              <AvatarFallback>U</AvatarFallback>
          </Avatar>

          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 text-muted-foreground" tabIndex={-1}>
              <Maximize2 size={18} />
          </Button>
        </div>
      </header>
      <AlertsOverlay isOpen={isAlertsOpen} onClose={() => setIsAlertsOpen(false)} />
    </>
  );
}

    