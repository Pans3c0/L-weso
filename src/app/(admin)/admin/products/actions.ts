'use server';

import { improveProductDescription } from '@/ai/flows/improve-product-description';
import { z } from 'zod';

const ImproveDescriptionSchema = z.object({
  keywords: z.string(),
  existingDescription: z.string(),
});

export async function improveDescriptionAction(input: {
  keywords: string;
  existingDescription: string;
}) {
  const parsedInput = ImproveDescriptionSchema.safeParse(input);
  if (!parsedInput.success) {
    return { error: 'Invalid input' };
  }

  try {
    const result = await improveProductDescription({
      ...parsedInput.data,
      productData: '', // Not used as per current requirements
    });
    return { improvedDescription: result.improvedDescription };
  } catch (error) {
    console.error('AI description improvement failed:', error);
    return { error: 'Failed to improve description.' };
  }
}
