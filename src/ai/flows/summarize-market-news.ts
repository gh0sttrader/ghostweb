// Summarize recent market news articles related to a user's portfolio.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NewsArticleSchema = z.object({
  title: z.string().describe('The title of the news article.'),
  content: z.string().describe('The main content of the news article.'),
  url: z.string().url().describe('The URL of the news article.'),
});

const PortfolioSchema = z.object({
  tickers: z.array(z.string()).describe('The list of stock tickers in the portfolio.'),
});

const SummarizeMarketNewsInputSchema = z.object({
  newsArticles: z.array(NewsArticleSchema).describe('A list of recent news articles related to the market.'),
  portfolio: PortfolioSchema.describe('The user portfolio information including the list of stock tickers.'),
});

export type SummarizeMarketNewsInput = z.infer<typeof SummarizeMarketNewsInputSchema>;

const SummarizeMarketNewsOutputSchema = z.object({
  summary: z.string().describe('A summary of the market news articles, focusing on the impact on the user portfolio.'),
});

export type SummarizeMarketNewsOutput = z.infer<typeof SummarizeMarketNewsOutputSchema>;

export async function summarizeMarketNews(input: SummarizeMarketNewsInput): Promise<SummarizeMarketNewsOutput> {
  return summarizeMarketNewsFlow(input);
}

const summarizeMarketNewsPrompt = ai.definePrompt({
  name: 'summarizeMarketNewsPrompt',
  input: {schema: SummarizeMarketNewsInputSchema},
  output: {schema: SummarizeMarketNewsOutputSchema},
  prompt: `You are an expert financial analyst.

You will receive a list of recent news articles related to the market and information about the user's portfolio.

Your task is to summarize the key events in the news and analyze their potential impact on the user's portfolio.

News Articles:
{{#each newsArticles}}
Title: {{title}}
URL: {{url}}
Content: {{content}}
{{/each}}

Portfolio: {{portfolio.tickers}}

Summary:`, 
});

const summarizeMarketNewsFlow = ai.defineFlow(
  {
    name: 'summarizeMarketNewsFlow',
    inputSchema: SummarizeMarketNewsInputSchema,
    outputSchema: SummarizeMarketNewsOutputSchema,
  },
  async input => {
    const {output} = await summarizeMarketNewsPrompt(input);
    return output!;
  }
);
