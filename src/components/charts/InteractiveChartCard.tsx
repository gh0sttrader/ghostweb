
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Stock } from '@/types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart as RechartsAreaChart, Area, BarChart, Bar, Cell, Legend } from 'recharts';
import type { TooltipProps } from 'recharts';
import { AreaChart as AreaIcon, CandlestickChart, Activity, Search, Loader2, Calendar, LineChart as LineChartIcon, Palette, Plus, X as XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getChartData } from '@/ai/flows/get-chart-data-flow';
import { sub, formatISO, format } from 'date-fns';
import { ChartDatePickerModal } from './ChartDatePickerModal';
import type { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';


interface InteractiveChartCardProps {
  stock: Stock | null;
  onManualTickerSubmit: (symbol: string) => void;
  onChartHover?: (value: number | null) => void;
  onChartLeave?: () => void;
  className?: string;
  variant?: 'trading' | 'account';
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const color = payload[0].color || 'hsl(var(--primary))';
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
            <p className="label text-muted-foreground font-semibold mb-1">{`${label}`}</p>
            {payload.map((p, i) => (
                 <div key={i} className="flex justify-between items-baseline">
                    <span className="text-foreground">{p.name}:</span>
                    <span className="font-bold ml-2" style={{ color: p.color }}>${(p.value as number).toFixed(2)}</span>
                </div>
            ))}
        </div>
    );
  }
  return null;
};


// Map UI timeframes to Alpaca API parameters
const getTimeframeParams = (timeframe: '1D' | '5D' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | '5Y' | 'All') => {
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
    case 'All':
      return { timeframe: '1Month', start: '2015-01-01T00:00:00Z' }; // A reasonable 'all time' start
    default:
      return { timeframe: '1Day', start: formatISO(sub(now, { months: 1 })) };
  }
};


export function InteractiveChartCard({ stock, onManualTickerSubmit, onChartHover, onChartLeave, className, variant = 'trading' }: InteractiveChartCardProps) {
  const { toast } = useToast();
  const [chartType, setChartType] = useState<'line' | 'area' | 'candle'>('area');
  const [timeframe, setTimeframe] = useState<'1D' | '5D' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | '5Y' | 'All'>('1M');
  const [manualTickerInput, setManualTickerInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [chartColor, setChartColor] = useState<string>('#e6e6e6');
  
  const [benchmarkSymbol, setBenchmarkSymbol] = useState<string | null>(null);
  const [benchmarkInput, setBenchmarkInput] = useState('VOO');
  const [showBenchmarkInput, setShowBenchmarkInput] = useState(false);
  const benchmarkInputRef = useRef<HTMLInputElement>(null);


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
      // Use mock historical data for account variant, otherwise fetch
      if (variant === 'account' && stock.historicalPrices) {
        const formattedData = stock.historicalPrices.map((price, index) => ({
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
          date: format(new Date(bar.t), 'MMM dd'),
          price: bar.c,
          open: bar.o,
          high: bar.h,
          low: bar.l,
          close: bar.c
        }));
        
        // If benchmark is active, fetch its data and merge it
        if (benchmarkSymbol) {
            // In a real app, you would fetch real data for the benchmark
            const benchmarkData = data.map(bar => ({
                benchmark: bar.c * (1 + (Math.random() - 0.5) * 0.1) // Simulate benchmark data
            }));
            
            formattedData = formattedData.map((item, index) => ({
                ...item,
                benchmark: benchmarkData[index].benchmark
            }));
        }

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
  }, [stock, timeframe, variant, benchmarkSymbol]);

  const handleDateGo = (date: Date | DateRange) => {
    console.log("Selected date/range:", date);
    // Future logic to refetch chart data will go here.
  };

  const handleManualSubmit = () => {
    if (manualTickerInput.trim()) {
      onManualTickerSubmit(manualTickerInput.trim().toUpperCase());
    }
  };

  const handleChartMouseMove = (e: any) => {
    if (onChartHover && e && e.activePayload && e.activePayload.length > 0) {
        const payload = e.activePayload[0].payload;
        if (payload.price !== undefined) {
            onChartHover(payload.price);
        }
    }
  };

  const handleBenchmarkSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && benchmarkInput.trim()) {
          setBenchmarkSymbol(benchmarkInput.trim().toUpperCase());
          setShowBenchmarkInput(false);
          toast({
            title: `Benchmark Added: ${benchmarkInput.trim().toUpperCase()}`
          });
      }
  };

  const removeBenchmark = () => {
      setBenchmarkSymbol(null);
      setChartData(prevData => prevData.map(({benchmark, ...rest}) => rest));
  };
  
  useEffect(() => {
    if (showBenchmarkInput && benchmarkInputRef.current) {
        benchmarkInputRef.current.focus();
    }
  }, [showBenchmarkInput]);


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
    const benchmarkUniqueId = `benchmark-gradient-${benchmarkSymbol || 'default'}`;
    
    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} onMouseMove={handleChartMouseMove} onMouseLeave={onChartLeave}>
            <XAxis dataKey="date" hide />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip
              cursor={{ stroke: 'hsl(var(--foreground))', strokeWidth: 1, strokeDasharray: '3 3' }}
              content={<CustomTooltip />}
            />
            <Line type="monotone" dataKey="price" name={stock?.symbol || "Portfolio"} stroke={chartColor} strokeWidth={2} dot={false} />
            {benchmarkSymbol && <Line type="monotone" dataKey="benchmark" name={benchmarkSymbol} stroke="#EF4444" strokeWidth={2} dot={false} />}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'area') {
      return (
        <ResponsiveContainer width="100%" height="100%">
             <RechartsAreaChart data={chartData} onMouseMove={handleChartMouseMove} onMouseLeave={onChartLeave}>
                <defs>
                    <linearGradient id={uniqueId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartColor} stopOpacity={0.2}/>
                      <stop offset="100%" stopColor={chartColor} stopOpacity={0.05}/>
                    </linearGradient>
                     {benchmarkSymbol && (
                      <linearGradient id={benchmarkUniqueId} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#EF4444" stopOpacity={0.2}/>
                          <stop offset="100%" stopColor="#EF4444" stopOpacity={0.0}/>
                      </linearGradient>
                     )}
                </defs>
                <XAxis dataKey="date" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip
                    cursor={{ stroke: 'hsl(var(--foreground))', strokeWidth: 1, strokeDasharray: '3 3' }}
                    content={<CustomTooltip />}
                />
                <Area type="monotone" dataKey="price" name={stock?.symbol || "Portfolio"} stroke={chartColor} strokeWidth={2} fillOpacity={1} fill={`url(#${uniqueId})`} dot={false} />
                {benchmarkSymbol && <Area type="monotone" dataKey="benchmark" name={benchmarkSymbol} stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill={`url(#${benchmarkUniqueId})`} dot={false} />}
            </RechartsAreaChart>
        </ResponsiveContainer>
      );
    }
    
    if (chartType === 'candle') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} onMouseMove={handleChartMouseMove} onMouseLeave={onChartLeave}>
            
            <XAxis dataKey="date" hide />
            <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
            <Tooltip
              cursor={{ fill: 'hsla(var(--primary), 0.05)' }}
              content={<CustomTooltip />}
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


  return (
    <Card className={cn("shadow-none flex flex-col border-none bg-transparent relative", className)}>
       <div className="absolute top-3 right-4 z-20 flex items-center gap-2">
           {benchmarkSymbol ? (
               <div className="bg-[#191919] text-white text-xs rounded-full py-1 px-3 font-medium flex items-center gap-1.5">
                   <span>{benchmarkSymbol}</span>
                   <button onClick={removeBenchmark} className="text-white hover:text-white/80"><XIcon size={14} /></button>
               </div>
           ) : (
                <Input
                    ref={benchmarkInputRef}
                    type="text"
                    value={benchmarkInput}
                    onChange={(e) => setBenchmarkInput(e.target.value.toUpperCase())}
                    onKeyDown={handleBenchmarkSubmit}
                    className="bg-[#18181B] border border-neutral-700 rounded-md px-2 py-1 h-7 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-primary w-20 text-center"
                />
           )}
            <Popover>
                <PopoverTrigger asChild>
                    <button
                        className="w-5 h-5 flex items-center justify-center rounded-full bg-neutral-800 border border-neutral-700 text-white text-xs font-bold transition-colors"
                        aria-label="What is a benchmark?"
                    >?</button>
                </PopoverTrigger>
                <PopoverContent className="w-64" side="bottom" align="end">
                    <div className="space-y-2">
                        <h4 className="font-bold text-sm">What’s a Benchmark?</h4>
                        <p className="text-xs text-muted-foreground">
                            A benchmark lets you compare your account’s performance to an index or security (e.g. S&P 500, VOO, etc). Add one to see how you stack up.
                        </p>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
       <CardHeader className="pb-2 pt-3 px-3">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
          {variant === 'trading' && stock && stock.price > 0 ? (
            <div className="flex items-baseline gap-x-2.5 gap-y-1 flex-wrap flex-1 min-w-0">
              <h3 className="text-base font-bold text-neutral-50 truncate" title={stock.name}>
                {stock.symbol}
              </h3>
              <p className="text-base font-bold text-foreground">
                ${stock.price.toFixed(2)}
              </p>
              <p className={cn("text-xs font-bold", stock.changePercent >= 0 ? 'text-[hsl(var(--confirm-green))]' : 'text-destructive')}>
                {stock.changePercent >= 0 ? '+' : ''}{(stock.price * (stock.changePercent / 100)).toFixed(2)}
                <span className="ml-1">({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)</span>
              </p>
              {stock.afterHoursPrice && stock.afterHoursChange !== undefined && (
                <p className="text-xs text-neutral-400 font-medium whitespace-nowrap">
                  After-Hours: ${stock.afterHoursPrice.toFixed(2)}
                  <span className={cn("ml-1", stock.afterHoursChange >= 0 ? 'text-[hsl(var(--confirm-green))]' : 'text-destructive')}>
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
          {variant === 'trading' && (
            <div className="flex items-center gap-1 w-full sm:w-auto">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Symbol"
                value={manualTickerInput}
                onChange={(e) => setManualTickerInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                className="h-7 text-xs flex-1 sm:flex-initial sm:w-28 bg-transparent"
              />
              <Button variant="ghost" size="icon" onClick={handleManualSubmit} className="h-7 w-7 text-foreground hover:bg-white/10">
                <Search className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="relative flex-1 p-1 pr-2 min-h-[250px]">
        {renderChartContent()}
        <div className="absolute bottom-3 right-3 z-10">
            <Popover>
              <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground/50 hover:text-foreground hover:bg-white/10 opacity-50 hover:opacity-100 transition-opacity">
                      <Palette className="h-4 w-4" />
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
      </CardContent>
     
      <CardFooter className="flex flex-wrap justify-start items-center gap-x-1 gap-y-2 pt-2 pb-2 px-3">
        {['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'All'].map((tf) => (
          <Button
            key={tf}
            variant="ghost"
            size="sm"
            onClick={() => setTimeframe(tf as any)}
            className={cn(
              "h-8 text-base px-3 font-medium",
              timeframe === tf
                ? "text-foreground font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-transparent"
            )}
          >
            {tf}
          </Button>
        ))}
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-transparent" onClick={() => setIsDatePickerOpen(true)}>
          <Calendar className="h-5 w-5" />
        </Button>
        
        <div className="w-px bg-border/20 h-6 self-center mx-1"></div>

        {[
          { type: 'line', label: 'Line', Icon: LineChartIcon },
          { type: 'area', label: 'Area', Icon: AreaIcon },
          { type: 'candle', label: 'Candle', Icon: CandlestickChart },
        ].map(({ type, label, Icon }) => (
          <Button
            key={type}
            variant="ghost"
            size="sm"
            onClick={() => setChartType(type as any)}
            className={cn(
              "h-8 text-base px-3 font-medium",
              chartType === type
                ? "text-foreground font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-transparent"
            )}
          >
            <Icon className="h-5 w-5 mr-1.5" />
            {label}
          </Button>
        ))}
      </CardFooter>
      <ChartDatePickerModal 
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onGo={handleDateGo}
      />
    </Card>
  );
}
