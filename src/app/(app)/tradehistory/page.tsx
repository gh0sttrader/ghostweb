
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  
  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden p-4 md:p-6 lg:py-8 items-center justify-center">
       <div className="w-full max-w-4xl flex justify-center">
            <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="p-0"
                classNames={{
                    caption_label: "text-2xl font-bold",
                    head_cell: "w-24 h-12 text-base",
                    cell: "w-24 h-20 text-base",
                    day: "w-16 h-16 text-xl",
                    nav_button: "h-10 w-10"
                }}
            />
       </div>
    </main>
  );
}
