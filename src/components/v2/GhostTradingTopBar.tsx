
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, ChevronDown, Maximize2 } from "lucide-react";
import Link from 'next/link';
import { useOpenPositionsContext } from '@/contexts/OpenPositionsContext';
import { cn } from '@/lib/utils';
import { AlertsOverlay } from './AlertsOverlay';

export function GhostTradingTopBar() {
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
        className="absolute top-0 left-0 w-full h-[50px] bg-background/90 backdrop-blur-md flex items-center z-50 px-6 border-b border-white/10"
        style={{
          WebkitBackdropFilter: 'blur(10px)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Link href="/accounts">
          <Button className="bg-white text-black font-semibold rounded-full h-8 px-5 text-sm hover:bg-neutral-200">
              Add widget
          </Button>
        </Link>
        
        <div className="ml-auto flex items-center gap-4">
          <div className="relative" ref={dropdownRef}>
            <Button variant="ghost" onClick={() => setIsAccountDropdownOpen(o => !o)} className="flex items-center gap-1.5 text-white font-medium h-8 px-3 text-sm hover:bg-white/10">
                {selectedAccount?.name || 'Select Account'}
                <ChevronDown size={16} className={cn("text-muted-foreground transition-transform", isAccountDropdownOpen && "rotate-180")} />
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
              <Bell size={18} fill="#ef4444" className="text-red-500" />
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
