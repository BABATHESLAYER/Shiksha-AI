'use server';

/**
 * @fileOverview AI agent that generates worksheets based on an image of a textbook page and target grade levels.
 *
 * - generateWorksheets - A function that handles the worksheet generation process.
 * - GenerateWorksheetsInput - The input type for the generateWorksheets function.
 * - GenerateWorksheetsOutput - The return type for the generateWorksheets function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWorksheetsInputSchema = z.object({
  textbookImage: z
    .string()
    .describe(
      "A photo of a textbook page, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  targetGrades: z
    .array(z.number())
    .describe('The target grade levels for the worksheets.'),
});
export type GenerateWorksheetsInput = z.infer<typeof GenerateWorksheetsInputSchema>;

const GenerateWorksheetsOutputSchema = z.object({
  worksheets: z
    .array(z.string())
    .describe('The generated worksheets in markdown format.'),
});
export type GenerateWorksheetsOutput = z.infer<typeof GenerateWorksheetsOutputSchema>;

export async function generateWorksheets(input: GenerateWorksheetsInput): Promise<GenerateWorksheetsOutput> {
  return generateWorksheetsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWorksheetsPrompt',
  input: {schema: GenerateWorksheetsInputSchema},
  output: {schema: GenerateWorksheetsOutputSchema},
  prompt: `You are an expert teacher specializing in creating worksheets for students.

You will use the textbook image and target grade levels to generate worksheets that are appropriate for the students.

Textbook Image: {{media url=textbookImage}}
Target Grades: {{{targetGrades}}}

Generate multiple worksheets based on the content of the textbook image and the target grade levels. The worksheets should be in markdown format.
`,
});

const generateWorksheetsFlow = ai.defineFlow(
  {
    name: 'generateWorksheetsFlow',
    inputSchema: GenerateWorksheetsInputSchema,
    outputSchema: GenerateWorksheetsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
