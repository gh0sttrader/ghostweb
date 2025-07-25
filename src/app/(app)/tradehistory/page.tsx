
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  
  return (
    <main className="flex flex-col flex-1 h-full overflow-hidden p-4 md:p-6 lg:py-8 items-center">
       <div className="w-full max-w-4xl">
            <Card className="rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-xl font-headline flex items-center">
                    Trade History Calendar
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="p-0"
                    />
                </CardContent>
            </Card>
       </div>
    </main>
  );
}
