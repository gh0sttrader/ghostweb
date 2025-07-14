
import type { NewsArticle } from '@/types';
import { Bell } from 'lucide-react';

export const dummyNewsData: Omit<NewsArticle, 'id' | 'preview' | 'alertType'> & { hasAlert: boolean }[] = [
    { timestamp: '09:28', symbol: 'TSLA', headline: 'Tesla Surges on Record Q2 Deliveries', sentiment: 'Positive', provider: 'Bloomberg', hasAlert: true },
    { timestamp: '08:15', symbol: 'AAPL', headline: 'Apple Announces New iPhone Event', sentiment: 'Neutral', provider: 'CNBC', hasAlert: false },
    { timestamp: '10:05', symbol: 'NVDA', headline: 'Nvidia Stock Hits All-Time High', sentiment: 'Positive', provider: 'Reuters', hasAlert: false },
    { timestamp: '07:59', symbol: 'GOOGL', headline: 'Google Under Antitrust Scrutiny Again', sentiment: 'Negative', provider: 'WSJ', hasAlert: true },
    { timestamp: '11:12', symbol: 'MSFT', headline: 'Microsoft Teams Outage Impacts Users', sentiment: 'Negative', provider: 'The Verge', hasAlert: false },
    { timestamp: '09:44', symbol: 'META', headline: 'Meta Expands Threads Features', sentiment: 'Neutral', provider: 'TechCrunch', hasAlert: false },
    { timestamp: '10:37', symbol: 'AMZN', headline: 'Amazon Launches Same-Day Grocery', sentiment: 'Positive', provider: 'CNBC', hasAlert: true },
    { timestamp: '07:21', symbol: 'NFLX', headline: 'Netflix Subscriber Growth Slows', sentiment: 'Negative', provider: 'Yahoo Finance', hasAlert: false },
    { timestamp: '08:58', symbol: 'AMD', headline: 'AMD Announces Next-Gen Chip', sentiment: 'Positive', provider: 'MarketWatch', hasAlert: false },
    { timestamp: '11:22', symbol: 'DIS', headline: 'Disney Reports Solid Earnings', sentiment: 'Positive', provider: 'Bloomberg', hasAlert: true },
    { timestamp: '09:33', symbol: 'JPM', headline: 'JPMorgan Raises Dividend', sentiment: 'Neutral', provider: 'Barrons', hasAlert: false },
    { timestamp: '10:12', symbol: 'BAC', headline: 'Bank of America Misses Estimates', sentiment: 'Negative', provider: 'Reuters', hasAlert: true },
    { timestamp: '09:01', symbol: 'TSLA', headline: 'Tesla Recalls 10,000 Vehicles', sentiment: 'Negative', provider: 'CNBC', hasAlert: true },
    { timestamp: '11:45', symbol: 'AAPL', headline: 'Apple Services Revenue Climbs', sentiment: 'Positive', provider: 'WSJ', hasAlert: false },
    { timestamp: '08:42', symbol: 'GOOGL', headline: 'Google Cloud Revenue Disappoints', sentiment: 'Negative', provider: 'TechCrunch', hasAlert: true },
];
