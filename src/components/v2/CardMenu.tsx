
"use client";

import React, { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Trash2, Settings2, Plus, LogOut } from 'lucide-react';
import { cn } from "@/lib/utils";

interface CardMenuProps {
  showCustomize?: boolean;
  onCustomize: () => void;
  onDelete: () => void;
}

export function CardMenu({ onCustomize, onDelete, showCustomize = true }: CardMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
  }

  return (
    <div className="relative no-drag" ref={ref} onMouseDown={handleInteraction} onTouchStart={handleInteraction}>
      <button
        className="p-1 rounded-full text-muted-foreground hover:bg-white/10 hover:text-foreground"
        onClick={(e) => {
            e.stopPropagation();
            setOpen((o) => !o)
        }}
        aria-label="Card options"
      >
        <MoreHorizontal size={18} />
      </button>
      {open && (
        <div
          className="
            absolute right-0 mt-2 w-48 z-50
            rounded-xl shadow-lg
            bg-transparent
            backdrop-blur-2xl
            border border-white/15
            py-1.5
          "
          style={{
            background: "rgba(24, 24, 27, 0.5)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
          }}
        >
          {showCustomize && (
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-white/5 text-white transition-colors"
                onClick={(e) => { e.stopPropagation(); setOpen(false); onCustomize(); }}
              >
                <Settings2 size={16} className="text-muted-foreground" />
                <span>Customize</span>
              </button>
          )}
          <button
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-white/5 text-destructive font-medium transition-colors"
            onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(); }}
          >
            <Trash2 size={16} />
            <span>Delete Card</span>
          </button>
        </div>
      )}
    </div>
  );
}
