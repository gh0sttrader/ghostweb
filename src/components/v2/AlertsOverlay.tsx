
"use client";

import React from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogPortal,
  DialogClose
} from "@/components/ui/dialog";

interface AlertsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AlertsOverlay({ isOpen, onClose }: AlertsOverlayProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogPortal>
                <DialogOverlay className="bg-background/10 backdrop-blur-md" />
                <DialogContent 
                    className="bg-transparent border-none shadow-none w-full max-w-md p-0"
                    onInteractOutside={onClose}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="relative bg-neutral-900/90 border border-white/10 p-6 rounded-2xl shadow-2xl text-white"
                  >
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold mb-4">Alerts</DialogTitle>
                      <DialogClose asChild>
                         <button className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors" onClick={onClose}>
                            <X size={20} />
                            <span className="sr-only">Close</span>
                        </button>
                      </DialogClose>
                    </DialogHeader>
                    
                    <ul className="space-y-3">
                      <li className="text-sm">🔔 <b>TSLA</b> is up 5% today.</li>
                      <li className="text-sm">🔔 <b>AAPL</b> earnings tomorrow at 3:30pm.</li>
                      <li className="text-sm">🔔 <b>NVDA</b> hit a new 52-week high.</li>
                    </ul>
                  </motion.div>
                </DialogContent>
            </DialogPortal>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
