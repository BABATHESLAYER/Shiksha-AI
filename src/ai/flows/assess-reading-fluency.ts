// src/ai/flows/assess-reading-fluency.ts
'use server';
/**
 * @fileOverview Assesses reading fluency from an audio recording and provides a fluency score and feedback.
 *
 * - assessReadingFluency - A function that handles the reading assessment process.
 * - AssessReadingFluencyInput - The input type for the assessReadingFluency function.
 * - AssessReadingFluencyOutput - The return type for the assessReadingFluency function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssessReadingFluencyInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The audio recording of the student reading, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AssessReadingFluencyInput = z.infer<typeof AssessReadingFluencyInputSchema>;

const AssessReadingFluencyOutputSchema = z.object({
  fluencyScore: z.number().describe('A numerical score representing the student\'s reading fluency.'),
  feedback: z.string().describe('AI-generated feedback on the student\'s reading performance.'),
});
export type AssessReadingFluencyOutput = z.infer<typeof AssessReadingFluencyOutputSchema>;

export async function assessReadingFluency(input: AssessReadingFluencyInput): Promise<AssessReadingFluencyOutput> {
  return assessReadingFluencyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'assessReadingFluencyPrompt',
  input: {schema: AssessReadingFluencyInputSchema},
  output: {schema: AssessReadingFluencyOutputSchema},
  prompt: `You are an expert reading tutor, skilled at providing constructive feedback. A student has submitted the following audio recording of them reading aloud. Please generate a fluency score (from 1 to 10, with 10 being perfectly fluent) and specific feedback to help them improve.

Audio: {{media url=audioDataUri}}

Ensure that the fluency score is a number between 1 and 10. Feedback should be concise and actionable.
`,
});

const assessReadingFluencyFlow = ai.defineFlow(
  {
    name: 'assessReadingFluencyFlow',
    inputSchema: AssessReadingFluencyInputSchema,
    outputSchema: AssessReadingFluencyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
