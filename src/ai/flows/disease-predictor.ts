// Predicts potential diseases based on user-provided symptoms.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiseasePredictorInputSchema = z.object({
  symptoms: z.string().describe("A description of the symptoms the user is experiencing."),
  painLocation: z.string().describe("A textual description of the part of the body where the user is feeling pain (e.g., 'my head', 'lower abdomen', 'left arm')."),
  duration: z.string().describe("How long the user has been experiencing these symptoms (e.g., '3 days', '2 weeks')."),
});
export type DiseasePredictorInput = z.infer<typeof DiseasePredictorInputSchema>;

const DiseasePredictorOutputSchema = z.object({
    predictedDiseases: z.array(z.object({
        name: z.string().describe("The name of the potential disease or condition."),
        probability: z.string().describe("A textual representation of the likelihood (e.g., 'High', 'Medium', 'Low')."),
        description: z.string().describe("A brief explanation of the disease."),
    })).describe("A list of potential diseases based on the symptoms."),
    affectedArea: z.enum(['Head', 'Chest', 'Abdomen', 'Left_Arm', 'Right_Arm', 'Left_Leg', 'Right_Leg', 'None']).describe("The machine-readable ID of the body part to highlight, based on the user's description. Return 'None' if it does not match a specific area."),
    disclaimer: z.string().describe("A mandatory disclaimer stating that this is not a medical diagnosis."),
    recordType: z.string().describe("The type of record, which should be 'AI Disease Prediction'."),
});
export type DiseasePredictorOutput = z.infer<typeof DiseasePredictorOutputSchema>;

export async function predictDisease(
  input: DiseasePredictorInput
): Promise<DiseasePredictorOutput> {
  return diseasePredictorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diseasePredictorPrompt',
  input: {schema: DiseasePredictorInputSchema},
  output: {schema: DiseasePredictorOutputSchema},
  prompt: `You are an AI medical assistant. Your role is to analyze the provided symptoms and predict potential diseases. You are not a real doctor.

  Analyze the following information:
  - Symptoms: {{{symptoms}}}
  - Pain Location: {{{painLocation}}}
  - Duration: {{{duration}}}

  Based on this information, provide a list of potential diseases with a probability score (High, Medium, or Low) and a brief description for each.

  From the 'Pain Location' description, identify the corresponding body part and set the 'affectedArea' field to one of the following IDs: 'Head', 'Chest', 'Abdomen', 'Left_Arm', 'Right_Arm', 'Left_Leg', 'Right_Leg'. If the location is ambiguous or not one of these specific parts, set 'affectedArea' to 'None'.

  Set the 'recordType' field to "AI Disease Prediction".

  Crucially, you MUST include the following disclaimer in your output: "This is an AI-generated prediction and not a substitute for professional medical advice. Please consult a qualified doctor for an accurate diagnosis."
  `,
});

const diseasePredictorFlow = ai.defineFlow(
  {
    name: 'diseasePredictorFlow',
    inputSchema: DiseasePredictorInputSchema,
    outputSchema: DiseasePredictorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
