// Extracts key information from a medical record for verification.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractRecordInfoInputSchema = z.object({
  recordDataUri: z
    .string()
    .describe(
      "A patient's health record, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractRecordInfoInput = z.infer<typeof ExtractRecordInfoInputSchema>;

const ExtractRecordInfoOutputSchema = z.object({
  patientName: z.string().describe("The full name of the patient."),
  dateOfBirth: z.string().describe("The patient's date of birth in YYYY-MM-DD format."),
  recordType: z.string().describe("The type of medical record (e.g., Lab Report, MRI Scan, Prescription)."),
  summary: z.string().describe("A concise, one-sentence summary of the record's key findings."),
});
export type ExtractRecordInfoOutput = z.infer<typeof ExtractRecordInfoOutputSchema>;

export async function extractRecordInfo(
  input: ExtractRecordInfoInput
): Promise<ExtractRecordInfoOutput> {
  return extractRecordInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractRecordInfoPrompt',
  input: {schema: ExtractRecordInfoInputSchema},
  output: {schema: ExtractRecordInfoOutputSchema},
  prompt: `You are an AI medical assistant. Your task is to extract key information from the provided medical document.

  Analyze the document and return the following details:
  - Patient's full name.
  - Patient's date of birth.
  - The specific type of the record (e.g., "Lab Report - Complete Blood Count", "MRI Scan - Brain", "Prescription").
  - A single sentence summarizing the most critical finding or purpose of the document.

  Medical Document:
  {{media url=recordDataUri}}
  `,
});

const extractRecordInfoFlow = ai.defineFlow(
  {
    name: 'extractRecordInfoFlow',
    inputSchema: ExtractRecordInfoInputSchema,
    outputSchema: ExtractRecordInfoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    