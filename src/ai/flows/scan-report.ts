// Scans a medical report and provides a structured summary.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScanReportInputSchema = z.object({
  reportDataUri: z
    .string()
    .describe(
      "A patient's medical report (e.g., prescription, lab result), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ScanReportInput = z.infer<typeof ScanReportInputSchema>;

const ScanReportOutputSchema = z.object({
  summary: z.string().describe("A brief, easy-to-understand summary of the report's key findings."),
  diagnosis: z.string().describe("The primary diagnosis or condition mentioned in the report."),
  medications: z.array(z.object({
    name: z.string().describe("Name of the medication."),
    dosage: z.string().describe("Dosage instructions (e.g., '500mg')."),
    frequency: z.string().describe("How often to take the medication (e.g., 'Twice a day for 7 days')."),
  })).describe("A list of prescribed medications, if any."),
  followUp: z.string().describe("Recommended follow-up actions or appointments, if mentioned."),
});
export type ScanReportOutput = z.infer<typeof ScanReportOutputSchema>;

export async function scanReport(
  input: ScanReportInput
): Promise<ScanReportOutput> {
  return scanReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scanReportPrompt',
  input: {schema: ScanReportInputSchema},
  output: {schema: ScanReportOutputSchema},
  prompt: `You are an AI medical assistant. Your task is to analyze the provided medical document and extract key information in a structured format for a patient. The language should be clear and easy to understand.

  Analyze the document and return the following:
  - A brief, easy-to-understand summary of the key findings.
  - The primary diagnosis or condition.
  - A list of all prescribed medications, including their name, dosage, and frequency.
  - Any recommended follow-up actions or appointments.

  If a section is not applicable (e.g., no medications are listed), indicate that clearly.

  Medical Document:
  {{media url=reportDataUri}}
  `,
});

const scanReportFlow = ai.defineFlow(
  {
    name: 'scanReportFlow',
    inputSchema: ScanReportInputSchema,
    outputSchema: ScanReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
