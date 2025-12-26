// Predicts potential diseases based on user-provided symptoms.

'use server';

import { model } from '@/ai/genkit';

export interface DiseasePredictorInput {
  symptoms: string;
  painLocation: string;
  duration: string;
}

export interface DiseasePredictorOutput {
  predictedDiseases: Array<{
    name: string;
    probability: string;
    description: string;
  }>;
  affectedArea: 'Head' | 'Chest' | 'Abdomen' | 'Left_Arm' | 'Right_Arm' | 'Left_Leg' | 'Right_Leg' | 'None';
  disclaimer: string;
  recordType: string;
}

export async function predictDisease(input: DiseasePredictorInput): Promise<DiseasePredictorOutput> {
  const prompt = `You are an AI medical assistant. Your role is to analyze the provided symptoms and predict potential diseases. You are not a real doctor.

Analyze the following information:
- Symptoms: ${input.symptoms}
- Pain Location: ${input.painLocation}
- Duration: ${input.duration}

Based on this information, provide a list of potential diseases with a probability score (High, Medium, or Low) and a brief description for each.

From the 'Pain Location' description, identify the corresponding body part and set the 'affectedArea' field to one of the following IDs: 'Head', 'Chest', 'Abdomen', 'Left_Arm', 'Right_Arm', 'Left_Leg', 'Right_Leg'. If the location is ambiguous or not one of these specific parts, set 'affectedArea' to 'None'.

Set the 'recordType' field to "AI Disease Prediction".

Crucially, you MUST include the following disclaimer in your output: "This is an AI-generated prediction and not a substitute for professional medical advice. Please consult a qualified doctor for an accurate diagnosis."

Return the response as a JSON object with the following structure:
{
  "predictedDiseases": [{"name": "string", "probability": "string", "description": "string"}],
  "affectedArea": "string",
  "disclaimer": "string",
  "recordType": "string"
}

IMPORTANT: Return ONLY the JSON object, no additional text or markdown formatting.`;

  const result = await model.generateContent(prompt);
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