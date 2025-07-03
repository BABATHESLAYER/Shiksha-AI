'use server';

/**
 * @fileOverview Provides simplified explanations and analogies to student questions using GenAI.
 *
 * - answerStudentQuestion - A function that handles the question answering process.
 * - AnswerStudentQuestionInput - The input type for the answerStudentQuestion function.
 * - AnswerStudentQuestionOutput - The return type for the answerStudentQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerStudentQuestionInputSchema = z.object({
  question: z.string().describe('The student\'s question in the local language.'),
});
export type AnswerStudentQuestionInput = z.infer<typeof AnswerStudentQuestionInputSchema>;

const AnswerStudentQuestionOutputSchema = z.object({
  simplifiedExplanation: z
    .string()
    .describe('A simplified explanation of the answer to the question.'),
  analogy: z.string().describe('An analogy to help understand the answer.'),
});
export type AnswerStudentQuestionOutput = z.infer<typeof AnswerStudentQuestionOutputSchema>;

export async function answerStudentQuestion(input: AnswerStudentQuestionInput): Promise<AnswerStudentQuestionOutput> {
  return answerStudentQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerStudentQuestionPrompt',
  input: {schema: AnswerStudentQuestionInputSchema},
  output: {schema: AnswerStudentQuestionOutputSchema},
  prompt: `You are an expert teacher skilled at explaining complex topics in simple terms.

  A student has asked the following question:
  {{question}}

  Provide a simplified explanation and an analogy to help the student understand the answer.
  `,
});

const answerStudentQuestionFlow = ai.defineFlow(
  {
    name: 'answerStudentQuestionFlow',
    inputSchema: AnswerStudentQuestionInputSchema,
    outputSchema: AnswerStudentQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
