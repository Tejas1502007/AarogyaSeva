// Scans a medical report and provides a structured summary.

'use server';

import { model } from '@/ai/genkit';

export interface ScanReportInput {
  reportDataUri: string;
}

export interface ScanReportOutput {
  summary: string;
  diagnosis: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;
  followUp: string;
}

export async function scanReport(
  input: ScanReportInput
): Promise<ScanReportOutput> {
  
  const prompt = `You are an AI medical assistant. Your task is to analyze the provided medical document and extract key information in a structured format for a patient. The language should be clear and easy to understand.

Analyze the document and return the following:
- A brief, easy-to-understand summary of the key findings.
- The primary diagnosis or condition.
- A list of all prescribed medications, including their name, dosage, and frequency.
- Any recommended follow-up actions or appointments.

If a section is not applicable (e.g., no medications are listed), indicate that clearly.

Return the response as a JSON object with the following structure:
{
  "summary": "string",
  "diagnosis": "string", 
  "medications": [{"name": "string", "dosage": "string", "frequency": "string"}],
  "followUp": "string"
}`;

  // Convert data URI to inline data for Gemini
  const [mimeType, base64Data] = input.reportDataUri.replace('data:', '').split(';base64,');
  
  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    }
  ]);
  
  const response = await result.response;
  const text = response.text();
  
  try {
    // Clean the response text to extract JSON
    const cleanText = text.replace(/```json\n?|```\n?/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('AI Response parsing error:', text);
    throw new Error(`Failed to parse AI response: ${error.message}`);
  }
}