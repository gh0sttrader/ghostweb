
"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// --- Dummy Data ---
// In a real application, you would fetch this data from your API.
// The key is the day of the month.
const dummyProfitLossData = {
    2: 150.75,
    3: -45.20,
    5: 350.00,
    6: 25.50,
    9: -88.10,
    10: 120.45,
    11: -15.00,
    12: 32.80,
    16: 550.25,
    17: -120.90,
    18: 75.00,
    19: -200.00,
    23: 450.60,
    24: 12.30,
    25: -30.50,
    30: 198.75,
};

// --- Helper Functions ---
const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
};

const TradeHistoryCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date(2025, 4, 1)); // May 2025

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const renderCalendarDays = () => {
        const days = [];
        // Add empty cells for the days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="border-r border-b border-neutral-800"></div>);
        }

        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const profitLoss = dummyProfitLossData[day as keyof typeof dummyProfitLossData];
            const isProfit = profitLoss !== undefined && profitLoss > 0;
            const isLoss = profitLoss !== undefined && profitLoss < 0;

            // Base classes for a day cell
            let dayContainerClasses = "p-2 h-28 border-r border-b border-neutral-800 flex flex-col transition-colors duration-200";

            // Conditionally add background colors for profit or loss
            if (isProfit) {
                dayContainerClasses += " bg-green-500/10 hover:bg-green-500/20";
            } else if (isLoss) {
                dayContainerClasses += " bg-red-500/10 hover:bg-red-500/20";
            }

            days.push(
                <div key={day} className={dayContainerClasses}>
                    {/* Day number remains at the top-left */}
                    <span className="font-medium text-neutral-300">{day}</span>
                    
                    {/* P/L value is now centered in the remaining space */}
                    {profitLoss !== undefined && (
                        <div className="flex-grow flex items-center justify-center">
                            <span className={`font-semibold text-xl ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                               {isProfit ? '+' : ''}${Math.abs(profitLoss).toFixed(2)}
                            </span>
                        </div>
                    )}
                </div>
            );
        }
        return days;
    };

    return (
        <div className="bg-transparent text-white w-full">
            <div className="bg-transparent border border-neutral-800 rounded-lg p-4 sm:p-6">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                    <button onClick={handlePrevMonth} className="p-2 rounded-md hover:bg-neutral-700 transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <h2 className="text-2xl font-bold text-white">
                        {monthName} {year}
                    </h2>
                    <button onClick={handleNextMonth} className="p-2 rounded-md hover:bg-neutral-700 transition-colors">
                        <ChevronRight size={24} />
                    </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 border-t border-l border-neutral-800">
                    {/* Day labels */}
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                        <div key={day} className="p-3 text-center font-semibold text-neutral-400 border-r border-b border-neutral-800">
                            {day}
                        </div>
                    ))}
                    {/* Calendar days */}
                    {renderCalendarDays()}
                </div>
            </div>
        </div>
    );
};


export default function HistoryPage() {
  return (
    <main className="w-full max-w-6xl mx-auto px-8 py-4 md:py-6 lg:py-8 2xl:max-w-7xl 2xl:px-16">
       <TradeHistoryCalendar />
    </main>
  );
}
