
"use client";

import React from 'react';
import { Separator } from '@/components/ui/separator';
import type { Stock } from '@/types';
import { cn } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface SectorsCardProps {
    stock: Stock;
    className?: string;
}

const COLORS = [
    '#38bdf8', // Technology (Sky Blue)
    '#a78bfa', // Industrials (Light Purple)
    '#f472b6', // Communication Services (Pink)
    '#facc15', // Consumer Cyclical (Yellow)
    '#34d399', // Healthcare (Mint Green)
];

const CustomTooltipContent = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background/80 backdrop-blur-sm border border-white/10 rounded-lg p-2 text-sm shadow-lg">
                <p className="font-bold">{`${payload[0].name}: ${payload[0].value.toFixed(2)}%`}</p>
            </div>
        );
    }
    return null;
};


export function SectorsCard({ stock, className }: SectorsCardProps) {
    if (!stock.sectors || stock.sectors.length === 0) {
        return null;
    }
    
    const chartData = stock.sectors.map((sector, index) => ({
        name: sector.name,
        value: sector.pct,
        color: COLORS[index % COLORS.length]
    }));

    return (
        <div className={cn("bg-transparent", className)}>
            <div className="pb-3">
                <h2 className="text-xl font-bold">Sectors</h2>
                <Separator className="bg-white/10 mt-2" />
            </div>
            <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="w-full md:w-1/2">
                    <ul className="space-y-3">
                        {chartData.map((sector) => (
                            <li key={sector.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center">
                                    <span
                                        className="h-3 w-3 rounded-sm mr-3"
                                        style={{ backgroundColor: sector.color }}
                                    />
                                    <span className="text-neutral-200">{sector.name}</span>
                                </div>
                                <span className="font-mono text-neutral-100">{sector.value.toFixed(2)}%</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="w-full md:w-1/2 h-52">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Tooltip content={<CustomTooltipContent />} />
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                                nameKey="name"
                                stroke="none"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
