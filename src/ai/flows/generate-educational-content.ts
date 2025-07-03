'use server';

/**
 * @fileOverview An AI agent for generating educational content in a local language.
 *
 * - generateEducationalContent - A function that handles the educational content generation process.
 * - GenerateEducationalContentInput - The input type for the generateEducationalContent function.
 * - GenerateEducationalContentOutput - The return type for the generateEducationalContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEducationalContentInputSchema = z.object({
  prompt: z.string().describe('The prompt in the local language for generating educational content.'),
});
export type GenerateEducationalContentInput = z.infer<typeof GenerateEducationalContentInputSchema>;

const GenerateEducationalContentOutputSchema = z.object({
  generatedContent: z.string().describe('The Gemini-generated educational content in the local language.'),
});
export type GenerateEducationalContentOutput = z.infer<typeof GenerateEducationalContentOutputSchema>;

export async function generateEducationalContent(input: GenerateEducationalContentInput): Promise<GenerateEducationalContentOutput> {
  return generateEducationalContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEducationalContentPrompt',
  input: {schema: GenerateEducationalContentInputSchema},
  output: {schema: GenerateEducationalContentOutputSchema},
  prompt: `You are a helpful assistant for teachers. Generate educational content based on the prompt given in the local language.

Prompt: {{{prompt}}}`,
});

const generateEducationalContentFlow = ai.defineFlow(
  {
    name: 'generateEducationalContentFlow',
    inputSchema: GenerateEducationalContentInputSchema,
    outputSchema: GenerateEducationalContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
