
import type { NewsArticle } from '@/types';

// Function to generate ISO strings for recent times
const timeAgo = (minutes: number) => new Date(Date.now() - minutes * 60 * 1000).toISOString();

export const dummyNewsData: Omit<NewsArticle, 'id' | 'preview' | 'alertType'> & { hasAlert: boolean }[] = [
    { timestamp: timeAgo(1), symbol: 'TSLA', headline: 'Tesla Surges on Record Q2 Deliveries', sentiment: 'Positive', provider: 'Bloomberg', hasAlert: true },
    { timestamp: timeAgo(2), symbol: 'AAPL', headline: 'Apple Announces New iPhone Event', sentiment: 'Neutral', provider: 'CNBC', hasAlert: false },
    { timestamp: timeAgo(4), symbol: 'NVDA', headline: 'Nvidia Stock Hits All-Time High', sentiment: 'Positive', provider: 'Reuters', hasAlert: false },
    { timestamp: timeAgo(6), symbol: 'GOOGL', headline: 'Google Under Antitrust Scrutiny Again', sentiment: 'Negative', provider: 'WSJ', hasAlert: true },
    { timestamp: timeAgo(10), symbol: 'MSFT', headline: 'Microsoft Teams Outage Impacts Users', sentiment: 'Negative', provider: 'The Verge', hasAlert: false },
    { timestamp: timeAgo(15), symbol: 'META', headline: 'Meta Expands Threads Features', sentiment: 'Neutral', provider: 'TechCrunch', hasAlert: false },
    { timestamp: timeAgo(20), symbol: 'AMZN', headline: 'Amazon Launches Same-Day Grocery', sentiment: 'Positive', provider: 'CNBC', hasAlert: true },
    { timestamp: timeAgo(30), symbol: 'NFLX', headline: 'Netflix Subscriber Growth Slows', sentiment: 'Negative', provider: 'Yahoo Finance', hasAlert: false },
    { timestamp: timeAgo(45), symbol: 'AMD', headline: 'AMD Announces Next-Gen Chip', sentiment: 'Positive', provider: 'MarketWatch', hasAlert: false },
    { timestamp: timeAgo(55), symbol: 'DIS', headline: 'Disney Reports Solid Earnings', sentiment: 'Positive', provider: 'Bloomberg', hasAlert: true },
    { timestamp: timeAgo(65), symbol: 'JPM', headline: 'JPMorgan Raises Dividend', sentiment: 'Neutral', provider: 'Barrons', hasAlert: false },
    { timestamp: timeAgo(75), symbol: 'BAC', headline: 'Bank of America Misses Estimates', sentiment: 'Negative', provider: 'Reuters', hasAlert: true },
    { timestamp: timeAgo(90), symbol: 'TSLA', headline: 'Tesla Recalls 10,000 Vehicles', sentiment: 'Negative', provider: 'CNBC', hasAlert: true },
    { timestamp: timeAgo(110), symbol: 'AAPL', headline: 'Apple Services Revenue Climbs', sentiment: 'Positive', provider: 'WSJ', hasAlert: false },
    { timestamp: timeAgo(125), symbol: 'GOOGL', headline: 'Google Cloud Revenue Disappoints', sentiment: 'Negative', provider: 'TechCrunch', hasAlert: true },
    { timestamp: timeAgo(140), symbol: 'UBER', headline: 'Uber stock downgraded on competition concerns', sentiment: 'Negative', provider: 'Yahoo Finance', hasAlert: false },
    { timestamp: timeAgo(155), symbol: 'CRM', headline: 'Salesforce announces new AI integrations for Slack', sentiment: 'Positive', provider: 'The Verge', hasAlert: true },
    { timestamp: timeAgo(170), symbol: 'XOM', headline: 'Exxon Mobil reports lower than expected quarterly profits', sentiment: 'Negative', provider: 'Bloomberg', hasAlert: true },
    { timestamp: timeAgo(185), symbol: 'PFE', headline: 'Pfizer gets FDA approval for new vaccine', sentiment: 'Positive', provider: 'Reuters', hasAlert: false },
    { timestamp: timeAgo(200), symbol: 'WMT', headline: 'Walmart to expand drone delivery service to 5 new states', sentiment: 'Positive', provider: 'CNBC', hasAlert: false },
    { timestamp: timeAgo(215), symbol: 'INTC', headline: 'Intel delays new chip factory opening', sentiment: 'Negative', provider: 'WSJ', hasAlert: true },
    { timestamp: timeAgo(230), symbol: 'PYPL', headline: 'PayPal launches new checkout feature for small businesses', sentiment: 'Neutral', provider: 'TechCrunch', hasAlert: false },
    { timestamp: timeAgo(245), symbol: 'SBUX', headline: 'Starbucks unionization efforts grow in major cities', sentiment: 'Neutral', provider: 'MarketWatch', hasAlert: false },
    { timestamp: timeAgo(260), symbol: 'BA', headline: 'Boeing secures massive order from international airline', sentiment: 'Positive', provider: 'Bloomberg', hasAlert: true },
    { timestamp: timeAgo(275), symbol: 'CSCO', headline: 'Cisco acquires cybersecurity firm for $2B', sentiment: 'Positive', provider: 'Reuters', hasAlert: false },
];
