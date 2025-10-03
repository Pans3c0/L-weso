'use server';

import { improveProductDescriptionFlow } from '@/ai/flows/improve-product-description';
import { z } from 'zod';

const ImproveDescriptionSchema = z.object({
  productName: z.string(),
  currentDescription: z.string().optional(),
});

export async function improveDescriptionAction(
  input: z.infer<typeof ImproveDescriptionSchema>
) {
  const parsedInput = ImproveDescriptionSchema.safeParse(input);
  if (!parsedInput.success) {
    return { success: false, error: 'Invalid input.' };
  }

  try {
    const improvedDescription = await improveProductDescriptionFlow(parsedInput.data);
    return { success: true, improvedDescription };
  } catch (error) {
    console.error('Error improving description with AI:', error);
    return { success: false, error: 'Failed to generate description from AI.' };
  }
}
