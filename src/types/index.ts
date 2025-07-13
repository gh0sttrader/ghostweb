
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
    premarketChange?: number;
    peRatio?: number;
    dividendYield?: number;
    sector?: string;
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
};

export type AlertRule = {
    id: string;
    name: string;
    isActive: boolean;
    criteria: Criterion[];
};

export type Criterion = {
    id: string;
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
};

export type OpenPosition = {
    id: string;
    symbol: string;
    entryPrice: number;
    shares: number;
    currentPrice: number;
    origin: TradeMode;
    accountId: string;
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
