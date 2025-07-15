
import type { DateRange } from "react-day-picker";

export type TradingFeatures = {
    overnight?: boolean;
    fractional?: boolean;
    shortable?: boolean;
    marginable?: boolean;
    nasdaqTotalView?: boolean;
    optionsAvailable?: boolean;
    preAfterMarket?: boolean;
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
    takeProfit?: number;
    stopLoss?: number;
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

export type Account = {
    id: string;
    name: string;
    balance: number;
    buyingPower: number;
    settledCash: number;
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
    alertType: 'Unusual Volume' | 'Earnings' | 'Price Spike' | 'News Catalyst';
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
