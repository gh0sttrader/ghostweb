
"use client";

import React from 'react';
import { Calendar } from "@/components/ui/calendar";

export default function HistoryPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  
  return (
    <main className="flex flex-col w-full max-w-6xl mx-auto px-8 py-4 md:py-6 lg:py-8 2xl:max-w-7xl 2xl:px-16">
       <div className="w-full flex justify-center">
            <div className="border border-white/10 rounded-xl p-8">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="p-0"
                    classNames={{
                        caption_label: "text-3xl font-bold",
                        head_cell: "w-28 h-14 text-lg",
                        cell: "w-28 h-24 text-lg",
                        day: "w-20 h-20 text-2xl",
                        nav_button: "h-12 w-12"
                    }}
                />
            </div>
       </div>
    </main>
  );
}
