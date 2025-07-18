
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
                <DialogOverlay className="gt2-alerts-overlay" />
                <DialogContent 
                    className="bg-transparent border-none shadow-none w-full max-w-md p-0"
                    onInteractOutside={onClose}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="gt2-alerts-card"
                  >
                    <DialogHeader>
                      <DialogTitle asChild>
                        <h2>ALERTS</h2>
                      </DialogTitle>
                      <DialogClose asChild>
                         <button className="gt2-alerts-close" onClick={onClose} aria-label="Close alerts">
                            <X size={22} />
                        </button>
                      </DialogClose>
                    </DialogHeader>
                    
                    <ul>
                      <li><span role="img" aria-label="bell">🔔</span> <b>TSLA</b> is up 5% today.</li>
                      <li><span role="img" aria-label="bell">🔔</span> <b>AAPL</b> earnings tomorrow at 3:30pm.</li>
                      <li><span role="img" aria-label="bell">🔔</span> <b>NVDA</b> hit a new 52-week high.</li>
                    </ul>
                  </motion.div>
                </DialogContent>
            </DialogPortal>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
