
"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, ChevronDown, Maximize2 } from "lucide-react";
import Link from 'next/link';

export function GhostTradingTopBar() {
  return (
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
        <Button variant="ghost" className="flex items-center gap-1.5 text-white font-medium h-8 px-3 text-sm hover:bg-white/10">
            Individual
            <ChevronDown size={16} className="text-muted-foreground" />
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10">
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
  );
}
