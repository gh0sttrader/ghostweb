
"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Stock } from '@/types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart as RechartsAreaChart, Area, BarChart, Bar, Cell, Legend } from 'recharts';
import type { TooltipProps } from 'recharts';
import { AreaChart as AreaIcon, CandlestickChart, Activity, Search, Loader2, Calendar, LineChart as LineChartIcon, Palette, Plus, X as XIcon, Bell, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getChartData } from '@/ai/flows/get-chart-data-flow';
import { sub, formatISO, format } from 'date-fns';
import { ChartDatePickerModal } from './ChartDatePickerModal';
import type { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import AddToWatchlistModal from '@/components/AddToWatchlistModal';

type Timeframe = '1D' | '5D' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | '5Y' | 'Max' | 'All';

interface InteractiveChartCardProps {
  stock: Stock | null;
  onManualTickerSubmit: (symbol: string) => void;
  className?: string;
  variant?: 'trading' | 'account';
  onAlertClick?: () => void;
  isAlertActive?: boolean;
  timeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
  showWatchlistButton?: boolean;
  showAlertButton?: boolean;
  showAdvancedButton?: boolean;
}

const CustomTooltip = ({ active, payload, label, timeframe }: TooltipProps<number, string> & { timeframe: Timeframe }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    // Candlestick data
    if (data.open !== undefined) { 
      const isUp = data.close >= data.open;
      const valueColor = isUp ? 'text-[hsl(var(--confirm-green))]' : 'text-destructive';
      return (
        <div className="p-2.5 text-xs bg-background/90 backdrop-blur-sm rounded-md border border-border/20 shadow-lg shadow-primary/10">
          <p className="label text-muted-foreground font-semibold mb-1">{`${label}`}</p>
          <div className="intro space-y-1">
            <div className="flex justify-between items-baseline"><span className="text-foreground">Open:</span> <span className={cn("font-bold ml-2", valueColor)}>${data.open.toFixed(2)}</span></div>
            <div className="flex justify-between items-baseline"><span className="text-foreground">High:</span> <span className={cn("font-bold ml-2", valueColor)}>${data.high.toFixed(2)}</span></div>
            <div className="flex justify-between items-baseline"><span className="text-foreground">Low:</span> <span className={cn("font-bold ml-2", valueColor)}>${data.low.toFixed(2)}</span></div>
            <div className="flex justify-between items-baseline"><span className="text-foreground">Close:</span> <span className={cn("font-bold ml-2", valueColor)}>${data.close.toFixed(2)}</span></div>
          </div>
        </div>
      );
    }
    
    return (
        <div className="p-2.5 text-xs bg-background/90 backdrop-blur-sm rounded-md border border-border/20 shadow-lg shadow-primary/10">
            <p className="label text-muted-foreground font-semibold mb-1">
                {timeframe === '1D' ? format(new Date(data.timestamp), 'h:mm a') : format(new Date(data.timestamp), 'MMM dd')}
            </p>
        </div>
    );
  }
  return null;
};


// Map UI timeframes to Alpaca API parameters
const getTimeframeParams = (timeframe: Timeframe) => {
  const now = new Date();
  switch (timeframe) {
    case '1D':
      return { timeframe: '15Min', start: formatISO(sub(now, { days: 1 })) };
    case '5D':
      return { timeframe: '1Hour', start: formatISO(sub(now, { days: 5 })) };
    case '1M':
      return { timeframe: '1Day', start: formatISO(sub(now, { months: 1 })) };
    case '3M':
      return { timeframe: '1Day', start: formatISO(sub(now, { months: 3 })) };
    case '6M':
      return { timeframe: '1Day', start: formatISO(sub(now, { months: 6 })) };
    case 'YTD':
      return { timeframe: '1Day', start: formatISO(new Date(now.getFullYear(), 0, 1)) };
    case '1Y':
      return { timeframe: '1Day', start: formatISO(sub(now, { years: 1 })) };
    case '5Y':
      return { timeframe: '1Week', start: formatISO(sub(now, { years: 5 })) };
    case 'Max':
    case 'All':
      return { timeframe: '1Month', start: '2015-01-01T00:00:00Z' }; // A reasonable 'all time' start
    default:
      return { timeframe: '1Day', start: formatISO(sub(now, { months: 1 })) };
  }
};


export function InteractiveChartCard({ stock, onManualTickerSubmit, className, variant = 'trading', onAlertClick, isAlertActive, timeframe, onTimeframeChange, showWatchlistButton = true, showAlertButton = true, showAdvancedButton = false }: InteractiveChartCardProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [chartType, setChartType] = useState<'line' | 'area' | 'candle'>(variant === 'account' ? 'line' : 'area');
  const [manualTickerInput, setManualTickerInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [chartColor, setChartColor] = useState<string>('#e6e6e6');
  const [isWatched, setIsWatched] = useState(false);
  const [isWatchlistModalOpen, setIsWatchlistModalOpen] = useState(false);
  
  const [hoveredData, setHoveredData] = useState<{ price: number; change: number; percent: number; isUp: boolean; date: string } | null>(null);

  const colorOptions = [
      { color: '#5721aa', label: 'Purple' },
      { color: '#00ec95', label: 'Green' },
      { color: '#F41415', label: 'Red' },
      { color: '#e6e6e6', label: 'Silver' },
      { color: '#1450fa', label: 'Navy Blue' },
  ];

  useEffect(() => {
    if (stock && document.activeElement !== inputRef.current) {
      setManualTickerInput(stock.symbol);
    } else if (!stock && document.activeElement !== inputRef.current) {
      setManualTickerInput('');
    }
  }, [stock]);

  // Effect to fetch data from mocked flow
  useEffect(() => {
    const fetchAndSetChartData = async () => {
      if (!stock?.symbol) {
        setChartData([]);
        return;
      }
      if (variant === 'account' && stock.historicalPrices) {
        const formattedData = stock.historicalPrices.map((price, index) => ({
            timestamp: sub(new Date(), { days: stock.historicalPrices.length - index }).toISOString(),
            date: `Day ${index + 1}`,
            price: price,
            open: price * (1 - (Math.random() - 0.5) * 0.02),
            high: price * (1 + Math.random() * 0.02),
            low: price * (1 - Math.random() * 0.02),
            close: price
        }));
        setChartData(formattedData);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const params = getTimeframeParams(timeframe);
        const data = await getChartData({ symbol: stock.symbol, ...params });
        
        let formattedData = data.map(bar => ({
          timestamp: bar.t,
          date: format(new Date(bar.t), 'MMM dd, yyyy'),
          price: bar.c,
          open: bar.o,
          high: bar.h,
          low: bar.l,
          close: bar.c
        }));
        
        setChartData(formattedData);
      } catch (err: any) {
        console.error("Error fetching chart data:", err);
        setError(err.message || "Failed to fetch chart data.");
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAndSetChartData();
  }, [stock, timeframe, variant]);

  const handleDateGo = (date: Date | DateRange) => {
    console.log("Selected date/range:", date);
  };

  const handleManualSubmit = () => {
    if (manualTickerInput.trim()) {
      onManualTickerSubmit(manualTickerInput.trim().toUpperCase());
    }
  };

  const firstPrice = useMemo(() => chartData[0]?.price, [chartData]);

  const handleChartMouseMove = (e: any) => {
    if (e && e.activePayload && e.activePayload.length > 0 && firstPrice) {
        const payload = e.activePayload[0].payload;
        if (payload.price !== undefined) {
            const price = payload.price;
            const change = price - firstPrice;
            const percent = (change / firstPrice) * 100;
            setHoveredData({
                price,
                change,
                percent,
                isUp: change >= 0,
                date: timeframe === '1D' ? format(new Date(payload.timestamp), 'h:mm a') : format(new Date(payload.timestamp), 'MMM dd'),
            });
        }
    }
  };
  
  const handleChartMouseLeave = () => {
    setHoveredData(null);
  };

  const renderChartContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <Loader2 className="h-10 w-10 mb-3 opacity-50 animate-spin text-white" />
          <p className="text-xs text-center">Loading Chart Data...</p>
        </div>
      );
    }

    if (error) {
       return (
        <div className="flex flex-col items-center justify-center h-full text-destructive p-4">
          <Activity className="h-10 w-10 mb-3 opacity-50" />
          <p className="text-xs text-center">{error}</p>
        </div>
      );
    }

    if (!chartData.length) {
       return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <Activity className="h-10 w-10 mb-3 opacity-30" />
          <p className="text-xs text-center">
            {stock?.symbol ? `No chart data for ${stock.symbol} in this timeframe.` : "Enter ticker or select from Watchlist."}
          </p>
        </div>
      );
    }

    const uniqueId = `chart-gradient-${stock?.id || 'default'}`;
    const chartComponentType = variant === 'trading' ? 'area' : chartType;

    if (chartComponentType === 'line') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} onMouseMove={handleChartMouseMove} onMouseLeave={handleChartMouseLeave}>
            <XAxis dataKey="date" hide />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip
              cursor={{ stroke: 'hsl(var(--foreground))', strokeWidth: 1, strokeDasharray: '3 3' }}
              content={<CustomTooltip timeframe={timeframe} />}
            />
            <Line type="monotone" dataKey="price" name={stock?.symbol || "Portfolio"} stroke={chartColor} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (chartComponentType === 'area') {
      return (
        <ResponsiveContainer width="100%" height="100%">
             <RechartsAreaChart data={chartData} onMouseMove={handleChartMouseMove} onMouseLeave={handleChartMouseLeave}>
                <defs>
                    <linearGradient id={uniqueId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartColor} stopOpacity={0.2}/>
                      <stop offset="100%" stopColor={chartColor} stopOpacity={0.05}/>
                    </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip
                    cursor={{ stroke: 'hsl(var(--foreground))', strokeWidth: 1, strokeDasharray: '3 3' }}
                    content={<CustomTooltip timeframe={timeframe} />}
                />
                <Area type="monotone" dataKey="price" name={stock?.symbol || "Portfolio"} stroke={chartColor} strokeWidth={2} fillOpacity={1} fill={`url(#${uniqueId})`} dot={false} />
            </RechartsAreaChart>
        </ResponsiveContainer>
      );
    }
    
    if (chartComponentType === 'candle') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} onMouseMove={handleChartMouseMove} onMouseLeave={handleChartMouseLeave}>
            
            <XAxis dataKey="date" hide />
            <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
            <Tooltip
              cursor={{ fill: 'hsla(var(--primary), 0.05)' }}
              content={<CustomTooltip timeframe={timeframe} />}
            />
            <Bar dataKey={(d: any) => [d.low, d.high]} barSize={1} fill="hsla(var(--muted-foreground), 0.5)" />
            <Bar dataKey={(d: any) => [d.open, d.close]} barSize={8}>
              {chartData.map((entry, index) => {
                const fillColor = entry.close >= entry.open ? 'hsl(var(--confirm-green))' : 'hsl(var(--destructive))';
                return <Cell key={`cell-${index}`} fill={fillColor} style={{ filter: `drop-shadow(0 0 1px ${fillColor})` }}/>;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    }

    return null;
  };

  const timeframeButtons: Timeframe[] = variant === 'trading'
    ? ['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'Max']
    : ['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'All'];

  const displayPrice = hoveredData ? hoveredData.price : stock?.price;
  const displayChange = hoveredData ? hoveredData.change : stock ? stock.price * (stock.changePercent / 100) : 0;
  const displayPercent = hoveredData ? hoveredData.percent : stock?.changePercent;
  const displayIsUp = hoveredData ? hoveredData.isUp : stock ? stock.changePercent >= 0 : true;
  const displayDate = hoveredData ? hoveredData.date : "Today";
  const changeLabel = hoveredData ? "Change" : "Today";
  const afterHoursVisible = !hoveredData;

  return (
    <>
      <Card className={cn("shadow-none flex flex-col border-none bg-transparent relative", className)}>
        {showAdvancedButton && (
            <Button
                className="absolute top-4 right-4 px-4 py-1.5 h-auto rounded-full bg-[#19191c] text-white font-medium hover:bg-[#23232b] transition z-20 text-xs"
                onClick={() => router.push('/trading-v2/dashboard')}
            >
                Advanced
            </Button>
        )}
        <CardHeader className="pb-2 pt-3 px-3">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
            {variant === 'trading' && stock && stock.price > 0 ? (
              <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-4">
                      <h3 className="text-2xl font-bold text-neutral-50 truncate" title={stock.name}>
                          {stock.name}
                      </h3>
                  </div>
                  <p className="text-xl font-extrabold text-foreground mt-1">
                      ${(displayPrice ?? 0).toFixed(2)}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className={cn("text-sm font-medium mt-1", displayIsUp ? 'text-[hsl(var(--confirm-green))]' : 'text-destructive')}>
                          {displayIsUp ? '+' : ''}{displayChange.toFixed(2)}
                          <span className="ml-1.5">({displayIsUp ? '+' : ''}{displayPercent?.toFixed(2)}%)</span>
                      </p>
                      <p className="text-sm font-medium mt-1 text-muted-foreground">{displayDate}</p>
                  </div>
                  {afterHoursVisible && stock.afterHoursPrice && stock.afterHoursChange !== undefined && (
                      <p className="text-xs text-neutral-400 mt-0.5">
                      After-Hours: ${stock.afterHoursPrice.toFixed(2)}
                      <span className={cn("ml-1.5", stock.afterHoursChange >= 0 ? 'text-[hsl(var(--confirm-green))]' : 'text-destructive')}>
                          ({stock.afterHoursChange >= 0 ? '+' : ''}{stock.afterHoursChange.toFixed(2)})
                      </span>
                      </p>
                  )}
              </div>
            ) : (
                <div className="flex-1">
                  {variant === 'trading' && (
                      <CardTitle className="text-lg font-headline text-foreground">
                        Trading Chart
                      </CardTitle>
                    )}
                </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-1 pr-2 min-h-[250px]">
          {renderChartContent()}
        </CardContent>
        <CardFooter className="flex items-center justify-between p-2 bg-transparent">
              <div className="flex items-center gap-1">
                  {timeframeButtons.map((tf) => (
                    <Button
                      key={tf}
                      variant="ghost"
                      size="sm"
                      onClick={() => onTimeframeChange(tf)}
                      className={cn(
                        "h-7 text-xs px-2.5 font-semibold",
                        timeframe === tf
                          ? "text-foreground bg-white/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                      )}
                    >
                      {tf}
                    </Button>
                  ))}
              </div>
        </CardFooter>
        <div className="absolute bottom-4 right-4 flex items-center space-x-3 z-10">
          {showAlertButton && (
              <Button
                  onClick={onAlertClick}
                  variant="ghost"
                  size="icon"
                  className={cn("p-1.5 rounded-full hover:bg-white/10 transition", isAlertActive ? 'text-destructive' : 'text-white')}
                  aria-label="Set Alert"
              >
                  <Bell size={16} fill={isAlertActive ? 'currentColor' : 'none'} />
              </Button>
          )}
           <Popover>
              <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="p-1.5 rounded-full hover:bg-white/10 text-white">
                      <Palette size={16} />
                  </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" side="top" align="end">
                  <div className="flex gap-2">
                      {colorOptions.map(({ color, label }) => (
                          <button
                              key={color}
                              aria-label={`Change chart color to ${label}`}
                              className={cn(
                                  "w-6 h-6 rounded-full border-2 transition-all",
                                  chartColor === color ? 'border-white shadow-md' : 'border-gray-600/50 hover:border-gray-400'
                              )}
                              style={{ backgroundColor: color }}
                              onClick={() => setChartColor(color)}
                          />
                      ))}
                  </div>
              </PopoverContent>
          </Popover>
        </div>
        <ChartDatePickerModal 
          isOpen={isDatePickerOpen}
          onClose={() => setIsDatePickerOpen(false)}
          onGo={handleDateGo}
        />
      </Card>
      {stock && (
        <AddToWatchlistModal
            isOpen={isWatchlistModalOpen}
            onClose={() => setIsWatchlistModalOpen(false)}
            ticker={stock.symbol}
            onSave={() => setIsWatched(true)}
        />
      )}
    </>
  );
}
