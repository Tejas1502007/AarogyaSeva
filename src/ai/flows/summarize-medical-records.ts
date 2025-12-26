// Summarizes medical records for doctors to quickly understand patient history.

'use server';

import { model } from '@/ai/genkit';

export interface SummarizeMedicalRecordsInput {
  recordDataUri: string;
}

export interface SummarizeMedicalRecordsOutput {
  summary: string;
}

export async function summarizeMedicalRecords(
  input: SummarizeMedicalRecordsInput
): Promise<SummarizeMedicalRecordsOutput> {
  
  const prompt = `You are an AI assistant specializing in summarizing patient medical records for doctors.

Please provide a concise summary of the patient's health record, highlighting key information such as diagnoses, treatments, medications, and relevant medical history.

Return the response as a JSON object with the following structure:
{
  "summary": "string"
}`;

  // Convert data URI to inline data for Gemini
  const [mimeType, base64Data] = input.recordDataUri.replace('data:', '').split(';base64,');
  
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