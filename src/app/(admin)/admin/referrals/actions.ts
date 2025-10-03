'use server';

import { 
    getReferralCodes,
    addReferralCode,
} from '@/lib/referral-codes';
import type { ReferralCode } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const GenerateCodeSchema = z.object({
    sellerId: z.string().min(1, "Seller ID is required"),
});

/**
 * Server Action: Generates a new, unique referral code for a specific seller.
 * @returns A success object with the new code or an error object.
 */
export async function generateReferralCodeAction(input: { sellerId: string }): Promise<{ success: boolean; newCode?: string; error?: string; }> {
    const parsedInput = GenerateCodeSchema.safeParse(input);
    if (!parsedInput.success) {
        return { success: false, error: "Invalid input" };
    }
    const { sellerId } = parsedInput.data;

    try {
        // Generate a random 6-character alphanumeric code
        const newCodeString = `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const newCode: ReferralCode = {
            code: newCodeString,
            sellerId: sellerId,
        };

        await addReferralCode(newCode);

        // Revalidate the referrals admin page to show the new code
        revalidatePath('/admin/referrals');

        return { success: true, newCode: newCodeString };
    } catch (error) {
        console.error('Failed to generate referral code:', error);
        return { success: false, error: 'No se pudo generar el código en el servidor.' };
    }
}

/**
 * Server Action: Retrieves all referral codes for a specific seller.
 * @param sellerId The ID of the seller whose codes to retrieve.
 * @returns An array of strings representing the active codes for that seller.
 */
export async function getReferralCodesForSeller(sellerId: string): Promise<string[]> {
    const allCodes = await getReferralCodes();
    return allCodes
        .filter(c => c.sellerId === sellerId)
        .map(c => c.code);
}
