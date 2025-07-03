'use server';

/**
 * @fileOverview An AI agent that generates a line diagram for a given concept.
 *
 * - generateVisualAid - A function that handles the visual aid generation process.
 * - GenerateVisualAidInput - The input type for the generateVisualAid function.
 * - GenerateVisualAidOutput - The return type for the generateVisualAid function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVisualAidInputSchema = z.object({
  conceptDescription: z
    .string()
    .describe('The concept to be visualized as a line diagram.'),
});
export type GenerateVisualAidInput = z.infer<typeof GenerateVisualAidInputSchema>;

const GenerateVisualAidOutputSchema = z.object({
  imageUrl: z.string().describe('The URL of the generated line diagram image.'),
});
export type GenerateVisualAidOutput = z.infer<typeof GenerateVisualAidOutputSchema>;

export async function generateVisualAid(input: GenerateVisualAidInput): Promise<GenerateVisualAidOutput> {
  return generateVisualAidFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateVisualAidPrompt',
  input: {schema: GenerateVisualAidInputSchema},
  output: {schema: GenerateVisualAidOutputSchema},
  prompt: `You are an AI assistant that generates simple line diagrams for educational purposes.

  Given the following concept description, generate a prompt suitable for generating a line diagram of the concept.  The line diagram should be simple and easy to understand for students.

  Concept Description: {{{conceptDescription}}}
  `,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const generateVisualAidFlow = ai.defineFlow(
  {
    name: 'generateVisualAidFlow',
    inputSchema: GenerateVisualAidInputSchema,
    outputSchema: GenerateVisualAidOutputSchema,
  },
  async input => {
    const {text} = await prompt(input);

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',

      prompt: text,

      config: {
        responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won't work
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_ONLY_HIGH',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_LOW_AND_ABOVE',
          },
        ],
      },
    });
    return {imageUrl: media.url!};
  }
);
