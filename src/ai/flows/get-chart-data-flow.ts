
'use server';

/**
 * @fileOverview A Genkit flow to retrieve historical chart data for a stock symbol.
 * 
 * - getChartData - Fetches chart data based on symbol, timeframe, and start date.
 * - GetChartDataInput - The input type for the getChartData function.
 * - ChartBar - The structure of a single bar in the historical data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChartBarSchema = z.object({
  t: z.string().describe("Timestamp in ISO 8601 format"),
  o: z.number().describe("Open price"),
  h: z.number().describe("High price"),
  l: z.number().describe("Low price"),
  c: z.number().describe("Close price"),
  v: z.number().describe("Volume"),
});
export type ChartBar = z.infer<typeof ChartBarSchema>;

const GetChartDataInputSchema = z.object({
  symbol: z.string().describe('The stock ticker symbol.'),
  timeframe: z.string().describe('The timeframe for the data (e.g., 1Day, 15Min).'),
  start: z.string().describe('The start date for the data in ISO 8601 format.'),
});
export type GetChartDataInput = z.infer<typeof GetChartDataInputSchema>;

export async function getChartData(input: GetChartDataInput): Promise<ChartBar[]> {
  return getChartDataFlow(input);
}

// Helper function to generate mock data
const generateMockData = (startDate: Date, numPoints: number, basePrice: number): ChartBar[] => {
    const data: ChartBar[] = [];
    let currentDate = new Date(startDate);
    let lastClose = basePrice;

    for (let i = 0; i < numPoints; i++) {
        const open = lastClose;
        const change = (Math.random() - 0.5) * (open * 0.05); // 5% volatility
        const close = open + change;
        const high = Math.max(open, close) + (Math.random() * (open * 0.02));
        const low = Math.min(open, close) - (Math.random() * (open * 0.02));
        const volume = 1000000 + Math.random() * 500000;

        data.push({
            t: currentDate.toISOString(),
            o: parseFloat(open.toFixed(2)),
            h: parseFloat(high.toFixed(2)),
            l: parseFloat(low.toFixed(2)),
            c: parseFloat(close.toFixed(2)),
            v: Math.floor(volume),
        });

        lastClose = close;
        currentDate.setDate(currentDate.getDate() + 1); // Increment by one day for simplicity
    }
    return data;
};


const getChartDataFlow = ai.defineFlow(
  {
    name: 'getChartDataFlow',
    inputSchema: GetChartDataInputSchema,
    outputSchema: z.array(ChartBarSchema),
  },
  async (input) => {
    console.log('Fetching chart data for:', input);
    // In a real application, you would call an external API like Alpaca here.
    // For now, we'll return mock data.
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const startDate = new Date(input.start);
    // Determine number of points based on timeframe, a rough approximation
    const numPoints = input.timeframe.includes('Min') || input.timeframe.includes('Hour') ? 100 : 30;
    const basePrice = Math.random() * 500 + 50; // Random base price between 50 and 550

    if (input.symbol.toUpperCase() === 'FAIL') {
        throw new Error("This is a mock error for testing purposes.");
    }

    const mockData = generateMockData(startDate, numPoints, basePrice);
    
    return mockData;
  }
);
