
"use client"
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Stock } from '@/types';
import { cn } from '@/lib/utils';

interface InteractiveChartCardProps {
    stock: Stock | null;
    onManualTickerSubmit: (symbol: string) => void;
    className?: string;
}

export const InteractiveChartCard: React.FC<InteractiveChartCardProps> = ({ stock, onManualTickerSubmit, className }) => {
    const chartData = useMemo(() => {
        if (!stock || !stock.historicalPrices || stock.historicalPrices.length === 0) {
            return Array.from({ length: 30 }, (_, i) => ({ day: i, value: 0 }));
        }
        return stock.historicalPrices.map((price, index) => ({ day: index, value: price }));
    }, [stock]);

    const chartConfig = {
        value: {
            label: stock?.symbol || 'Price',
            color: stock && stock.changePercent >= 0 ? "hsl(var(--chart-2))" : "hsl(var(--destructive))",
        },
    };

    const handleTickerSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const symbol = formData.get('ticker') as string;
        if (symbol) {
            onManualTickerSubmit(symbol.toUpperCase());
        }
    };

    return (
        <Card className={cn("h-full flex flex-col", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-4">
                    <CardTitle className="text-2xl font-bold">{stock?.symbol || "N/A"}</CardTitle>
                    <div>
                        <div className="text-2xl font-bold">{stock ? `$${stock.price.toFixed(2)}` : "..."}</div>
                        <div className={`text-sm ${stock && stock.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {stock ? `${stock.changePercent.toFixed(2)}%` : "..."}
                        </div>
                    </div>
                </div>
                <form onSubmit={handleTickerSubmit} className="flex items-center gap-2">
                    <Input name="ticker" placeholder="Enter Ticker" className="w-32 h-9" defaultValue={stock?.symbol} />
                    <Button type="submit" size="sm" className="h-9">Load</Button>
                </form>
            </CardHeader>
            <CardContent className="flex-1 -mx-4 -mb-4">
                <ChartContainer config={chartConfig} className="w-full h-full">
                    <AreaChart
                        accessibilityLayer
                        data={chartData}
                        margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
                    >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                            dataKey="day"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => ''}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                        />
                        <defs>
                            <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartConfig.value.color} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={chartConfig.value.color} stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <Area
                            dataKey="value"
                            type="natural"
                            fill="url(#fillValue)"
                            stroke={chartConfig.value.color}
                            stackId="a"
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};
