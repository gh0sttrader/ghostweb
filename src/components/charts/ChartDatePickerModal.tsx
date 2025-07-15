
"use client"

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import type { DateRange } from 'react-day-picker';

interface ChartDatePickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGo: (date: Date | DateRange) => void;
}

export function ChartDatePickerModal({ isOpen, onClose, onGo }: ChartDatePickerModalProps) {
    const [date, setDate] = useState<Date | undefined>(new Date());
    
    const handleGoClick = () => {
        if (date) {
            onGo(date);
            onClose();
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Select Date</DialogTitle>
                </DialogHeader>
                <div className="flex justify-center">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button variant="outline" onClick={handleGoClick}>Go</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
