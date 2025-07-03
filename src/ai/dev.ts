import { config } from 'dotenv';
config();

import '@/ai/flows/generate-worksheets.ts';
import '@/ai/flows/generate-educational-content.ts';
import '@/ai/flows/generate-game.ts';
import '@/ai/flows/generate-visual-aid.ts';
import '@/ai/flows/assess-reading-fluency.ts';
import '@/ai/flows/answer-student-questions.ts';