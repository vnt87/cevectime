// src/ai/flows/suggest-tomorrow-plan.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting entries for the 'Tomorrow Plan'
 * section of a timesheet based on the user's inputs in 'Today plan', 'Actual work', and 'Issues'.
 *
 * - suggestTomorrowPlan - A function that takes the current day's inputs and generates suggestions for tomorrow's plan.
 * - SuggestTomorrowPlanInput - The input type for the suggestTomorrowPlan function.
 * - SuggestTomorrowPlanOutput - The return type for the suggestTomorrowPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTomorrowPlanInputSchema = z.object({
  todayPlan: z.string().describe('The user\'s plan for today.'),
  actualWork: z.string().describe('The work the user actually did today.'),
  issues: z.string().describe('Any issues the user encountered today.'),
});
export type SuggestTomorrowPlanInput = z.infer<typeof SuggestTomorrowPlanInputSchema>;

const SuggestTomorrowPlanOutputSchema = z.object({
  tomorrowPlanSuggestion: z
    .string()
    .describe(
      'A suggestion for what the user should include in their tomorrow plan, based on the inputs.'
    ),
});
export type SuggestTomorrowPlanOutput = z.infer<typeof SuggestTomorrowPlanOutputSchema>;

export async function suggestTomorrowPlan(
  input: SuggestTomorrowPlanInput
): Promise<SuggestTomorrowPlanOutput> {
  return suggestTomorrowPlanFlow(input);
}

const suggestTomorrowPlanPrompt = ai.definePrompt({
  name: 'suggestTomorrowPlanPrompt',
  input: {schema: SuggestTomorrowPlanInputSchema},
  output: {schema: SuggestTomorrowPlanOutputSchema},
  prompt: `Based on the following information from the user's timesheet, suggest what they should include in their plan for tomorrow focusing specifically on UI design tasks. Keep the response under 400 characters and concentrate on concrete UI/UX related tasks, design improvements, and visual enhancements.

Today's Plan: {{{todayPlan}}}
Actual Work: {{{actualWork}}}
Issues: {{{issues}}}

Tomorrow's Plan Suggestion:`, // Constrained to UI design tasks and 400 char limit
});

const suggestTomorrowPlanFlow = ai.defineFlow(
  {
    name: 'suggestTomorrowPlanFlow',
    inputSchema: SuggestTomorrowPlanInputSchema,
    outputSchema: SuggestTomorrowPlanOutputSchema,
  },
  async input => {
    const {output} = await suggestTomorrowPlanPrompt(input);
    return output!;
  }
);
