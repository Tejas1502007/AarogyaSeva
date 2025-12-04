// Summarizes medical records for doctors to quickly understand patient history.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeMedicalRecordsInputSchema = z.object({
  recordDataUri: z
    .string()
    .describe(
      "A patient's health record, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SummarizeMedicalRecordsInput = z.infer<typeof SummarizeMedicalRecordsInputSchema>;

const SummarizeMedicalRecordsOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise summary of the patient health record, highlighting key information.'),
});
export type SummarizeMedicalRecordsOutput = z.infer<typeof SummarizeMedicalRecordsOutputSchema>;

export async function summarizeMedicalRecords(
  input: SummarizeMedicalRecordsInput
): Promise<SummarizeMedicalRecordsOutput> {
  return summarizeMedicalRecordsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeMedicalRecordsPrompt',
  input: {schema: SummarizeMedicalRecordsInputSchema},
  output: {schema: SummarizeMedicalRecordsOutputSchema},
  prompt: `You are an AI assistant specializing in summarizing patient medical records for doctors.

  Please provide a concise summary of the patient's health record, highlighting key information such as diagnoses, treatments, medications, and relevant medical history.

  Here is the patient's medical record:

  {{media url=recordDataUri}}
  `,
});

const summarizeMedicalRecordsFlow = ai.defineFlow(
  {
    name: 'summarizeMedicalRecordsFlow',
    inputSchema: SummarizeMedicalRecordsInputSchema,
    outputSchema: SummarizeMedicalRecordsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
