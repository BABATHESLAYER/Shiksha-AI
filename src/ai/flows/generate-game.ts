'use server';

/**
 * @fileOverview AI agent that generates quizzes based on a topic.
 *
 * - generateGame - A function that handles the quiz generation process.
 * - GenerateGameInput - The input type for the generateGame function.
 * - GenerateGameOutput - The return type for the generateGame function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateGameInputSchema = z.object({
  topic: z.string().describe('The topic for the quiz (e.g., parts of a plant)'),
});
export type GenerateGameInput = z.infer<typeof GenerateGameInputSchema>;

const GenerateGameOutputSchema = z.object({
  quiz: z.string().describe('The generated quiz in JSON format (MCQs or word puzzle).'),
});
export type GenerateGameOutput = z.infer<typeof GenerateGameOutputSchema>;

export async function generateGame(input: GenerateGameInput): Promise<GenerateGameOutput> {
  return generateGameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateGamePrompt',
  input: {schema: GenerateGameInputSchema},
  output: {schema: GenerateGameOutputSchema},
  prompt: `You are an expert game designer specializing in creating educational quizzes.

You will use the following topic to create a fun and engaging quiz for students.
The quiz can be either multiple choice questions or a word puzzle.
Return the quiz in JSON format.

Topic: {{{topic}}}`,
});

const generateGameFlow = ai.defineFlow(
  {
    name: 'generateGameFlow',
    inputSchema: GenerateGameInputSchema,
    outputSchema: GenerateGameOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
