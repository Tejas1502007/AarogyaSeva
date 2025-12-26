// Extracts key information from a medical record for verification.

'use server';

import { model } from '@/ai/genkit';

export interface ExtractRecordInfoInput {
  recordDataUri: string;
}

export interface ExtractRecordInfoOutput {
  patientName: string;
  dateOfBirth: string;
  recordType: string;
  summary: string;
}

export async function extractRecordInfo(
  input: ExtractRecordInfoInput
): Promise<ExtractRecordInfoOutput> {
  
  const prompt = `You are an AI medical assistant. Your task is to extract key information from the provided medical document.

Analyze the document and return the following details:
- Patient's full name.
- Patient's date of birth.
- The specific type of the record (e.g., "Lab Report - Complete Blood Count", "MRI Scan - Brain", "Prescription").
- A single sentence summarizing the most critical finding or purpose of the document.

Return the response as a JSON object with the following structure:
{
  "patientName": "string",
  "dateOfBirth": "string",
  "recordType": "string",
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