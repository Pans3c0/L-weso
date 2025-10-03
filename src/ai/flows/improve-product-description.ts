'use server';
/**
 * @fileOverview Flow to improve a product description using AI.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Define the schema for the input of the flow.
export const ImproveProductDescriptionSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  currentDescription: z
    .string()
    .optional()
    .describe('The current, potentially basic, description of the product.'),
});

// Define the flow that will call the AI model.
export const improveProductDescriptionFlow = ai.defineFlow(
  {
    name: 'improveProductDescriptionFlow',
    inputSchema: ImproveProductDescriptionSchema,
    outputSchema: z.string(),
  },
  async ({ productName, currentDescription }) => {
    // Define the prompt for the AI model.
    const llmResponse = await ai.generate({
      prompt: `You are an expert copywriter for an e-commerce store. Your task is to write a compelling, concise, and attractive product description.
      
      Product Name: "${productName}"
      Current Description: "${currentDescription || 'No description provided.'}"
      
      Rewrite the description to be more appealing to customers. Focus on the key benefits and unique aspects. Keep it under 40 words. Do not use markdown or special formatting. Just return the new description text.`,
      model: 'googleai/gemini-2.5-flash',
      config: {
        temperature: 0.8, // Increase creativity
      },
    });

    return llmResponse.text;
  }
);
