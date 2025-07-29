

import type { DateRange } from "react-day-picker";
import type { ActiveScreenerFilters } from "@/components/ScreenerFilterModal";

export type Sector = {
    name: string;
    pct: number;
    color: string;
};

export type HoldingV2 = {
    name: string;
    symbol: string;
    assets: number;
}

export type TradingFeatures = {
    overnight?: boolean;
    fractional?: boolean;
    shortable?: boolean;
    marginable?: boolean;
    nasdaqTotalView?: boolean;
    optionsAvailable?: boolean;
    preAfterMarket?: boolean;
};

export type AnalystRatingsDistribution = {
    buy: number;
    hold: number;
    sell: number;
};

export type Stock = {
    id: string;
    symbol: string;
    name?: string;
    price: number;
    changePercent: number;
    float?: number;
    volume?: number;
    newsSnippet?: string;
    lastUpdated?: string;
    catalystType?: 'news' | 'fire' | 'earnings';
    sentiment?: 'Positive' | 'Negative' | 'Neutral';
    newsSentimentPercent?: number;
    topNewsKeyword?: string;
    historicalPrices: number[];
    marketCap?: number;
    avgVolume?: number;
    atr?: number;
    rsi?: number;
    vwap?: number;
    beta?: number;
    high52?: number;
    low52?: number;
    gapPercent?: number;
    shortFloat?: number;
    instOwn?: number;
    insiderOwn?: number;
    premarketChange?: number;
    peRatio?: number;
    dividendYield?: number;
    sector?: string;
    industry?: string;
    exchange?: 'NASDAQ' | 'NYSE' | 'AMEX' | 'OTC';
    macd?: 'Bullish Crossover' | 'Bearish Crossover' | 'Neutral';
    earningsDate?: string;
    open?: number;
    high?: number;
    low?: number;
    prevClose?: number;
    peRatioTTM?: number;
    epsTTM?: number;
    sharesOutstanding?: number;
    freeFloatShares?: number;
    exDividendDate?: string;
    lotSize?: number;
    afterHoursPrice?: number;
    afterHoursChange?: number;
    afterHoursChangePercent?: number;
    analystRating?: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
    tradingFeatures?: TradingFeatures;

    // Company Info
    description?: string;
    ceo?: string;
    employees?: number;
    headquarters?: string;
    founded?: number | string;
    analystRatings?: AnalystRatingsDistribution;
    
    // ETF Specific Info
    'Index-Tracked'?: string;
    'Number of holdings'?: number;
    'Inception Date'?: string;
    sectors?: Sector[];
    topHoldings?: HoldingV2[];

    // Expanded for screener
    country?: string;
    currency?: 'USD' | 'CAD' | 'EUR' | 'GBP' | 'JPY';
    pegRatio?: number;
    movingAverageCrossover?: 'Golden Cross' | 'Death Cross' | 'None';
    volatility?: number;
    chartPattern?: 'Breakout' | 'Reversal' | 'Momentum' | 'Continuation';
};

export type AlertRule = {
    id: string;
    name: string;
    isActive: boolean;
    criteria: Criterion[];
};

export type Criterion = {
    id:string;
    metric: keyof Stock;
    operator: '>' | '<' | '>=' | '<=' | '==' | '!=' | 'between';
    value: number | string | [number, number];
};

export type ColumnConfig<T> = {
    key: keyof T | (string & {});
    label: string;
    defaultVisible?: boolean;
    isDraggable?: boolean;
    align?: 'left' | 'right' | 'center';
    format?: (value: any, item: T) => React.ReactNode;
    description?: string;
};

export type OrderActionType = 'Buy' | 'Sell' | 'Short' | 'Cover';
export type OrderSystemType = 'Market' | 'Limit' | 'Stop';
export type TradeMode = 'manual' | 'milo';
export type TimeInForce = 'Day' | 'GTC' | 'OPG' | 'CLS' | 'IOC' | 'FOK';

export type TradeRequest = {
    symbol: string;
    quantity: number;
    action: OrderActionType;
    orderType: OrderSystemType;
    limitPrice?: number;
    stopPrice?: number;
    trailingOffset?: number;
    TIF?: TimeInForce;
    allowExtendedHours?: boolean;
    tradeModeOrigin?: TradeMode;
    accountId?: string;
};

export type TradeHistoryEntry = {
    id: string;
    symbol: string;
    side: OrderActionType;
    totalQty: number;
    orderType: OrderSystemType;
    limitPrice?: number;
    stopPrice?: number;
    trailAmount?: number;
    TIF: TimeInForce;
    tradingHours: 'Include Extended Hours' | 'Regular Market Hours Only';
    placedTime: string;
    filledTime: string;
    orderStatus: 'Filled' | 'Canceled' | 'Pending';
    averagePrice: number;
    tradeModeOrigin: TradeMode;
    accountId: string;
    takeProfit?: number;
    stopLoss?: number;
};

export type AccountPnl = {
    daily: number;
    weekly: number;
    percent: number;
}

export type Holding = {
    symbol: string;
    name: string;
    logo: string;
    shares: number;
    marketPrice: number;
    unrealizedGain: number;
    totalValue: number;
    dayPnl?: number;
    dayPnlPercent?: number;
    openPnlPercent?: number;
    averagePrice?: number;
}

export type Account = {
    id: string;
    name: string;
    balance: number;
    buyingPower: number;
    settledCash: number;
    pnl?: AccountPnl;
    holdingsCount?: number;
    cash?: number;
    ytdReturn?: number;
    netContributions?: number;
    totalGains?: number;
    marketGains?: number;
    dividends?: number;
    holdings?: Holding[];
};

export type OpenPosition = {
    id: string;
    symbol: string;
    entryPrice: number;
    shares: number;
    currentPrice: number;
    origin: TradeMode;
    accountId: string;
    side: 'Long' | 'Sell' | 'Short';
};

export type NewsArticle = {
    id: string;
    timestamp: string;
    symbol: string;
    headline: string;
    preview: string;
    provider: string;
    sentiment: 'Positive' | 'Negative' | 'Neutral';
    alertType?: 'Unusual Volume' | 'Earnings' | 'Price Spike' | 'News Catalyst';
};

export type TradeStatsData = {
    totalTrades: number;
    winRate: number;
    totalPnL: number;
    avgReturn: number;

    largestWin: number;
    largestLoss: number;
    avgHoldTime: string;
    mostTradedSymbol: string;
    winStreak: number;
};

export type ChartBar = {
    t: string; // Timestamp
    o: number; // Open
    h: number; // High
    l: number; // Low
    c: number; // Close
    v: number; // Volume
};

export type AlertMetric = 'price' | 'changePercent' | 'volume' | 'news';
export type AlertOperator = 'above' | 'below' | 'contains';

export type AlertCondition = {
    metric: AlertMetric;
    operator: AlertOperator;
    value: number | string;
};

export type Alert = {
    id: string;
    symbol: string;
    condition: AlertCondition;
    status: 'active' | 'triggered' | 'inactive';
    createdAt: string;
};

export type SavedScreener = {
    id: string;
    name: string;
    filters: ActiveScreenerFilters;
}

export type WidgetKey = 'chart' | 'order' | 'positions' | 'orders' | 'history' | 'watchlist' | 'screeners' | 'news' | 'details';

export interface DetailsCardV2Props {
    account: Account | undefined;
    onDelete: () => void;
    onAddWidget: (widgetKey: WidgetKey) => void;
}

export interface NewsCardV2Props {
    className?: string;
    onSymbolSelect: (symbol: string) => void;
    selectedSymbol: string | null;
    onDelete: () => void;
    onAddWidget: (widgetKey: WidgetKey) => void;
}

export interface OrderCardV2Props {
    selectedStock: Stock | null;
    initialActionType?: OrderActionType | null;
    initialTradeMode?: TradeMode;
    miloActionContextText?: string | null;
    initialQuantity?: string;
    initialOrderType?: OrderSystemType;
    initialLimitPrice?: string;
    onSubmit: (tradeDetails: TradeRequest) => void;
    onClear: () => void;
    className?: string;
    onDelete: () => void;
    onAddWidget: (widgetKey: WidgetKey) => void;
}

    
