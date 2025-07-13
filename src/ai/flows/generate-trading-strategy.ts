'use server';

/**
 * @fileOverview An AI agent that generates a basic trading strategy based on user input.
 *
 * - generateTradingStrategy - A function that generates a trading strategy.
 * - GenerateTradingStrategyInput - The input type for the generateTradingStrategy function.
 * - GenerateTradingStrategyOutput - The return type for the generateTradingStrategy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTradingStrategyInputSchema = z.object({
  riskTolerance: z
    .string()
    .describe(
      'The users risk tolerance. Should be one of the following: Low, Medium, or High.'
    ),
  investmentAmount: z
    .number()
    .describe('The amount of money the user wants to invest.'),
  returnTimeframe: z
    .string()
    .describe(
      'The desired return timeframe. Should be one of the following: Short, Medium, or Long.'
    ),
});
export type GenerateTradingStrategyInput = z.infer<
  typeof GenerateTradingStrategyInputSchema
>;

const GenerateTradingStrategyOutputSchema = z.object({
  strategy: z.string().describe('The generated trading strategy.'),
});
export type GenerateTradingStrategyOutput = z.infer<
  typeof GenerateTradingStrategyOutputSchema
>;

export async function generateTradingStrategy(
  input: GenerateTradingStrategyInput
): Promise<GenerateTradingStrategyOutput> {
  return generateTradingStrategyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTradingStrategyPrompt',
  input: {schema: GenerateTradingStrategyInputSchema},
  output: {schema: GenerateTradingStrategyOutputSchema},
  prompt: `You are an expert financial advisor.

You will generate a basic trading strategy based on the user's risk tolerance, investment amount, and desired return timeframe.

Risk Tolerance: {{{riskTolerance}}}
Investment Amount: {{{investmentAmount}}}
Return Timeframe: {{{returnTimeframe}}}

Generate a trading strategy:
`,
});

const generateTradingStrategyFlow = ai.defineFlow(
  {
    name: 'generateTradingStrategyFlow',
    inputSchema: GenerateTradingStrategyInputSchema,
    outputSchema: GenerateTradingStrategyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
